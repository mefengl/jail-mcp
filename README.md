# JAIL Search — MCP Server

<!-- mcp-name: io.github.mefengl/jail-mcp -->

[![Install in Cursor](https://img.shields.io/badge/Install_in-Cursor-000000?style=flat-square&logoColor=white)](https://cursor.com/en/install-mcp?name=jail&config=eyJuYW1lIjoiamFpbCIsInR5cGUiOiJodHRwIiwidXJsIjoiaHR0cHM6Ly9hcGkuamFpbC5saS9tY3AifQ==)
[![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=jail&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A//api.jail.li/mcp%22%7D)

Search a billion+ documents — papers, books, code, legal cases, forums, Wikipedia, and more.

**[jail.li](https://jail.li)**

## Installation

Connect to the hosted MCP server:

```
https://api.jail.li/mcp
```

[Get API key](https://jail.li#pricing) for higher limits — append `?jailApiKey=` to the URL.

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add --transport http jail https://api.jail.li/mcp
```

With API key:

```bash
claude mcp add --transport http jail "https://api.jail.li/mcp?jailApiKey=sk_live_..."
```
</details>

<details>
<summary><b>Codex</b></summary>

```bash
codex mcp add jail --url https://api.jail.li/mcp
```

With API key: `codex mcp add jail --url "https://api.jail.li/mcp?jailApiKey=sk_live_..."`
</details>

<details>
<summary><b>Cursor</b></summary>

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "jail": {
      "url": "https://api.jail.li/mcp"
    }
  }
}
```

With API key: `"url": "https://api.jail.li/mcp?jailApiKey=sk_live_..."`
</details>

<details>
<summary><b>VS Code</b></summary>

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "jail": {
      "type": "http",
      "url": "https://api.jail.li/mcp"
    }
  }
}
```

With API key: `"url": "https://api.jail.li/mcp?jailApiKey=sk_live_..."`
</details>

<details>
<summary><b>Claude Desktop</b></summary>

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "jail": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.jail.li/mcp"]
    }
  }
}
```

With API key: `"args": ["-y", "mcp-remote", "https://api.jail.li/mcp?jailApiKey=sk_live_..."]`
</details>

<details>
<summary><b>OpenCode</b></summary>

Add to your `opencode.json`:

```json
{
  "mcp": {
    "jail": {
      "type": "remote",
      "url": "https://api.jail.li/mcp",
      "enabled": true
    }
  }
}
```

With API key: `"url": "https://api.jail.li/mcp?jailApiKey=sk_live_..."`
</details>

<details>
<summary><b>Copilot CLI</b></summary>

Edit `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "jail": {
      "type": "http",
      "url": "https://api.jail.li/mcp"
    }
  }
}
```

With API key: `"url": "https://api.jail.li/mcp?jailApiKey=sk_live_..."`
</details>

<details>
<summary><b>Windsurf</b></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "jail": {
      "serverUrl": "https://api.jail.li/mcp"
    }
  }
}
```

With API key: `"serverUrl": "https://api.jail.li/mcp?jailApiKey=sk_live_..."`
</details>

<details>
<summary><b>Hermes</b></summary>

Add to `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  jail:
    url: "https://api.jail.li/mcp"
```

With API key: `url: "https://api.jail.li/mcp?jailApiKey=sk_live_..."`

Or install the skill: `hermes skill install jail-search`
</details>

### Via npm Package

<details>
<summary>Use the npm/pypi package for stdio transport</summary>

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

For API key with stdio: `"env": { "JAIL_API_KEY": "sk_live_..." }`
</details>

## Tools

| Tool | What it does |
|------|-------------|
| `search` | Search across all content types. Filter by type, paginate with cursor. |
| `detail` | Get full metadata for a document by ID. |

## Content Types

| Type | Sources |
|------|---------|
| academic | OpenAlex, arXiv, Semantic Scholar, DBLP |
| books | Books, digital libraries, classical literature |
| wiki | Wikipedia — en, zh, de, fr, es, ru, ja, ko + 10 more |
| forums | Hacker News, StackExchange, Lobsters, LessWrong, 60+ more |
| legal | Harvard Case Law, CourtListener, EUR-Lex, UK Legislation |
| news | News articles and journalism |
| packages | npm, PyPI, Crates.io, Libraries.io |
| economics | World Bank, IMF, FRED, ECB, BLS, Tax Foundation |
| knowledge | Wikidata, structured knowledge |
| video | IMDb, YouTube |
| music | Discogs, MusicBrainz |
| health | Clinical trials, food safety |
| geo | World place names, geographic data |
| tech | Dev.to, product community forums |
| social | Reddit, Mastodon, Lemmy, fediverse |
| fandom | Fan wiki articles, community knowledge |
| crypto | DeFi protocols, token data, on-chain analytics |
| predictions | Prediction markets, forecasting |
| audio | Podcasts and audio content |

## License

MIT
