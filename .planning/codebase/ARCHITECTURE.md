# Architecture

**Analysis Date:** 2026-08-07

## Pattern Overview

**Overall:** SSR-enabled TanStack Start modular frontend with file-based routes, route-level feature orchestration, pure in-process domain logic, and browser-local persistence.

**Key Characteristics:**
- The application is a single TypeScript/React deployable rooted in `src/server.ts`, `src/start.ts`, and `src/router.tsx`; there are no separate API, database, worker, or service packages in the implemented code.
- Route modules in `src/routes/` act as composition roots: they own page state and connect feature components, domain functions, and persistence hooks.
- Business behavior is deterministic and in-process. Search, advisor recommendations, council replies, notebook answers, and artifacts derive from static data and pure functions in `src/data/`, `src/lib/`, and feature components.
- Persistent user state is stored in `window.localStorage` through `src/hooks/useLocalStorage.ts` and the domain-specific adapters in `src/hooks/useAppState.ts`.
- Reusable presentation primitives are separated into `src/components/ui/`, while feature assemblies live in `src/components/`, `src/components/advisor/`, and `src/components/notebook/`.
- TanStack Router generates `src/routeTree.gen.ts` from route files; application code imports the generated tree through `src/router.tsx` and does not edit it directly.

## Layers

**Request and SSR Bootstrap:**
- Purpose: Accept runtime requests, delegate to TanStack Start, normalize catastrophic SSR failures, and install request middleware.
- Location: `src/server.ts`, `src/start.ts`
- Contains: The runtime `fetch` export, lazy server-entry loading, swallowed-h3 error normalization, generic HTML error rendering, global error capture, CSRF middleware, and request error middleware.
- Depends on: `@tanstack/react-start/server-entry`, `@tanstack/react-start`, `src/lib/error-capture.ts`, and `src/lib/error-page.ts`.
- Used by: The build entry configured in `vite.config.ts` and the Nitro/Cloudflare-compatible server bundle generated under `.output/server/`.

**Router and Application Shell:**
- Purpose: Create one router and query client per router instance, define the document shell, render nested routes, and provide global error/not-found handling.
- Location: `src/router.tsx`, `src/routeTree.gen.ts`, `src/routes/__root.tsx`
- Contains: `getRouter()`, generated route registration, route context typing, metadata, font/style links, `<Outlet />`, `QueryClientProvider`, global `Toaster`, and root boundaries.
- Depends on: `@tanstack/react-router`, `@tanstack/react-query`, `src/styles.css`, `src/components/ui/sonner.tsx`, and `src/lib/lovable-error-reporting.ts`.
- Used by: Every route under `src/routes/` and the TanStack Start runtime configured by `src/start.ts`.

**Route Composition:**
- Purpose: Define URLs, metadata/loaders, page-local state machines, responsive layouts, and event wiring between features.
- Location: `src/routes/index.tsx`, `src/routes/card.$id.tsx`, `src/routes/council.tsx`
- Contains: The search dashboard at `/`, the dynamic notebook workspace at `/card/$id`, and the council workspace at `/council`.
- Depends on: Feature components in `src/components/`, state hooks in `src/hooks/`, domain data/functions in `src/data/`, and pure helpers in `src/lib/`.
- Used by: The generated route tree in `src/routeTree.gen.ts` and rendered beneath `src/routes/__root.tsx`.

**Feature Components:**
- Purpose: Implement cohesive user-facing workflows while receiving domain state and callbacks from route composition roots.
- Location: `src/components/`, `src/components/advisor/`, `src/components/notebook/`, `src/components/notebook/artifacts/`
- Contains: Search/filter/card presentation in `src/components/SearchPanel.tsx`, `src/components/FiltersBar.tsx`, and `src/components/KnowledgeCard.tsx`; advisor stages in `src/components/advisor/AdvisorFlow.tsx`; notebook sources/chat/studio in `src/components/notebook/`; artifact renderers in `src/components/notebook/artifacts/`.
- Depends on: Domain types and builders in `src/data/`, source/search helpers in `src/lib/`, shared state callbacks from route modules, and UI primitives in `src/components/ui/`.
- Used by: Route modules in `src/routes/index.tsx`, `src/routes/card.$id.tsx`, and `src/routes/council.tsx`; notebook subcomponents also compose one another within `src/components/notebook/StudioPanel.tsx`.

**UI Primitive Layer:**
- Purpose: Provide consistent low-level controls and overlays with Radix behavior, Tailwind styling, and variant APIs.
- Location: `src/components/ui/`
- Contains: Buttons, badges, dialogs, sheets, popovers, selects, tooltips, inputs, sidebars, tables, and toast integration such as `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`, and `src/components/ui/sonner.tsx`.
- Depends on: Radix packages, `class-variance-authority`, React, and the `cn()` utility from `src/lib/utils.ts`.
- Used by: Route and feature components throughout `src/routes/` and `src/components/`.

**Client State and Browser Adapters:**
- Purpose: Encapsulate persistent application state, responsive state, and resizable-panel interactions.
- Location: `src/hooks/useLocalStorage.ts`, `src/hooks/useAppState.ts`, `src/hooks/useResizablePanel.ts`, `src/hooks/use-mobile.tsx`
- Contains: Generic JSON localStorage synchronization; bookmarks, dismissed/private cards, theme, scope, history, notes, feedback, council sessions, advisor sessions, and card-title hooks; viewport and mouse/keyboard panel helpers.
- Depends on: React hooks, browser APIs, and domain types from `src/data/advisor.ts`, `src/data/council.ts`, and `src/lib/search.ts`.
- Used by: Route composition roots in `src/routes/index.tsx`, `src/routes/card.$id.tsx`, and `src/routes/council.tsx`, plus `src/components/ui/sidebar.tsx`.

**Domain and Mock Data:**
- Purpose: Define the implemented domain model, seed records, classification rules, response builders, and council/advisor behavior.
- Location: `src/data/mockCards.ts`, `src/data/advisor.ts`, `src/data/council.ts`
- Contains: `KnowledgeCardData` and its catalog, advisor dilemma/answer models, council persona/session/message models, and deterministic builder functions.
- Depends on: No network or persistence layer; these modules are predominantly self-contained TypeScript data and pure functions.
- Used by: `src/lib/search.ts`, `src/lib/sources.ts`, route modules in `src/routes/`, and feature components under `src/components/advisor/` and `src/components/notebook/`.

**Shared Pure Utilities:**
- Purpose: Transform domain records, calculate search results, build notebook sources, merge CSS classes, pluralize labels, and render fallback errors.
- Location: `src/lib/search.ts`, `src/lib/sources.ts`, `src/lib/utils.ts`, `src/lib/error-page.ts`
- Contains: `searchCards()`, `buildNotebookSources()`, `cn()`, `pluralRu()`, and `renderErrorPage()`.
- Depends on: Domain types/data from `src/data/mockCards.ts` plus small utility packages in `src/lib/utils.ts`.
- Used by: Routes, feature components, UI primitives, and SSR handling across `src/`.

**Styling and Static Assets:**
- Purpose: Define global design tokens, Tailwind theme mappings, dark mode, base styles, animation utilities, and static visual assets.
- Location: `src/styles.css`, `public/`, `components.json`
- Contains: OKLCH semantic tokens, radii, shadows, global typography, CSS animations, favicons, app images, and council persona portraits under `public/personas/`.
- Depends on: Tailwind CSS 4 and the shadcn-style alias/configuration in `components.json`.
- Used by: `src/routes/__root.tsx` links `src/styles.css`; route and component class names consume tokens declared there.

## Data Flow

**Search and Discovery Flow (`/`):**

1. `src/routes/index.tsx` reads persistent theme, bookmark, dismissal, privacy, scope, history, onboarding, and advisor-session state from `src/hooks/useAppState.ts`.
2. `src/components/SearchPanel.tsx` and `src/components/FiltersBar.tsx` send query/scope/filter changes back to route-owned React state in `src/routes/index.tsx`.
3. `src/routes/index.tsx` debounces the query, then calls `searchCards()` from `src/lib/search.ts`; that function filters and scores the in-memory catalog from `src/data/mockCards.ts`.
4. `src/routes/index.tsx` applies dismissed/private/bookmark constraints, paginates results, and renders `src/components/KnowledgeCard.tsx` instances.
5. Card navigation uses TanStack links from `src/components/KnowledgeCard.tsx` to `/card/$id`; persistent actions write JSON through `src/hooks/useAppState.ts` into `src/hooks/useLocalStorage.ts`.

**Notebook Workspace Flow (`/card/$id`):**

1. The loader in `src/routes/card.$id.tsx` resolves the route parameter with `getCardById()` from `src/data/mockCards.ts` and throws TanStack `notFound()` when no record exists.
2. `src/routes/card.$id.tsx` converts card citations to `NotebookSource[]` through `buildNotebookSources()` in `src/lib/sources.ts`, then owns source selection, open-reader state, responsive sheets, and panel widths.
3. `src/components/notebook/SourcesPanel.tsx` controls which source anchors enter `selectedCitations`; `src/components/notebook/NotebookChat.tsx` receives only those anchors as answer context.
4. `src/components/notebook/NotebookChat.tsx` builds deterministic answers locally from `KnowledgeCardData`, displays inline source markers, and calls back to `src/routes/card.$id.tsx` to open `src/components/notebook/SourceReaderDialog.tsx`.
5. Notes, title overrides, bookmarks, and feedback flow through callbacks from `src/routes/card.$id.tsx` to localStorage adapters in `src/hooks/useAppState.ts`.
6. `src/components/notebook/StudioPanel.tsx` derives quizzes, decks, cards, podcasts, reports, and infographics from the same card and delegates specialized rendering to `src/components/notebook/artifacts/`.

**AI Advisor Flow (`/`, advisor mode):**

1. `src/routes/index.tsx` switches the dashboard into advisor mode and passes a submitted managerial query into `src/components/advisor/AdvisorFlow.tsx`.
2. `src/components/advisor/AdvisorFlow.tsx` classifies and extracts known context using `classify()` and `extractKnown()` from `src/data/advisor.ts`.
3. The route-independent stage machine in `src/components/advisor/AdvisorFlow.tsx` moves through clarify, understanding, simulated thinking, and answer states; `src/components/advisor/ClarifyBlock.tsx` and `src/components/advisor/UnderstandingCard.tsx` update the selection model.
4. `buildAnswer()` and related builders in `src/data/advisor.ts` derive the recommendation, follow-up replies, negotiation questions, and shareholder summary without an external AI call.
5. Optional saved sessions are written by `useAdvisorSessions()` in `src/hooks/useAppState.ts` and can be restored by `src/routes/index.tsx`.

**Council Flow (`/council`):**

1. `src/routes/council.tsx` loads seeded/persisted sessions through `useCouncilSessions()` from `src/hooks/useAppState.ts` and owns the active session, creation view, persona picker, session search, and panel state.
2. `NewCouncilPanel` in `src/routes/council.tsx` selects up to three personas from `COUNCIL_PERSONAS` and a case from `mockCards`, then maps the card into a `CouncilTopic`.
3. `buildOpeningMessages()` in `src/data/council.ts` produces persona messages and optional disagreement; `useCouncilSessions().create()` persists the resulting `CouncilSession`.
4. Follow-up input in `SessionView` returns to `CouncilPage` in `src/routes/council.tsx`; `buildUserMessage()` and `buildFollowUpReplies()` in `src/data/council.ts` create messages, and `useCouncilSessions().addMessages()` persists them.
5. Persona changes, read state, reactions, and deletion update immutable session arrays through `src/hooks/useAppState.ts` and ultimately `src/hooks/useLocalStorage.ts`.

**SSR Request and Error Flow:**

1. `vite.config.ts` directs TanStack Start's server build to `src/server.ts`; the runtime invokes its default `fetch()` export.
2. `src/server.ts` lazily loads `@tanstack/react-start/server-entry` and forwards the request to the generated handler.
3. `src/start.ts` wraps request handling with an error middleware and protects server-function handler types with CSRF middleware.
4. `src/lib/error-capture.ts` expands and records error/cause chains; `src/server.ts` detects h3's generic swallowed-error JSON and replaces it with HTML from `src/lib/error-page.ts`.
5. Client render errors reach `ErrorComponent` in `src/routes/__root.tsx`, which reports them through `src/lib/lovable-error-reporting.ts` and exposes retry/home actions.

**State Management:**
- Ephemeral UI state uses route/component-local `useState`, `useMemo`, `useRef`, and `useEffect` in files such as `src/routes/index.tsx`, `src/routes/card.$id.tsx`, and `src/routes/council.tsx`.
- Durable browser state uses named `biaqyl:*` localStorage keys through `src/hooks/useLocalStorage.ts` and domain adapters in `src/hooks/useAppState.ts`.
- Remote-cache infrastructure is provisioned as a per-router `QueryClient` in `src/router.tsx` and provided by `src/routes/__root.tsx`; implemented features do not call `useQuery`, fetch APIs, or server functions.
- Route loader data is limited to synchronous card lookup in `src/routes/card.$id.tsx`; the implemented catalog remains the static array in `src/data/mockCards.ts`.

## Key Abstractions

**Knowledge Card:**
- Purpose: Represent a searchable case/material and provide the source for notebook, advisor-adjacent, council, and artifact views.
- Examples: `KnowledgeCardData`, `mockCards`, `getCardById()`, and `getRelatedCards()` in `src/data/mockCards.ts`; rendering in `src/components/KnowledgeCard.tsx`.
- Pattern: Typed record plus an in-memory repository array and pure selector functions in `src/data/mockCards.ts`.

**Notebook Source:**
- Purpose: Normalize a card citation into a file/link source with reader sections and citation anchors.
- Examples: `NotebookSource` and `buildNotebookSources()` in `src/lib/sources.ts`; consumers in `src/components/notebook/SourcesPanel.tsx`, `src/components/notebook/NotebookChat.tsx`, and `src/components/notebook/SourceReaderDialog.tsx`.
- Pattern: Adapter function from `KnowledgeCardData` to a feature-specific view model in `src/lib/sources.ts`.

**Advisor Dilemma and Answer:**
- Purpose: Model a managerial decision, dynamic clarification questions, selection state, and structured recommendation.
- Examples: `Dilemma`, `AdvisorSelection`, `Answer`, `classify()`, and `buildAnswer()` in `src/data/advisor.ts`; orchestration in `src/components/advisor/AdvisorFlow.tsx`.
- Pattern: Pure domain rules separated from a React stage-machine presenter.

**Council Session:**
- Purpose: Model selected personas, the case-derived discussion topic, chat messages, reactions, and session metadata.
- Examples: `CouncilPersona`, `CouncilTopic`, `CouncilChatMessage`, and `CouncilSession` in `src/data/council.ts`; persistence operations in `src/hooks/useAppState.ts`.
- Pattern: Typed aggregate persisted as one immutable localStorage-backed array.

**Local Storage State Adapter:**
- Purpose: Give React state semantics to serialized browser persistence and expose domain-specific operations.
- Examples: Generic `useLocalStorage<T>()` in `src/hooks/useLocalStorage.ts`; `useBookmarks()`, `useCouncilSessions()`, `useNotes()`, and `useFeedback()` in `src/hooks/useAppState.ts`.
- Pattern: Generic persistence primitive wrapped by narrow hooks that return state plus command-like callbacks.

**Controlled Feature Component:**
- Purpose: Keep shared state in a route composition root while allowing complex feature components to render and emit intent.
- Examples: `SearchPanel` in `src/components/SearchPanel.tsx`, `SourcesPanel` in `src/components/notebook/SourcesPanel.tsx`, and `SessionView` within `src/routes/council.tsx`.
- Pattern: Typed props carry values downward and callbacks upward; route modules coordinate sibling components.

**UI Primitive and Variant:**
- Purpose: Standardize behavior and appearance without coupling primitives to feature data.
- Examples: `Button`/`buttonVariants` in `src/components/ui/button.tsx`, `Badge`/`badgeVariants` in `src/components/ui/badge.tsx`, and dialog/sheet wrappers in `src/components/ui/dialog.tsx` and `src/components/ui/sheet.tsx`.
- Pattern: Radix primitive composition plus `class-variance-authority` and `cn()` from `src/lib/utils.ts`.

## Entry Points

**Server Runtime Entry:**
- Location: `src/server.ts`
- Triggers: Runtime HTTP requests after the build target configured in `vite.config.ts` loads the server bundle.
- Responsibilities: Load the TanStack server handler, normalize catastrophic 500 responses, log retained causes, and return fallback HTML for uncaught failures.

**Start Middleware Entry:**
- Location: `src/start.ts`
- Triggers: TanStack Start initializes application request handling using the registration emitted in `src/routeTree.gen.ts`.
- Responsibilities: Register error and CSRF middleware through `createStart()`.

**Router Factory:**
- Location: `src/router.tsx`
- Triggers: TanStack Start creates the router for SSR and client navigation.
- Responsibilities: Instantiate `QueryClient`, attach the generated `routeTree`, expose router context, enable scroll restoration, and configure preload freshness.

**Root Route and Document Shell:**
- Location: `src/routes/__root.tsx`
- Triggers: Every navigation and SSR render in the route tree from `src/routeTree.gen.ts`.
- Responsibilities: Emit document metadata/styles/scripts, provide query context/toasts, render `<Outlet />`, and handle route errors and 404s.

**Dashboard Route:**
- Location: `src/routes/index.tsx`
- Triggers: Navigation to `/` as registered in `src/routeTree.gen.ts`.
- Responsibilities: Coordinate search, filters, pagination, onboarding, card actions, and advisor mode.

**Card Workspace Route:**
- Location: `src/routes/card.$id.tsx`
- Triggers: Navigation to `/card/:id` from links such as `src/components/KnowledgeCard.tsx`.
- Responsibilities: Resolve a card, compose source/chat/studio panels, manage citation reading and panel layout, and connect notebook actions to persisted state.

**Council Route:**
- Location: `src/routes/council.tsx`
- Triggers: Navigation to `/council` through application navigation such as `src/components/Header.tsx`.
- Responsibilities: Compose session navigation, council creation, persona selection, chat/reactions, and persistent session updates.

## Error Handling

**Strategy:** Layered fallback handling covers request middleware, runtime response normalization, route/render boundaries, missing records, and non-critical browser storage failures.

**Patterns:**
- Let HTTP-like errors carrying `statusCode` propagate from middleware in `src/start.ts`; convert other request failures to a generic 500 page from `src/lib/error-page.ts`.
- Capture complete error/cause chains by wrapping `console.error` in `src/lib/error-capture.ts`; consume the retained error when `src/server.ts` detects h3's generic swallowed-error payload.
- Throw TanStack `notFound()` from the loader in `src/routes/card.$id.tsx` when `getCardById()` finds no record; render the root 404 from `src/routes/__root.tsx`.
- Report route/render failures to Lovable preview hooks from `ErrorComponent` in `src/routes/__root.tsx` via `src/lib/lovable-error-reporting.ts`.
- Treat localStorage read/write failures as non-fatal in `src/hooks/useLocalStorage.ts`; keep in-memory React state usable when serialization or browser storage fails.
- Surface user-action/browser capability failures with Sonner toasts in components such as `src/components/SearchPanel.tsx`, `src/components/notebook/NotebookChat.tsx`, and `src/routes/council.tsx`.

## Cross-Cutting Concerns

**Logging:** Use `console.error` for runtime failures; `src/lib/error-capture.ts` globally expands `Error` values and cause chains, while `src/server.ts` and `src/routes/__root.tsx` log server and render failures.

**Validation:** Use TypeScript domain types and local UI guards in `src/data/`, `src/routes/`, and `src/components/`; route existence validation occurs in `src/routes/card.$id.tsx`, and advisor completeness gates occur through `contextIsSufficient()` in `src/data/advisor.ts`. No schema-validation library or request DTO layer is implemented.

**Authentication:** Not implemented in `src/`; the root shell in `src/routes/__root.tsx` and all routes in `src/routeTree.gen.ts` are public. CSRF protection for any TanStack server functions is registered in `src/start.ts`, although no server function is implemented.

**Accessibility:** Preserve keyboard/focus behavior in `src/routes/council.tsx`, resize separator keyboard controls in `src/routes/card.$id.tsx`, reduced-motion handling in `src/routes/council.tsx` and `src/components/KnowledgeCard.tsx`, and labels/ARIA attributes across `src/components/`.

**Responsive Layout:** Keep responsive composition at route/feature boundaries: `src/routes/card.$id.tsx` swaps desktop sidebars for Radix sheets, `src/routes/council.tsx` changes session layout at `md`, and reusable viewport detection is available in `src/hooks/use-mobile.tsx`.

**Theming:** Apply semantic colors and component tokens from `src/styles.css`; toggle the document `.dark` class only through `useTheme()` in `src/hooks/useAppState.ts`.

---

*Architecture analysis: 2026-08-07*
