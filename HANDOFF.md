# Developer Handoff — BI AQYL Frontend

**Scope of this handoff:** all UI work from this working session — AI-советник rework, Studio/Artifacts rework, new Консилиум (Council) feature, search filters consolidation, and header cleanup.

**Nothing here was handed off from a separate design file.** Design and implementation happened together, directly in code, against the project's existing OKLCH token system (`src/styles.css`). This document exists so the next person (human or agent) doesn't have to re-derive intent from diffs.

---

## 1. Version tag

This codebase is git-versioned; that *is* the version history — no separate design-file versioning needed. The four commits in scope, newest first:

| Commit | What |
|---|---|
| `1efc001` | Accessibility/responsive fixes on Council (contrast, scroll, mobile stacking, labels) |
| `a5bd308` | New `/council` route + persona data; filters collapsed into a popover |
| `e6eabb4` | AI-советник UX rework; Studio/Artifacts redesign; header nav cleanup; color contrast fixes |
| `94b3f2e` | *(pre-existing, not part of this session)* topic-tag filters, UI polish, Docker setup |

Baseline before this session: `94b3f2e`. Everything below describes the delta from there to `1efc001` (pushed to `origin/main`).

---

## 2. What changed, by feature

### 2.1 AI-советник (`src/components/advisor/*`, `src/data/advisor.ts`)
- Layout matches the search bar's full width (`max-w-[1600px]`) at every stage — was previously narrower (`max-w-[820px]`/`[1200px]`), which read as a floating island between full-width header/filters.
- Stepper (Уточнение → Понимание → Анализ → Рекомендация) is compact-adaptive: on mobile only the **active** step shows its text label; others collapse to a numbered/checked circle. No more horizontal scroll-to-see-the-steps.
- `AdvisorAnswer` sections paired into `xl:grid-cols-2` groups (arguments+case, transfer+recommendation, risks+change-factors, missing+sources) so paragraph width stays readable even at full container width.
- Accessibility: labels added to the follow-up input and the "own answer" textarea (previously placeholder-only); `HelpHint` hit-area extended to 24×24 via `::after`, focus ring restored; `button.tsx` focus ring bumped 1px→2px (affects every button app-wide).
- Header row simplified: dropped the redundant title text, dilemma-type pill, and "Новый вопрос" button (editing the search query already resets the flow).

### 2.2 Studio / Artifacts (`src/components/notebook/StudioPanel.tsx`, `ArtifactDialog.tsx`, `artifacts/*`)
- Artifact grid kept as 2-col cards (colored `border-2` per type — **intentionally kept**, see §5) but internals cleaned up: bigger title (`text-xs`→`text-sm`), "Готово" status moved to its own line with a status dot instead of being crammed into the subtitle.
- `ArtifactDialog` gained a `size?: "default" | "wide"` prop. Presentation and infographic now render at `max-w-5xl` (was `max-w-2xl` for everything), and — the actual bug — **fullscreen previously capped content at `max-w-3xl` regardless of dialog size**, making "fullscreen" barely different from windowed. Wide artifacts now get `max-w-6xl` in fullscreen.
- `InfographicView.tsx` rewritten from scratch: was a single static portrait JPG (`infographic-summary.jpg`, same image for every card, now deleted) rendered inside a photo frame. Replaced with a real horizontal (`aspect-video`) layout built from the actual card's data (title, insight, path, 4 stat tiles) — matches the deck's sizing/treatment.
- `QuizView`: "Пройти заново" becomes the primary (filled) button once the quiz is completed, was always `ghost`.

### 2.3 Консилиум — new feature (`src/routes/council.tsx`, `src/data/council.ts`)
Multi-persona case discussion, built to the reference screenshot the user supplied.
- **Data model** (`src/data/council.ts`): 6 fixed personas (id, name, initials, role, `color` = Tailwind bg class), `CouncilSession` (id, title, date, personaIds, `topic: {title, summary, insight, businessUnit}`, `unread?`), and `buildPersonaTake(personaId, topic)` — a deterministic, per-role-flavored opinion string, same mocking philosophy as `advisor.ts` (no LLM, no backend).
- **Persistence** (`useCouncilSessions` in `src/hooks/useAppState.ts`): localStorage-backed, seeded with two example sessions (`SEED_COUNCIL_SESSIONS`) so the sidebar isn't empty on first load. Follows the exact same pattern as `useBookmarks`/`useNotes`/`useHistory`.
- **Page states**: `empty` (avatar-cluster hero + CTA) → `creating` (case search + persona picker, max 3) → `session` (per-persona opening take + free-text follow-up that appends a canned "synthesis" reply). State lives in `CouncilPage` component state (`activeId`, `creating`); only `sessions` themselves persist — an in-session follow-up thread does **not** survive reload (see §5).
- **Nav**: `Header.tsx` NAV array now has two real `Link`-based items ("Кейсы" → `/`, "Консилиум" → `/council`) using TanStack Router's `activeProps`/`inactiveProps` for active-state styling. The previous "Заметки"/"Советники" buttons were plain `<button>`s with no `onClick`/route behind them — removed once, then this one was explicitly re-added as a *working* link when the user asked for the tab back.

### 2.4 Search filters (`src/components/FiltersBar.tsx`, `src/components/SearchPanel.tsx`, `src/lib/search.ts`)
- Topic tags (`#Стратегия` etc.) used to overwrite the search query text on click. Now they're a real independent filter: `Filters.topic` field, `matchesTopic()` in `lib/search.ts`, combinable with a typed query via AND.
- Media type / business unit / language — previously three always-visible `<Select>`s in `FiltersBar` — are now one "Фильтры" popover trigger (with an active-count badge) sitting to the right of the Все/Внутренний/Мировой scope toggle in `SearchPanel`. `LANGUAGES` const moved to `lib/search.ts` as the single source (was duplicated).
- "Недавние вопросы" now only renders when the AI-советник toggle is on (previously always visible regardless of mode).
- AI-советник toggle now defaults **on** (`useState(true)`), and the case grid no longer disappears when it's on — advisor UI expands above the still-visible, still-filterable case grid instead of replacing it.

---

## 3. Visual specs (tokens actually used — not raw values)

All color is OKLCH, defined in `src/styles.css` `:root`/`.dark`, registered in `@theme inline`. Use the token name in Tailwind classes (`bg-primary`, `text-art-deck`, etc.) — never hardcode a hex/oklch value inline except for the one documented exception below.

| Token | Light `oklch(...)` | Used for |
|---|---|---|
| `--primary` | `0.538 0.256 262.4` | brand blue, primary actions, advisor accents |
| `--success` | `0.541 0.149 162.5` | *(darkened from `0.696` this session — was 2.36:1 on white, now ≥4.5:1)* |
| `--destructive` | `0.593 0.208 25.3` | *(darkened from `0.637` — button/text combo now passes 4.5:1)* |
| `--art-quiz/deck/report/cards/podcast/infographic` | 6 hues, `L 0.538–0.680` | categorical artifact-type coding in Studio panel |

**Documented exception:** Council persona avatars (`src/data/council.ts`) use raw Tailwind palette classes (`bg-amber-700`, `bg-violet-600`, `bg-blue-600`, `bg-teal-700`, `bg-orange-700`, `bg-fuchsia-600`), not app tokens. This was a deliberate scoped trade-off, not an oversight — see §5 for the reasoning and the follow-up recommendation.

Layout scale in use: `rounded-card` (surfaces), `rounded-control` (inputs/buttons), spacing steps of `1.5`/`2`/`3`/`4` (Tailwind default scale, i.e. 6/8/12/16px), container widths `max-w-[1600px]` (page shell), `max-w-2xl` (readable text column), `max-w-5xl`/`max-w-6xl` (wide artifact dialogs).

---

## 4. Interaction specs

### AI-советник stepper (`AdvisorFlow.tsx`)
| State | Desktop | Mobile |
|---|---|---|
| Done step | filled check icon, `bg-primary/10` pill | check icon only, no label |
| Active step | `bg-primary` pill, label visible | `bg-primary` pill, label visible (only step with visible text) |
| Future step | numbered circle, muted | numbered circle only |

### Studio artifact card (`StudioPanel.tsx`)
| State | Visual |
|---|---|
| Not generated | colored `border-2` per type, subtitle = format description |
| Loading | icon replaced by spinner, card disabled |
| Ready | subtitle → "Готово · открыть" in `text-success`, status dot |

### Консилиум page (`council.tsx`)
| State | Trigger | Renders |
|---|---|---|
| `empty` | no `activeId`, not `creating` | avatar-cluster hero, CTA |
| `creating` | "Новый совет" clicked (sidebar or hero) | case search (max 8 results) + persona grid (`aria-pressed`, disabled past 3rd pick) |
| `session` | a session row clicked, or just created | topic summary + one bubble per persona + follow-up input |

Keyboard: all custom `<button>`s inherit the global `:focus-visible` 2px outline rule in `styles.css` — don't add per-component `outline-none` without replacing it. Persona toggles expose `aria-pressed`; the open session row exposes `aria-current="true"`.

### Responsive breakpoint behavior — Консилиум
- `< md` (768px): sidebar becomes a full-width block above the main panel, capped at `max-h-[40vh]` with its own scroll, so the session list can't push the main content off-screen.
- `≥ md`: side-by-side, sidebar fixed `320px`.
- `main` always has `overflow-y-auto` — this was a real bug (see §5), don't remove it.

---

## 5. Known gaps / explicitly deferred (read before extending)

These were identified during the session and intentionally **not** fixed, either because they were out of the requested scope or because the user made an explicit call. Don't rediscover them as "bugs" without checking here first.

1. **Council persona avatar colors are raw Tailwind, not app tokens.** All 6 were checked for ≥4.5:1 contrast against white text and 3 were bumped a shade to pass. If this feature grows beyond a demo, promote these to real OKLCH tokens (`--persona-1`..`--persona-6`) in `styles.css` following the `--art-*` pattern, so they get the same light/dark-mode discipline as everything else.
2. **Council follow-up thread doesn't persist.** `SessionView`'s `thread` state is local to the component; refreshing the page loses any follow-up Q&A (the session itself, and its opening persona takes, do persist — only the ad-hoc follow-up exchange doesn't).
3. **Council's "synthesis" reply is one canned sentence**, not a real per-question response — same class of mock as `advisor.ts`, just less developed. If asked to deepen Council, this is the first thing to make real.
4. **AI-советник ТЗ compliance gaps** (flagged in an earlier audit this session, not yet fixed):
   - No "honest refusal" path (спец. раздел 15) — `buildAnswer()` always returns a full recommendation even when `evidenceLevel` is "недостаточно данных".
   - Follow-up questions in the advisor (not Council) don't actually recalculate anything — `buildAnswer(dilemma, selection)` never reads the follow-up text, so "what if the partner guarantees X" produces an unchanged answer.
   - Selecting "Пока неизвестно" alongside other answers can leak the literal string `__unknown` into the "Вот как я понял вашу ситуацию" text.
5. **`00_docs/` describes an unrelated backend project**, not this frontend (confirmed via a full-folder audit this session — see conversation history for the detailed report). It was left untouched per instruction ("изучи, но ничего не меняй"). Anyone relying on it for security/compliance claims about *this* repo is reading fiction — there is no backend here at all.
6. **Infographic generation** was requested to possibly use a Higgsfield MCP tool; that server wasn't connected in this session, so `InfographicView` was rebuilt as a data-driven layout instead of an AI-generated image. If Higgsfield (or any image-gen MCP) becomes available, this is a candidate to revisit — but the current version is arguably more correct anyway, since it's per-card instead of one static stock image.
7. **Filters count badge** on the "Фильтры" popover trigger only counts media type / business unit / language — topic tags are deliberately excluded (they're already visible as pressed pills below, no need to double-count).

---

## 6. QA checklist

Legend: ✅ verified this session (via Playwright + manual contrast math) · ⬜ not verified, do before shipping further

**Visual accuracy**
- ✅ `--success`/`--destructive` contrast ≥4.5:1 against white/card in both themes
- ✅ Council persona avatar contrast ≥4.5:1 (all 6, computed against white text)
- ⬜ Dark mode pass on Council specifically (built/verified in light mode only)

**Layout / responsive**
- ✅ Studio artifact panel readable at both 220px (min resize) and 520px (max resize)
- ✅ Advisor stepper fits without overflow at 375px
- ✅ Council: sidebar stacks correctly at 420px width
- ✅ Council: creation panel reachable via scroll at 640px viewport height
- ⬜ Full breakpoint sweep (sm/md/lg/xl) beyond the specific widths tested

**Interaction**
- ✅ Presentation/infographic dialogs open at `max-w-5xl`, fullscreen at `max-w-6xl`
- ✅ Persona toggle `aria-pressed` reflects selection; max-3 disables the rest
- ✅ Keyboard focus ring visible on `HelpHint` and all buttons (2px, not 1px)
- ⬜ Full keyboard-only walkthrough of Council creation → session flow (spot-checked, not exhaustive)

**Accessibility**
- ✅ Case-search input, follow-up inputs (advisor + Council) have real labels, not placeholder-only
- ✅ Council `h1` present (`sr-only`), avatar stacks have `aria-label` instead of being unlabeled color blobs
- ⬜ Actual screen reader pass (NVDA/VoiceOver) — only static AT-tree reasoning was done, not a live SR test

**Content**
- ✅ Infographic reflects the actual selected card's data (title, insight, path, stats) instead of one fixed stock image

---

## 7. Review readiness (gates)

- **Gate 3 (Pre-Handoff):** states covered for every new/changed flow (empty/loading/ready for artifacts; empty/creating/session for Council); accessibility pass done for what shipped. ✅
- **Gate 4 (Implementation QA):** verified in Chromium via Playwright at multiple viewport sizes; **not** verified cross-browser or on real devices — flag before a real release. ⬜

**Net verdict:** ready for internal review / further iteration. Not release-audited beyond what's checked off in §6.
