# Technology Stack

**Analysis Date:** 2026-08-07

## Languages

**Primary:**
- TypeScript `^5.8.3` (resolved to `5.9.3` by `package-lock.json`) - application, SSR entry, routes, components, hooks, data models, and tests under `src/**/*.ts` and `src/**/*.tsx`; strict compiler settings are defined in `tsconfig.json`.
- TSX / React JSX - all route and component rendering under `src/routes/**/*.tsx` and `src/components/**/*.tsx`; JSX uses the `react-jsx` transform configured in `tsconfig.json`.

**Secondary:**
- CSS - global Tailwind v4 theme, utility imports, and custom responsive styling in `src/styles.css`.
- JavaScript (ES modules) - tool configuration in `eslint.config.js`; the package is explicitly ESM through `"type": "module"` in `package.json`.
- Markdown and YAML - product/architecture contracts under `00_docs/**/*.md`, `docs/**/*.md`, and `00_docs/openapi.yaml`; these documents describe a broader backend system that is not present in the executable `src/` tree.

## Runtime

**Environment:**
- Node.js `>=22.12.0` for local npm development and builds. `@tanstack/react-start` requires this minimum in `package-lock.json`; the repository does not pin Node with `.nvmrc`, `.node-version`, `engines`, or `.tool-versions`.
- Bun 1.x for the containerized development image. `Dockerfile` uses `oven/bun:1`, installs from `bun.lock`, exposes port 8080, and runs `bun run dev`.
- Browser runtime for the React UI and client persistence. Browser APIs are used in `src/hooks/useLocalStorage.ts`, `src/components/ui/sidebar.tsx`, and notebook export components such as `src/components/notebook/ArtifactDialog.tsx`.
- Cloudflare Workers-compatible server runtime for production output. `vite.config.ts` delegates to the Lovable preset, and generated `.output/nitro.json` records the `cloudflare-module` Nitro preset with Node compatibility.

**Package Manager:**
- npm - documented local workflow (`npm i`, `npm run dev`) in `README.md`; lockfile is `package-lock.json` (lockfile version 3).
- Bun - container workflow in `Dockerfile`; lockfile is `bun.lock` (lockfile version 1), with supply-chain age policy in `bunfig.toml`.
- Lockfiles: both `package-lock.json` and `bun.lock` are present. Keep both regenerated from `package.json` when dependencies change because npm is the documented local path while Docker consumes the Bun lockfile.

## Frameworks

**Core:**
- TanStack Start `^1.168.26` - full-stack React/SSR framework; request middleware is registered in `src/start.ts` and the custom server adapter is in `src/server.ts`.
- TanStack Router `^1.170.16` - file-based routes in `src/routes/`, generated route wiring in `src/routeTree.gen.ts`, and router construction in `src/router.tsx`.
- React `^19.2.0` / React DOM `^19.2.0` - UI and SSR component runtime throughout `src/**/*.tsx`.
- TanStack Query `^5.101.1` - `QueryClient` creation and context in `src/router.tsx` and `src/routes/__root.tsx`; no remote query functions are currently implemented.
- Tailwind CSS `^4.2.1` with `@tailwindcss/vite` `^4.2.1` - utility-first styling configured indirectly by `vite.config.ts` and imported/customized in `src/styles.css`.
- Radix UI primitives `1.x`/`2.x` with shadcn-style wrappers - accessible UI primitives in `src/components/ui/`; aliases and style metadata are in `components.json`.

**Testing:**
- Vitest `^4.1.10` - unit test runner configured by `vitest.config.ts`; test files are limited to `src/**/*.test.ts`.

**Build/Dev:**
- Vite `^8.0.16` - development server and production builder invoked by scripts in `package.json`.
- `@lovable.dev/vite-tanstack-config` `^2.7.7` - composite Vite configuration in `vite.config.ts`; supplies TanStack Start, React, Tailwind, TS path aliases, devtools, error logging, Nitro, and Cloudflare defaults.
- Nitro `3.0.260603-beta` - SSR/server output builder declared in `package.json`; generated build metadata is in `.output/nitro.json`.
- TypeScript `^5.8.3` - typechecking/compiler configuration in `tsconfig.json`; the build uses bundler mode and emits through Vite rather than `tsc`.
- ESLint `^9.32.0` with `typescript-eslint`, React Hooks, React Refresh, and Prettier plugins - linting policy in `eslint.config.js`.
- Prettier `^3.7.3` - formatting command in `package.json`, settings in `.prettierrc`, and exclusions in `.prettierignore`.

## Key Dependencies

**Critical:**
- `@tanstack/react-start` `^1.168.26` - owns SSR, middleware, server-function infrastructure, and generated runtime conventions used by `src/start.ts` and `src/server.ts`.
- `@tanstack/react-router` `^1.170.16` - navigation, loaders, errors, and page routes in `src/routes/`.
- `react` / `react-dom` `^19.2.0` - component runtime for all UI under `src/components/` and `src/routes/`.
- `@tanstack/react-query` `^5.101.1` - request-state context exposed at the root in `src/routes/__root.tsx`.
- `@radix-ui/react-*` packages - dialog, menu, tooltip, form control, navigation, and overlay primitives wrapped under `src/components/ui/`.
- `motion` `^12.42.2` - animation and reduced-motion behavior in `src/routes/council.tsx` and `src/components/KnowledgeCard.tsx`.

**Infrastructure:**
- `@lovable.dev/vite-tanstack-config` `^2.7.7` - central build/runtime integration in `vite.config.ts`; do not duplicate its included plugins.
- `nitro` `3.0.260603-beta` - generates the Cloudflare-compatible server bundle recorded under `.output/`.
- `clsx` `^2.1.1`, `tailwind-merge` `^3.5.0`, and `class-variance-authority` `^0.7.1` - class composition and component variants through `src/lib/utils.ts` and `src/components/ui/`.
- `lucide-react` `^0.575.0` - icon library used throughout `src/components/` and `src/routes/`.
- `sonner` `^2.0.7` - toast notifications through `src/components/ui/sonner.tsx` and feature components.
- `date-fns` `^4.1.0` - date formatting/manipulation dependency declared in `package.json`.

## Configuration

**Environment:**
- No `.env`, `.env.*`, or `.dev.vars` file is present at the repository root, and executable code under `src/` does not read `process.env` or `import.meta.env`.
- `vite.config.ts` notes that the Lovable preset can inject `VITE_*` variables, but no current source file consumes one.
- `.gitignore` excludes `.dev.vars` and `*.local`; use those ignored locations for local-only Cloudflare/Vite configuration if environment variables are introduced.
- The backend variables listed in `00_docs/12_Инфраструктура_и_DevOps.md` belong to a documented FastAPI architecture whose manifests and implementation are absent from this repository; they are not requirements for the current TanStack application.

**Build:**
- `package.json` - dependency versions and `dev`, `build`, `build:dev`, `preview`, `lint`, `test`, and `format` commands.
- `vite.config.ts` - Lovable/TanStack build preset and custom `src/server.ts` SSR entry.
- `tsconfig.json` - ES2022 target, strict TypeScript, bundler resolution, and `@/* -> src/*` alias.
- `vitest.config.ts` - unit test file inclusion.
- `eslint.config.js`, `.prettierrc`, and `.prettierignore` - code quality configuration.
- `components.json` - shadcn component generator metadata and aliases.
- `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and `bunfig.toml` - Bun-based development container and install policy.
- `.lovable/project.json` - Lovable template identity; repository synchronization constraints are documented in `AGENTS.md`.

## Platform Requirements

**Development:**
- Use Node.js `>=22.12.0` with npm for the documented workflow in `README.md`, or Bun 1.x for parity with `Dockerfile`.
- Install dependencies from `package.json` using the matching committed lockfile (`package-lock.json` for npm, `bun.lock` for Bun).
- Run `npm run dev` for Vite development, `npm run build` for Nitro output, `npm test` for Vitest, and `npm run lint` for ESLint; commands are defined in `package.json`.
- The application currently needs no database, backend API, identity provider, or required environment variable; mock content is in `src/data/mockCards.ts` and client persistence is in `src/hooks/useAppState.ts`.

**Production:**
- The build target is a Cloudflare Workers module with static assets. `vite.config.ts` selects the preset indirectly; `.output/nitro.json` and `.output/server/wrangler.json` show the generated worker shape and asset binding.
- `src/server.ts` is the production SSR fetch entry wrapper and delegates to `@tanstack/react-start/server-entry` while normalizing catastrophic 500 responses.
- Static asset cache policy is generated at `.output/public/_headers`; source-controlled public files live in `public/`.
- Lovable is connected to the repository according to `AGENTS.md` and `README.md`; pushed commits on the connected branch synchronize back to the Lovable editor.

---

*Stack analysis: 2026-08-07*
