# JAIL Search — MCP Server

<!-- mcp-name: io.github.mefengl/jail-mcp -->

[![Install in Cursor](https://img.shields.io/badge/Install_in-Cursor-000000?style=flat-square&logoColor=white)](https://cursor.com/en/install-mcp?name=jail&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImphaWwtbWNwQGxhdGVzdCJdfQ==)
[![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=jail&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22jail-mcp%40latest%22%5D%7D)

Search 1.7B documents across papers, books, code, legal cases, forums, Wikipedia, and more.

**[jail.li](https://jail.li)**

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

## Installation

<details open>
<summary><b>Cursor</b></summary>

Add to `~/.cursor/mcp.json`:

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

<details>
<summary><b>VS Code</b></summary>

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
</details>

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add jail -- npx -y jail-mcp@latest
```
</details>

<details>
<summary><b>Claude Desktop</b></summary>

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
</details>

<details>
<summary><b>Copilot CLI</b></summary>

Edit `~/.copilot/mcp-config.json`:

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

<details>
<summary><b>Windsurf</b></summary>

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
</details>

<details>
<summary><b>Hermes</b></summary>

Add to `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  jail:
    command: "npx"
    args: ["-y", "jail-mcp@latest"]
```

Or install the skill: `hermes skill install jail-search`
</details>

<details>
<summary><b>Crush</b></summary>

```bash
npx -y jail-mcp@latest --http --port 8808
```
</details>

### With API key

Add `"env": { "JAIL_API_KEY": "your-key" }` to any config above for higher rate limits.

Get a key at [jail.li](https://jail.li#pricing).

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
| social | Mastodon, Lemmy, fediverse |
| fandom | Fan wiki articles, community knowledge |
| crypto | DeFi protocols, token data, on-chain analytics |
| predictions | Prediction markets, forecasting |
| audio | Podcasts and audio content |

## License

MIT
