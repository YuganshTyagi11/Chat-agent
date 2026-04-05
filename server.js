import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function dedupeSources(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url?.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function firstSentence(text = '') {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^(.*?[.!?])\s/);
  return match ? match[1] : trimmed;
}

async function searchDuckDuckGo(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const response = await fetch(url, { headers: { 'User-Agent': 'FreeChatAgent/1.0' } });
  if (!response.ok) throw new Error(`DuckDuckGo request failed: ${response.status}`);

  const data = await response.json();
  const sources = [];

  if (data.AbstractText && data.AbstractURL) {
    sources.push({
      title: data.Heading || 'DuckDuckGo Instant Answer',
      snippet: data.AbstractText,
      url: data.AbstractURL,
      source: 'DuckDuckGo'
    });
  }

  const flattenRelated = (topics = []) => {
    const out = [];
    for (const topic of topics) {
      if (Array.isArray(topic.Topics)) {
        out.push(...flattenRelated(topic.Topics));
      } else if (topic.Text && topic.FirstURL) {
        out.push({
          title: topic.Text.split(' - ')[0].slice(0, 110),
          snippet: topic.Text,
          url: topic.FirstURL,
          source: 'DuckDuckGo'
        });
      }
    }
    return out;
  };

  sources.push(...flattenRelated(data.RelatedTopics).slice(0, 7));
  return sources;
}

async function searchWikipedia(query) {
  const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=5`;
  const response = await fetch(searchUrl, { headers: { 'Api-User-Agent': 'FreeChatAgent/1.0' } });
  if (!response.ok) throw new Error(`Wikipedia search failed: ${response.status}`);

  const data = await response.json();
  const pages = data.pages || [];

  return pages.map((page) => ({
    title: page.title,
    snippet: page.description || page.excerpt?.replace(/<[^>]*>/g, '') || 'Wikipedia result',
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
    source: 'Wikipedia'
  }));
}

function synthesizeAnswer(query, sources) {
  if (!sources.length) {
    return `I couldn't find reliable free-source results for "${query}" right now. Please rephrase your question or try again in a moment.`;
  }

  const intro = `Here is what I found for "${query}":`;
  const bullets = sources.slice(0, 4).map((item) => `- ${firstSentence(item.snippet)}`).join('\n');
  return `${intro}\n${bullets}\n\nI included sources below so you can verify details.`;
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, { 'Content-Type': MIME_TYPES['.json'], 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

async function handleChat(req, res) {
  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
    if (raw.length > 1_000_000) req.destroy();
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(raw || '{}');
      const message = parsed?.message?.trim();
      if (!message) return sendJson(res, 400, { error: 'message is required' });

      const [ddg, wiki] = await Promise.allSettled([searchDuckDuckGo(message), searchWikipedia(message)]);
      const sources = dedupeSources([
        ...(ddg.status === 'fulfilled' ? ddg.value : []),
        ...(wiki.status === 'fulfilled' ? wiki.value : [])
      ]).slice(0, 8);

      return sendJson(res, 200, {
        answer: synthesizeAnswer(message, sources),
        sources,
        diagnostics: { duckduckgo: ddg.status, wikipedia: wiki.status }
      });
    } catch {
      return sendJson(res, 500, { error: 'Something went wrong while searching.' });
    }
  });
}

async function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/chat') return handleChat(req, res);
  if (req.method === 'GET') return serveStatic(req, res);
  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(port, () => {
  console.log(`Free Chat Agent running at http://localhost:${port}`);
});
