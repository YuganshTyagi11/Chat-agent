# Free Search Chat Agent

A lightweight chat agent that answers by searching only free sources and showing citations.

## Features

- 🔎 Free search stack (no paid API required):
  - DuckDuckGo Instant Answer API
  - Wikipedia REST Search API
- 🧠 Produces a concise synthesized answer from results.
- 🔗 Always returns clickable sources.
- 🎨 Clean, responsive single-page UI.

## Quick start

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
