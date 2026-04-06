import { Router } from "express";

const router = Router();

interface ReviewData {
  available: true;
  rating: number;
  user_ratings_total: number;
  reviews: {
    author_name: string;
    rating: number;
    text: string;
    relative_time_description: string;
    profile_photo_url?: string;
  }[];
}

interface ReviewCache {
  data: ReviewData | { available: false };
  updatedAt: number;
}

let cache: ReviewCache | null = null;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

async function fetchGoogleData(): Promise<ReviewData | null> {
  const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
  if (!apiKey) return null;

  try {
    let placeId = process.env["GOOGLE_PLACE_ID"];

    if (!placeId) {
      const searchUrl = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
      searchUrl.searchParams.set("input", "Giacosa Elio Corralón Tucumán");
      searchUrl.searchParams.set("inputtype", "textquery");
      searchUrl.searchParams.set("fields", "place_id");
      searchUrl.searchParams.set("key", apiKey);

      const searchRes = await fetch(searchUrl.toString());
      const searchData = await searchRes.json() as { candidates?: { place_id: string }[] };
      placeId = searchData.candidates?.[0]?.place_id;

      if (!placeId) {
        console.warn("[google-reviews] place_id not found via text search");
        return null;
      }
      console.log("[google-reviews] auto-discovered place_id:", placeId);
    }

    const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    detailsUrl.searchParams.set("place_id", placeId);
    detailsUrl.searchParams.set("fields", "rating,user_ratings_total,reviews");
    detailsUrl.searchParams.set("language", "es");
    detailsUrl.searchParams.set("reviews_sort", "newest");
    detailsUrl.searchParams.set("key", apiKey);

    const detailsRes = await fetch(detailsUrl.toString());
    const detailsData = await detailsRes.json() as {
      status: string;
      result?: {
        rating: number;
        user_ratings_total: number;
        reviews?: {
          author_name: string;
          rating: number;
          text: string;
          relative_time_description: string;
          profile_photo_url?: string;
        }[];
      };
    };

    if (detailsData.status !== "OK" || !detailsData.result) {
      console.warn("[google-reviews] Places API status:", detailsData.status);
      return null;
    }

    const { rating, user_ratings_total, reviews = [] } = detailsData.result;
    return {
      available: true,
      rating,
      user_ratings_total,
      reviews: reviews
        .filter((r) => r.text && r.text.trim().length > 10)
        .slice(0, 4)
        .map((r) => ({
          author_name: r.author_name,
          rating: r.rating,
          text: r.text,
          relative_time_description: r.relative_time_description,
          profile_photo_url: r.profile_photo_url,
        })),
    };
  } catch (err) {
    console.error("[google-reviews] fetch error:", err);
    return null;
  }
}

router.get("/google-reviews", async (_req, res) => {
  const now = Date.now();

  if (cache && now - cache.updatedAt < CACHE_TTL_MS) {
    return res.json(cache.data);
  }

  const data = await fetchGoogleData();
  const response = data ?? { available: false };
  cache = { data: response, updatedAt: now };
  return res.json(response);
});

export default router;
