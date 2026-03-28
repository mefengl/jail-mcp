---
name: jail-search
description: Search papers, books, code, legal cases, forums, Wikipedia, and more from one API.
metadata: {"openclaw":{"requires":{"bins":["curl"]},"optionalEnv":["JAIL_API_KEY"],"emoji":"🔍","homepage":"https://jail.li"}}
---

# JAIL Search

A discovery tool. Returns titles, authors, URLs, and short descriptions — not full content. Find sources here, then use `curl` or `fetch` to read the actual documents.

## When to use

- User asks to research a topic, find papers, books, or articles
- User wants to look up facts, people, places, or concepts
- User asks about community discussions or forum threads
- User wants to find legal cases or legislation
- User asks "search for...", "find...", or "look up..."

## Search

```bash
curl -Gs "https://api.jail.li/v1/search" --data-urlencode "q=QUERY" -d "type=TYPE&limit=10"
```

With API key: add `-H "Authorization: Bearer $JAIL_API_KEY"`

Replace `QUERY` and `TYPE` (required, see below).

Paginate: add `&cursor=CURSOR` using `next_cursor` from previous response.

## Detail

```bash
curl -s "https://api.jail.li/v1/detail/DOC_ID"
```

## Types

```bash
curl -s "https://api.jail.li/v1/types"
```

| Type | Content |
|------|---------|
| `academic` | OpenAlex, arXiv, Semantic Scholar, DBLP |
| `audio` | Podcasts and audio content |
| `books` | Books, digital libraries, and classical literature |
| `crypto` | DeFi protocols, token data, and on-chain analytics |
| `economics` | World Bank, IMF, FRED, ECB, BLS, Tax Foundation |
| `fandom` | Fan wiki articles and community knowledge bases |
| `forums` | Hacker News, StackExchange, Lobsters, LessWrong, and 60+ more |
| `geo` | World place names and geographic data |
| `health` | Clinical trials and food safety data |
| `knowledge` | Wikidata, structured knowledge, and facts |
| `legal` | Harvard Case Law, CourtListener, EUR-Lex, UK Legislation |
| `music` | Discogs, MusicBrainz |
| `news` | News articles and journalism |
| `packages` | npm, PyPI, Crates.io, Libraries.io |
| `predictions` | Prediction markets and forecasting |
| `social` | Mastodon, Lemmy, fediverse |
| `tech` | Dev.to, product community forums |
| `video` | IMDb, YouTube |
| `wiki` | Wikipedia (en/zh/de/fr/es/ru/ja/ko/it/pl/ar/cs/da/el/hi/hu/ro/az) |

## Strategy

1. Pick the right type first
2. 2-4 keywords work best
3. Try different types for cross-referencing
4. Use `next_cursor` to paginate
5. Use detail endpoint for full metadata
