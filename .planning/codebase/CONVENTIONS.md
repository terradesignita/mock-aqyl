# Coding Conventions

**Analysis Date:** 2026-08-07

## Naming Patterns

**Files:**
- Use PascalCase for hand-written React component files: `src/components/KnowledgeCard.tsx`, `src/components/MessageBubble.tsx`, and `src/components/notebook/StudioPanel.tsx`.
- Use `use` plus camelCase for hook files: `src/hooks/useLocalStorage.ts`, `src/hooks/useAppState.ts`, and `src/hooks/useResizablePanel.ts`.
- Use lowercase descriptive names for library and data modules: `src/lib/search.ts`, `src/lib/error-capture.ts`, `src/data/advisor.ts`, and `src/data/council.ts`.
- Keep shadcn/Radix UI primitives lowercase under `src/components/ui/`, such as `src/components/ui/button.tsx` and `src/components/ui/alert-dialog.tsx`; these files follow the generator's naming style rather than the application component style.
- Follow TanStack Router's file-route naming under `src/routes/`: `src/routes/index.tsx` for `/`, `src/routes/council.tsx` for `/council`, `src/routes/card.$id.tsx` for a dynamic segment, and `src/routes/__root.tsx` for the root layout.
- Co-locate unit tests with their implementation and suffix them `.test.ts`: `src/data/advisor.test.ts`, `src/data/council.test.ts`, and `src/hooks/useResizablePanel.test.ts`.
- Treat `src/routeTree.gen.ts` as generated code. It is also excluded from formatting in `.prettierignore`; do not hand-edit or copy its conventions into application code.

**Functions:**
- Use camelCase for functions and local helpers: `buildAnswer` in `src/data/advisor.ts`, `searchCards` in `src/lib/search.ts`, and `describeError` in `src/lib/error-capture.ts`.
- Prefix React hooks with `use`: `useTheme`, `useCouncilSessions`, and `useFeedback` in `src/hooks/useAppState.ts`.
- Use PascalCase for React component functions: `Header` in `src/components/Header.tsx` and `MessageBubble` in `src/components/MessageBubble.tsx`.
- Name event callbacks after the action they perform. Public callback props use `on...` (`onToggleDark`, `onClose`); internal handlers commonly use action verbs such as `toggle`, `remove`, `record`, `startResize`, or `onMove`.
- Name pure builder functions with `build...` when they derive display/domain data: `buildOpeningMessages` in `src/data/council.ts` and `buildNotebookSources` in `src/lib/sources.ts`.

**Variables:**
- Use camelCase for local state and values: `serverEntryPromise` in `src/server.ts`, `onlyBookmarked` in `src/lib/search.ts`, and `followUpFlags` in `src/hooks/useAppState.ts`.
- Use concise callback parameters only inside tight collection transforms (`c`, `s`, `m`, `p`) as seen in `src/lib/search.ts`, `src/hooks/useAppState.ts`, and `src/data/council.test.ts`; prefer descriptive names at module and API boundaries.
- Use uppercase snake case for module constants and fixed datasets: `EMPTY_STATS` in `src/hooks/useAppState.ts`, `DILEMMAS` in `src/data/advisor.ts`, `COUNCIL_PERSONAS` in `src/data/council.ts`, and `DARK_CARD_HEX` in `src/data/council.test.ts`.
- Use lowercase object keys for persisted/domain values where they are part of the data contract, including `business_unit`, `media_type`, and `executive_summary` in `src/data/mockCards.ts`.

**Types:**
- Use PascalCase for interfaces and type aliases: `KnowledgeCardData` in `src/data/mockCards.ts`, `AdvisorSelection` in `src/data/advisor.ts`, and `MessageBubbleProps` in `src/components/MessageBubble.tsx`.
- Prefer `interface` for extendable object shapes and exported domain records, as in `CouncilPersona` in `src/data/council.ts` and `ButtonProps` in `src/components/ui/button.tsx`.
- Prefer `type` for unions, discriminated unions, and framework adapter shapes, as in `DilemmaType` in `src/data/advisor.ts`, `MessageBubbleProps` in `src/components/MessageBubble.tsx`, and `ServerEntry` in `src/server.ts`.
- Model variants with string-literal unions rather than free-form strings. Examples include `Scope`, `Lang`, and `MediaType` in `src/data/mockCards.ts` and `FeedbackEvent["type"]` in `src/hooks/useAppState.ts`.
- Keep component-only prop interfaces private unless another module consumes them. `HeaderProps` in `src/components/Header.tsx` is private; reusable `PersonaAvatarProps` in `src/components/PersonaAvatar.tsx` is exported.

## Code Style

**Formatting:**
- Use Prettier 3.7.3 through `npm run format`, configured by `.prettierrc`.
- Apply a 100-character print width, semicolons, double quotes, and trailing commas everywhere supported. These settings are explicit in `.prettierrc`.
- Use two-space indentation as produced by Prettier throughout `src/`.
- Let Prettier format JSX and multiline calls; do not manually align values.
- Exclude generated/build/lock artifacts listed in `.prettierignore`: `node_modules`, `dist`, `.output`, `.vinxi`, lockfiles, and `routeTree.gen.ts`.
- Current enforcement state: `npx prettier --check src eslint.config.js vitest.config.ts vite.config.ts tsconfig.json` reports formatting issues in 15 files, including `src/data/council.ts`, `src/lib/search.ts`, and `src/routes/council.tsx`. Run formatting before treating the tree as style-clean.

**Linting:**
- Use ESLint 9.32.0 with flat configuration in `eslint.config.js`; run it with `npm run lint`.
- Apply `@eslint/js` recommended rules plus `typescript-eslint` recommended rules to `**/*.{ts,tsx}`.
- Follow the recommended React Hooks rules. Avoid suppressions; the only current hook suppression is a targeted `react-hooks/exhaustive-deps` comment in `src/routes/council.tsx` and another in `src/components/notebook/NotebookChat.tsx`.
- Keep Fast Refresh warnings enabled through `react-refresh/only-export-components`; constant exports are allowed, while helper exports from component modules remain warnings.
- Do not import Next.js `server-only`; `eslint.config.js` explicitly directs server-only code to `*.server.ts` or `@tanstack/react-start/server-only`.
- Unused TypeScript variables are intentionally not lint errors (`@typescript-eslint/no-unused-vars` is off), matching `noUnusedLocals: false` and `noUnusedParameters: false` in `tsconfig.json`.
- Avoid explicit `any`; the recommended TypeScript configuration flags it. Existing speech-recognition bridges in `src/components/SearchPanel.tsx` and `src/components/notebook/NotebookChat.tsx` currently violate this rule.
- Current enforcement state: `npm run lint` reports 59 errors and 9 warnings. Most errors are Prettier violations; explicit `any` accounts for the remaining TypeScript lint failures.
- Keep TypeScript strict and emission-free. `tsconfig.json` sets `strict: true`, `noEmit: true`, `noFallthroughCasesInSwitch: true`, and `noUncheckedSideEffectImports: true`. `npx tsc --noEmit` currently passes.

## Import Organization

**Order:**
1. Import React and third-party packages first, as in `src/routes/card.$id.tsx` and `src/components/KnowledgeCard.tsx`.
2. Import internal application modules through the `@/` alias, grouping components, UI primitives, data, hooks, and library utilities by local readability.
3. Use relative imports for same-directory modules and framework entry wiring, as in `src/data/advisor.test.ts`, `src/router.tsx`, and `src/server.ts`.
4. Keep side-effect-only imports explicit and first when required, as with `import "./lib/error-capture"` in `src/server.ts`.
- There is no automated import sorter and exact internal grouping varies between files. Preserve the dominant external-then-internal order when adding code.
- Use `import type` or inline `type` specifiers for type-only dependencies: `import type { KnowledgeCardData }` in `src/components/ChatPanel.tsx` and `import { clsx, type ClassValue }` in `src/lib/utils.ts`.
- Prefer named imports and named exports. Namespace imports are used mainly in generated-style UI primitives such as `src/components/ui/button.tsx`.

**Path Aliases:**
- Use `@/*` for cross-directory imports under `src/`. The alias maps to `./src/*` in `tsconfig.json` and is enabled by the Lovable Vite configuration in `vite.config.ts`.
- Use aliases such as `@/components`, `@/components/ui`, `@/hooks`, `@/lib`, and `@/data`. `components.json` defines the shadcn aliases used when generating primitives.
- Use `./...` only for same-directory siblings or entry-point wiring where the relative relationship is clearer. Tests currently import the subject under test relatively, for example `./advisor` in `src/data/advisor.test.ts`.

## Error Handling

**Patterns:**
- Catch values as `unknown` and narrow with `instanceof`, property checks, or `typeof`. `src/lib/error-capture.ts`, `src/lib/lovable-error-reporting.ts`, and `src/start.ts` demonstrate this pattern.
- At server boundaries, log the original failure and return a sanitized HTML 500 response using `renderErrorPage()` from `src/lib/error-page.ts`. Both `src/start.ts` and `src/server.ts` use this boundary pattern.
- Preserve framework control-flow errors. `src/start.ts` rethrows objects with `statusCode` rather than converting every thrown value into a generic response.
- For browser persistence, fail soft: `src/hooks/useLocalStorage.ts` catches local-storage and JSON failures, keeps in-memory state, and intentionally ignores the exception.
- When serializing unknown errors, use bounded safe fallbacks. `describeError()` and `safeStringify()` in `src/lib/error-capture.ts` preserve cause chains while limiting depth and output length.
- Throw explicit invariant errors when a context contract is violated. `useSidebar()` in `src/components/ui/sidebar.tsx` throws if used outside `SidebarProvider`.
- Do not expose raw server exceptions to rendered pages; centralize user-facing fallback markup in `src/lib/error-page.ts`.

## Logging

**Framework:** console plus Lovable preview telemetry

**Patterns:**
- Reserve `console.error` for infrastructure and error boundaries. Current calls are concentrated in `src/routes/__root.tsx`, `src/start.ts`, `src/server.ts`, and `src/lib/error-capture.ts`.
- Load `src/lib/error-capture.ts` before the server entry so its `console.error` wrapper can retain swallowed SSR errors.
- Report browser boundary errors through `reportLovableError()` in `src/lib/lovable-error-reporting.ts`; it forwards context to optional Lovable runtime hooks without assuming they exist.
- Include structured context such as boundary name and route when forwarding errors, as done in `src/routes/__root.tsx` and `src/lib/lovable-error-reporting.ts`.
- No general-purpose application logger or routine debug logging is present. Do not add ad hoc `console.log` calls to components.

## Comments

**When to Comment:**
- Explain non-obvious constraints, framework workarounds, and design rationale. Strong examples are the h3 error-normalization comments in `src/server.ts` and the resizable-panel rationale in `src/hooks/useResizablePanel.ts`.
- Cite product-spec sections when behavior exists to satisfy a specific requirement, as in `src/hooks/useAppState.ts` and `src/data/advisor.test.ts`.
- Explain deliberate test exclusions and hardcoded reference values when they prevent false positives or external parsing, as in `src/data/council.test.ts`.
- Keep ordinary JSX and self-explanatory transformations uncommented. Comments should capture why, not narrate the syntax.
- Use narrowly scoped ESLint disable comments with the exact rule and only on the affected line.

**JSDoc/TSDoc:**
- Use short `/** ... */` documentation for exported hooks, utilities, or props whose semantics are not obvious, such as `clampWidth()` in `src/hooks/useResizablePanel.ts`, `ScopeFilter` in `src/lib/search.ts`, and `ButtonProps.static` in `src/components/ui/button.tsx`.
- Use block TSDoc for behavior with multiple constraints or usage guidance, as on `useResizablePanel()` in `src/hooks/useResizablePanel.ts`.
- JSDoc coverage is selective rather than comprehensive; do not add boilerplate documentation to obvious components.

## Function Design

**Size:**
- Keep reusable transformations pure and small where practical: `clampWidth()` in `src/hooks/useResizablePanel.ts`, `pluralRu()` in `src/lib/utils.ts`, and the private matching/scoring helpers in `src/lib/search.ts`.
- Extract domain builders from UI when they are independently testable. `buildAnswer()` lives in `src/data/advisor.ts`, while presentation lives in `src/components/advisor/AdvisorAnswer.tsx`.
- Large route and feature components currently exist (`src/routes/council.tsx`, `src/components/notebook/StudioPanel.tsx`). When extending them, prefer extracting cohesive helpers/components into the adjacent feature directory rather than adding more nested logic.
- Use early returns for guards and simple failure cases, as in `searchCards()` helpers in `src/lib/search.ts` and `normalizeCatastrophicSsrResponse()` in `src/server.ts`.

**Parameters:**
- Use typed positional parameters for small pure functions with two or three obvious values, such as `clampWidth(value, min, max)` in `src/hooks/useResizablePanel.ts`.
- Use typed object props for React components and destructure at the function boundary, as in `Header()` in `src/components/Header.tsx`.
- Use discriminated unions when valid props depend on a variant, as `MessageBubbleProps` does in `src/components/MessageBubble.tsx`.
- Use optional parameters with explicit defaults when absence has stable semantics, such as `limit = 3` in `src/data/mockCards.ts` and `flags = {}` in `src/data/advisor.ts`.

**Return Values:**
- Give explicit return types to exported data transformations when the contract matters, such as `buildNotebookSources(): NotebookSource[]` in `src/lib/sources.ts` and `describeError(): string` in `src/lib/error-capture.ts`.
- Allow inference for React components and hooks when the return shape is evident, as in `src/components/Header.tsx` and `src/hooks/useAppState.ts`.
- Return immutable update objects/arrays from state setters rather than mutating existing state. `src/hooks/useAppState.ts` consistently uses spreads, `map`, and `filter`.
- Use `as const` for fixed literal arrays and hook tuples where callers benefit from narrow types, as in `LANGUAGES` in `src/lib/search.ts` and `useLocalStorage()` in `src/hooks/useLocalStorage.ts`.

## Module Design

**Exports:**
- Prefer named exports for application components, hooks, data, and utilities. Examples include `Header` in `src/components/Header.tsx`, `useFeedback` in `src/hooks/useAppState.ts`, and `searchCards` in `src/lib/search.ts`.
- Use default exports only where the framework/configuration requires them: `src/server.ts`, `vite.config.ts`, `vitest.config.ts`, and `eslint.config.js`.
- Keep private helpers unexported until another module requires them. Examples include `score()` in `src/lib/search.ts`, `safeStringify()` in `src/lib/error-capture.ts`, and `useToggleSet()` in `src/hooks/useAppState.ts`.
- In Radix/shadcn primitives, define components locally and export the public set at the bottom, as in `src/components/ui/button.tsx` and `src/components/ui/context-menu.tsx`.
- Keep component modules focused on rendering. The Fast Refresh warnings for helper exports in files such as `src/components/notebook/artifacts/DeckViewer.tsx` indicate that shareable builders should move to non-component modules when touched.

**Barrel Files:**
- Not used. There are no application `index.ts` re-export barrels under `src/components`, `src/hooks`, `src/lib`, or `src/data`.
- Import directly from the defining module, for example `@/components/ui/button`, `@/hooks/useAppState`, or `@/data/council`.
- Do not introduce a barrel solely for shorter imports; direct imports make dependency ownership explicit and match the existing codebase.

---

*Convention analysis: 2026-08-07*
