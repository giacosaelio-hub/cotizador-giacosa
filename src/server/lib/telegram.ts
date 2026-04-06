const TOKEN = process.env["TELEGRAM_BOT_TOKEN"];
const BASE_URL = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

const CAPTION_LIMIT = 1024;

interface TelegramApiResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
  parameters?: { migrate_to_chat_id?: number };
}

async function callTelegramApi(method: string, chatId: string, body: Record<string, unknown>): Promise<unknown> {
  if (!BASE_URL) throw new Error("TELEGRAM_BOT_TOKEN no configurado");

  const payload = { ...body, chat_id: chatId };
  const res = await fetch(`${BASE_URL}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as TelegramApiResponse;

  if (!json.ok) {
    if (json.parameters?.migrate_to_chat_id) {
      const newChatId = String(json.parameters.migrate_to_chat_id);
      console.log(`[Telegram] Grupo migrado → nuevo chat_id: ${newChatId}. Reintentando...`);
      const payload2 = { ...body, chat_id: newChatId };
      const res2 = await fetch(`${BASE_URL}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload2),
      });
      const json2 = (await res2.json()) as TelegramApiResponse;
      if (!json2.ok) {
        throw new Error(`Telegram API error [${method}] (retry): ${json2.description ?? "unknown error"}`);
      }
      return json2.result;
    }
    throw new Error(`Telegram API error [${method}]: ${json.description ?? "unknown error"}`);
  }

  return json.result;
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  await callTelegramApi("sendMessage", chatId, { text });
}

async function sendPhotoWithChatId(
  id: string,
  imageBuffer: Buffer,
  caption: string,
  filename: string,
): Promise<TelegramApiResponse> {
  if (!BASE_URL) throw new Error("TELEGRAM_BOT_TOKEN no configurado");
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/png" });
  const form = new FormData();
  form.append("chat_id", id);
  form.append("caption", caption);
  form.append("photo", blob, filename);
  const res = await fetch(`${BASE_URL}/sendPhoto`, { method: "POST", body: form });
  return (await res.json()) as TelegramApiResponse;
}

export async function sendTelegramPhoto(
  chatId: string,
  imageBase64: string,
  caption: string,
  filename: string,
): Promise<void> {
  const imageBuffer = Buffer.from(imageBase64, "base64");

  const captionTruncated =
    caption.length > CAPTION_LIMIT ? caption.slice(0, CAPTION_LIMIT - 3) + "..." : caption;
  const needsExtraMessage = caption.length > CAPTION_LIMIT;

  let json = await sendPhotoWithChatId(chatId, imageBuffer, captionTruncated, filename);

  if (!json.ok) {
    if (json.parameters?.migrate_to_chat_id) {
      const newChatId = String(json.parameters.migrate_to_chat_id);
      console.log(`[Telegram] Grupo migrado → nuevo chat_id: ${newChatId}. Reintentando foto...`);
      json = await sendPhotoWithChatId(newChatId, imageBuffer, captionTruncated, filename);
      if (!json.ok) {
        throw new Error(`Telegram API error [sendPhoto] (retry): ${json.description ?? "unknown error"}`);
      }
      if (needsExtraMessage) {
        await sendTelegramMessage(newChatId, caption);
      }
      return;
    }
    throw new Error(`Telegram API error [sendPhoto]: ${json.description ?? "unknown error"}`);
  }

  if (needsExtraMessage) {
    await sendTelegramMessage(chatId, caption);
  }
}
