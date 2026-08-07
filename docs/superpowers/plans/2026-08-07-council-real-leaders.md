# Council Real Leaders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 12 fictional Council personas with approved real-world leaders and display a consistent generated editorial portrait everywhere the Council renders a persona.

**Architecture:** Keep the existing internal persona IDs and chat behavior intact for localStorage compatibility. Extend `CouncilPersona` with a project-local image path, teach the shared avatar to render an image over its existing silhouette fallback, and update the Council route to consume the same persona data in gallery, stacks, pickers, conversation cover, and messages.

**Tech Stack:** TypeScript 5, React 19, TanStack Start/Router, Tailwind CSS 4, Vitest 4, React DOM server rendering, built-in image generation, ImageMagick `magick`, WebP.

## Global Constraints

- This remains a frontend prototype: do not add an LLM, backend, network client, database, or prompt execution.
- Preserve all 12 internal IDs and the `biaqyl:council-sessions:v3` storage key.
- Do not change `buildPersonaTake`, `buildOpeningMessages`, `buildFollowUpReplies`, `BULLISH`, `SKEPTICAL`, message timing, reactions, or case selection.
- Use the exact 12 leaders, names, roles, tags, descriptions, and image paths from `docs/superpowers/specs/2026-08-07-council-real-leaders-design.md`.
- Portraits use the approved B direction: consistent semi-realistic editorial illustration, 4:5 crop, no text, logos, quotes, props, or watermarks.
- Save final project assets as 640×800 WebP under `public/personas/`, each at or below 250 KB.
- Keep the existing `hex` and `darkHex` values unchanged.
- Gallery and active session must explicitly say these are digital models of public approaches, not the real people or their current/private views.
- Image failure must reveal the existing colored silhouette without a broken-image icon or layout shift.
- Do not touch unrelated untracked files `public/1.png`, `public/2.png`, or `Консилиум.md`.

## File Structure

- Modify `src/data/council.ts`: real leader metadata, `image` field, removal of `inspiredBy`, shared disclaimer copy.
- Modify `src/data/council.test.ts`: exact leader/data/image contract tests while retaining behavior and contrast coverage.
- Create `src/components/PersonaAvatar.test.ts`: server-rendered avatar and fallback contract tests without adding a DOM dependency.
- Modify `src/components/PersonaAvatar.tsx`: portrait rendering over the existing silhouette fallback.
- Modify `src/routes/council.tsx`: portrait gallery, portrait propagation to every avatar, disclaimer placement, removal of “в духе”.
- Create 12 WebP files under `public/personas/`: final generated portraits listed in Task 2.

---

### Task 1: Replace persona metadata without changing behavior

**Files:**
- Modify: `src/data/council.test.ts:1-103`
- Modify: `src/data/council.ts:1-146`

**Interfaces:**
- Consumes: existing `CouncilPersona`, `COUNCIL_PERSONAS`, stable IDs, color fields, and behavior functions.
- Produces: `CouncilPersona.image: string`, 12 approved profile records, and `COUNCIL_PERSONA_DISCLAIMER: string` for route rendering.

- [ ] **Step 1: Replace the old reference tests with failing real-leader contract tests**

Add this exact contract near the existing `COUNCIL_PERSONAS` suite while preserving the contrast, behavior, session, reaction, and safety tests below it:

```ts
const EXPECTED_REAL_LEADERS = [
  "Илон Маск",
  "Стив Джобс",
  "Джефф Безос",
  "Дженсен Хуанг",
  "Сатья Наделла",
  "Уоррен Баффет",
  "Рэй Далио",
  "Питер Тиль",
  "Эндрю Ын",
  "Демис Хассабис",
  "Сэм Альтман",
  "Айдын Рахимбаев",
];

const FICTIONAL_NAMES = [
  "Артур Ким",
  "Роза Ниязова",
  "Виктор Тен",
  "Лейла Асанова",
  "Данияр Оспанов",
  "Мила Ержанова",
  "Николь Багрова",
  "Самат Ержигитов",
  "Алина Достаева",
  "Тимур Нурланов",
  "Диана Рахимова",
  "Ержан Тулегенов",
];

it("uses the approved 12 real-world leader profiles", () => {
  expect(COUNCIL_PERSONAS.map((persona) => persona.name)).toEqual(
    expect.arrayContaining(EXPECTED_REAL_LEADERS),
  );
  expect(COUNCIL_PERSONAS.map((persona) => persona.name)).toHaveLength(12);
  for (const name of FICTIONAL_NAMES) {
    expect(COUNCIL_PERSONAS.some((persona) => persona.name === name)).toBe(false);
  }
});

it("gives every leader a unique project-local WebP portrait", () => {
  const images = COUNCIL_PERSONAS.map((persona) => persona.image);
  expect(new Set(images).size).toBe(12);
  for (const image of images) {
    expect(image).toMatch(/^\/personas\/[a-z0-9-]+\.webp$/);
  }
});

it("does not retain the obsolete inspiredBy presentation field", () => {
  for (const persona of COUNCIL_PERSONAS) {
    expect("inspiredBy" in persona).toBe(false);
  }
});
```

Update the old `every persona names a real-world style reference` assertion so it no longer reads `inspiredBy`. Import `COUNCIL_PERSONA_DISCLAIMER` and add:

```ts
it("exposes the approved public-approach disclaimer", () => {
  expect(COUNCIL_PERSONA_DISCLAIMER).toBe(
    "Цифровые модели публично известных подходов. Это не реальные люди и не их текущие или частные мнения.",
  );
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run: `npm test -- src/data/council.test.ts`

Expected: FAIL because `CouncilPersona.image` and `COUNCIL_PERSONA_DISCLAIMER` do not exist, the names are still fictional, and `inspiredBy` is still present.

- [ ] **Step 3: Update the data contract and all 12 records**

Change the interface to:

```ts
export interface CouncilPersona {
  id: string;
  name: string;
  initials: string;
  role: string;
  description: string;
  image: string;
  hex: string;
  darkHex?: string;
  tag: string;
}

export const COUNCIL_PERSONA_DISCLAIMER =
  "Цифровые модели публично известных подходов. Это не реальные люди и не их текущие или частные мнения.";
```

Replace only the presentation fields of the 12 records. Keep their IDs and colors exactly as they are now. Use these exact values:

| id | name | initials | role | tag | image | description |
|---|---|---|---|---|---|---|
| `founder` | Илон Маск | EM | Радикальный инженер и визионер | Первые принципы | `/personas/elon-musk.webp` | Разбирает проблему до базовых фактов, удаляет лишнее и ищет путь к десятикратному улучшению. |
| `product` | Стив Джобс | SJ | Продуктовый редактор | Продукт | `/personas/steve-jobs.webp` | Защищает простоту и цельность опыта, возвращая спор к вопросу: зачем это человеку. |
| `operator` | Джефф Безос | JB | Долгосрочный оператор | Клиент | `/personas/jeff-bezos.webp` | Начинает с клиента и строит масштабируемые механизмы вместо разовых героических усилий. |
| `platform` | Дженсен Хуанг | JH | Архитектор технологических платформ | Полный стек | `/personas/jensen-huang.webp` | Рассматривает AI, вычисления, экосистему и экономику отрасли как единый полный стек. |
| `transform` | Сатья Наделла | SN | Лидер корпоративной трансформации | Трансформация | `/personas/satya-nadella.webp` | Соединяет технологию, культуру, партнёрства и практическую ценность для организации. |
| `industrialist` | Уоррен Баффет | WB | Дисциплинированный инвестор | Ценность | `/personas/warren-buffett.webp` | Проверяет понятность экономики, качество управления, цену ошибки и долгосрочную устойчивость. |
| `resilience` | Рэй Далио | RD | Системный диагност | Принципы | `/personas/ray-dalio.webp` | Превращает решения в явные принципы, причинно-следственные модели и циклы обратной связи. |
| `contrarian` | Питер Тиль | PT | Контрарный стратег | Контрарианец | `/personas/peter-thiel.webp` | Ищет скрытую истину, сильную дифференциацию и путь от нуля к единице. |
| `scale` | Эндрю Ын | AN | Прагматичный AI-лидер | AI-практик | `/personas/andrew-ng.webp` | Переводит бизнес-задачу в выполнимый AI-проект с данными, метриками и короткими итерациями. |
| `engineer` | Демис Хассабис | DH | Научный стратег | Наука | `/personas/demis-hassabis.webp` | Разделяет инженерную задачу и научную неизвестность, требуя точного эксперимента и проверки обобщения. |
| `competitor` | Сэм Альтман | SA | Стратег AI-продуктов | Стартап | `/personas/sam-altman.webp` | Сочетает большую ставку со скоростью обучения, дистрибуцией и ранним реальным использованием. |
| `brand` | Айдын Рахимбаев | AR | Предприниматель и лидер девелопмента | Девелопмент | `/personas/aydin-rakhimbayev.webp` | Оценивает идеи через пользу людям, качество среды, масштаб исполнения и ответственность за результат. |

Do not edit any switch case or set below `getPersona`.

- [ ] **Step 4: Run the targeted test and verify GREEN**

Run: `npm test -- src/data/council.test.ts`

Expected: all Council data and behavior tests PASS.

- [ ] **Step 5: Commit the metadata contract**

```bash
git add src/data/council.ts src/data/council.test.ts
git commit -m "feat: replace council personas with real leaders"
```

---

### Task 2: Generate and optimize the 12 portrait assets

**Files:**
- Create: `public/personas/elon-musk.webp`
- Create: `public/personas/steve-jobs.webp`
- Create: `public/personas/jeff-bezos.webp`
- Create: `public/personas/jensen-huang.webp`
- Create: `public/personas/satya-nadella.webp`
- Create: `public/personas/warren-buffett.webp`
- Create: `public/personas/ray-dalio.webp`
- Create: `public/personas/peter-thiel.webp`
- Create: `public/personas/andrew-ng.webp`
- Create: `public/personas/demis-hassabis.webp`
- Create: `public/personas/sam-altman.webp`
- Create: `public/personas/aydin-rakhimbayev.webp`

**Interfaces:**
- Consumes: the exact `image` paths and unchanged persona `hex` values from Task 1.
- Produces: 12 optimized 640×800 WebP assets used by the avatar and gallery tasks.

- [ ] **Step 1: Generate one source portrait per leader with the built-in image generator**

Create the fixed staging directory first:

```bash
mkdir -p tmp/council-portraits
```

Issue one built-in generation call per row below. For every call use this exact shared prompt, followed by the row’s exact `Subject clause` and `Accent clause`:

```text
Use case: stylized-concept
Asset type: portrait for a premium enterprise AI council persona card
Primary request: Create a recognizable, respectful editorial portrait of the named public leader as a refined semi-realistic digital illustration.
Scene/backdrop: clean neutral studio backdrop with one restrained color accent; no environmental objects.
Style/medium: premium magazine editorial illustration, realistic proportions and natural skin texture, subtle painterly finish, not a photograph and not a caricature.
Composition/framing: head and shoulders, centered face, calm direct or slight three-quarter gaze, generous safe area around hair and shoulders, designed for both a 4:5 card crop and a circular avatar crop.
Lighting/mood: soft directional studio light, thoughtful, authoritative, modern, understated.
Constraints: one person only; preserve recognizable facial identity; no text, logos, quotes, watermark, sci-fi props, branded objects, exaggerated expression, or parody.
```

| Output slug | Subject clause | Accent clause |
|---|---|---|
| `elon-musk` | `Subject: Elon Musk.` | `Color accent: restrained amber #a75d00.` |
| `steve-jobs` | `Subject: Steve Jobs.` | `Color accent: restrained magenta #c026d3.` |
| `jeff-bezos` | `Subject: Jeff Bezos.` | `Color accent: restrained violet #7c3aed.` |
| `jensen-huang` | `Subject: Jensen Huang.` | `Color accent: restrained indigo #4f46e5.` |
| `satya-nadella` | `Subject: Satya Nadella.` | `Color accent: restrained warm gray #57534e.` |
| `warren-buffett` | `Subject: Warren Buffett.` | `Color accent: restrained orange #c34700.` |
| `ray-dalio` | `Subject: Ray Dalio.` | `Color accent: restrained cyan #0e7490.` |
| `peter-thiel` | `Subject: Peter Thiel.` | `Color accent: restrained teal #0f766e.` |
| `andrew-ng` | `Subject: Andrew Ng.` | `Color accent: restrained green #047857.` |
| `demis-hassabis` | `Subject: Demis Hassabis.` | `Color accent: restrained blue #2563eb.` |
| `sam-altman` | `Subject: Sam Altman.` | `Color accent: restrained red #ce3452.` |
| `aydin-rakhimbayev` | `Subject: Aydin Rakhimbayev.` | `Color accent: restrained rose #c13892.` |

After every call, copy the returned generated PNG to its exact staging path: `tmp/council-portraits/elon-musk.png`, `tmp/council-portraits/steve-jobs.png`, `tmp/council-portraits/jeff-bezos.png`, `tmp/council-portraits/jensen-huang.png`, `tmp/council-portraits/satya-nadella.png`, `tmp/council-portraits/warren-buffett.png`, `tmp/council-portraits/ray-dalio.png`, `tmp/council-portraits/peter-thiel.png`, `tmp/council-portraits/andrew-ng.png`, `tmp/council-portraits/demis-hassabis.png`, `tmp/council-portraits/sam-altman.png`, or `tmp/council-portraits/aydin-rakhimbayev.png`, matching the row. Keep the original generated file in place. Do not overwrite or remove the existing small legacy PNG placeholders; the new data no longer references them.

- [ ] **Step 2: Inspect every source before conversion**

Use the local image viewer on each generated PNG. Reject and regenerate any portrait that fails identity recognition, contains text/logo/watermark, clips the head, uses a different visual style, adds a second person, or cannot survive a centered circular crop.

- [ ] **Step 3: Convert each accepted source to the exact project asset**

Run this exact loop over the accepted, inspected staging files:

```bash
for slug in elon-musk steve-jobs jeff-bezos jensen-huang satya-nadella warren-buffett ray-dalio peter-thiel andrew-ng demis-hassabis sam-altman aydin-rakhimbayev; do
  magick "tmp/council-portraits/$slug.png" -auto-orient -resize '640x800^' -gravity center -extent 640x800 -strip -quality 82 "public/personas/$slug.webp"
done
```

- [ ] **Step 4: Verify dimensions, format, and file-size budget**

Run:

```bash
identify -format '%f %m %wx%h %b\n' public/personas/{elon-musk,steve-jobs,jeff-bezos,jensen-huang,satya-nadella,warren-buffett,ray-dalio,peter-thiel,andrew-ng,demis-hassabis,sam-altman,aydin-rakhimbayev}.webp
```

Expected for all 12: format `WEBP`, dimensions `640x800`, and size at or below 250 KB. If a file exceeds 250 KB, rerun its conversion at quality 76 and verify again.

- [ ] **Step 5: Build and inspect a contact sheet**

Run:

```bash
magick montage public/personas/{elon-musk,steve-jobs,jeff-bezos,jensen-huang,satya-nadella,warren-buffett,ray-dalio,peter-thiel,andrew-ng,demis-hassabis,sam-altman,aydin-rakhimbayev}.webp -thumbnail 240x300 -tile 4x3 -geometry +12+12 /tmp/council-real-leaders-contact-sheet.webp
```

Open `/tmp/council-real-leaders-contact-sheet.webp` with the local image viewer. Verify consistent crop, scale, lighting, backdrop treatment, and individual recognizability before committing.

- [ ] **Step 6: Commit the generated portrait set**

```bash
git add public/personas/*.webp
git commit -m "feat: add editorial portraits for council leaders"
```

---

### Task 3: Add image and fallback support to the shared avatar

**Files:**
- Create: `src/components/PersonaAvatar.test.ts`
- Modify: `src/components/PersonaAvatar.tsx:1-65`

**Interfaces:**
- Consumes: `src?: string`, `alt?: string`, existing `initials`, size, ring, class, and style props.
- Produces: `PersonaAvatar` that renders a project image above a stable `data-avatar-fallback="true"` silhouette and fades only the broken image on load error.

- [ ] **Step 1: Write the failing server-render tests**

Create `src/components/PersonaAvatar.test.ts`:

```ts
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PersonaAvatar } from "./PersonaAvatar";

describe("PersonaAvatar", () => {
  it("renders a portrait and a stable silhouette fallback", () => {
    const html = renderToStaticMarkup(
      createElement(PersonaAvatar, {
        initials: "EM",
        src: "/personas/elon-musk.webp",
        alt: "Илон Маск",
      }),
    );

    expect(html).toContain('src="/personas/elon-musk.webp"');
    expect(html).toContain('alt="Илон Маск"');
    expect(html).toContain('data-avatar-fallback="true"');
  });

  it("keeps an accessible name when no portrait is supplied", () => {
    const html = renderToStaticMarkup(
      createElement(PersonaAvatar, { initials: "EM", alt: "Илон Маск" }),
    );

    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Илон Маск"');
    expect(html).not.toContain("<img");
  });
});
```

- [ ] **Step 2: Run the avatar test and verify RED**

Run: `npm test -- src/components/PersonaAvatar.test.ts`

Expected: FAIL because `PersonaAvatarProps` does not accept `src`/`alt` and the rendered component has no `<img>` or fallback marker.

- [ ] **Step 3: Implement the minimal portrait layer**

Extend `PersonaAvatarProps`:

```ts
src?: string;
alt?: string;
```

Update the avatar container to include `relative overflow-hidden`, preserve every existing size/ring/class/style behavior, and render this content:

```tsx
<span data-avatar-fallback="true" className="absolute inset-0 grid place-items-center" aria-hidden>
  <PersonaSilhouette />
</span>
{src ? (
  <img
    src={src}
    alt={alt ?? initials}
    className="absolute inset-0 h-full w-full object-cover transition-opacity"
    onError={(event) => {
      event.currentTarget.style.opacity = "0";
    }}
  />
) : null}
```

When `src` is absent, set `role="img"` and `aria-label={alt ?? initials}` on the outer span. When `src` exists, leave naming to the `<img alt>` to avoid duplicate accessible image labels. Replace the old fictional-person guardrail comment above `PersonaSilhouette` with a concise description that it is the image-failure fallback.

- [ ] **Step 4: Run the avatar test and verify GREEN**

Run: `npm test -- src/components/PersonaAvatar.test.ts`

Expected: 2 tests PASS.

- [ ] **Step 5: Run all unit tests**

Run: `npm test`

Expected: all existing and new tests PASS.

- [ ] **Step 6: Commit the reusable avatar**

```bash
git add src/components/PersonaAvatar.tsx src/components/PersonaAvatar.test.ts
git commit -m "feat: render council portrait avatars"
```

---

### Task 4: Render portraits and disclosures throughout the Council UI

**Files:**
- Modify: `src/routes/council.tsx:19,98-125,147-175,230-310,348-370,610-640,770-820,1090-1110`

**Interfaces:**
- Consumes: `CouncilPersona.image`, `COUNCIL_PERSONA_DISCLAIMER`, and the `PersonaAvatar src/alt` API from Tasks 1 and 3.
- Produces: image-backed gallery, stacks, picker rows, conversation cover, message avatars, and explicit digital-model disclosures.

- [ ] **Step 1: Update imports and every shared-avatar call site**

Keep both `PersonaAvatar` and `PersonaSilhouette` imported from `@/components/PersonaAvatar`, and add `COUNCIL_PERSONA_DISCLAIMER` to the existing import from `@/data/council`.

For every `PersonaAvatar` call where `p` is the resolved persona, add:

```tsx
src={p.image}
alt={p.name}
```

This applies to `AvatarStack`, `PersonaPicker`, grouped persona messages, typing/reveal avatars, and the active participant list. Do not pass images to the user’s own avatar because it is not a `CouncilPersona`.

- [ ] **Step 2: Replace the gallery silhouette block with the portrait**

Replace the left-side `PersonaSilhouette` block in `GalleryCard` with:

```tsx
<span className="relative w-1/3 shrink-0 overflow-hidden bg-muted ring-1 ring-inset ring-black/10 dark:ring-white/10">
  <span
    className="absolute inset-0 grid place-items-center text-white/90"
    style={{ backgroundColor: persona.hex }}
    aria-hidden
  >
    <PersonaSilhouette className="h-10 w-10" />
  </span>
  <img
    src={persona.image}
    alt={persona.name}
    className={cn(
      "absolute inset-0 h-full w-full object-cover transition-[filter,opacity,transform] duration-200 group-hover:scale-[1.03]",
      !selected && "grayscale-[.35] saturate-[.7]",
    )}
    onError={(event) => {
      event.currentTarget.style.opacity = "0";
    }}
  />
</span>
```

Keep the image container at the existing one-third width so the grid and responsive card density remain unchanged.

- [ ] **Step 3: Show role, remove “в духе”, and add the gallery disclosure**

Within the gallery card’s copy, render the existing tag and this role line:

```tsx
<span className="text-[10px] leading-tight text-muted-foreground">{persona.role}</span>
```

Delete the line that renders `в духе {persona.inspiredBy}`.

Immediately after the “Соберите консилиум” heading row, render:

```tsx
<p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
  {COUNCIL_PERSONA_DISCLAIMER}
</p>
```

Keep the selection counter and status/live-region behavior below it.

- [ ] **Step 4: Add the active-session disclosure**

In `ConversationCover`, immediately below the participant-count line, render:

```tsx
<p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
  AI-модели публичных подходов. Не являются реальными людьми и не выражают их частные взгляды.
</p>
```

Keep the existing `HelpHint` elsewhere unchanged; this text must remain visible without hover.

- [ ] **Step 5: Format and run focused verification**

Run:

```bash
npx prettier --write src/data/council.ts src/data/council.test.ts src/components/PersonaAvatar.tsx src/components/PersonaAvatar.test.ts src/routes/council.tsx
npx prettier --check src/data/council.ts src/data/council.test.ts src/components/PersonaAvatar.tsx src/components/PersonaAvatar.test.ts src/routes/council.tsx
npx eslint src/data/council.ts src/data/council.test.ts src/components/PersonaAvatar.tsx src/components/PersonaAvatar.test.ts src/routes/council.tsx
npx tsc --noEmit
npm test
```

Expected: Prettier, focused ESLint, TypeScript, and all tests PASS. If focused ESLint exposes a pre-existing warning in a touched file, fix it only when the correction is local and behavior-preserving; do not expand into repository-wide lint cleanup.

- [ ] **Step 6: Commit the Council UI integration**

```bash
git add src/routes/council.tsx
git commit -m "feat: show real leaders across council UI"
```

---

### Task 5: Production and visual acceptance verification

**Files:**
- Verify only; no planned source changes.

**Interfaces:**
- Consumes: the complete implementation from Tasks 1–4.
- Produces: fresh automated and visual evidence that the approved design works across themes, breakpoints, saved sessions, and image failure.

- [ ] **Step 1: Run the complete automated verification suite**

Run:

```bash
npm test
npx tsc --noEmit
npm run build
npm run lint
```

Expected: tests, typecheck, and production build exit 0. Repository-wide lint is known to start from 59 errors and 9 warnings; report the fresh count exactly and verify that focused ESLint from Task 4 is clean.

- [ ] **Step 2: Start the frontend and inspect the gallery**

Run: `npm run dev`

Verify at `/council` in light and dark themes:

- all 12 exact names and portraits render;
- cards retain the 1/2/3/4-column responsive grid at mobile/tablet/desktop widths;
- each portrait survives the one-third card crop without clipping the face;
- tag, role, and one-sentence description remain readable;
- the full digital-model disclaimer is visible without hover;
- selecting a fourth participant still shows the existing capacity message.

- [ ] **Step 3: Inspect active and saved sessions**

Create a session with three leaders and verify:

- portrait stack, cover, messages, participant picker, and session rows use the matching person images;
- the active-session disclosure is visible;
- unchanged chat behavior still generates opening and follow-up messages;
- existing seeded and localStorage sessions open because the internal IDs did not change.

- [ ] **Step 4: Verify the image-failure fallback**

In browser developer tools, block one `/personas/*.webp` request and reload. Verify that the avatar and gallery card show the existing colored silhouette, do not show a broken-image icon, retain the same dimensions, and keep the participant name accessible.

- [ ] **Step 5: Record final evidence and status**

Run `git status --short` and `git log -5 --oneline`. Confirm that only the planned commits and the user’s pre-existing untracked files remain. Report exact test counts, build status, focused lint status, repository-wide lint baseline, and the 12 final asset paths.
