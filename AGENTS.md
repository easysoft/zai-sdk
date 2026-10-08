# Repository Guidelines

Contributor and coding-agent instructions. See [README.md](./README.md) for installation and SDK usage. Keep repository workflows here and link detailed documentation instead of duplicating it.

## Project Structure & Module Organization

- `src/` contains the public SDK entry point, generated client, authentication, transport, streaming, and diagnostics.
- `tests/` contains unit and live tests; `tests/browser/` contains Playwright tests and fixtures.
- `scripts/` handles generation, builds, and package validation.
- `docs/` holds Chinese documentation sources and generated HTML; `examples/` contains usage examples.

## Build, Test, and Development Commands

Use the Node.js requirement and pnpm version declared in [package.json](./package.json). Run commands from the repository root.

- `pnpm install`: install dependencies.
- `pnpm build`: build distributable files in `dist/`.
- `pnpm exec playwright install chromium firefox webkit`: install test browsers.
- `pnpm check`: run the full CI suite: generation, docs, ESLint, types, coverage, browsers, and package consumption.

Routine checks require no service credentials. Playwright starts its own Vite server.

## Generated API & Documentation

Maintain `zai-openapi.json`, the add-only `zai-openapi.supplement.json`, and mappings, permissions, and sources in `scripts/operations.ts`. Run `pnpm generate:api` after contract changes. Never hand-edit generated `src/schema.ts`, `src/client.ts`, `src/operations.ts`, or `docs/index.html`.

Run `pnpm docs:build` after API or documentation-source changes; commit generated files with their sources. Follow [docs/MAINTENANCE.md](./docs/MAINTENANCE.md) for the documentation workflow.

## Coding Style & Naming Conventions

Use strict TypeScript/NodeNext, two-space indentation, single quotes, semicolons, and compact brace spacing. Suffix relative imports with `.js`; use type-only imports where appropriate. Use camelCase functions/variables, PascalCase types, and lowercase hyphenated filenames. Preserve snake_case payload fields. Validate with `pnpm lint` and `pnpm typecheck`.

## Testing Guidelines

Use `pnpm test:unit` for Vitest (`tests/*.test.ts`, excluding live tests) and `pnpm test:browser` for Playwright (`tests/browser/*.spec.ts`). Add regressions for changed behavior. `pnpm test:coverage` enforces thresholds and exclusions defined in [vitest.config.ts](./vitest.config.ts).

For Markdown-only changes, verify links, commands, and whitespace. Historical results in [docs/VALIDATION.md](./docs/VALIDATION.md) do not replace current checks.

## Commit & Pull Request Guidelines

Write commit messages in English. Prefix the first line with `*` (change), `+` (addition), or `-` (removal); no emoji. Example: `* Clarify contributor guidelines`.

Keep commits focused. PRs should explain behavior changes, link relevant issues, report checks, and include screenshots for documentation UI changes.

## Security & Configuration

Never commit credentials or log tokens. For deliberate `pnpm test:live` runs, configure ignored `.env.local` from [.env.example](./.env.example). These tests create temporary resources and consume model usage; prerequisites and validation scope are in [docs/LIVE-VALIDATION.md](./docs/LIVE-VALIDATION.md).
