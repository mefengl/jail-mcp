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
    "academic": "OpenAlex, arXiv, Semantic Scholar, DBLP",
    "audio": "Podcasts and audio content",
    "books": "Books, digital libraries, and classical literature",
    "crypto": "DeFi protocols, token data, and on-chain analytics",
    "economics": "World Bank, IMF, FRED, ECB, BLS, Tax Foundation",
    "fandom": "Fan wiki articles and community knowledge bases",
    "forums": "Hacker News, StackExchange, Lobsters, LessWrong, and 60+ more",
    "geo": "World place names and geographic data",
    "health": "Clinical trials and food safety data",
    "knowledge": "Wikidata, structured knowledge, and facts",
    "legal": "Harvard Case Law, CourtListener, EUR-Lex, UK Legislation",
    "music": "Discogs, MusicBrainz",
    "news": "News articles and journalism",
    "packages": "npm, PyPI, Crates.io, Libraries.io",
    "predictions": "Prediction markets and forecasting",
    "social": "Mastodon, Lemmy, fediverse",
    "tech": "Dev.to, product community forums",
    "video": "IMDb, YouTube",
    "wiki": "Wikipedia (en/zh/de/fr/es/ru/ja/ko/it/pl/ar/cs/da/el/hi/hu/ro/az)",
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

INSTRUCTIONS = """You have access to JAIL Search — a discovery tool for finding documents across academic papers, case law, books, encyclopedias, forums, and more.

Results include titles, authors, URLs, and short descriptions. This is for discovering sources and links, not retrieving full content. After finding relevant results, use their URLs with fetch or browsing tools to read the actual documents.

## When to use
- User asks to research a topic, find papers, books, or articles
- User wants to look up facts, people, places, or concepts
- User asks about community discussions or forum threads
- User wants to find legal cases or legislation
- User needs to find music, movies, or other media metadata
- User asks "search for...", "find...", or "look up..."

## Quick start
1. Call `search(query="your topic", type="academic")` — type is required
2. Try multiple types: academic, books, wiki, forums, legal, news, knowledge
3. Use `detail(doc_id)` to get full metadata for a specific result

## Search strategy
1. Pick the right type first: academic for papers, books for books, wiki for encyclopedia, forums for discussions, legal for cases
2. Default to searching in English
3. Unless you know exactly what you're looking for, 2-4 keywords usually work best
4. Multi-word queries match any combination of terms, ranked by relevance
5. Try different keywords and synonyms if first attempt returns few results
6. Search the same topic across multiple types for cross-referencing
7. Paginate: use next_cursor from response as the `cursor` parameter

## Available types
academic, audio, books, crypto, economics, fandom, forums, geo, health, knowledge, legal, music, news, packages, predictions, social, tech, video, wiki

## Response fields
Each result: title, author, year, type, description (200 char), id, url, score.

## Need higher limits?
Get an API key at https://jail.li"""

mcp = FastMCP("jail-search", instructions=INSTRUCTIONS)

# ── Tools ────────────────────────────────────────────────────────────
def _summary(doc: dict) -> str:
    s = doc.get("title", "")
    if doc.get("author"): s += f" — {doc['author']}"
    if doc.get("year"): s += f" ({doc['year']})"
    if doc.get("id"): s += f" [{doc['id']}]"
    return s

@mcp.tool()
async def search(query: str, type: str, limit: int = 10, cursor: str | None = None):
    """Search documents. Returns ranked results with title, author, year, description.

    Args:
        query: Search query (natural language or keywords, any language)
        type: Content type (required). Use: academic, books, wiki, forums, legal, news, knowledge, music, video, audio, packages, geo, economics, health, fandom, social, tech, crypto, predictions.
        limit: Results to return (1-50). Trial max 10, Pro max 50.
        cursor: Opaque pagination token — use next_cursor from previous response
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
        "notes": ["type is required — pick the right type first", "search first, then detail with an id"],
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
