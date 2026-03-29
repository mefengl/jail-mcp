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

const INSTRUCTIONS = `You have access to JAIL Search, a discovery tool for finding documents across academic papers, case law, books, encyclopedias, forums, and more.

Results include titles, authors, URLs, and short descriptions. This is for discovering sources and links, not retrieving full content. After finding relevant results, use their URLs with fetch or browsing tools to read the actual documents.

## When to use
- User asks to research a topic, find papers, books, or articles
- User wants to look up facts, people, places, or concepts
- User asks about community discussions or forum threads
- User wants to find legal cases or legislation
- User needs to find music, movies, or other media metadata
- User asks "search for...", "find...", or "look up..."

## Quick start
1. Call \`search(query="your topic", type="academic")\`. Type is required.
2. Start with: academic, wiki, books, legal, forums. The rest just exist if you need.
3. Use \`detail(doc_id)\` to get full metadata for a specific result

## Search strategy
1. Pick the right type first: academic for papers, books for books, wiki for encyclopedia, forums for discussions, legal for cases
2. Default to searching in English
3. Unless you know exactly what you're looking for, 2-4 keywords usually work best
4. Multi-word queries match any combination of terms, ranked by relevance
5. Try different keywords and synonyms if first attempt returns few results
6. Search the same topic across multiple types for cross-referencing
7. Paginate: use next_cursor from response as the \`cursor\` parameter

## Available types
academic, wiki, books, legal, forums, economics, packages, knowledge, news
  music, video, health, geo, fandom, tech, audio, social, crypto, predictions

## Response fields
Each result: title, author, year, type, description (200 char), id, url, score.

## Need higher limits?
Get an API key at https://jail.li`;

// ── Server ──────────────────────────────────────────────────────────
const server = new McpServer({ name: "jail-search", version: "1.0.0" }, { instructions: INSTRUCTIONS });

// ── Tools ───────────────────────────────────────────────────────────
server.tool(
  "search", "Search documents. Returns ranked results with title, author, year, description.",
  {
    query: z.string().describe("Search query (natural language or keywords, any language)"),
    type: z.enum(TYPE_KEYS).describe("Content type (required). Use: academic, books, wiki, forums, legal, news, knowledge, music, video, audio, packages, geo, economics, health, fandom, social, tech, crypto, predictions."),
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
