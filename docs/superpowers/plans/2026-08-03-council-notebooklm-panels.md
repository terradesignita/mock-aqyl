# Консилиум: панели в стиле NotebookLM — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Left (сессии) and right (вердикт) panels in Консилиум become collapsible and mouse-resizable, with floating restore buttons and unified panel headers — matching the visual/interaction language of the open-case workspace's Sources/Studio panels, without touching panel content or mobile stacking behavior.

**Architecture:** Extract the drag-to-resize logic already duplicated conceptually between Sources/Studio in `card.$id.tsx` into a shared `useResizablePanel` hook, refactor `card.$id.tsx` onto it (no behavior change), then apply the same hook plus matching header/collapse/floating-button chrome to Консилиум's two side panels.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react icons, Vitest.

## Global Constraints

- Panel content (session list, persona composition, verdict synthesis/questions/agreements) does not change — only chrome around it.
- Mobile behavior (`< md` for the sessions panel, `< lg` for the verdict panel — these are Консилиум's *existing*, already-different breakpoints, do not unify them) keeps stacking columns; it never hides them. Collapse/resize/floating-restore-button behavior only activates at the panel's own existing desktop breakpoint.
- No new dependencies. No persistence of collapse/width state (matches `card.$id.tsx` today — resets on remount).
- Reuse the exact drag-resize mechanics already proven in `card.$id.tsx` (`cursor: col-resize` on `document.body` during drag, listeners removed on `mouseup`).

---

### Task 1: `useResizablePanel` hook

**Files:**
- Create: `src/hooks/useResizablePanel.ts`
- Test: `src/hooks/useResizablePanel.test.ts`

**Interfaces:**
- Produces: `clampWidth(value: number, min: number, max: number): number` — pure function, exported.
- Produces: `useResizablePanel(initial: number, opts: { min: number; max: number }): { width: number; startResize: (invert?: boolean) => (e: React.MouseEvent) => void }`.
  - `startResize()` (no arg / `false`): dragging the handle to the right increases width (panel anchored on the left, handle on its right edge).
  - `startResize(true)`: dragging the handle to the left increases width (panel anchored on the right, handle on its left edge).

- [ ] **Step 1: Write the failing test for `clampWidth`**

Create `src/hooks/useResizablePanel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { clampWidth } from "./useResizablePanel";

describe("clampWidth", () => {
  it("clamps values below the minimum up to the minimum", () => {
    expect(clampWidth(100, 220, 520)).toBe(220);
  });

  it("clamps values above the maximum down to the maximum", () => {
    expect(clampWidth(900, 220, 520)).toBe(520);
  });

  it("passes through values already inside the range", () => {
    expect(clampWidth(300, 220, 520)).toBe(300);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/hooks/useResizablePanel.test.ts`
Expected: FAIL — `src/hooks/useResizablePanel.ts` does not exist yet (import error).

- [ ] **Step 3: Write the hook**

Create `src/hooks/useResizablePanel.ts`:

```ts
import { useState } from "react";

/** Clamps `value` into the [min, max] range. */
export function clampWidth(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface ResizablePanelOptions {
  min: number;
  max: number;
}

/**
 * Drag-to-resize width state for a side panel. `startResize()` returns a
 * `mousedown` handler for the panel's resize handle.
 *
 * Pass `invert: true` for panels anchored on the right side of the layout
 * (handle on the panel's left edge, so dragging left grows the panel).
 */
export function useResizablePanel(initial: number, { min, max }: ResizablePanelOptions) {
  const [width, setWidth] = useState(initial);

  const startResize = (invert = false) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const onMove = (ev: MouseEvent) => {
      const delta = invert ? startX - ev.clientX : ev.clientX - startX;
      setWidth(clampWidth(startWidth + delta, min, max));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return { width, startResize };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/hooks/useResizablePanel.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useResizablePanel.ts src/hooks/useResizablePanel.test.ts
git commit -m "Add useResizablePanel hook for drag-to-resize side panels"
```

---

### Task 2: Refactor `card.$id.tsx` onto the shared hook

**Files:**
- Modify: `src/routes/card.$id.tsx:1` (imports), `:75-108` (state + resize logic), `:219`, `:274` (handle wiring)

**Interfaces:**
- Consumes: `useResizablePanel` from Task 1 (`src/hooks/useResizablePanel.ts`).
- No change to any exported interface — this is a pure internal refactor. `sourcesWidth`/`studioWidth` variable names stay the same so the rest of the component (JSX using `style={{ width: sourcesWidth }}` etc.) is untouched.

- [ ] **Step 1: Add the import**

In `src/routes/card.$id.tsx`, add to the top imports (after the `useAppState` import):

```ts
import { useResizablePanel } from "@/hooks/useResizablePanel";
```

- [ ] **Step 2: Replace the width state and `startResize` function**

Find and replace this block:

```ts
  const [selected, setSelected] = useState<string[]>(() => sources.map((s) => s.id));
  const [showSources, setShowSources] = useState(true);
  const [showStudio, setShowStudio] = useState(true);
  const [sourcesWidth, setSourcesWidth] = useState(290);
  const [studioWidth, setStudioWidth] = useState(320);

  const [reader, setReader] = useState<NotebookSource | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<{ text: string; nonce: number } | null>(
    null,
  );

  const bookmarked = bookmarks.includes(card.id);
  const isInternal = card.scope === "INTERNAL";
  const selectedCitations = sources.filter((s) => selected.includes(s.id)).map((s) => s.anchor);

  const startResize = (side: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = side === "left" ? sourcesWidth : studioWidth;
    const onMove = (ev: MouseEvent) => {
      const delta = side === "left" ? ev.clientX - startX : startX - ev.clientX;
      const next = Math.min(520, Math.max(220, startW + delta));
      if (side === "left") setSourcesWidth(next);
      else setStudioWidth(next);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
```

with:

```ts
  const [selected, setSelected] = useState<string[]>(() => sources.map((s) => s.id));
  const [showSources, setShowSources] = useState(true);
  const [showStudio, setShowStudio] = useState(true);
  const { width: sourcesWidth, startResize: startSourcesResize } = useResizablePanel(290, {
    min: 220,
    max: 520,
  });
  const { width: studioWidth, startResize: startStudioResize } = useResizablePanel(320, {
    min: 220,
    max: 520,
  });

  const [reader, setReader] = useState<NotebookSource | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<{ text: string; nonce: number } | null>(
    null,
  );

  const bookmarked = bookmarks.includes(card.id);
  const isInternal = card.scope === "INTERNAL";
  const selectedCitations = sources.filter((s) => selected.includes(s.id)).map((s) => s.anchor);
```

- [ ] **Step 3: Update the two resize-handle call sites**

Find:
```tsx
              onMouseDown={startResize("left")}
```
Replace with:
```tsx
              onMouseDown={startSourcesResize()}
```

Find:
```tsx
              onMouseDown={startResize("right")}
```
Replace with:
```tsx
              onMouseDown={startStudioResize(true)}
```

- [ ] **Step 4: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Run the test suite**

Run: `bunx vitest run`
Expected: all existing tests still pass (this task touches no test-covered logic, but confirms nothing else broke)

- [ ] **Step 6: Manual regression check**

Start the dev server if not already running (`docker compose up -d` in the project root, or `bun run dev`), open `/card/<any-id>` in a browser, and verify:
- Dragging the handle between Sources and the chat still resizes Sources (grows when dragged right, within 220–520px).
- Dragging the handle between the chat and Studio still resizes Studio (grows when dragged left, within 220–520px).
- Collapse/re-open buttons for both panels still work (unrelated to this refactor, but confirms nothing else regressed).

- [ ] **Step 7: Commit**

```bash
git add src/routes/card.\$id.tsx
git commit -m "Refactor card workspace resize logic onto useResizablePanel"
```

---

### Task 3: Sessions panel (left) — header, collapse, resize

**Files:**
- Modify: `src/routes/council.tsx:3` (icon imports), add hook import, `:481-602` (`CouncilPage`)

**Interfaces:**
- Consumes: `useResizablePanel` from Task 1.
- Produces: no new exports — internal to `CouncilPage`.

- [ ] **Step 1: Add icon and hook imports**

Find:
```ts
import { Plus, Search, Send } from "lucide-react";
```
Replace with:
```ts
import { PanelLeft, PanelLeftClose, PanelRight, PanelRightClose, Plus, Search, Send } from "lucide-react";
```

Find:
```ts
import { useCouncilSessions, useTheme } from "@/hooks/useAppState";
```
Add directly below it:
```ts
import { useResizablePanel } from "@/hooks/useResizablePanel";
```

- [ ] **Step 2: Add panel state to `CouncilPage`**

Find:
```ts
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
```
Replace with:
```ts
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showSessions, setShowSessions] = useState(true);
  const [showVerdict, setShowVerdict] = useState(true);
  const { width: sessionsWidth, startResize: startSessionsResize } = useResizablePanel(320, {
    min: 220,
    max: 520,
  });
  const { width: verdictWidth, startResize: startVerdictResize } = useResizablePanel(260, {
    min: 220,
    max: 480,
  });
```

- [ ] **Step 3: Rebuild the layout JSX**

Find the full JSX returned by `CouncilPage` (from `return (` down to the closing `);` right before `}` — i.e. everything currently between `<div className="flex min-h-screen ...">` and its matching close):

```tsx
    <div className="flex min-h-screen flex-col bg-background md:h-screen md:overflow-hidden">
      <Header dark={dark} onToggleDark={toggle} />
      <h1 className="sr-only">Консилиум</h1>

      <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card p-3 md:max-h-none md:w-[320px] md:overflow-y-auto md:border-b-0 md:border-r">
          <Button
            className="h-11 w-full gap-1.5 rounded-2xl text-sm"
            onClick={() => {
              setCreating(true);
              setActiveId(null);
            }}
          >
            <Plus className="h-4 w-4" /> Создать совет
          </Button>

          <div className="mt-4 flex-1 space-y-4">
            {today.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Сегодня</p>
                <div className="space-y-1.5">
                  {today.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                    />
                  ))}
                </div>
              </div>
            )}
            {earlier.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Ранее</p>
                <div className="space-y-1.5">
                  {earlier.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {active && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-1.5 px-1 text-xs font-bold text-muted-foreground">Совет</p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {active.personaIds.map((id) => {
                  const p = getPersona(id);
                  return (
                    <PersonaAvatar key={id} initials={p.initials} size="sm" className={p.color} />
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-card-foreground"
              >
                Изменить состав
              </button>
            </div>
          )}
        </aside>

        <div className="flex flex-1 flex-col md:min-h-0 md:min-w-0 lg:flex-row">
          <main className="flex flex-1 flex-col md:min-h-0 md:min-w-0 md:overflow-y-auto">
            {creating ? (
              <NewCouncilPanel
                onCancel={() => setCreating(false)}
                onCreate={(session) => {
                  create(session);
                  setCreating(false);
                  setActiveId(session.id);
                }}
              />
            ) : active ? (
              <SessionView session={active} onFollowUp={(text) => addFollowUp(active.id, text)} />
            ) : (
              <EmptyState />
            )}
          </main>
          {active && (
            <VerdictPanel session={active} onAsk={(text) => addFollowUp(active.id, text)} />
          )}
        </div>
      </div>

      {active && pickerOpen && (
        <PersonaPicker
          selected={active.personaIds}
          onChange={(ids) => updatePersonas(active.id, ids)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
```

Replace it with:

```tsx
    <div className="flex min-h-screen flex-col bg-background md:h-screen md:overflow-hidden">
      <Header dark={dark} onToggleDark={toggle} />
      <h1 className="sr-only">Консилиум</h1>

      <div className="relative flex flex-1 flex-col md:min-h-0 md:flex-row">
        <aside
          style={{ "--panel-w": `${sessionsWidth}px` } as React.CSSProperties}
          className={cn(
            "relative flex w-full shrink-0 flex-col border-b border-border bg-card p-3 md:max-h-none md:w-[var(--panel-w)] md:overflow-y-auto md:border-b-0 md:border-r",
            !showSessions && "md:hidden",
          )}
        >
          <div
            onMouseDown={startSessionsResize()}
            role="separator"
            aria-orientation="vertical"
            aria-label="Изменить ширину панели сессий"
            className="absolute inset-y-0 -right-1 z-20 hidden w-2 cursor-col-resize hover:bg-primary/25 md:block"
          />

          <div className="flex items-center gap-2 pb-2">
            <p className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm font-bold tracking-tight text-card-foreground">
              Сессии
              <span className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 text-xs font-bold tabular-nums text-muted-foreground">
                {sessions.length}
              </span>
            </p>
            <button
              onClick={() => setShowSessions(false)}
              aria-label="Свернуть панель сессий"
              title="Свернуть панель"
              className="hidden h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary md:grid"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <Button
            className="h-11 w-full gap-1.5 rounded-2xl text-sm"
            onClick={() => {
              setCreating(true);
              setActiveId(null);
            }}
          >
            <Plus className="h-4 w-4" /> Создать совет
          </Button>

          <div className="mt-4 flex-1 space-y-4">
            {today.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Сегодня</p>
                <div className="space-y-1.5">
                  {today.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                    />
                  ))}
                </div>
              </div>
            )}
            {earlier.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Ранее</p>
                <div className="space-y-1.5">
                  {earlier.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {active && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-1.5 px-1 text-xs font-bold text-muted-foreground">Совет</p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {active.personaIds.map((id) => {
                  const p = getPersona(id);
                  return (
                    <PersonaAvatar key={id} initials={p.initials} size="sm" className={p.color} />
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-card-foreground"
              >
                Изменить состав
              </button>
            </div>
          )}
        </aside>

        {!showSessions && (
          <button
            onClick={() => setShowSessions(true)}
            aria-label="Показать сессии"
            title="Показать панель сессий"
            className="absolute left-0 top-1/2 z-20 hidden h-16 w-6 -translate-y-1/2 place-items-center rounded-r-lg border border-l-0 border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary md:grid"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        <div className="relative flex flex-1 flex-col md:min-h-0 md:min-w-0 lg:flex-row">
          <main className="flex flex-1 flex-col md:min-h-0 md:min-w-0 md:overflow-y-auto">
            {creating ? (
              <NewCouncilPanel
                onCancel={() => setCreating(false)}
                onCreate={(session) => {
                  create(session);
                  setCreating(false);
                  setActiveId(session.id);
                }}
              />
            ) : active ? (
              <SessionView session={active} onFollowUp={(text) => addFollowUp(active.id, text)} />
            ) : (
              <EmptyState />
            )}
          </main>
          {active && (
            <VerdictPanel
              session={active}
              onAsk={(text) => addFollowUp(active.id, text)}
              width={verdictWidth}
              startResize={startVerdictResize(true)}
              collapsed={!showVerdict}
              onCollapse={() => setShowVerdict(false)}
            />
          )}
          {active && !showVerdict && (
            <button
              onClick={() => setShowVerdict(true)}
              aria-label="Показать вердикт"
              title="Показать панель вердикта"
              className="absolute right-0 top-1/2 z-20 hidden h-16 w-6 -translate-y-1/2 place-items-center rounded-l-lg border border-r-0 border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary lg:grid"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {active && pickerOpen && (
        <PersonaPicker
          selected={active.personaIds}
          onChange={(ids) => updatePersonas(active.id, ids)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
```

Note: this step references `<VerdictPanel width={...} startResize={...} collapsed={...} onCollapse={...} />` with props that don't exist yet — Task 4 adds them to `VerdictPanel`'s definition. Do Task 4 immediately after this step, before typechecking (the project will not typecheck cleanly in between).

- [ ] **Step 4: Commit** (after Task 4's `VerdictPanel` changes are also in place — see Task 4's own commit step, which covers both)

---

### Task 4: Verdict panel (right) — header, collapse, resize

**Files:**
- Modify: `src/routes/council.tsx:420-479` (`VerdictPanel`)

**Interfaces:**
- Consumes: `width: number`, `startResize: (e: React.MouseEvent) => void`, `collapsed: boolean`, `onCollapse: () => void` — passed from `CouncilPage` (Task 3, Step 3).

- [ ] **Step 1: Replace the `VerdictPanel` component**

Find:

```tsx
function VerdictPanel({
  session,
  onAsk,
}: {
  session: CouncilSession;
  onAsk: (text: string) => void;
}) {
  const verdict = buildVerdict(session.topic, session.personaIds, session.followUps);

  return (
    <aside
      aria-label="Вердикт совета"
      className="flex w-full flex-col gap-3 border-t border-border bg-card p-4 md:max-h-[45vh] md:shrink-0 md:overflow-y-auto lg:max-h-none lg:w-[260px] lg:border-l lg:border-t-0"
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
        <p className="text-xs font-bold text-primary">Вердикт совета</p>
      </div>
      <div
        key={session.followUps.length}
        className="animate-in rounded-xl border border-primary/30 bg-primary/6 p-3 text-sm leading-relaxed text-card-foreground fade-in duration-300"
      >
        {verdict.synthesis}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Открытые вопросы</p>
        <div className="flex flex-wrap gap-1.5">
          {verdict.openQuestions.map((question, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onAsk(question)}
              className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-left text-xs text-card-foreground transition-[color,border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8 hover:text-primary"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Согласны / расходятся</p>
        <div className="flex flex-wrap gap-1.5">
          {verdict.agreements.map((a, i) => (
            <span
              key={i}
              className={cn(
                "max-w-full truncate rounded-full border px-2 py-0.5 text-xs font-medium",
                a.kind === "agree"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
```

Replace with:

```tsx
function VerdictPanel({
  session,
  onAsk,
  width,
  startResize,
  collapsed,
  onCollapse,
}: {
  session: CouncilSession;
  onAsk: (text: string) => void;
  width: number;
  startResize: (e: React.MouseEvent) => void;
  collapsed: boolean;
  onCollapse: () => void;
}) {
  const verdict = buildVerdict(session.topic, session.personaIds, session.followUps);

  return (
    <aside
      aria-label="Вердикт совета"
      style={{ "--panel-w": `${width}px` } as React.CSSProperties}
      className={cn(
        "relative flex w-full flex-col gap-3 border-t border-border bg-card p-4 md:max-h-[45vh] md:shrink-0 md:overflow-y-auto lg:max-h-none lg:w-[var(--panel-w)] lg:border-l lg:border-t-0",
        collapsed && "lg:hidden",
      )}
    >
      <div
        onMouseDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label="Изменить ширину панели вердикта"
        className="absolute inset-y-0 -left-1 z-20 hidden w-2 cursor-col-resize hover:bg-primary/25 lg:block"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onCollapse}
          aria-label="Свернуть панель вердикта"
          title="Свернуть панель"
          className="hidden h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:grid"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
        <p className="text-xs font-bold text-primary">Вердикт совета</p>
      </div>
      <div
        key={session.followUps.length}
        className="animate-in rounded-xl border border-primary/30 bg-primary/6 p-3 text-sm leading-relaxed text-card-foreground fade-in duration-300"
      >
        {verdict.synthesis}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Открытые вопросы</p>
        <div className="flex flex-wrap gap-1.5">
          {verdict.openQuestions.map((question, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onAsk(question)}
              className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-left text-xs text-card-foreground transition-[color,border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8 hover:text-primary"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Согласны / расходятся</p>
        <div className="flex flex-wrap gap-1.5">
          {verdict.agreements.map((a, i) => (
            <span
              key={i}
              className={cn(
                "max-w-full truncate rounded-full border px-2 py-0.5 text-xs font-medium",
                a.kind === "agree"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no errors (this closes out Task 3's dangling prop references too)

- [ ] **Step 3: Run the test suite**

Run: `bunx vitest run`
Expected: all tests pass

- [ ] **Step 4: Commit (covers Task 3 + Task 4 together, since they don't typecheck independently)**

```bash
git add src/routes/council.tsx
git commit -m "Add collapsible/resizable NotebookLM-style chrome to Council's side panels"
```

---

### Task 5: Manual verification and mobile check

**Files:** none (verification only)

- [ ] **Step 1: Start the app**

`docker compose up -d --build` in the project root (OrbStack), or `bun run dev` locally. App serves on `http://localhost:8080`.

- [ ] **Step 2: Desktop verification (viewport ≥ 1024px wide)**

Open `/council`, create or open a session, then check:
- Sessions panel: header shows "Сессии" + a count badge; clicking the collapse button (`PanelLeftClose`) hides the panel and a floating left-edge arrow button (`PanelLeft`) appears; clicking it restores the panel.
- Dragging the sessions panel's right-edge handle resizes it between 220–520px.
- Verdict panel: header shows a collapse button (`PanelRightClose`) + "Вердикт совета"; collapsing hides it behind a floating right-edge arrow button (`PanelRight`); restoring works.
- Dragging the verdict panel's left-edge handle resizes it between 220–480px.

- [ ] **Step 3: Mid-width check (768px–1023px, i.e. `md` but below `lg`)**

Resize the browser (or use Playwright `browser_resize` to e.g. 900×800) with a session open. Confirm:
- Sessions panel is already collapsible/resizable here (its breakpoint is `md`).
- Verdict panel is NOT yet collapsible/resizable — it should render full-width, stacked below the chat (its breakpoint is `lg`), same as before this change.

- [ ] **Step 4: Mobile check (< 768px)**

Resize to e.g. 375×800. Confirm both panels render stacked (sessions on top, chat, verdict at the bottom) exactly as before this change — no collapse buttons, no resize handles, nothing hidden.

- [ ] **Step 5: Regression check on the case workspace**

Open any `/card/<id>` and re-confirm Task 2's manual check still holds (Sources/Studio collapse, resize, and restore all still work after the shared-hook refactor).

- [ ] **Step 6: Final full-suite check**

```bash
bunx tsc --noEmit
bunx vitest run
```

Expected: both clean.
