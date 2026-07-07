# Online Quoting Tool (Cotizador)

A web-based quoting tool that turns website visitors into structured, trackable sales leads — built to replace a manual, error-prone quoting process at a construction-materials retailer.

## What it does

When a customer requests a quote on the website, the tool:
- Lets them build a quote from a live product/price catalog.
- Captures the full context of the request — customer name, phone, products quoted, payment method, discounts, total, timestamp, and **lead source** (including whether they came from Google Ads, via GCLID).
- Writes every submission automatically into a **structured Google Sheet**, so the sales team gets a clean, real-time lead database instead of copying data by hand.
- Sends instant notifications and keeps records organized through automation.

**Impact:** eliminated manual data entry, removed lost leads, and gave the commercial team a single source of truth for incoming quotes with full traceability of where each lead came from.

## Tech stack

- **TypeScript** + **Vite** (front end / build)
- **Google Sheets API** — structured lead storage
- **n8n** + **webhooks** — automation and integrations
- **Telegram** — instant notifications
- **Google Ads / GCLID tracking** — lead-source attribution
- **Docker** — containerized deployment

## How it works

```
Website quote form
      │  (webhook)
      ▼
   n8n workflow  ──►  parse + structure the submission
      │                     │
      ▼                     ▼
 Google Sheets        Telegram notification
 (structured leads)   (instant alert)
```

## Project structure

- `src/` — application source (TypeScript)
- `public/` — static assets
- `scripts/` — build/automation scripts
- `precios.json` — product/price catalog
- `Dockerfile`, `vite.config.ts`, `tsconfig.json` — build & deploy config
- `.env.example` — required environment variables (copy to `.env` and fill in)

## Running locally

```bash
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

## Why I built it

I'm an Industrial Engineer focused on data and automation. This project is a real example of turning a repetitive manual process (copying quote requests by hand) into an automated, traceable system that the business actually relies on.

---
*Built by Elio Enzo Giacosa — [LinkedIn](https://www.linkedin.com/in/elio-enzo-giacosa-452879291)*
