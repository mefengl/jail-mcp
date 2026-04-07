"""JAIL Search MCP Server."""
from __future__ import annotations
import os, json
from typing import Any

import httpx
from mcp.types import CallToolResult, TextContent
from mcp.server.fastmcp import FastMCP

# ── Config ───────────────────────────────────────────────────────────
API_BASE = "https://api.jail.li"
_PLACEHOLDER_KEYS = {"", "test", "your_api_key", "your-api-key", "xxx", "sk-xxx"}
_raw_key = os.environ.get("JAIL_API_KEY", "").strip()
API_KEY = "" if _raw_key.lower() in _PLACEHOLDER_KEYS else _raw_key
TYPES = {
    # Recommended
    "academic": "OpenAlex, arXiv, Semantic Scholar, DBLP",
    "wiki": "Wikipedia (en/zh/de/fr/es/ru/ja/ko/it/pl/ar/cs/da/el/hi/hu/ro/az)",
    "books": "Books, digital libraries, and classical literature",
    "legal": "Harvard Case Law, CourtListener, EUR-Lex, UK Legislation",
    "forums": "Hacker News, StackExchange, Lobsters, LessWrong, and 60+ more",
    "economics": "World Bank, IMF, FRED, ECB, BLS, Tax Foundation",
    "packages": "npm, PyPI, Crates.io, Libraries.io",
    "knowledge": "Wikidata, structured knowledge, and facts",
    "news": "News articles and journalism",
    # Smaller or narrower indices
    "music": "Discogs, MusicBrainz",
    "video": "IMDb, YouTube",
    "health": "Clinical trials and food safety data",
    "geo": "World place names and geographic data",
    "fandom": "Fan wiki articles and community knowledge bases",
    "tech": "Dev.to, product community forums",
    "audio": "Podcasts and audio content",
    "social": "Mastodon, Lemmy, fediverse",
    "crypto": "DeFi protocols, token data, and on-chain analytics",
    "predictions": "Prediction markets and forecasting",
}

_client: httpx.AsyncClient | None = None
def _http():
    global _client
    if _client is None or _client.is_closed:
        hdrs = {"Accept": "application/json"}
        if API_KEY: hdrs["Authorization"] = f"Bearer {API_KEY}"
        _client = httpx.AsyncClient(base_url=API_BASE, timeout=30, headers=hdrs)
    return _client

async def _get(path: str, params: dict | None = None) -> dict:
    r = await _http().get(path, params=params)
    if r.status_code == 401: raise Exception("Invalid API key. Remove JAIL_API_KEY to use trial, or get a valid key at https://jail.li")
    if r.status_code == 429: raise Exception("Rate limit hit. Get a key at https://jail.li for higher limits.")
    r.raise_for_status()
    return r.json()

mcp = FastMCP("jail-search")

# ── Tools ────────────────────────────────────────────────────────────
def _summary(doc: dict) -> str:
    s = doc.get("title", "")
    if doc.get("author"): s += f" — {doc['author']}"
    if doc.get("year"): s += f" ({doc['year']})"
    if doc.get("id"): s += f" [{doc['id']}]"
    return s

@mcp.tool()
async def search(query: str, type: str, limit: int = 10, cursor: str | None = None):
    """Search documents. Returns ranked results with title, author, year, description, url, id, score — not full content. Use URLs from results with fetch/browsing to read actual documents.

    Use when: user asks to research, find papers/books/articles, look up facts, find discussions, legal cases, or any "search for..." request.

    Strategy: use 2-4 keywords per query (English preferred). Pick the right type first.
    Try synonyms if few results. Search across multiple types to cross-reference.
    Use detail() for full metadata on promising results.

    Args:
        query: Search query — use 2-4 keywords for best results. English preferred unless searching non-English content. Try different keywords and synonyms if first attempt returns few results.
        type: Content type (required). academic: OpenAlex/arXiv/Semantic Scholar/DBLP | wiki: Wikipedia 18 languages | books: books/digital libraries | legal: Case Law/CourtListener/EUR-Lex | forums: HN/StackExchange/Lobsters/LessWrong/60+ | economics: World Bank/IMF/FRED | packages: npm/PyPI/Crates.io | knowledge: Wikidata | news: news articles | music: Discogs/MusicBrainz | video: IMDb/YouTube | health: clinical trials | geo: world places | fandom: fan wikis | tech: Dev.to | audio: podcasts | social: Mastodon/Lemmy | crypto: DeFi/tokens | predictions: prediction markets.
        limit: Results to return (1-50). Trial max 10, Pro max 50.
        cursor: Opaque pagination token. Use next_cursor from previous response.
    """
    params: dict[str, Any] = {"q": query, "type": type, "limit": min(limit, 50)}
    if cursor is not None: params["cursor"] = cursor

    data = await _get("/v1/search", params)
    results = data.get("results", [])

    if results:
        top_summary = f"{data.get('count', len(results))} results"
        if data.get("time_ms"): top_summary += f" in {data['time_ms']}ms"
        top_summary += f". Top hit: {_summary(results[0])}"
        if data.get("next_cursor"): top_summary += " More results available."
    else:
        top_summary = f"No results found for: {query}"

    return CallToolResult(
        content=[TextContent(type="text", text=top_summary)],
        structuredContent={
            "results": results, "count": data.get("count", len(results)),
            "time_ms": data.get("time_ms"), "indices": data.get("indices"),
            "next_cursor": data.get("next_cursor"), "query": query,
            "type_filter": type, "message": None if results else top_summary,
        },
    )

@mcp.tool()
async def detail(doc_id: str):
    """Get full metadata for a document. Use IDs from search results.

    Args:
        doc_id: Document ID from search results (e.g. "md5:abc123...", "hn:19415066", "doi:10.1038/...")
    """
    doc = await _get(f"/v1/detail/{doc_id}")
    return CallToolResult(
        content=[TextContent(type="text", text=_summary(doc))],
        structuredContent={"document": doc, "message": None},
    )

# ── Resource ─────────────────────────────────────────────────────────
@mcp.resource("jail://schema")
async def schema_resource() -> str:
    """Compact machine-readable schema for tools."""
    return json.dumps({
        "server": "jail-search", "version": "1.0.0",
        "notes": ["type is required: pick the right type first", "search first, then detail with an id"],
        "tools": {
            "search": {"input": {"query": "string", "type": f"enum({','.join(sorted(TYPES))})",
                                  "limit": "int 1-50 default 10", "cursor": "string|null (opaque pagination token)"}},
            "detail": {"input": {"doc_id": "string (opaque ID from search results)"}},
        },
    }, indent=2)

# ── Prompt ───────────────────────────────────────────────────────────
@mcp.prompt()
def research(topic: str) -> str:
    """Multi-angle research: broad search, then drill into academic, books, forums."""
    return f"""Research: {topic}
1. search(query="{topic}")  2. Try related terms  3. type="academic"  4. type="books"
5. type="forums"  6. type="legal" if relevant  7. Summarize. Use cursor= to paginate."""

# ── Entry point ──────────────────────────────────────────────────────
def main():
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--http", action="store_true")
    p.add_argument("--port", type=int, default=8808)
    p.add_argument("--host", default="127.0.0.1")
    a = p.parse_args()
    mcp.run(transport="streamable-http" if a.http else "stdio", **({"host": a.host, "port": a.port} if a.http else {}))

if __name__ == "__main__":
    main()
