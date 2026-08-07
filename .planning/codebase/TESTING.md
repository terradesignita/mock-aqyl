# Testing Patterns

**Analysis Date:** 2026-08-07

## Test Framework

**Runner:**
- Vitest 4.1.10, declared in `package.json` and configured in `vitest.config.ts`.
- Config: `vitest.config.ts`
- The configured include pattern is `src/**/*.test.ts`; `.test.tsx`, `.spec.ts`, and tests outside `src/` are not discovered by the current configuration.
- No `environment` is configured, so the suite uses Vitest's default Node environment. The verified run reports `environment 0ms`.
- No global test APIs are enabled. Import `describe`, `it`, and `expect` explicitly from `vitest`, as every current test does.
- No setup file, global fixture, test timeout override, or pool configuration is present in `vitest.config.ts`.

**Assertion Library:**
- Vitest's built-in `expect` API.
- Current matchers include `toBe`, `toEqual`, `toContain`, `not.toContain`, `toHaveLength`, `toBeDefined`, `toBeGreaterThan`, `toBeGreaterThanOrEqual`, `toMatch`, and boolean assertions.

**Run Commands:**
```bash
npm test                 # Run all tests once through the package script
npx vitest               # Watch mode; no dedicated package script exists
npx vitest run           # Direct one-shot invocation
```

- `npm test` currently passes 3 files and 41 tests.
- There is no `test:watch`, `test:coverage`, or CI-specific test script in `package.json`.

## Test File Organization

**Location:**
- Co-locate tests beside the implementation module.
- Domain tests live in `src/data/advisor.test.ts` beside `src/data/advisor.ts` and `src/data/council.test.ts` beside `src/data/council.ts`.
- Hook-adjacent pure utility tests live in `src/hooks/useResizablePanel.test.ts` beside `src/hooks/useResizablePanel.ts`.
- There is no separate `tests/`, `__tests__/`, fixtures, or test-support directory.

**Naming:**
- Use `<module>.test.ts`, matching the include rule in `vitest.config.ts`.
- Do not use `.spec.ts` or `.test.tsx` unless `vitest.config.ts` is expanded to discover them.
- Describe suites by exported function, data contract, or behavior: `describe("buildOpeningMessages", ...)`, `describe("persona color contrast", ...)`, and `describe("clampWidth", ...)`.
- Phrase `it()` names as concrete observable behavior, including the condition and expected outcome.

**Structure:**
```text
src/
├── data/
│   ├── advisor.ts
│   ├── advisor.test.ts
│   ├── council.ts
│   └── council.test.ts
└── hooks/
    ├── useResizablePanel.ts
    └── useResizablePanel.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from "vitest";
import { clampWidth } from "./useResizablePanel";

describe("clampWidth", () => {
  it("clamps values below the minimum up to the minimum", () => {
    expect(clampWidth(100, 220, 520)).toBe(220);
  });
});
```

- This is the direct pattern in `src/hooks/useResizablePanel.test.ts`: explicit Vitest imports, a relative import of the subject, a subject-level `describe`, and behavior-focused `it` blocks.

**Patterns:**
- Keep arrange/act/assert inline when the scenario is short. `src/hooks/useResizablePanel.test.ts` calls and asserts in one expression.
- For richer domain scenarios, create typed input data, call the public builder, then assert the returned contract. `src/data/advisor.test.ts` uses `AdvisorSelection` values and assertions against `Answer` fields.
- Reuse immutable suite-level input objects when many cases share the same domain context. `src/data/council.test.ts` defines a `topic` inside each relevant suite.
- Use loops inside a test when every item must satisfy the same invariant, as with all council personas and colors in `src/data/council.test.ts`.
- Generate one named test per enum/key when separate failures improve diagnosis. `src/data/advisor.test.ts` iterates `Object.keys(DILEMMAS)` outside `it()` and creates a test for each dilemma type.
- Assert externally meaningful output, invariants, and safety properties rather than internal calls. Examples include no real leader names leaking, valid persona references, WCAG contrast thresholds, and recalculated risk levels in `src/data/council.test.ts` and `src/data/advisor.test.ts`.
- No `beforeEach`, `afterEach`, `beforeAll`, or `afterAll` hooks are used. Current tests rely on pure functions and immutable inputs, so teardown is unnecessary.

## Mocking

**Framework:** Vitest `vi` is available through Vitest but not used in the current suite.

**Patterns:**
```typescript
// Not detected in current tests.
// No vi.mock(), vi.fn(), spies, fake timers, or module replacement are used in
// src/data/advisor.test.ts, src/data/council.test.ts, or
// src/hooks/useResizablePanel.test.ts.
```

**What to Mock:**
- No established project pattern exists.
- If a new unit reaches time, browser APIs, network, or framework adapters, mock only that external boundary and keep domain logic real.
- Prefer extracting browser-independent logic into a pure exported helper, following `clampWidth()` in `src/hooks/useResizablePanel.ts`, so it can be tested without mocking React or the DOM.

**What NOT to Mock:**
- Do not mock domain datasets and pure builders from `src/data/advisor.ts` or `src/data/council.ts`; current tests intentionally exercise the real exported data and transformations together.
- Do not mock small deterministic helpers merely to isolate a caller. The existing suite validates observable results across helpers.
- Do not introduce React/DOM mocks as a substitute for a test environment. A component-test addition requires an explicit DOM environment and test library because neither `jsdom`, `happy-dom`, nor `@testing-library/react` is installed in `package.json`.

## Fixtures and Factories

**Test Data:**
```typescript
const empty: AdvisorSelection = { choices: {}, own: {} };

const topic = {
  title: "SpinBrush",
  summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
  insight: "Переговорная сила растёт после подтверждения спроса.",
  businessUnit: "Товары для дома",
};
```

- `empty` is the typed shared fixture at module scope in `src/data/advisor.test.ts`.
- The `topic` object pattern appears within behavior suites in `src/data/council.test.ts`.
- Keep fixtures minimal: provide only fields required by the public type and the behavior being tested.
- Use production constants such as `DILEMMAS`, `COUNCIL_PERSONAS`, and `QUICK_REPLIES` when testing data integrity; do not duplicate those datasets into fixtures.
- Small test-only helpers may live in the test file. `hexToRgb()`, `relativeLuminance()`, `contrastRatio()`, and `toggleInArray()` in `src/data/council.test.ts` support assertions without becoming production APIs.

**Location:**
- Inline in the relevant `.test.ts` file.
- Shared fixture/factory infrastructure: Not detected.
- If fixture reuse crosses multiple test files, add a clearly named non-test helper under the nearest feature directory and ensure its name does not match `src/**/*.test.ts` unless it contains executable tests.

## Coverage

**Requirements:** None enforced.

- `vitest.config.ts` has no `coverage` block, thresholds, include/exclude rules, or reporter configuration.
- `package.json` has no coverage script.
- Neither `@vitest/coverage-v8` nor `@vitest/coverage-istanbul` is installed at the project root.
- No coverage output directory is present in the tracked source inventory.
- The current test inventory covers three modules directly out of 85 non-generated source `.ts`/`.tsx` files: `src/data/advisor.ts`, `src/data/council.ts`, and the pure `clampWidth()` export from `src/hooks/useResizablePanel.ts`. This file count is an inventory comparison, not a measured statement/branch percentage.

**View Coverage:**
```bash
# Not currently available. Install and configure a Vitest coverage provider,
# then add a package script before using `vitest run --coverage`.
```

## Test Types

**Unit Tests:**
- This is the only automated test type detected.
- Test deterministic domain builders and data invariants in `src/data/advisor.test.ts` and `src/data/council.test.ts`.
- Test extracted pure utilities at boundary values in `src/hooks/useResizablePanel.test.ts`.
- The tests execute synchronously in the Node environment and do not render React components.
- Domain tests sometimes span several pure functions to validate a behavior chain. For example, `src/data/advisor.test.ts` feeds `buildFollowUpReply()` flags back into `buildAnswer()` and asserts the recalculated result.

**Integration Tests:**
- Not used.
- No tests exercise TanStack Router routes, React Query wiring, localStorage hooks, server middleware, SSR response normalization, or interactions between UI and data modules.
- No network/database test harness or service containers are referenced by `vitest.config.ts`.

**E2E Tests:**
- Not used.
- No Playwright, Cypress, WebdriverIO, or browser-test dependency/config is declared in `package.json`.
- Repository screenshots such as `answer-full.png` and local `.playwright-mcp/` artifacts are not an executable checked-in E2E suite.

## Common Patterns

**Async Testing:**
```typescript
// Not detected. All current tests are synchronous and no test returns or awaits
// a Promise in src/data/*.test.ts or src/hooks/*.test.ts.
```

- When adding asynchronous tests, return/await the operation from the `it` callback so Vitest observes failures; there is no project-specific async helper or timer setup to reuse.

**Error Testing:**
```typescript
// Not detected. Current tests validate fallback output and refusal behavior,
// but do not assert thrown or rejected errors with toThrow()/rejects.
```

- `src/data/advisor.test.ts` treats insufficient information as a normal result contract and asserts `evidenceLevel`, `verdict`, `risks`, and `missing` rather than expecting an exception.
- Add `toThrow`/`rejects` coverage only for APIs whose public contract is to throw. Current server and error-boundary behavior in `src/server.ts`, `src/start.ts`, and `src/lib/error-capture.ts` has no automated coverage.

**Data-Driven Invariants:**
```typescript
for (const p of COUNCIL_PERSONAS) {
  expect(contrastRatio(p.hex, "#ffffff")).toBeGreaterThanOrEqual(4.5);
}
```

- Use this pattern from `src/data/council.test.ts` for invariants that must hold across every item in an exported dataset.
- Keep thresholds explicit in the assertion and explain any hardcoded reference value adjacent to the test.

**Regression Assertions:**
```typescript
const reply = buildFollowUpReply("А если партнёр гарантирует объём?", before);
const after = buildAnswer(DILEMMAS.partnership, empty, reply.flags);
expect(after.risks).not.toContain("партнёр не обеспечит заявленный канал");
```

- Use before/action/after assertions from `src/data/advisor.test.ts` when a user follow-up must change computed domain output, not only presentation text.
- Assert the exact business rule that regressed while retaining structural invariants around it.

## Verification Snapshot

- `npm test`: passes, 3 test files and 41 tests, verified 2026-08-07.
- `npx tsc --noEmit`: passes, verified 2026-08-07.
- `npm run lint`: fails with 59 errors and 9 warnings, verified 2026-08-07; failures include formatting and explicit `any` usage outside the test files.
- `npx prettier --check src eslint.config.js vitest.config.ts vite.config.ts tsconfig.json`: fails on 15 files, verified 2026-08-07.
- Tests themselves require no setup and complete in approximately 326 ms in the verified local run.

---

*Testing analysis: 2026-08-07*
