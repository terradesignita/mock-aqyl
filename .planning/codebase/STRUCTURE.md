# Codebase Structure

**Analysis Date:** 2026-08-07

## Directory Layout

```text
Insight Navigator/
├── src/                              # Implemented TypeScript/React application
│   ├── routes/                       # TanStack file-based routes and root shell
│   ├── components/                   # Shared and feature presentation components
│   │   ├── advisor/                  # AI-advisor workflow components
│   │   ├── notebook/                 # Case workspace source/chat/studio components
│   │   │   └── artifacts/            # Artifact-specific viewers/builders
│   │   └── ui/                       # Radix/shadcn-style UI primitives
│   ├── data/                         # Domain types, mock records, and pure behavior
│   ├── hooks/                        # Browser state and interaction hooks
│   ├── lib/                          # Shared pure helpers and error utilities
│   ├── server.ts                     # SSR runtime fetch wrapper
│   ├── start.ts                      # TanStack Start middleware registration
│   ├── router.tsx                    # Router and QueryClient factory
│   ├── routeTree.gen.ts              # Generated route registry
│   └── styles.css                    # Tailwind theme, tokens, and global styles
├── public/                           # Static web assets copied to output
│   └── personas/                     # Council persona portrait images
├── docs/                             # Feature specifications, plans, and persona docs
│   ├── council-personas/             # Persona definition documents
│   └── superpowers/                  # Design specifications and implementation plans
├── 00_docs/                          # Product/system documentation and ADRs
│   └── adr/                          # Architecture decision records
├── .planning/codebase/               # GSD codebase reference documents
├── .output/                          # Ignored generated production build output
├── .tanstack/                        # Ignored TanStack temporary/generated state
├── .wrangler/                        # Ignored Cloudflare deployment state
├── graphify-out/                     # Ignored generated code-analysis output
├── package.json                      # Scripts and JavaScript dependencies
├── vite.config.ts                    # Lovable/TanStack Start build configuration
├── tsconfig.json                     # TypeScript compiler and @/* alias configuration
├── components.json                   # UI generator aliases and style configuration
├── eslint.config.js                  # TypeScript/React lint configuration
├── vitest.config.ts                  # Test discovery configuration
├── Dockerfile                        # Bun development container entry
├── package-lock.json                 # npm dependency lockfile
└── bun.lock                          # Bun dependency lockfile
```

## Directory Purposes

**`src/routes/`:**
- Purpose: Define the URL tree and compose each full-page workflow using TanStack Start file routing.
- Contains: The root document/layout route, dashboard route, dynamic card route, council route, and route-specific guidance.
- Key files: `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/card.$id.tsx`, `src/routes/council.tsx`, `src/routes/README.md`
- Placement rule: Add route modules here using the filename-to-URL rules documented in `src/routes/README.md`; preserve `<Outlet />` in `src/routes/__root.tsx`.

**`src/components/`:**
- Purpose: Hold reusable application components that are not themselves URL entry points.
- Contains: Global shell elements in `src/components/Header.tsx` and `src/components/Footer.tsx`, discovery components in `src/components/SearchPanel.tsx` and `src/components/KnowledgeCard.tsx`, shared conversation elements in `src/components/MessageBubble.tsx`, and feature subdirectories.
- Key files: `src/components/Header.tsx`, `src/components/SearchPanel.tsx`, `src/components/KnowledgeCard.tsx`, `src/components/MessageBubble.tsx`
- Placement rule: Put cross-route feature components directly in `src/components/`; put components specific to an established feature in its subdirectory.

**`src/components/advisor/`:**
- Purpose: Render the advisor clarification-to-recommendation workflow.
- Contains: The stage orchestrator, clarification UI, understanding confirmation, and structured answer display.
- Key files: `src/components/advisor/AdvisorFlow.tsx`, `src/components/advisor/ClarifyBlock.tsx`, `src/components/advisor/UnderstandingCard.tsx`, `src/components/advisor/AdvisorAnswer.tsx`
- Placement rule: Put advisor-only presenters here and keep advisor domain rules/types in `src/data/advisor.ts`.

**`src/components/notebook/`:**
- Purpose: Implement the three-panel card workspace and source/artifact dialogs.
- Contains: Source selection/reading, grounded chat, artifact studio, and dialog shells.
- Key files: `src/components/notebook/SourcesPanel.tsx`, `src/components/notebook/NotebookChat.tsx`, `src/components/notebook/StudioPanel.tsx`, `src/components/notebook/SourceReaderDialog.tsx`, `src/components/notebook/ArtifactDialog.tsx`
- Placement rule: Put notebook workspace features here and compose them from `src/routes/card.$id.tsx`.

**`src/components/notebook/artifacts/`:**
- Purpose: Render and build individual generated-artifact formats.
- Contains: Quiz, presentation deck, insight card deck, podcast player/transcript, and infographic views.
- Key files: `src/components/notebook/artifacts/QuizView.tsx`, `src/components/notebook/artifacts/DeckViewer.tsx`, `src/components/notebook/artifacts/CardsDeck.tsx`, `src/components/notebook/artifacts/PodcastPlayer.tsx`, `src/components/notebook/artifacts/InfographicView.tsx`
- Placement rule: Add one PascalCase file per artifact format here and register its ID/metadata/build selection in `src/components/notebook/StudioPanel.tsx`.

**`src/components/ui/`:**
- Purpose: Provide low-level, feature-neutral UI primitives.
- Contains: Radix wrappers and styled controls such as `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/select.tsx`, `src/components/ui/sheet.tsx`, and `src/components/ui/tooltip.tsx`.
- Key files: `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/sonner.tsx`, `src/components/ui/sidebar.tsx`
- Placement rule: Add generic primitives here; use aliases configured in `components.json` and class composition from `src/lib/utils.ts`.

**`src/data/`:**
- Purpose: Define domain types, static datasets, deterministic recommendation/chat rules, and pure selectors.
- Contains: Card catalog/domain in `src/data/mockCards.ts`, advisor domain in `src/data/advisor.ts`, council domain in `src/data/council.ts`, and co-located pure-domain tests.
- Key files: `src/data/mockCards.ts`, `src/data/advisor.ts`, `src/data/council.ts`, `src/data/advisor.test.ts`, `src/data/council.test.ts`
- Placement rule: Put feature-domain models and pure builders here when they do not depend on React or browser APIs; co-locate their `*.test.ts` files.

**`src/hooks/`:**
- Purpose: Encapsulate reusable React state, browser adapters, and UI interaction mechanics.
- Contains: Generic localStorage synchronization, domain-specific persistent state, mobile detection, and resizable panel logic.
- Key files: `src/hooks/useLocalStorage.ts`, `src/hooks/useAppState.ts`, `src/hooks/use-mobile.tsx`, `src/hooks/useResizablePanel.ts`, `src/hooks/useResizablePanel.test.ts`
- Placement rule: Put reusable hooks here; centralize new persistent `biaqyl:*` state adapters in `src/hooks/useAppState.ts` unless the hook forms a separate cohesive module.

**`src/lib/`:**
- Purpose: Hold shared framework-independent transformations, lightweight utilities, and infrastructure helpers.
- Contains: Search/filtering in `src/lib/search.ts`, citation-to-source adaptation in `src/lib/sources.ts`, class/plural utilities in `src/lib/utils.ts`, SSR error HTML in `src/lib/error-page.ts`, server error capture in `src/lib/error-capture.ts`, and Lovable preview reporting in `src/lib/lovable-error-reporting.ts`.
- Key files: `src/lib/search.ts`, `src/lib/sources.ts`, `src/lib/utils.ts`, `src/lib/error-capture.ts`, `src/lib/lovable-error-reporting.ts`
- Placement rule: Put stateless helpers here; use a feature-significant filename rather than a catch-all utility file when logic has a domain purpose.

**`public/`:**
- Purpose: Serve files by stable root-relative URLs without importing them into the TypeScript bundle.
- Contains: Favicons, robots instructions, general images, and persona portraits under `public/personas/`.
- Key files: `public/favicon.svg`, `public/favicon.ico`, `public/robots.txt`, `public/personas/founder.png`
- Placement rule: Put externally addressed static assets here; put persona portraits in `public/personas/<persona-id>.png` so IDs in `src/data/council.ts` remain usable as asset keys.

**`docs/`:**
- Purpose: Store implementation-facing product specs, design specs, plans, and council persona source documents.
- Contains: Advisor requirements in `docs/ai-sovetnik.md`, persona documents in `docs/council-personas/`, and design/implementation records in `docs/superpowers/`.
- Key files: `docs/ai-sovetnik.md`, `docs/council-personas/README.md`, `docs/superpowers/specs/2026-08-04-council-visual-redesign-design.md`
- Placement rule: Put feature-specific implementation/design documents here; use `00_docs/` for system-wide product and architecture documentation.

**`00_docs/`:**
- Purpose: Hold broader product, system architecture, API, data, operations, security, and governance documentation.
- Contains: Numbered Russian-language system documents, `00_docs/openapi.yaml`, and ADRs under `00_docs/adr/`.
- Key files: `00_docs/05_Архитектура_системы.md`, `00_docs/10_API_контракты.md`, `00_docs/20_ADR_реестр.md`, `00_docs/adr/ADR-0004-Strict_grounded_mode_по_умолчанию.md`
- Placement rule: Add cross-system documentation using the existing numbered naming scheme; add architecture decisions as `ADR-NNNN-<decision>.md` under `00_docs/adr/`.

## Key File Locations

**Entry Points:**
- `src/server.ts`: Runtime HTTP fetch entry and SSR failure normalization.
- `src/start.ts`: Request middleware and CSRF registration.
- `src/router.tsx`: Router and QueryClient factory.
- `src/routes/__root.tsx`: HTML shell, global providers, metadata, root boundaries, and nested-route outlet.
- `src/routes/index.tsx`: `/` search dashboard and advisor-mode composition root.
- `src/routes/card.$id.tsx`: `/card/:id` loader and notebook workspace composition root.
- `src/routes/council.tsx`: `/council` session workspace composition root.

**Configuration:**
- `package.json`: Application scripts and runtime/development dependencies.
- `vite.config.ts`: Lovable TanStack preset and custom server-entry selection.
- `tsconfig.json`: Strict TypeScript settings and `@/*` to `src/*` path alias.
- `eslint.config.js`: TypeScript, React Hooks, React Refresh, and Prettier lint integration.
- `vitest.config.ts`: `src/**/*.test.ts` test discovery.
- `components.json`: shadcn-style UI generator configuration and aliases.
- `src/styles.css`: Tailwind 4 source configuration, semantic design tokens, dark theme, and global CSS.

**Core Logic:**
- `src/data/mockCards.ts`: Knowledge-card types, catalog, and card selectors.
- `src/lib/search.ts`: Discovery filtering, scoring, and sorting.
- `src/lib/sources.ts`: Notebook source-view-model construction.
- `src/data/advisor.ts`: Advisor classification, clarification, recommendation, and follow-up rules.
- `src/data/council.ts`: Persona/session models and discussion-message builders.
- `src/hooks/useAppState.ts`: Persistent state API for routes and features.
- `src/hooks/useLocalStorage.ts`: Generic browser persistence primitive.

**Feature UI:**
- `src/components/SearchPanel.tsx`: Main search and advisor-mode input.
- `src/components/KnowledgeCard.tsx`: Search-result card and navigation actions.
- `src/components/advisor/AdvisorFlow.tsx`: Advisor stage machine.
- `src/components/notebook/NotebookChat.tsx`: Source-grounded local chat flow.
- `src/components/notebook/SourcesPanel.tsx`: Source selection and notes surface.
- `src/components/notebook/StudioPanel.tsx`: Artifact selection and generation surface.
- `src/components/MessageBubble.tsx`: Shared message presentation used by notebook/advisor/council features.

**Testing:**
- `src/data/advisor.test.ts`: Pure advisor-domain tests.
- `src/data/council.test.ts`: Pure council-domain tests.
- `src/hooks/useResizablePanel.test.ts`: Resizable-width helper tests.
- `vitest.config.ts`: Test file inclusion pattern.

**Static Assets and Documentation:**
- `public/personas/`: Persona images referenced by council identity data.
- `docs/council-personas/`: Persona design/source documents.
- `00_docs/`: System-level specifications and decisions.
- `.planning/codebase/`: Generated codebase maps used by GSD planning/execution.

## Naming Conventions

**Files:**
- Use PascalCase `.tsx` names for React application components, as in `src/components/KnowledgeCard.tsx`, `src/components/advisor/AdvisorAnswer.tsx`, and `src/components/notebook/SourceReaderDialog.tsx`.
- Use lowercase kebab-like primitive filenames in `src/components/ui/`, as in `src/components/ui/alert-dialog.tsx`, `src/components/ui/scroll-area.tsx`, and `src/components/ui/toggle-group.tsx`.
- Use `use` plus a descriptive hook name for reusable hooks, as in `src/hooks/useLocalStorage.ts`, `src/hooks/useAppState.ts`, and `src/hooks/useResizablePanel.ts`; `src/hooks/use-mobile.tsx` is the existing lowercase exception.
- Use lowercase domain-purpose names for non-component modules, as in `src/data/advisor.ts`, `src/data/council.ts`, `src/lib/search.ts`, and `src/lib/sources.ts`.
- Use co-located `<module>.test.ts` names for tests, as in `src/data/advisor.test.ts`, `src/data/council.test.ts`, and `src/hooks/useResizablePanel.test.ts`.
- Use TanStack route filenames from `src/routes/README.md`: `index.tsx` for `/`, `$` for dynamic segments such as `src/routes/card.$id.tsx`, and `__root.tsx` for the application shell.
- Treat `.gen.ts` as generated code, as in `src/routeTree.gen.ts`; do not edit it manually.

**Directories:**
- Use lowercase plural or domain names under `src/`, as in `src/components/`, `src/routes/`, `src/hooks/`, `src/lib/`, `src/data/`, `src/components/advisor/`, and `src/components/notebook/`.
- Mirror feature boundaries in nested component directories, as in `src/components/notebook/artifacts/`; keep generic controls in `src/components/ui/`.
- Use stable lowercase persona IDs for matching data, docs, and assets across `src/data/council.ts`, `docs/council-personas/`, and `public/personas/`.
- Use zero-padded numeric prefixes for ordered system documentation in `00_docs/` and zero-padded ADR numbers in `00_docs/adr/`.

**Symbols:**
- Use PascalCase for components and interfaces such as `KnowledgeCard`, `KnowledgeCardData`, `CouncilSession`, and `NotebookSource` in `src/components/KnowledgeCard.tsx`, `src/data/mockCards.ts`, `src/data/council.ts`, and `src/lib/sources.ts`.
- Use camelCase for functions/hooks and local values such as `searchCards()`, `buildNotebookSources()`, `useCouncilSessions()`, and `selectedCitations` in `src/lib/search.ts`, `src/lib/sources.ts`, `src/hooks/useAppState.ts`, and `src/routes/card.$id.tsx`.
- Use UPPER_SNAKE_CASE for module constants such as `PAGE_SIZE` in `src/routes/index.tsx`, `MAX_PERSONAS` in `src/routes/council.tsx`, and `THINKING_STEPS` in `src/data/advisor.ts`.

## Where to Add New Code

**New Route/Feature:**
- Primary code: Add the URL entry under `src/routes/` using `src/routes/README.md`; keep full-page state and sibling-component wiring in that route module.
- Feature components: Add route-specific presenters under a new `src/components/<feature>/` directory when the feature contains multiple cohesive components; use `src/components/advisor/` and `src/components/notebook/` as the pattern.
- Domain logic: Add framework-independent types, rules, and seed data under `src/data/<feature>.ts`; keep React/browser dependencies out of that module.
- Tests: Add pure-domain tests beside the module as `src/data/<feature>.test.ts`, matching `vitest.config.ts`.

**New Search or Card Capability:**
- Primary code: Extend the card model/catalog in `src/data/mockCards.ts` and search behavior in `src/lib/search.ts`.
- UI: Add reusable discovery presentation to `src/components/` and wire it from `src/routes/index.tsx`.
- Persistence: Add a narrow hook in `src/hooks/useAppState.ts` backed by `src/hooks/useLocalStorage.ts` when user choices must survive reloads.

**New Notebook Capability:**
- Primary code: Add notebook presenters under `src/components/notebook/` and wire shared workspace state in `src/routes/card.$id.tsx`.
- Source transformation: Extend `NotebookSource` or `buildNotebookSources()` in `src/lib/sources.ts` when the capability changes source shape.
- New artifact: Add `src/components/notebook/artifacts/<ArtifactName>.tsx`, then register and compose it in `src/components/notebook/StudioPanel.tsx` and, if needed, `src/components/notebook/ArtifactDialog.tsx`.
- Tests: Put pure builder tests in a co-located `*.test.ts` under `src/components/notebook/artifacts/` only if the code stays framework-independent; otherwise extract the builder to `src/lib/` or `src/data/` and test it there.

**New Advisor Capability:**
- Primary code: Add decision rules/types/builders in `src/data/advisor.ts` and presentation in `src/components/advisor/`.
- Workflow composition: Wire new stages or callbacks in `src/components/advisor/AdvisorFlow.tsx`; keep dashboard mode entry/resume behavior in `src/routes/index.tsx`.
- Persistence: Extend `AdvisorSession` and `useAdvisorSessions()` in `src/hooks/useAppState.ts` when the saved-session aggregate changes.

**New Council Capability:**
- Primary code: Add persona/session/message behavior in `src/data/council.ts` and route-level session orchestration in `src/routes/council.tsx`.
- Assets/docs: Add a matching image at `public/personas/<persona-id>.png` and persona definition at `docs/council-personas/<nn>-<persona-id>.md` when introducing a persona.
- Persistence: Extend immutable council session operations in `useCouncilSessions()` within `src/hooks/useAppState.ts`.

**New Component/Module:**
- Implementation: Put shared application components directly in `src/components/`; put generic Radix/shadcn-style primitives in `src/components/ui/`; put feature-only components in the applicable `src/components/<feature>/` directory.
- Styling: Reuse tokens in `src/styles.css`; register any new semantic token in `@theme inline`, `:root`, and `.dark` within the same file.
- Imports: Use the `@/*` alias configured in `tsconfig.json` and `components.json` for source modules.

**Utilities:**
- Shared helpers: Put small application-wide helpers in `src/lib/utils.ts`; use a dedicated module such as `src/lib/search.ts` or `src/lib/sources.ts` when the helper represents a coherent transformation.
- Hooks: Put browser/React behavior in `src/hooks/`, not `src/lib/`; use `src/hooks/useResizablePanel.ts` and `src/hooks/useLocalStorage.ts` as the boundary examples.
- Infrastructure errors: Keep request/runtime capture in `src/lib/error-capture.ts`, fallback markup in `src/lib/error-page.ts`, and editor telemetry adaptation in `src/lib/lovable-error-reporting.ts`.

## Special Directories

**`src/routes/`:**
- Purpose: Source directory watched by the TanStack Router plugin for file-based route generation.
- Generated: No; route source files are hand-maintained, while they generate `src/routeTree.gen.ts`.
- Committed: Yes; route source files and `src/routes/README.md` are tracked.

**`src/components/ui/`:**
- Purpose: shadcn-style component registry target configured by `components.json`.
- Generated: Partially generator-friendly but maintained as application source.
- Committed: Yes; primitives such as `src/components/ui/button.tsx` and `src/components/ui/dialog.tsx` are tracked.

**`src/routeTree.gen.ts`:**
- Purpose: Register file routes and provide route type augmentation for TanStack Router/Start.
- Generated: Yes; its header and `src/routes/README.md` prohibit manual edits.
- Committed: Yes; `src/router.tsx` imports it directly.

**`.output/`:**
- Purpose: Store generated public/server bundles from the TanStack Start/Nitro build.
- Generated: Yes; contents include `.output/public/` and `.output/server/`.
- Committed: No; `.gitignore` excludes `.output`.

**`.tanstack/`:**
- Purpose: Store TanStack temporary generation state.
- Generated: Yes; current contents include `.tanstack/tmp/`.
- Committed: No; `.gitignore` excludes `.tanstack/**`.

**`.wrangler/`:**
- Purpose: Store local Cloudflare/Wrangler deployment artifacts.
- Generated: Yes; current contents include `.wrangler/deploy/`.
- Committed: No; `.gitignore` excludes `.wrangler/`.

**`graphify-out/`:**
- Purpose: Store generated code-analysis caches and output.
- Generated: Yes; current contents include `graphify-out/cache/ast/` and `graphify-out/cache/semantic/`.
- Committed: No; `.gitignore` excludes `graphify-out/`.

**`.playwright-mcp/`:**
- Purpose: Store local browser-verification artifacts.
- Generated: Yes; the directory contains tool-produced verification data.
- Committed: No; `.gitignore` excludes `.playwright-mcp/`.

**`.planning/codebase/`:**
- Purpose: Store GSD codebase mapping documents for planning and execution.
- Generated: Yes; mapper workflows write files such as `.planning/codebase/ARCHITECTURE.md` and `.planning/codebase/STRUCTURE.md`.
- Committed: Repository workflow dependent; this directory is not excluded by `.gitignore`.

**`public/`:**
- Purpose: Store source-controlled static assets served at root-relative URLs.
- Generated: No; files such as `public/favicon.svg` and `public/personas/founder.png` are application inputs.
- Committed: Mixed current state; tracked assets coexist with untracked `public/1.png` and `public/2.png`.

---

*Structure analysis: 2026-08-07*
