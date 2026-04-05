# Free Search Chat Agent

A lightweight chat agent that answers by searching only free sources and showing citations.

## Features

- 🔎 Free search stack (no paid API required):
  - DuckDuckGo Instant Answer API
  - Wikipedia REST Search API
- 🧠 Produces a concise synthesized answer from results.
- 🔗 Always returns clickable sources.
- 🎨 Clean, responsive single-page UI.

## Quick start (local)

```bash
npm start
```

Open: `http://localhost:3000`

## How it works

1. Frontend sends your message to `POST /api/chat`.
2. Backend searches DuckDuckGo + Wikipedia in parallel.
3. Backend merges and deduplicates links.
4. App returns:
   - short synthesized answer
   - list of sources for verification

## Complete free deployment options

> Status checked on **April 5, 2026**. Free tiers can change, so verify limits before production use.

### Option A (recommended): Koyeb Starter (free)

Koyeb currently documents a forever free Starter tier with one free web service.

1. Push this repo to GitHub.
2. Sign in to Koyeb: <https://www.koyeb.com/>
3. Create **Web Service** → **Deploy from GitHub**.
4. Select this repository.
5. Runtime settings:
   - Build command: *(leave default autodetect)*
   - Start command: `npm start`
   - Port: `3000`
6. Deploy and open the generated `*.koyeb.app` URL.

### Option B: Render Free Web Service

Render offers a free web service, but it spins down after inactivity.

1. Push this repo to GitHub.
2. Create account: <https://render.com/>
3. New → **Web Service** → connect repository.
4. Settings:
   - Environment: `Node`
   - Build command: `npm install` *(no dependencies, so this is quick)*
   - Start command: `npm start`
5. Deploy and use the generated `*.onrender.com` URL.

### Option C: Cloudflare Workers (free plan)

Cloudflare Workers has a free daily request allowance, but this app must be adapted from Node HTTP server style to Workers runtime.

- Good if you want global edge + very low cost.
- Requires code migration (`fetch` handler + static asset strategy).

## Free APIs you can use (and where to get them)

This project currently uses **completely free, no-key APIs**:

1. **DuckDuckGo Instant Answer API**  
   Endpoint: `https://api.duckduckgo.com/?q=...&format=json`
2. **Wikipedia REST API**  
   Docs: https://api.wikimedia.org/wiki/Main_Page

If you want to upgrade later with LLM text generation, common free-tier options:

- **Hugging Face Inference API** (free tier) — https://huggingface.co/
- **OpenRouter free models** — https://openrouter.ai/
- **Groq free tier models** — https://console.groq.com/

> For best stability in production, add provider fallbacks and basic caching.

## Project structure

```txt
.
├─ public/
│  ├─ app.js
│  ├─ index.html
│  └─ styles.css
├─ server.js
└─ package.json
```

## Notes

- This is a search-grounded assistant, not a fully autonomous reasoning agent.
- Accuracy depends on source quality; users should verify using source links.
