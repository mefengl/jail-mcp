#!/usr/bin/env node
/**
 * JAIL Search MCP Server.
 * Config: { "command": "npx", "args": ["-y", "jail-mcp"], "env": { "JAIL_API_KEY": "..." } }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ── Config ──────────────────────────────────────────────────────────
const API_BASE = "https://api.jail.li";
const PLACEHOLDER_KEYS = new Set(["", "test", "your_api_key", "your-api-key", "xxx", "sk-xxx"]);
const API_KEY = (() => {
  const raw = (process.env.JAIL_API_KEY ?? "").trim();
  return PLACEHOLDER_KEYS.has(raw.toLowerCase()) ? "" : raw;
})();
const TYPES = {
  // Recommended
  academic: "OpenAlex, arXiv, Semantic Scholar, DBLP",
  wiki: "Wikipedia (en/zh/de/fr/es/ru/ja/ko/it/pl/ar/cs/da/el/hi/hu/ro/az)",
  books: "Books, digital libraries, and classical literature",
  legal: "Harvard Case Law, CourtListener, EUR-Lex, UK Legislation",
  forums: "Hacker News, StackExchange, Lobsters, LessWrong, and 60+ more",
  economics: "World Bank, IMF, FRED, ECB, BLS, Tax Foundation",
  packages: "npm, PyPI, Crates.io, Libraries.io",
  knowledge: "Wikidata, structured knowledge, and facts",
  news: "News articles and journalism",
  // Smaller or narrower indices
  music: "Discogs, MusicBrainz",
  video: "IMDb, YouTube",
  health: "Clinical trials and food safety data",
  geo: "World place names and geographic data",
  fandom: "Fan wiki articles and community knowledge bases",
  tech: "Dev.to, product community forums",
  audio: "Podcasts and audio content",
  social: "Mastodon, Lemmy, fediverse",
  crypto: "DeFi protocols, token data, and on-chain analytics",
  predictions: "Prediction markets and forecasting",
};
const TYPE_KEYS = Object.keys(TYPES);

async function apiGet(path, params) {
  const url = new URL(path, API_BASE);
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const hdrs = { Accept: "application/json" };
  if (API_KEY) hdrs["Authorization"] = `Bearer ${API_KEY}`;
  const r = await fetch(url.toString(), { headers: hdrs });
  if (!r.ok) {
    if (r.status === 401) throw new Error("Invalid API key. Remove JAIL_API_KEY to use trial, or get a valid key at https://jail.li");
    if (r.status === 429) throw new Error("Rate limit hit. Get a key at https://jail.li for higher limits.");
    throw new Error(`API error ${r.status}: ${await r.text()}`);
  }
  return r.json();
}

function summary(doc) {
  let s = doc.title ?? "";
  if (doc.author) s += ` — ${doc.author}`;
  if (doc.year) s += ` (${doc.year})`;
  if (doc.id) s += ` [${doc.id}]`;
  return s;
}

// ── Server ──────────────────────────────────────────────────────────
const server = new McpServer({ name: "jail-search", version: "1.0.0" });

// ── Tools ───────────────────────────────────────────────────────────
server.tool(
  "search", "Search documents. Returns ranked results with title, author, year, description, url, id, score — not full content. Use URLs from results with fetch/browsing to read actual documents.\n\nUse when: user asks to research, find papers/books/articles, look up facts, find discussions, legal cases, or any \"search for...\" request.\n\nStrategy: use 2-4 keywords per query (English preferred). Pick the right type first. Try synonyms if few results. Search across multiple types to cross-reference. Use detail() for full metadata on promising results.",
  {
    query: z.string().describe("Search query — use 2-4 keywords for best results. English preferred unless searching non-English content. Try different keywords and synonyms if first attempt returns few results."),
    type: z.enum(TYPE_KEYS).describe("Content type (required). academic: OpenAlex/arXiv/Semantic Scholar/DBLP | wiki: Wikipedia 18 languages | books: books/digital libraries | legal: Case Law/CourtListener/EUR-Lex | forums: HN/StackExchange/Lobsters/LessWrong/60+ | economics: World Bank/IMF/FRED | packages: npm/PyPI/Crates.io | knowledge: Wikidata | news: news articles | music: Discogs/MusicBrainz | video: IMDb/YouTube | health: clinical trials | geo: world places | fandom: fan wikis | tech: Dev.to | audio: podcasts | social: Mastodon/Lemmy | crypto: DeFi/tokens | predictions: prediction markets."),
    limit: z.number().int().min(1).max(50).default(10).describe("Results to return (1-50). Trial max 10, Pro max 50."),
    cursor: z.string().optional().describe("Opaque pagination token. Use next_cursor from previous response."),
  },
  async ({ query, type, limit, cursor }) => {
    const params = { q: query, type, limit: Math.min(limit ?? 10, 50) };
    if (cursor !== undefined) params.cursor = cursor;

    const data = await apiGet("/v1/search", params);
    const results = data.results ?? [];

    let text;
    if (results.length) {
      text = `${data.count} results`;
      if (data.time_ms) text += ` in ${data.time_ms}ms`;
      text += `. Top hit: ${summary(results[0])}`;
      if (data.next_cursor) text += " More results available.";
    } else {
      text = `No results found for: ${query}`;
    }

    return {
      content: [{ type: "text", text }],
      structuredContent: {
        results, count: data.count ?? results.length,
        time_ms: data.time_ms ?? null, indices: data.indices ?? null,
        next_cursor: data.next_cursor ?? null, query, type_filter: type ?? null,
        message: results.length ? null : text,
      },
    };
  },
);

server.tool(
  "detail", "Get full metadata for a document. Use IDs from search results.",
  { doc_id: z.string().describe('Document ID from search results (e.g. "md5:abc123...", "hn:19415066", "doi:10.1038/...")') },
  async ({ doc_id }) => {
    const doc = await apiGet(`/v1/detail/${doc_id}`);
    return {
      content: [{ type: "text", text: summary(doc) }],
      structuredContent: { document: doc, message: null },
    };
  },
);

// ── Resource ────────────────────────────────────────────────────────
server.resource("jail://schema", "jail://schema", async () => ({
  contents: [{
    uri: "jail://schema",
    mimeType: "application/json",
    text: JSON.stringify({
      server: "jail-search", version: "1.0.0",
      notes: ["type is required: pick the right type first", "search first, then detail with an id"],
      tools: {
        search: { input: { query: "string", type: `enum(${TYPE_KEYS.sort().join(",")})`,
                           limit: "int 1-50 default 10", cursor: "string|null (opaque pagination token)" } },
        detail: { input: { doc_id: "string (opaque ID from search results)" } },
      },
    }, null, 2),
  }],
}));

// ── Prompt ───────────────────────────────────────────────────────────
server.prompt("research", { topic: z.string() }, ({ topic }) => ({
  messages: [{
    role: "user",
    content: { type: "text", text: `Research: ${topic}
1. search(query="${topic}")  2. Try related terms  3. type="academic"  4. type="books"
5. type="forums"  6. type="legal" if relevant  7. Summarize. Use cursor= to paginate.` },
  }],
}));

// ── Start ───────────────────────────────────────────────────────────
await server.connect(new StdioServerTransport());
