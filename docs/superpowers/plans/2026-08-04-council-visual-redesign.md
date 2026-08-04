# Консилиум: визуальный редизайн — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Консилиум (`src/routes/council.tsx`) the "яркое и игривое" visual language from `docs/superpowers/specs/2026-08-04-council-visual-redesign-design.md` — colored persona identity (ring + role tag), tinted message bubbles, a gradient conversation cover, colored sidebar rows, spring-in message animation, a typing-persona ring pulse, and persisted emoji reactions.

**Architecture:** Persona color moves from a Tailwind class name (`color`) to a raw `hex` (+ optional `darkHex` for the two personas that need a lighter border in dark mode). Two small CSS-variable-driven Tailwind constants (`PERSONA_BORDER_CLASS`, `PERSONA_TINT_CLASS`) replace the old per-color static class map — the actual color comes from `--persona-color`/`--persona-color-dark` custom properties set via `style`, not from enumerating every persona in a lookup table. Reactions are a new optional field on `CouncilChatMessage`, mutated through a new `toggleReaction` hook method, same `useLocalStorage`-backed pattern as everything else in `useCouncilSessions`.

**Tech Stack:** React 19, TypeScript, Tailwind v4 (CSS custom properties + arbitrary-value classes), Vitest. No new dependencies.

## Global Constraints

- No new dependencies, no new runtime — plain functions, CSS, and React state, consistent with the rest of this codebase.
- Persona border/ring color is **always 100% opacity** — the spec's own color audit found that a tinted (<100%) border cannot reach WCAG 3:1 against the dark card at any reasonable opacity for several persona hues. Only the background *fill* (`PERSONA_TINT_CLASS`) uses reduced opacity (10%).
- `darkHex` exists on exactly 2 of 12 personas (`platform`, `transform`) — the rest use the same `hex` in both themes because it already clears 3:1 against the dark card at full opacity. Do not add `darkHex` to personas that don't need it; the spec's contrast table (§1) is the source of truth for which ones do.
- Reactions are a **fixed 4-emoji set** (`👍 🤔 😮 🔥`), no open picker, and only ever attach to **persona** messages — the user's own messages never show a reaction bar, and persona-to-persona/persona-to-user reactions are explicitly out of scope for this pass.
- `prefers-reduced-motion: reduce` already zeroes `animation-duration` globally (`src/styles.css:258-263`) — new `@utility` animations must not bypass this (they don't need special-casing, just don't set `animation-duration` via inline style, which would win over the media-query override).

---

### Task 1: Persona data — `hex`/`darkHex`/`tag`, contrast-locking test

**Files:**
- Modify: `src/data/council.ts:1-109` (the `CouncilPersona` interface and `COUNCIL_PERSONAS` array)
- Modify: `src/data/council.test.ts` (add a new describe block)

**Interfaces:**
- Produces: `CouncilPersona.hex: string`, `CouncilPersona.darkHex?: string`, `CouncilPersona.tag: string` — `color` field is removed entirely.
- Consumes: nothing new.

- [ ] **Step 1: Replace the `CouncilPersona` interface and `COUNCIL_PERSONAS` array**

Find (the interface):
```ts
export interface CouncilPersona {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Реальный лидер — только как отсылка к стилю в bio. Никогда не источник цитаты. */
  inspiredBy: string;
  color: string;
}
```
Replace with:
```ts
export interface CouncilPersona {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Реальный лидер — только как отсылка к стилю в bio. Никогда не источник цитаты. */
  inspiredBy: string;
  /** Основной цвет персоны — hex. Используется в обеих темах для солидной
   *  заливки (аватар, тег) и как база для рамки/кольца. */
  hex: string;
  /** Только у персон, чей `hex` не проходит WCAG 3:1 на тёмной карточке —
   *  более светлый вариант ТОЛЬКО для рамки/кольца в тёмной теме. */
  darkHex?: string;
  /** Короткое слово-тег архетипа для чипа под именем персоны. */
  tag: string;
}
```

Find (the whole array, from `export const COUNCIL_PERSONAS` through its closing `];`):
```ts
export const COUNCIL_PERSONAS: CouncilPersona[] = [
  // Цвета подобраны на контраст ≥4.5:1 с белым текстом инициалов (WCAG AA).
  {
    id: "founder",
    name: "Артур Ким",
    initials: "AK",
    role: "Визионер-фаундер",
    inspiredBy: "Илона Маска",
    color: "bg-amber-700",
  },
  {
    id: "operator",
    name: "Роза Ниязова",
    initials: "RN",
    role: "Операционный директор",
    inspiredBy: "Тима Кука",
    color: "bg-violet-600",
  },
  {
    id: "engineer",
    name: "Виктор Тен",
    initials: "VT",
    role: "Инженер-прагматик",
    inspiredBy: "Стива Возняка",
    color: "bg-blue-600",
  },
  {
    id: "contrarian",
    name: "Лейла Асанова",
    initials: "LA",
    role: "Контрарианка-инвестор",
    inspiredBy: "Джорджа Сороса",
    color: "bg-teal-700",
  },
  {
    id: "industrialist",
    name: "Данияр Оспанов",
    initials: "DO",
    role: "Промышленник",
    inspiredBy: "Уоррена Баффета",
    color: "bg-orange-700",
  },
  {
    id: "product",
    name: "Мила Ержанова",
    initials: "ME",
    role: "Продакт-лидер",
    inspiredBy: "Джеффа Безоса",
    color: "bg-fuchsia-600",
  },
  {
    id: "brand",
    name: "Николь Багрова",
    initials: "NB",
    role: "Бренд-стратег",
    inspiredBy: "Ричарда Брэнсона",
    color: "bg-rose-700",
  },
  {
    id: "platform",
    name: "Самат Ержигитов",
    initials: "SE",
    role: "Платформенный стратег",
    inspiredBy: "Сатьи Наделлы",
    color: "bg-indigo-600",
  },
  {
    id: "competitor",
    name: "Алина Достаева",
    initials: "AD",
    role: "Директор по M&A",
    inspiredBy: "Ларри Эллисона",
    color: "bg-red-700",
  },
  {
    id: "resilience",
    name: "Тимур Нурланов",
    initials: "TN",
    role: "Директор по устойчивости",
    inspiredBy: "Джека Ма",
    color: "bg-cyan-700",
  },
  {
    id: "scale",
    name: "Диана Рахимова",
    initials: "DR",
    role: "Операционная эффективность",
    inspiredBy: "Сэма Уолтона",
    color: "bg-emerald-700",
  },
  {
    id: "transform",
    name: "Ержан Тулегенов",
    initials: "ET",
    role: "Директор по трансформации",
    inspiredBy: "Мэри Барра",
    color: "bg-stone-600",
  },
];
```
Replace with:
```ts
export const COUNCIL_PERSONAS: CouncilPersona[] = [
  // hex/darkHex подобраны скриптом (OKLCH → sRGB → WCAG-контраст) — см.
  // docs/superpowers/specs/2026-08-04-council-visual-redesign-design.md §1
  // для полной таблицы контрастов. Не менять точечно без пересчёта.
  {
    id: "founder",
    name: "Артур Ким",
    initials: "AK",
    role: "Визионер-фаундер",
    inspiredBy: "Илона Маска",
    hex: "#a75d00",
    tag: "Визионер",
  },
  {
    id: "operator",
    name: "Роза Ниязова",
    initials: "RN",
    role: "Операционный директор",
    inspiredBy: "Тима Кука",
    hex: "#7c3aed",
    tag: "Оператор",
  },
  {
    id: "engineer",
    name: "Виктор Тен",
    initials: "VT",
    role: "Инженер-прагматик",
    inspiredBy: "Стива Возняка",
    hex: "#2563eb",
    tag: "Инженер",
  },
  {
    id: "contrarian",
    name: "Лейла Асанова",
    initials: "LA",
    role: "Контрарианка-инвестор",
    inspiredBy: "Джорджа Сороса",
    hex: "#0f766e",
    tag: "Скептик",
  },
  {
    id: "industrialist",
    name: "Данияр Оспанов",
    initials: "DO",
    role: "Промышленник",
    inspiredBy: "Уоррена Баффета",
    hex: "#c34700",
    tag: "Промышленник",
  },
  {
    id: "product",
    name: "Мила Ержанова",
    initials: "ME",
    role: "Продакт-лидер",
    inspiredBy: "Джеффа Безоса",
    hex: "#c026d3",
    tag: "Продакт",
  },
  {
    id: "brand",
    name: "Николь Багрова",
    initials: "NB",
    role: "Бренд-стратег",
    inspiredBy: "Ричарда Брэнсона",
    hex: "#c13892",
    tag: "Бренд",
  },
  {
    id: "platform",
    name: "Самат Ержигитов",
    initials: "SE",
    role: "Платформенный стратег",
    inspiredBy: "Сатьи Наделлы",
    hex: "#4f46e5",
    darkHex: "#5954f3",
    tag: "Платформа",
  },
  {
    id: "competitor",
    name: "Алина Достаева",
    initials: "AD",
    role: "Директор по M&A",
    inspiredBy: "Ларри Эллисона",
    hex: "#ce3452",
    tag: "M&A",
  },
  {
    id: "resilience",
    name: "Тимур Нурланов",
    initials: "TN",
    role: "Директор по устойчивости",
    inspiredBy: "Джека Ма",
    hex: "#0e7490",
    tag: "Устойчивость",
  },
  {
    id: "scale",
    name: "Диана Рахимова",
    initials: "DR",
    role: "Операционная эффективность",
    inspiredBy: "Сэма Уолтона",
    hex: "#047857",
    tag: "Масштаб",
  },
  {
    id: "transform",
    name: "Ержан Тулегенов",
    initials: "ET",
    role: "Директор по трансформации",
    inspiredBy: "Мэри Барра",
    hex: "#57534e",
    darkHex: "#6f6b66",
    tag: "Трансформация",
  },
];
```

- [ ] **Step 2: Typecheck (expect failures — this is the point)**

Run: `bunx tsc --noEmit`
Expected: errors in `src/routes/council.tsx` wherever `p.color`/`typingPersona.color` is referenced (8 call sites) — that's the rest of this plan. Confirm there are NO errors inside `src/data/council.ts` itself.

- [ ] **Step 3: Add the contrast-locking test**

In `src/data/council.test.ts`, add this new `describe` block (anywhere after the imports — e.g. right after the existing `describe("COUNCIL_PERSONAS", ...)` block):

```ts
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

// Same sRGB value as oklch(0.221 0.037 258.8) — the dark-theme --card token
// in src/styles.css. Hardcoded here so this test doesn't depend on parsing CSS.
const DARK_CARD_HEX = "#101b2c";

describe("persona color contrast", () => {
  it("every persona hex/darkHex is a valid #rrggbb string", () => {
    const hexPattern = /^#[0-9a-f]{6}$/i;
    for (const p of COUNCIL_PERSONAS) {
      expect(p.hex).toMatch(hexPattern);
      if (p.darkHex) expect(p.darkHex).toMatch(hexPattern);
    }
  });

  it("every persona has a non-empty tag", () => {
    for (const p of COUNCIL_PERSONAS) {
      expect(p.tag.length).toBeGreaterThan(0);
    }
  });

  it("white text on every persona hex clears WCAG AA (4.5:1)", () => {
    for (const p of COUNCIL_PERSONAS) {
      expect(contrastRatio(p.hex, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("the border color used in each theme clears 3:1 against the dark card", () => {
    for (const p of COUNCIL_PERSONAS) {
      const darkThemeBorderHex = p.darkHex ?? p.hex;
      expect(contrastRatio(darkThemeBorderHex, DARK_CARD_HEX)).toBeGreaterThanOrEqual(3.0);
    }
  });
});
```

- [ ] **Step 4: Run the new tests**

Run: `bunx vitest run src/data/council.test.ts`
Expected: all pass, including the 4 new ones.

- [ ] **Step 5: Commit**

```bash
git add src/data/council.ts src/data/council.test.ts
git commit -m "Replace persona Tailwind color class with hex/darkHex, lock contrast with a test"
```

---

### Task 2: `PersonaAvatar` — ring support

**Files:**
- Modify: `src/components/PersonaAvatar.tsx` (whole file — see exact replacement below)

**Interfaces:**
- Consumes: nothing new.
- Produces: `PersonaAvatarProps.ringClassName?: string` — merged into the rendered `<span>`'s className. `style` already passes through via the existing `...rest: HTMLAttributes<HTMLSpanElement>` spread, so no new prop is needed for background color or CSS custom properties.

- [ ] **Step 1: Replace the whole file**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  xs: "h-6 w-6 text-xs",
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-sm",
} as const;

export interface PersonaAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials: string;
  size?: keyof typeof SIZE_CLASS;
  /** border-2 border-card — для стека перекрывающихся аватаров. */
  ring?: boolean;
  /** Кольцо цвета персоны — border-2 в цвете, заданном через CSS-переменные
   *  в `style` (см. personaColorVars/personaAvatarStyle в council.tsx).
   *  Отдельно от `ring` — оба применяются одновременно, если заданы оба. */
  ringClassName?: string;
}

export function PersonaAvatar({
  initials,
  size = "md",
  ring,
  ringClassName,
  className,
  ...rest
}: PersonaAvatarProps) {
  return (
    <span
      {...rest}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold text-white",
        SIZE_CLASS[size],
        ring && "border-2 border-card",
        ringClassName && "border-2",
        ringClassName,
        className,
      )}
    >
      {initials}
    </span>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: same set of `council.tsx` errors as after Task 1 (this file itself introduces none).

- [ ] **Step 3: Commit**

```bash
git add src/components/PersonaAvatar.tsx
git commit -m "Add ringClassName to PersonaAvatar for persona-colored identity rings"
```

---

### Task 3: Council color helpers + `PersonaTag`, migrate persona-picker rows

**Files:**
- Modify: `src/routes/council.tsx` (imports; replace `PERSONA_BORDER_CLASS`; update `AvatarStack`; update `NewCouncilPanel`'s and `PersonaPicker`'s persona rows; update the sidebar "Совет" chip row)

**Interfaces:**
- Consumes: `CouncilPersona.hex`/`darkHex`/`tag` (Task 1), `PersonaAvatar.ringClassName` (Task 2).
- Produces: `PERSONA_BORDER_CLASS: string` (now a single constant, not a map), `PERSONA_TINT_CLASS: string`, `personaColorVars(p): React.CSSProperties`, `personaAvatarStyle(p): React.CSSProperties`, `PersonaTag` component — all consumed by Task 4/6.

This task will not fully typecheck alone — `SessionView`'s persona-message rendering and the typing indicator (Task 4) still reference the old per-color map shape. Do these checks instead:

- [ ] **Step 1: Replace the old `PERSONA_BORDER_CLASS` map with the new constants + helpers + `PersonaTag`**

Find:
```ts
// Static map so Tailwind's JIT scanner sees every class literally — a
// runtime `p.color.replace("bg-", "border-l-")` would never be picked up.
const PERSONA_BORDER_CLASS: Record<string, string> = {
  "bg-amber-700": "border-l-amber-700",
  "bg-violet-600": "border-l-violet-600",
  "bg-blue-600": "border-l-blue-600",
  "bg-teal-700": "border-l-teal-700",
  "bg-orange-700": "border-l-orange-700",
  "bg-fuchsia-600": "border-l-fuchsia-600",
  "bg-rose-700": "border-l-rose-700",
  "bg-indigo-600": "border-l-indigo-600",
  "bg-red-700": "border-l-red-700",
  "bg-cyan-700": "border-l-cyan-700",
  "bg-emerald-700": "border-l-emerald-700",
  "bg-stone-600": "border-l-stone-600",
};
```
Replace with:
```ts
// Персональный цвет — произвольный hex (Task 1), не именованный Tailwind-класс,
// поэтому вместо карты color→класс используем CSS-переменные: сам класс
// статичен и один на всех (JIT видит литерал), а конкретный цвет приходит
// через --persona-color/--persona-color-dark в style. Рамка/кольцо — всегда
// 100% непрозрачности (тонированная рамка не держит WCAG 3:1 в тёмной теме,
// см. спеку §2); только заливка (PERSONA_TINT_CLASS) — 10%.
const PERSONA_BORDER_CLASS = "border-[var(--persona-color)] dark:border-[var(--persona-color-dark)]";
const PERSONA_TINT_CLASS = "bg-[color-mix(in_oklab,var(--persona-color)_10%,transparent)]";

function personaColorVars(p: CouncilPersona): React.CSSProperties {
  return {
    "--persona-color": p.hex,
    "--persona-color-dark": p.darkHex ?? p.hex,
  } as React.CSSProperties;
}

/** personaColorVars + backgroundColor in one shot — for standalone PersonaAvatar
 *  usages that aren't already inside an element carrying the CSS variables. */
function personaAvatarStyle(p: CouncilPersona): React.CSSProperties {
  return { backgroundColor: p.hex, ...personaColorVars(p) };
}

function PersonaTag({ tag, hex }: { tag: string; hex: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white"
      style={{ backgroundColor: hex }}
    >
      {tag}
    </span>
  );
}
```

Add `type CouncilPersona` to the existing `@/data/council` import list (needed for the two helpers' parameter types):
Find:
```ts
import {
  buildFollowUpReplies,
  buildOpeningMessages,
  buildUserMessage,
  COUNCIL_PERSONAS,
  FOLLOW_UP_FALLBACK_TEXT,
  getPersona,
  hasLikelyDisagreement,
  pickDefaultTrio,
  QUICK_REPLIES,
  type CouncilChatMessage,
  type CouncilSession,
} from "@/data/council";
```
Replace with:
```ts
import {
  buildFollowUpReplies,
  buildOpeningMessages,
  buildUserMessage,
  COUNCIL_PERSONAS,
  FOLLOW_UP_FALLBACK_TEXT,
  getPersona,
  hasLikelyDisagreement,
  pickDefaultTrio,
  QUICK_REPLIES,
  type CouncilChatMessage,
  type CouncilPersona,
  type CouncilSession,
} from "@/data/council";
```

- [ ] **Step 2: Update `AvatarStack` — parameterize size, use hex-based style**

Find:
```tsx
function AvatarStack({ personaIds }: { personaIds: string[] }) {
  const shown = personaIds.slice(0, 2);
  const rest = personaIds.length - shown.length;
  const names = personaIds.map((id) => getPersona(id).name).join(", ");
  return (
    <div role="img" aria-label={`Участники: ${names}`} className="flex items-center -space-x-2">
      {shown.map((id) => {
        const p = getPersona(id);
        return (
          <PersonaAvatar
            key={id}
            aria-hidden
            initials={p.initials}
            size="xs"
            ring
            className={p.color}
          />
        );
      })}
      {rest > 0 && (
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-secondary text-xs font-bold text-muted-foreground"
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
```
Replace with:
```tsx
function AvatarStack({
  personaIds,
  size = "xs",
}: {
  personaIds: string[];
  size?: "xs" | "lg";
}) {
  const shown = personaIds.slice(0, 2);
  const rest = personaIds.length - shown.length;
  const names = personaIds.map((id) => getPersona(id).name).join(", ");
  const overflowClass = size === "lg" ? "h-10 w-10 text-sm" : "h-6 w-6 text-xs";
  return (
    <div role="img" aria-label={`Участники: ${names}`} className="flex items-center -space-x-2">
      {shown.map((id) => {
        const p = getPersona(id);
        return (
          <PersonaAvatar
            key={id}
            aria-hidden
            initials={p.initials}
            size={size}
            ring
            style={{ backgroundColor: p.hex }}
          />
        );
      })}
      {rest > 0 && (
        <span
          aria-hidden
          className={cn(
            "grid place-items-center rounded-full border-2 border-card bg-secondary font-bold text-muted-foreground",
            overflowClass,
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `NewCouncilPanel`'s persona row — add ring + tag**

Find:
```tsx
                    <PersonaAvatar initials={p.initials} size="md" className={p.color} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-card-foreground">
                        {p.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.role} · в духе {p.inspiredBy}
                      </span>
                    </span>
```
Replace with:
```tsx
                    <PersonaAvatar
                      initials={p.initials}
                      size="md"
                      ringClassName={PERSONA_BORDER_CLASS}
                      style={personaAvatarStyle(p)}
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="block truncate text-sm font-semibold text-card-foreground">
                          {p.name}
                        </span>
                        <PersonaTag tag={p.tag} hex={p.hex} />
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.role} · в духе {p.inspiredBy}
                      </span>
                    </span>
```

- [ ] **Step 4: `PersonaPicker`'s persona row — same treatment**

Find:
```tsx
              <PersonaAvatar initials={p.initials} size="md" className={p.color} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-card-foreground">
                  {p.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.role} · в духе {p.inspiredBy}
                </span>
              </span>
```
Replace with:
```tsx
              <PersonaAvatar
                initials={p.initials}
                size="md"
                ringClassName={PERSONA_BORDER_CLASS}
                style={personaAvatarStyle(p)}
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="block truncate text-sm font-semibold text-card-foreground">
                    {p.name}
                  </span>
                  <PersonaTag tag={p.tag} hex={p.hex} />
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.role} · в духе {p.inspiredBy}
                </span>
              </span>
```

- [ ] **Step 5: Sidebar "Совет" chip row — hex-based background, no ring/tag (too small, per spec §3)**

Find:
```tsx
                        <PersonaAvatar
                          key={id}
                          initials={p.initials}
                          size="sm"
                          className={p.color}
                        />
```
Replace with:
```tsx
                        <PersonaAvatar
                          key={id}
                          initials={p.initials}
                          size="sm"
                          style={{ backgroundColor: p.hex }}
                        />
```

- [ ] **Step 6: Typecheck**

Run: `bunx tsc --noEmit`
Expected: errors remain only in `SessionView`'s persona-message block and typing indicator (`p.color`/`typingPersona.color`, and `PERSONA_BORDER_CLASS[p.color]` — now invalid since `PERSONA_BORDER_CLASS` is a string, not a map) — fixed in Task 4.

- [ ] **Step 7: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Add persona color CSS-variable helpers and PersonaTag; ring+tag on persona pickers"
```

---

### Task 4: Persona message bubbles — ring + tint, typing indicator hex

**Files:**
- Modify: `src/routes/council.tsx` (`SessionView`'s persona-message block and typing indicator)

**Interfaces:**
- Consumes: `PERSONA_BORDER_CLASS`, `PERSONA_TINT_CLASS`, `personaColorVars` (Task 3).
- Produces: nothing new — this is the task that makes the whole file typecheck again.

- [ ] **Step 1: Persona message group — tint + ring, CSS vars on the group wrapper**

Find:
```tsx
          const p = getPersona(group.author);
          const replyTarget = group.items[0].replyTo ? getPersona(group.items[0].replyTo) : null;

          return (
            <div key={group.items[0].id} className="flex gap-3">
              <PersonaAvatar initials={p.initials} size="md" className={p.color} />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-card-foreground">
                  {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
                  {replyTarget && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · Ответ: {replyTarget.name.split(" ")[0]}
                    </span>
                  )}
                </p>
                {group.items.map((m) => (
                  <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <MessageBubble
                      variant="entity"
                      accentClassName={cn("border-l-4", PERSONA_BORDER_CLASS[p.color])}
                    >
                      {m.text}
                    </MessageBubble>
                    <p className="mt-1 text-xs text-muted-foreground">{m.time}</p>
                  </div>
                ))}
              </div>
            </div>
          );
```
Replace with:
```tsx
          const p = getPersona(group.author);
          const replyTarget = group.items[0].replyTo ? getPersona(group.items[0].replyTo) : null;

          return (
            <div key={group.items[0].id} className="flex gap-3" style={personaColorVars(p)}>
              <PersonaAvatar
                initials={p.initials}
                size="md"
                ringClassName={PERSONA_BORDER_CLASS}
                style={{ backgroundColor: p.hex }}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-card-foreground">
                  {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
                  {replyTarget && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · Ответ: {replyTarget.name.split(" ")[0]}
                    </span>
                  )}
                </p>
                {group.items.map((m) => (
                  <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <MessageBubble
                      variant="entity"
                      accentClassName={cn(PERSONA_TINT_CLASS, PERSONA_BORDER_CLASS)}
                    >
                      {m.text}
                    </MessageBubble>
                    <p className="mt-1 text-xs text-muted-foreground">{m.time}</p>
                  </div>
                ))}
              </div>
            </div>
          );
```

- [ ] **Step 2: Typing indicator — hex-based background**

Find:
```tsx
            <PersonaAvatar
              initials={typingPersona.initials}
              size="md"
              className={typingPersona.color}
            />
```
Replace with:
```tsx
            <PersonaAvatar
              initials={typingPersona.initials}
              size="md"
              style={{ backgroundColor: typingPersona.hex }}
            />
```

- [ ] **Step 3: Typecheck — must be completely clean now**

Run: `bunx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 4: Run the full test suite**

Run: `bunx vitest run`
Expected: all pass (this task changes no data/logic, only JSX).

- [ ] **Step 5: Manual visual check**

Start the app (`docker compose up -d` or `bun run dev`), open `/council`, open any session. Confirm: each persona's message bubble has a subtly tinted background and a full-strength colored border matching that persona; the avatar next to it has a matching colored ring; the "Совет" chip row and persona pickers show solid-colored avatars (no ring there — sidebar chips are `size="sm"`, correctly excluded per Task 3 Step 5). Toggle dark mode: confirm `platform`- and `transform`-colored borders are visibly lighter in dark mode than in light mode (the only two personas where this should be visible — everyone else's border color is identical in both themes).

- [ ] **Step 6: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Apply persona ring and tint to message bubbles and the typing indicator"
```

---

### Task 5: `ConversationCover` — merge case card and chat header

**Files:**
- Modify: `src/routes/council.tsx` (`SessionView`'s header+case blocks; add a new `ConversationCover` function)

**Interfaces:**
- Consumes: `AvatarStack` with the new `size` prop (Task 3), `getPersona(id).hex` (Task 1).
- Produces: `ConversationCover({ session }: { session: CouncilSession })` component, used only in `SessionView`.

- [ ] **Step 1: Add the `ConversationCover` function**

Add this new function immediately after `groupMessages` and before `getScrollParent`:

```tsx
function ConversationCover({ session }: { session: CouncilSession }) {
  const colors = session.personaIds.slice(0, 3).map((id) => getPersona(id).hex);
  const anchors = ["0% 0%", "100% 0%", "50% 100%"];
  const backgroundImage = colors
    .map(
      (hex, i) =>
        `radial-gradient(60% 90% at ${anchors[i]}, color-mix(in oklab, ${hex} 18%, transparent), transparent 65%)`,
    )
    .join(", ");

  return (
    <div
      className="rounded-2xl border border-border p-4"
      style={{ backgroundImage, backgroundColor: "var(--color-card)" }}
    >
      <AvatarStack personaIds={session.personaIds} size="lg" />
      <h2 className="mt-3 text-lg font-bold leading-tight text-foreground">
        {session.topic.title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {session.topic.summary}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {session.personaIds.length}{" "}
        {session.personaIds.length === 1 ? "участник" : "участника"} · на связи
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Replace the two separate header/case blocks in `SessionView` with `ConversationCover`**

Find:
```tsx
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <AvatarStack personaIds={session.personaIds} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-card-foreground" title={session.title}>
              {session.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {session.personaIds.length}{" "}
              {session.personaIds.length === 1 ? "участник" : "участника"} · на связи
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold text-primary">Кейс</p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-foreground">
            {session.topic.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {session.topic.summary}
          </p>
        </div>
```
Replace with:
```tsx
        <ConversationCover session={session} />
```

- [ ] **Step 3: Typecheck and test**

Run: `bunx tsc --noEmit && bunx vitest run`
Expected: both clean.

- [ ] **Step 4: Manual visual check**

Open a session with 1 participant, one with 2, and one with 3 (create test sessions via "Создать совет" if needed). Confirm the cover card shows a visible soft-colored gradient in all three cases (not just a flat card), the avatar stack renders large (`size="lg"`, 56px circles) inside it, and the title/summary/participant-count text is legible over the gradient in both themes.

- [ ] **Step 5: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Merge case summary and chat header into a gradient ConversationCover"
```

---

### Task 6: Colored sidebar session rows

**Files:**
- Modify: `src/routes/council.tsx` (`SessionRow`)

**Interfaces:**
- Consumes: `getPersona(id).hex` (Task 1).
- Produces: nothing new.

- [ ] **Step 1: Add a per-row accent derived from the first persona, via CSS variable + arbitrary-value classes**

Inline `style` cannot be used for the background/border here because it would out-rank the existing `hover:` Tailwind classes (inline style always wins over a class-based `:hover` rule, which would make the row un-hoverable) — so this uses the same CSS-variable + arbitrary-class pattern as `PERSONA_BORDER_CLASS`/`PERSONA_TINT_CLASS`, not a plain `style` object.

Find:
```tsx
  return (
    <div
      className={cn(
        "group relative w-full rounded-xl border transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/30 hover:bg-secondary/30",
      )}
    >
```
Replace with:
```tsx
  const accentHex = getPersona(session.personaIds[0]).hex;
  return (
    <div
      style={{ "--row-accent": accentHex } as React.CSSProperties}
      className={cn(
        "group relative w-full rounded-xl border transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-[color-mix(in_oklab,var(--row-accent)_25%,transparent)] bg-[color-mix(in_oklab,var(--row-accent)_6%,var(--color-card))] hover:border-primary/30 hover:bg-secondary/30",
      )}
    >
```

- [ ] **Step 2: Typecheck and test**

Run: `bunx tsc --noEmit && bunx vitest run`
Expected: both clean.

- [ ] **Step 3: Manual visual check**

Open `/council` with 2+ sessions using different first personas. Confirm each row has a subtly different tinted background/border reflecting its first participant's color, hover still visibly changes the row (confirming the `hover:` classes still win over the base arbitrary-value classes), and the active/selected row still shows the plain primary highlight (not a persona color) since `active` short-circuits to the `border-primary bg-primary/5` branch.

- [ ] **Step 4: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Give sidebar session rows a subtle accent tint from their first persona"
```

---

### Task 7: Motion — spring message pop-in, typing-persona ring pulse

**Files:**
- Modify: `src/styles.css` (two new `@keyframes`/`@utility` pairs)
- Modify: `src/routes/council.tsx` (apply the new animation classes)

**Interfaces:**
- Consumes: nothing new.
- Produces: `animate-message-pop`, `animate-typing-ring` Tailwind utility classes.

- [ ] **Step 1: Add the two keyframe/utility pairs to `styles.css`**

Find:
```css
@utility shadow-brand {
  box-shadow: var(--shadow-brand);
}
```
Replace with:
```css
@utility shadow-brand {
  box-shadow: var(--shadow-brand);
}

@keyframes message-pop {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.92);
  }
  60% {
    opacity: 1;
    transform: translateY(0) scale(1.04);
  }
  100% {
    transform: scale(1);
  }
}

@utility animate-message-pop {
  animation: message-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes typing-ring-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in oklab, var(--pulse-color, currentColor) 50%, transparent);
  }
  50% {
    box-shadow: 0 0 0 6px color-mix(in oklab, var(--pulse-color, currentColor) 0%, transparent);
  }
}

@utility animate-typing-ring {
  animation: typing-ring-pulse 1.2s ease-out infinite;
}
```

(This must land above the `@media (prefers-reduced-motion: reduce)` block later in the file — since it's inserted right after `@utility shadow-brand`, which is already above that block, no reordering is needed.)

- [ ] **Step 2: Apply `animate-message-pop` to the user-message wrapper**

Find:
```tsx
                    <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <MessageBubble variant="user" bubbleClassName="p-3">
                        {m.text}
                      </MessageBubble>
```
Replace with:
```tsx
                    <div key={m.id} className="animate-message-pop">
                      <MessageBubble variant="user" bubbleClassName="p-3">
                        {m.text}
                      </MessageBubble>
```

- [ ] **Step 3: Apply `animate-message-pop` to the persona-message wrapper**

Find:
```tsx
                  <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <MessageBubble
                      variant="entity"
                      accentClassName={cn(PERSONA_TINT_CLASS, PERSONA_BORDER_CLASS)}
                    >
```
Replace with:
```tsx
                  <div key={m.id} className="animate-message-pop">
                    <MessageBubble
                      variant="entity"
                      accentClassName={cn(PERSONA_TINT_CLASS, PERSONA_BORDER_CLASS)}
                    >
```

- [ ] **Step 4: Ring-pulse on the typing indicator's avatar**

Find:
```tsx
            <PersonaAvatar
              initials={typingPersona.initials}
              size="md"
              style={{ backgroundColor: typingPersona.hex }}
            />
```
Replace with:
```tsx
            <PersonaAvatar
              initials={typingPersona.initials}
              size="md"
              className="animate-typing-ring"
              style={
                {
                  backgroundColor: typingPersona.hex,
                  "--pulse-color": typingPersona.darkHex ?? typingPersona.hex,
                } as React.CSSProperties
              }
            />
```

- [ ] **Step 5: Typecheck and test**

Run: `bunx tsc --noEmit && bunx vitest run`
Expected: both clean.

- [ ] **Step 6: Manual visual check**

Send a follow-up in an active session. Confirm: each new message bubble bounces in with a slight overshoot (not a flat fade), and the typing persona's avatar shows a pulsing ring while its dots are visible. Then enable "reduce motion" in the OS/browser accessibility settings, reload, and repeat — confirm the pop and pulse both collapse to instant/static (no animation), matching the existing `prefers-reduced-motion` behavior already used elsewhere on this page.

- [ ] **Step 7: Commit**

```bash
git add src/styles.css src/routes/council.tsx
git commit -m "Add spring pop-in for new messages and a typing-persona ring pulse"
```

---

### Task 8: Emoji reactions on persona messages

**Files:**
- Modify: `src/data/council.ts` (new `reactions` field, `REACTION_EMOJIS` constant)
- Modify: `src/data/council.test.ts` (new test for the reaction toggle logic used by the hook)
- Modify: `src/hooks/useAppState.ts` (`toggleReaction` method)
- Modify: `src/routes/council.tsx` (`ReactionBar` component, wiring)

**Interfaces:**
- Produces: `CouncilChatMessage.reactions?: string[]`, `REACTION_EMOJIS: string[]` (from `council.ts`); `toggleReaction(sessionId: string, messageId: string, emoji: string): void` (from `useCouncilSessions()`); `ReactionBar` component (`council.tsx`, not exported).

- [ ] **Step 1: Add `reactions` to `CouncilChatMessage` and export `REACTION_EMOJIS`**

Find:
```ts
export interface CouncilChatMessage {
  id: string;
  /** "user" или id персоны из COUNCIL_PERSONAS. */
  author: "user" | string;
  text: string;
  /** "ЧЧ:ММ" — тот же паттерн, что уже используется в NotebookChat.tsx. */
  time: string;
  /** id персоны, на чью реплику это реакция — рендерится как "отвечает <Имя>". */
  replyTo?: string;
}
```
Replace with:
```ts
export interface CouncilChatMessage {
  id: string;
  /** "user" или id персоны из COUNCIL_PERSONAS. */
  author: "user" | string;
  text: string;
  /** "ЧЧ:ММ" — тот же паттерн, что уже используется в NotebookChat.tsx. */
  time: string;
  /** id персоны, на чью реплику это реакция — рендерится как "· Ответ: <Имя>". */
  replyTo?: string;
  /** Эмодзи, которыми пользователь отреагировал на это сообщение персоны.
   *  Только у сообщений персон — у сообщений пользователя не используется. */
  reactions?: string[];
}
```

Find:
```ts
export const QUICK_REPLIES = [
  "Какие главные риски?",
  "Что бы вы сделали первым?",
  "Вы согласны друг с другом?",
  "Дайте конкретный план",
];
```
Replace with:
```ts
export const QUICK_REPLIES = [
  "Какие главные риски?",
  "Что бы вы сделали первым?",
  "Вы согласны друг с другом?",
  "Дайте конкретный план",
];

/** Фиксированный набор — никакого открытого пикера (см. спеку §7). */
export const REACTION_EMOJIS = ["👍", "🤔", "😮", "🔥"];
```

- [ ] **Step 2: Write the failing test for the toggle logic**

The toggle logic itself lives in the hook (Step 3), but the pure "add or remove from array" behavior is worth locking with a plain unit test that doesn't need React. Add to `src/data/council.test.ts`, right after the `persona color contrast` describe block:

```ts
function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

describe("REACTION_EMOJIS", () => {
  it("has exactly 4 emoji, no duplicates", () => {
    expect(REACTION_EMOJIS).toHaveLength(4);
    expect(new Set(REACTION_EMOJIS).size).toBe(4);
  });

  it("toggling the same emoji twice returns to the original list", () => {
    const start: string[] = [];
    const added = toggleInArray(start, "👍");
    const removed = toggleInArray(added, "👍");
    expect(added).toEqual(["👍"]);
    expect(removed).toEqual([]);
  });

  it("toggling a second emoji keeps the first", () => {
    const afterFirst = toggleInArray([], "👍");
    const afterSecond = toggleInArray(afterFirst, "🔥");
    expect(afterSecond).toEqual(["👍", "🔥"]);
  });
});
```

Add `REACTION_EMOJIS` to the existing import list at the top of `council.test.ts`.

- [ ] **Step 3: Run it to confirm it fails on the import**

Run: `bunx vitest run src/data/council.test.ts`
Expected: FAIL — `REACTION_EMOJIS` is not exported yet from this test's perspective if Step 1 hasn't landed in the same commit; since Step 1 and Step 2 are both in this task, run this AFTER Step 1's edit is in place. If you followed the steps in order, this should already PASS — this step exists to confirm the toggle helper's behavior is correct before wiring it into the real hook in Step 4, not to catch a missing export.

- [ ] **Step 4: Add `toggleReaction` to `useCouncilSessions`**

Find:
```ts
  const addMessages = useCallback(
    (id: string, newMessages: CouncilChatMessage[]) =>
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, messages: [...s.messages, ...newMessages] } : s)),
      ),
    [setSessions],
  );

  const remove = useCallback(
    (id: string) => setSessions((prev) => prev.filter((s) => s.id !== id)),
    [setSessions],
  );

  return { sessions, create, markRead, updatePersonas, addMessages, remove };
```
Replace with:
```ts
  const addMessages = useCallback(
    (id: string, newMessages: CouncilChatMessage[]) =>
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, messages: [...s.messages, ...newMessages] } : s)),
      ),
    [setSessions],
  );

  const toggleReaction = useCallback(
    (sessionId: string, messageId: string, emoji: string) =>
      setSessions((prev) =>
        prev.map((s) =>
          s.id !== sessionId
            ? s
            : {
                ...s,
                messages: s.messages.map((m) => {
                  if (m.id !== messageId) return m;
                  const active = m.reactions ?? [];
                  const next = active.includes(emoji)
                    ? active.filter((e) => e !== emoji)
                    : [...active, emoji];
                  return { ...m, reactions: next };
                }),
              },
        ),
      ),
    [setSessions],
  );

  const remove = useCallback(
    (id: string) => setSessions((prev) => prev.filter((s) => s.id !== id)),
    [setSessions],
  );

  return { sessions, create, markRead, updatePersonas, addMessages, toggleReaction, remove };
```

- [ ] **Step 5: Run tests, typecheck**

Run: `bunx vitest run && bunx tsc --noEmit`
Expected: both clean — `toggleReaction` isn't consumed by any component yet, which is fine (an unused exported hook method is not a type error).

- [ ] **Step 6: Add `ReactionBar` and wire it into `SessionView`**

Add `REACTION_EMOJIS` and `type CouncilPersona` (already added in Task 3) to the `@/data/council` import list — find:
```ts
import {
  buildFollowUpReplies,
  buildOpeningMessages,
  buildUserMessage,
  COUNCIL_PERSONAS,
  FOLLOW_UP_FALLBACK_TEXT,
  getPersona,
  hasLikelyDisagreement,
  pickDefaultTrio,
  QUICK_REPLIES,
  type CouncilChatMessage,
  type CouncilPersona,
  type CouncilSession,
} from "@/data/council";
```
Replace with:
```ts
import {
  buildFollowUpReplies,
  buildOpeningMessages,
  buildUserMessage,
  COUNCIL_PERSONAS,
  FOLLOW_UP_FALLBACK_TEXT,
  getPersona,
  hasLikelyDisagreement,
  pickDefaultTrio,
  QUICK_REPLIES,
  REACTION_EMOJIS,
  type CouncilChatMessage,
  type CouncilPersona,
  type CouncilSession,
} from "@/data/council";
```

Add the `ReactionBar` component right after `ConversationCover` (Task 5) and before `getScrollParent`:

```tsx
function ReactionBar({
  message,
  onToggle,
}: {
  message: CouncilChatMessage;
  onToggle: (emoji: string) => void;
}) {
  const active = message.reactions ?? [];
  return (
    <div
      className={cn(
        "flex items-center gap-1 transition-opacity",
        active.length > 0
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
      )}
    >
      {REACTION_EMOJIS.map((emoji) => {
        const isActive = active.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            aria-pressed={isActive}
            aria-label={`Отреагировать ${emoji}`}
            onClick={() => onToggle(emoji)}
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-xs transition-colors",
              isActive
                ? "border-primary bg-primary/10"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/40",
            )}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
```

Update `SessionView`'s props to accept `onReact`. Find:
```tsx
function SessionView({
  session,
  revealFromStart,
  onFollowUp,
}: {
  session: CouncilSession;
  revealFromStart: boolean;
  onFollowUp: (text: string) => void;
}) {
```
Replace with:
```tsx
function SessionView({
  session,
  revealFromStart,
  onFollowUp,
  onReact,
}: {
  session: CouncilSession;
  revealFromStart: boolean;
  onFollowUp: (text: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}) {
```

Wire it into the persona-message rendering. Find (the block Task 7 Step 3 left behind):
```tsx
                {group.items.map((m) => (
                  <div key={m.id} className="animate-message-pop">
                    <MessageBubble
                      variant="entity"
                      accentClassName={cn(PERSONA_TINT_CLASS, PERSONA_BORDER_CLASS)}
                    >
                      {m.text}
                    </MessageBubble>
                    <p className="mt-1 text-xs text-muted-foreground">{m.time}</p>
                  </div>
                ))}
```
Replace with:
```tsx
                {group.items.map((m) => (
                  <div key={m.id} className="group animate-message-pop">
                    <MessageBubble
                      variant="entity"
                      accentClassName={cn(PERSONA_TINT_CLASS, PERSONA_BORDER_CLASS)}
                    >
                      {m.text}
                    </MessageBubble>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{m.time}</p>
                      <ReactionBar message={m} onToggle={(emoji) => onReact(m.id, emoji)} />
                    </div>
                  </div>
                ))}
```

- [ ] **Step 7: Wire `onReact` from `CouncilPage`**

Find:
```ts
  const { sessions, create, markRead, updatePersonas, addMessages, remove } = useCouncilSessions();
```
Replace with:
```ts
  const { sessions, create, markRead, updatePersonas, addMessages, toggleReaction, remove } =
    useCouncilSessions();
```

Find:
```tsx
          ) : active ? (
            <SessionView
              session={active}
              revealFromStart={active.id === justCreatedId}
              onFollowUp={submitFollowUp}
            />
          ) : (
```
Replace with:
```tsx
          ) : active ? (
            <SessionView
              session={active}
              revealFromStart={active.id === justCreatedId}
              onFollowUp={submitFollowUp}
              onReact={(messageId, emoji) => toggleReaction(active.id, messageId, emoji)}
            />
          ) : (
```

- [ ] **Step 8: Typecheck and full test suite**

Run: `bunx tsc --noEmit && bunx vitest run`
Expected: both clean.

- [ ] **Step 9: Manual verification**

Open a session, hover over a persona message — confirm 4 emoji fade in below it. Click one — confirm it snaps to "always visible" (no longer needs hover) and shows the active (primary-bordered) state; `aria-pressed` should be `true` (check via browser devtools or accessibility tree). Click it again — confirm it deactivates and (if no other reaction is active on that message) fades back to hover-only. Reload the page — confirm the active reaction is still there (persisted through `localStorage`). Confirm the reaction bar never appears under the user's own messages.

- [ ] **Step 10: Commit**

```bash
git add src/data/council.ts src/data/council.test.ts src/hooks/useAppState.ts src/routes/council.tsx
git commit -m "Add persisted emoji reactions on persona messages"
```

---

### Task 9: Final manual verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full regression pass in the browser**

Start the app, and in both light and dark theme:
- Create a new council with `founder` + `industrialist` + `competitor` selected together (the three of the four rebalanced warm personas that can coexist under `MAX_PERSONAS = 3`) — confirm they're visually distinguishable at a glance (not "all orange"), per the spec's whole reason for existing.
- Confirm the opening message cascade still plays with the new pop animation and ring pulse, and finishes cleanly (no stuck typing indicator, no leaked timers — same checks as the live-chat plan's Task 6, since this redesign doesn't touch the timer logic but does touch what's rendered during it).
- Add a couple of reactions, send a follow-up, delete the session — confirm no console errors anywhere in this flow.
- Resize the sidebar, collapse/restore it, use the persona picker to change an active session's composition — confirm nothing visually broke from the color/layout changes in this plan.

- [ ] **Step 2: Full suite one more time**

Run: `bunx tsc --noEmit && bunx vitest run`
Expected: both clean.

- [ ] **Step 3: Check for stray debug artifacts**

Run: `git status --short`
Expected: clean tree (no leftover screenshots or scratch files from manual verification — delete any before finishing, same as the previous plan's cleanup step).
