---
name: jail-search
description: Search 1.7B documents across papers, books, legal cases, forums, Wikipedia, and more from one API.
metadata: {"openclaw":{"requires":{"bins":["curl"]},"optionalEnv":["JAIL_API_KEY"],"emoji":"🔍","homepage":"https://jail.li"},"hermes":{"tags":["search","research","knowledge"],"category":"research"}}
---

# JAIL Search

Search engine covering 1.7 billion documents across 19 content types. Returns titles, authors, URLs, and short descriptions — for discovering sources and links, not retrieving full content. After finding relevant results, use their URLs with fetch or browsing tools to read the actual documents.

## When to Use

- User asks to research a topic, find papers, books, or articles
- User wants to look up facts, people, places, or concepts
- User asks about community discussions or forum threads
- User wants to find legal cases or legislation
- User needs to find music, movies, packages, or other metadata
- User asks "search for...", "find...", or "look up..."

## Via MCP (preferred if jail MCP server is configured)

Use `mcp_jail_search(query, type)` and `mcp_jail_detail(doc_id)`.

## Via curl (fallback)

### Search

```bash
curl -Gs "https://api.jail.li/v1/search" --data-urlencode "q=QUERY" -d "type=TYPE&limit=10"
```

With API key: add `-H "Authorization: Bearer $JAIL_API_KEY"`

Replace `QUERY` and `TYPE` (required, see below).

Paginate: add `&cursor=CURSOR` using `next_cursor` from previous response.

### Detail

```bash
curl -s "https://api.jail.li/v1/detail/DOC_ID"
```

## Types

Start with: `academic`, `wiki`, `books`, `legal`, `forums`. The rest just exist if you need.

| Type | Content |
|------|---------|
| `academic` | OpenAlex, arXiv, Semantic Scholar, DBLP |
| `wiki` | Wikipedia (18 languages) |
| `books` | Books, digital libraries, and classical literature |
| `legal` | Harvard Case Law, CourtListener, EUR-Lex, UK Legislation |
| `forums` | Hacker News, StackExchange, Lobsters, LessWrong, and 60+ more |
| `economics` | World Bank, IMF, FRED, ECB, BLS, Tax Foundation |
| `packages` | npm, PyPI, Crates.io, Libraries.io |
| `knowledge` | Wikidata, structured knowledge, and facts |
| `news` | News articles and journalism |
| `music` | Discogs, MusicBrainz |
| `video` | IMDb, YouTube |
| `health` | Clinical trials and food safety data |
| `geo` | World place names and geographic data |
| `fandom` | Fan wiki articles and community knowledge bases |
| `tech` | Dev.to, product community forums |
| `audio` | Podcasts and audio content |
| `social` | Mastodon, Lemmy, fediverse |
| `crypto` | DeFi protocols, token data, and on-chain analytics |
| `predictions` | Prediction markets and forecasting |

## Strategy

1. Pick the right type first — this determines which indices are searched
2. Use 2-4 keywords (English preferred unless searching non-English content)
3. Try different keywords and synonyms if first attempt returns few results
4. Search the same topic across multiple types for cross-referencing
5. Use `next_cursor` to paginate for more results
6. Use detail endpoint for full metadata on promising results

## Response fields

Each result: title, author, year, type, description (200 char), id, url, score.

Get an API key at https://jail.li for higher limits.
