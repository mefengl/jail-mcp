# JAIL Search — MCP Server + Plugins

<!-- mcp-name: io.github.mefengl/jail-mcp -->

Search across papers, books, code, legal cases, forums, Wikipedia, and more from one API.

## Quick Start

Works with any MCP-compatible tool. No API key needed.

```json
{
  "mcpServers": {
    "jail": {
      "command": "npx",
      "args": ["-y", "jail-mcp@latest"]
    }
  }
}
```

Or with Python: `"command": "uvx", "args": ["jail-mcp"]`

### With API key

```json
{
  "mcpServers": {
    "jail": {
      "command": "npx",
      "args": ["-y", "jail-mcp@latest"],
      "env": { "JAIL_API_KEY": "your-api-key" }
    }
  }
}
```

## Plugins

### Claude Code

```bash
/plugin marketplace add mefengl/jail-mcp
/plugin install jail-search
```

Or add MCP directly:

```bash
claude mcp add jail -- npx -y jail-mcp@latest
```

### Hermes Agent

Add MCP server to `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  jail:
    command: "npx"
    args: ["-y", "jail-mcp@latest"]
    env:
      JAIL_API_KEY: ""  # optional
```

Or install the skill from ClawHub:

```bash
hermes skill install jail-search
```

### Copilot CLI

```
/mcp add
```

Or edit `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "jail": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "jail-mcp@latest"]
    }
  }
}
```

<details>
<summary>More clients: Claude Desktop, VS Code, Cursor, Windsurf, Crush</summary>

**Claude Desktop**

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "jail": {
      "command": "npx",
      "args": ["-y", "jail-mcp@latest"]
    }
  }
}
```

**VS Code / Copilot**

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "jail": {
      "command": "npx",
      "args": ["-y", "jail-mcp@latest"]
    }
  }
}
```

**Cursor**

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "jail": {
      "command": "npx",
      "args": ["-y", "jail-mcp@latest"]
    }
  }
}
```

**Windsurf**

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "jail": {
      "command": "npx",
      "args": ["-y", "jail-mcp@latest"]
    }
  }
}
```

**Crush (formerly OpenCode)**

Add to `.opencode.json` or Crush config:

```json
{
  "mcpServers": {
    "jail": {
      "command": "npx",
      "args": ["-y", "jail-mcp@latest"]
    }
  }
}
```
</details>

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search across all types. Filter by type, paginate with cursor. |
| `detail` | Get full metadata for a document by ID. |

## Content Types

| Type | Content |
|----------|---------|
| academic | OpenAlex, arXiv, Semantic Scholar, DBLP |
| audio | Podcasts and audio content |
| books | Books, digital libraries, and classical literature |
| crypto | DeFi protocols, token data, and on-chain analytics |
| economics | World Bank, IMF, FRED, ECB, BLS, Tax Foundation |
| fandom | Fan wiki articles and community knowledge bases |
| forums | Hacker News, StackExchange, Lobsters, LessWrong, and 60+ more |
| geo | World place names and geographic data |
| health | Clinical trials and food safety data |
| knowledge | Wikidata, structured knowledge, and facts |
| legal | Harvard Case Law, CourtListener, EUR-Lex, UK Legislation |
| music | Discogs, MusicBrainz |
| news | News articles and journalism |
| packages | npm, PyPI, Crates.io, Libraries.io |
| predictions | Prediction markets and forecasting |
| social | Mastodon, Lemmy, fediverse |
| tech | Dev.to, product community forums |
| video | IMDb, YouTube |
| wiki | Wikipedia (en/zh/de/fr/es/ru/ja/ko/it/pl/ar/cs/da/el/hi/hu/ro/az) |

## Pricing

| Plan | Queries | Results/query | QPS | Price |
|------|---------|---------------|-----|-------|
| Trial | Best-effort | 10 | — | — |
| Pro | 10,000/month | 50 | 10 | $5/month |
| Custom | Unlimited | Unlimited | Dedicated | [Contact](mailto:buyoufeng@jail.li) |

Be Pro at [jail.li](https://jail.li).

## License

MIT
