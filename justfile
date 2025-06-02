# Leptos Playwright test commands

playwright-test:
	npx playwright test

playwright-ui:
	npx playwright test --ui

playwright-chromium:
	npx playwright test --project=chromium

playwright-file FILE:
	npx playwright test {{FILE}}

playwright-debug:
	npx playwright test --debug

playwright-codegen:
	npx playwright codegen