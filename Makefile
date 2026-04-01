.PHONY: publish\:npm publish\:pypi publish\:skill publish\:registry publish\:all

publish\:npm:
	@echo '//registry.npmjs.org/:_authToken='$$(op read 'op://Personal/npm-token/credential') > .npmrc
	npm publish --access public
	@rm -f .npmrc

publish\:pypi:
	uv build --no-sources
	UV_PUBLISH_TOKEN=$$(op read "op://Personal/pypi-token/credential") \
		uv publish

publish\:registry:
	@JWT=$$(curl -s -X POST https://registry.modelcontextprotocol.io/v0.1/auth/github-at \
		-H "Content-Type: application/json" \
		-d "{\"github_token\": \"$$(gh auth token)\"}" \
		| python3 -c "import sys,json; print(json.load(sys.stdin)['registry_token'])") && \
	curl -s -X POST https://registry.modelcontextprotocol.io/v0.1/publish \
		-H "Content-Type: application/json" \
		-H "Authorization: Bearer $$JWT" \
		-d @server.json | python3 -m json.tool

publish\:skill:
	npx clawhub@latest login --token "$$(op read 'op://Personal/clawhub-token/credential')" --no-browser
	npx clawhub@latest publish skills/ --slug jail-search --version "$$(node -p "require('./package.json').version")"
	npx clawhub@latest logout

publish\:all: publish\:npm publish\:pypi publish\:registry publish\:skill
	@echo "✅ Published to npm, PyPI, MCP Registry, and ClawHub"
	@echo ""
	@echo "Manual steps remaining:"
	@echo "  1. git push (for Claude Code marketplace)"
	@echo "  2. Submit to Anthropic marketplace: claude.ai/settings/plugins/submit"
