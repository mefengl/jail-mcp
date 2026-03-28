.PHONY: publish\:npm publish\:pypi publish\:skill

publish\:npm:
	@echo '//registry.npmjs.org/:_authToken='$$(op read 'op://Personal/npm-token/credential') > .npmrc
	npm publish --access public
	@rm -f .npmrc

publish\:pypi:
	uv build --no-sources
	UV_PUBLISH_TOKEN=$$(op read "op://Personal/pypi-token/credential") \
		uv publish

publish\:skill:
	npx clawhub@latest login --token "$$(op read 'op://Personal/clawhub-token/credential')" --no-browser
	npx clawhub@latest publish skills/ --slug jail-search
	npx clawhub@latest logout
