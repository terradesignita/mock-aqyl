# Общие компоненты чата + редизайн Консилиума — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Вынести `PersonaAvatar`/`MessageBubble` в `src/components/` как реальный переиспользуемый слой и пересадить на них Консилиум + три существующие чат-фичи (`ChatPanel`, `NotebookChat`, `AdvisorFlow`) + `Header`.

**Architecture:** Два новых презентационных компонента без собственного состояния/логики — только форма и стили, цвет/контент передаются пропами. Существующая логика каждой фичи (стейт, обработчики, спец-функции вроде `buildAnswer`) не трогается — меняется только то, что рендерит тело сообщения/аватар.

**Tech Stack:** React 19 + TS + Tailwind v4, `cn()` (`clsx` + `tailwind-merge`, поэтому поздние классы в `className`-пропах корректно перебивают более ранние).

## Global Constraints

- Никакой новой логики — `PersonaAvatar`/`MessageBubble` не содержат стейта, только пропы → разметка.
- Канонический стиль пузыря пользователя: обводка `border-primary/30 bg-primary/6`, хвостик `rounded-tr-sm` (как в `AdvisorFlow`/текущем Консилиуме) — **не** сплошная заливка `bg-primary`, которая сейчас в `ChatPanel`/`NotebookChat`.
- Не мигрируем на shadcn/ui-примитивы (`ui/card.tsx`, `ui/badge.tsx`, `ui/avatar.tsx` и т.д.) — они и дальше не используются, новые компоненты пишутся в стиле проекта.
- В репозитории нет UI-тест-раннера (нет React Testing Library/jsdom) — эти два компонента и все 5 ретрофитов проверяются `tsc`/`eslint` + вручную в браузере (скриншот до/после), не юнит-тестами.

---

### Task 1: Компонент `PersonaAvatar`

**Files:**
- Create: `src/components/PersonaAvatar.tsx`

**Interfaces:**
- Produces: `export interface PersonaAvatarProps { initials: string; size?: "xs" | "sm" | "md" | "lg"; ring?: boolean; className?: string }` и `export function PersonaAvatar(props: PersonaAvatarProps): JSX.Element`. Размеры: `xs` → `h-6 w-6`, `sm` → `h-7 w-7`, `md` → `h-9 w-9` (дефолт), `lg` → `h-14 w-14`.

- [ ] **Step 1: Написать компонент**

```tsx
// src/components/PersonaAvatar.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  xs: "h-6 w-6 text-[11px]",
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-sm",
} as const;

export interface PersonaAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials: string;
  size?: keyof typeof SIZE_CLASS;
  /** border-2 border-card — для стека перекрывающихся аватаров. */
  ring?: boolean;
}

export function PersonaAvatar({
  initials,
  size = "md",
  ring,
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
        className,
      )}
    >
      {initials}
    </span>
  );
}
```

Расширение `HTMLAttributes<HTMLSpanElement>` нужно сразу — `AvatarStack` (Task 3) передаёт `aria-hidden`, а `EmptyState` (Task 3) передаёт `style` для z-index стека.

- [ ] **Step 2: Проверить типы**

Run: `npx tsc --noEmit`
Expected: без ошибок (компонент пока нигде не используется).

- [ ] **Step 3: Commit**

```bash
git add src/components/PersonaAvatar.tsx
git commit -m "Добавить общий компонент PersonaAvatar"
```

---

### Task 2: Компонент `MessageBubble`

**Files:**
- Create: `src/components/MessageBubble.tsx`

**Interfaces:**
- Produces: `export interface MessageBubbleProps { variant: "user" | "entity"; avatar?: ReactNode; title?: ReactNode; accentClassName?: string; bubbleClassName?: string; bodyClassName?: string; footer?: ReactNode; className?: string; children: ReactNode }` и `export function MessageBubble(props: MessageBubbleProps): JSX.Element`.

- [ ] **Step 1: Написать компонент**

```tsx
// src/components/MessageBubble.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  variant: "user" | "entity";
  /** Только entity — аватар слева. */
  avatar?: ReactNode;
  /** Только entity — строка имени/роли над текстом. */
  title?: ReactNode;
  /** Только entity — например "border-l-4 border-l-emerald-700". */
  accentClassName?: string;
  /** Переопределяет фон/паддинг самой карточки (мёржится через cn/tailwind-merge). */
  bubbleClassName?: string;
  /** Переопределяет типографику текста тела (leading, whitespace и т.д.). */
  bodyClassName?: string;
  /** Цитаты/действия — остаются целиком на стороне вызывающей фичи. */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function MessageBubble({
  variant,
  avatar,
  title,
  accentClassName,
  bubbleClassName,
  bodyClassName,
  footer,
  className,
  children,
}: MessageBubbleProps) {
  if (variant === "user") {
    return (
      <div
        className={cn(
          "rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/6 px-3 py-2 text-sm text-card-foreground",
          bubbleClassName,
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3", className)}>
      {avatar}
      <div
        className={cn(
          "min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-card p-3",
          accentClassName,
          bubbleClassName,
        )}
      >
        {title && <p className="text-xs font-bold text-card-foreground">{title}</p>}
        <div
          className={cn(
            "text-sm leading-relaxed text-card-foreground",
            title && "mt-1",
            bodyClassName,
          )}
        >
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Проверить типы**

Run: `npx tsc --noEmit`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add src/components/MessageBubble.tsx
git commit -m "Добавить общий компонент MessageBubble"
```

---

### Task 3: Консилиум — `PersonaAvatar` во всех местах с аватарами

**Files:**
- Modify: `src/routes/council.tsx`

**Interfaces:**
- Consumes: `PersonaAvatar` (Task 1).
- Produces: визуально идентичный (по размерам/цветам) результат — только источник разметки меняется.

Заменить каждый инстанс кружка-инициалов на `PersonaAvatar` с эквивалентными пропами:

- [ ] **Step 1: Импорт**

В `src/routes/council.tsx` добавить импорт:
```tsx
import { PersonaAvatar } from "@/components/PersonaAvatar";
```

- [ ] **Step 2: `AvatarStack`**

Заменить:
```tsx
<span
  key={id}
  aria-hidden
  className={cn(
    "grid h-6 w-6 place-items-center rounded-full border-2 border-card text-xs font-bold text-white",
    p.color,
  )}
>
  {p.initials}
</span>
```
на:
```tsx
<PersonaAvatar
  key={id}
  aria-hidden
  initials={p.initials}
  size="xs"
  ring
  className={p.color}
/>
```
(`aria-hidden` доходит до нативного `<span>` через `...rest` — `PersonaAvatarProps` уже расширяет `HTMLAttributes<HTMLSpanElement>` с Task 1.)

Теперь `+N`-бейдж рядом (`bg-secondary text-muted-foreground`) — оставить как есть, это не персона, а счётчик, `PersonaAvatar` не подходит по семантике (нет `initials` одной персоны).

- [ ] **Step 3: `EmptyState` hero**

Заменить:
```tsx
<span
  key={id}
  style={{ zIndex: heroIds.length - i }}
  className={cn(
    "grid h-14 w-14 place-items-center rounded-full border-4 border-background text-sm font-bold text-white",
    p.color,
  )}
>
  {p.initials}
</span>
```
на:
```tsx
<PersonaAvatar
  key={id}
  initials={p.initials}
  size="lg"
  style={{ zIndex: heroIds.length - i }}
  className={cn(p.color, "border-4 border-background")}
/>
```

- [ ] **Step 4: `PersonaPicker` строки списка**

Заменить:
```tsx
<span
  className={cn(
    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
    p.color,
  )}
>
  {p.initials}
</span>
```
на:
```tsx
<PersonaAvatar initials={p.initials} size="md" className={p.color} />
```
(два места — внутри `PersonaPicker`, строка ~276 по текущему файлу).

- [ ] **Step 5: `SessionView` аватар у реплики персоны**

Заменить (внутри маппинга `session.personaIds`):
```tsx
<span
  className={cn(
    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
    p.color,
  )}
>
  {p.initials}
</span>
```
на:
```tsx
<PersonaAvatar initials={p.initials} size="md" className={p.color} />
```
(этот инстанс дальше в Task 4 переедет внутрь `MessageBubble avatar={...}` — здесь просто фиксируем `PersonaAvatar` как содержимое пропа).

- [ ] **Step 6: Сайдбар — чипы текущего состава + `NewCouncilPanel`**

В `CouncilPage`'s блоке «Совет» в aside заменить:
```tsx
<span
  key={id}
  className={cn(
    "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white",
    p.color,
  )}
>
  {p.initials}
</span>
```
на:
```tsx
<PersonaAvatar key={id} initials={p.initials} size="sm" className={p.color} />
```

В `NewCouncilPanel` чипы `{p.initials} {p.name.split(" ")[0]}` внутри `<span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white" ...>` — **не трогать**: это не круглый аватар, а горизонтальная пилюля с именем внутри, другая форма, `PersonaAvatar` сюда не подходит по семантике.

- [ ] **Step 7: Проверить типы и линт**

Run: `npx tsc --noEmit && npx eslint src/routes/council.tsx src/components/PersonaAvatar.tsx`
Expected: без ошибок.

- [ ] **Step 8: Commit**

```bash
git add src/routes/council.tsx src/components/PersonaAvatar.tsx
git commit -m "Консилиум: перевести все аватары персон на PersonaAvatar"
```

---

### Task 4: Консилиум — `MessageBubble` для реплик + pill-чипы в вердикте

**Files:**
- Modify: `src/routes/council.tsx`

**Interfaces:**
- Consumes: `MessageBubble` (Task 2), `PersonaAvatar` (Task 1/3).
- Produces: визуально то же самое, что сейчас (акцент по цвету персоны, анимация появления), плюс «Открытые вопросы» становятся круглыми pill-кнопками вместо прямоугольных строк.

- [ ] **Step 1: Импорт**

Добавить: `import { MessageBubble } from "@/components/MessageBubble";`
Удалить (больше не нужна, если нигде больше в файле не используется после этой задачи): `PERSONA_BORDER_CLASS` **остаётся** — она нужна для `accentClassName`, просто теперь передаётся в `MessageBubble`, а не собирается вручную в `cn()`.

- [ ] **Step 2: `SessionView` — реплики персон**

Заменить блок (внутри `.map` по `session.personaIds`):
```tsx
<div
  key={id}
  style={{ animationDelay: `${Math.min(i, 9) * 80}ms` }}
  className="flex animate-in gap-3 fade-in slide-in-from-bottom-2 duration-300"
>
  <PersonaAvatar initials={p.initials} size="md" className={p.color} />
  <div
    className={cn(
      "min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border border-l-4 bg-card p-3",
      PERSONA_BORDER_CLASS[p.color],
    )}
  >
    <p className="text-xs font-bold text-card-foreground">
      {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
    </p>
    <p className="mt-1 text-sm leading-relaxed text-card-foreground">
      {buildPersonaTake(id, session.topic)}
    </p>
  </div>
</div>
```
на:
```tsx
<div
  key={id}
  style={{ animationDelay: `${Math.min(i, 9) * 80}ms` }}
  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
>
  <MessageBubble
    variant="entity"
    avatar={<PersonaAvatar initials={p.initials} size="md" className={p.color} />}
    title={
      <>
        {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
      </>
    }
    accentClassName={cn("border-l-4", PERSONA_BORDER_CLASS[p.color])}
  >
    {buildPersonaTake(id, session.topic)}
  </MessageBubble>
</div>
```

- [ ] **Step 3: `SessionView` — follow-up пользователя**

Заменить:
```tsx
{session.followUps.map((text, i) => (
  <div
    key={i}
    className="ml-12 animate-in rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/6 p-3 text-sm text-card-foreground fade-in slide-in-from-bottom-2 duration-300"
  >
    {text}
  </div>
))}
```
на:
```tsx
{session.followUps.map((text, i) => (
  <div key={i} className="ml-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <MessageBubble variant="user" bubbleClassName="p-3">
      {text}
    </MessageBubble>
  </div>
))}
```

- [ ] **Step 4: `VerdictPanel` — «Открытые вопросы» на pill-чипы**

Заменить:
```tsx
<ul className="space-y-1.5">
  {verdict.openQuestions.map((question, i) => (
    <li key={i}>
      <button
        type="button"
        onClick={() => onAsk(question)}
        className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-left text-xs text-card-foreground transition-[color,border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8 hover:text-primary"
      >
        {question}
      </button>
    </li>
  ))}
</ul>
```
на:
```tsx
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
```
(меняется контейнер `<ul className="space-y-1.5">` → `<div className="flex flex-wrap gap-1.5">`, `<li><button className="w-full ... rounded-lg ...">` → плоский `<button className="rounded-full ...">` без обёртки `<li>`).

- [ ] **Step 5: Проверить типы, линт, тесты**

Run: `npx tsc --noEmit && npx eslint src/routes/council.tsx && npx vitest run`
Expected: всё чисто, 15/15 тестов (эта задача не трогает `council.ts`/`council.test.ts`).

- [ ] **Step 6: Ручная проверка в браузере**

`npm run dev` → открыть `/council`, открыть сессию: реплики персон визуально идентичны прошлой версии (цветной левый акцент, анимация появления), «Открытые вопросы» теперь круглые пилюли. Проверить светлую и тёмную тему.

- [ ] **Step 7: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Консилиум: перевести реплики на MessageBubble, открытые вопросы — на pill-чипы"
```

---

### Task 5: Ретрофит `ChatPanel.tsx`

**Files:**
- Modify: `src/components/ChatPanel.tsx`

**Interfaces:**
- Consumes: `MessageBubble` (Task 2).
- Produces: тот же props-интерфейс `ChatPanelProps`, та же логика (`buildAnswer`, стейт, drawer). Меняется только рендер сообщений — user-пузырь визуально меняется с сплошной заливки на обводку (см. Global Constraints).

- [ ] **Step 1: Импорт**

Добавить: `import { MessageBubble } from "@/components/MessageBubble";`

- [ ] **Step 2: Заменить рендер сообщений**

Заменить (текущие строки 100-120):
```tsx
{messages.map((m, i) => (
  <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
    {m.role === "user" ? (
      <p className="max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
        {m.text}
      </p>
    ) : (
      <div className="text-sm leading-relaxed text-card-foreground">
        <p className="whitespace-pre-line">{m.text}</p>
        {m.citations && (
          <ul className="mt-2 space-y-1">
            {m.citations.map((c) => (
              <li key={c} className="text-xs text-muted-foreground opacity-80">
                — {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </div>
))}
```
на:
```tsx
{messages.map((m, i) => (
  <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
    {m.role === "user" ? (
      <MessageBubble variant="user" className="max-w-[85%]">
        {m.text}
      </MessageBubble>
    ) : (
      <MessageBubble
        variant="entity"
        bubbleClassName="border-none bg-transparent p-0"
        bodyClassName="whitespace-pre-line"
        footer={
          m.citations && (
            <ul className="mt-2 space-y-1">
              {m.citations.map((c) => (
                <li key={c} className="text-xs text-muted-foreground opacity-80">
                  — {c}
                </li>
              ))}
            </ul>
          )
        }
      >
        {m.text}
      </MessageBubble>
    )}
  </div>
))}
```
(`bubbleClassName="border-none bg-transparent p-0"` убирает card-обводку `entity`-варианта — ChatPanel исходно рендерил ассистента как голый текст без карточки; так сохраняем этот вид один-в-один, используя `MessageBubble` только ради структуры footer/body, а не ради визуала карточки).

- [ ] **Step 3: Проверить типы и линт**

Run: `npx tsc --noEmit && npx eslint src/components/ChatPanel.tsx`
Expected: без ошибок.

- [ ] **Step 4: Ручная проверка**

`npm run dev` → открыть любую карточку кейса, открыть чат (кнопка вопроса), задать вопрос. Ассистентский ответ выглядит как раньше (без карточки), user-пузырь теперь с обводкой вместо сплошной заливки — ожидаемое, согласованное изменение.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatPanel.tsx
git commit -m "Ретрофит ChatPanel на MessageBubble"
```

---

### Task 6: Ретрофит `NotebookChat.tsx`

**Files:**
- Modify: `src/components/notebook/NotebookChat.tsx`

**Interfaces:**
- Consumes: `MessageBubble` (Task 2).
- Produces: тот же `Props`-интерфейс, вся логика (footnotes, speech-to-text, фидбек, saved-note, suggested pills) не меняется. User-пузырь меняется с `bg-primary` на канон `border-primary/30 bg-primary/6`.

- [ ] **Step 1: Импорт**

Добавить: `import { MessageBubble } from "@/components/MessageBubble";`

- [ ] **Step 2: Заменить user-пузырь**

Заменить (текущие строки 324-331):
```tsx
<div key={m.id} className="flex justify-end">
  <div className="max-w-[80%]">
    <p className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
      {m.text}
    </p>
    <p className="mt-1 text-right text-xs text-muted-foreground">{m.time}</p>
  </div>
</div>
```
на:
```tsx
<div key={m.id} className="flex justify-end">
  <div className="max-w-[80%]">
    <MessageBubble variant="user" bubbleClassName="px-4 py-2.5 font-medium">
      {m.text}
    </MessageBubble>
    <p className="mt-1 text-right text-xs text-muted-foreground">{m.time}</p>
  </div>
</div>
```

- [ ] **Step 3: Заменить assistant-карточку**

Заменить открывающий/закрывающий контейнер (текущие строки 333 и 431 — сама структура цитат/action-бара/report-панели внутри остаётся как есть, меняется только внешний `<div className="rounded-2xl border border-border bg-card p-5">` → `<MessageBubble variant="entity" bubbleClassName="p-5" bodyClassName="leading-7 whitespace-pre-line" footer={...}>`):

Было:
```tsx
<div key={m.id} className="rounded-2xl border border-border bg-card p-5">
  <p className="whitespace-pre-line text-sm leading-7 text-card-foreground">
    {renderWithFootnotes(m.text, m.citations ?? [])}
  </p>

  {m.citations && m.citations.length > 0 && (
    <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
      {/* ...цитаты... */}
    </ul>
  )}

  <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-2.5 text-muted-foreground">
    {/* ...action-бар... */}
  </div>

  {reportFor === m.id && (
    <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3">
      {/* ...report-панель... */}
    </div>
  )}
</div>
```

Стало:
```tsx
<MessageBubble
  key={m.id}
  variant="entity"
  bubbleClassName="p-5"
  bodyClassName="leading-7 whitespace-pre-line"
  footer={
    <>
      {m.citations && m.citations.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
          {/* ...цитаты, без изменений... */}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-2.5 text-muted-foreground">
        {/* ...action-бар, без изменений... */}
      </div>

      {reportFor === m.id && (
        <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3">
          {/* ...report-панель, без изменений... */}
        </div>
      )}
    </>
  }
>
  {renderWithFootnotes(m.text, m.citations ?? [])}
</MessageBubble>
```

Внутреннее содержимое цитат/action-бара/report-панели (все `onClick`-обработчики, `m.feedback`, `copiedId`, `reportFor` и т.д.) копируется без изменений — переносится из тела `<div>` в JSX-значение пропа `footer`.

- [ ] **Step 4: Проверить типы и линт**

Run: `npx tsc --noEmit && npx eslint src/components/notebook/NotebookChat.tsx`
Expected: без ошибок.

- [ ] **Step 5: Ручная проверка**

`npm run dev` → открыть Notebook-чат по любой карточке, задать вопрос с цитируемым ответом. Карточка ответа, цитаты, action-бар (лайк/дизлайк/копировать/в заметки/пожаловаться), report-панель — всё работает как раньше. User-пузырь — новый канонический вид (обводка).

- [ ] **Step 6: Commit**

```bash
git add src/components/notebook/NotebookChat.tsx
git commit -m "Ретрофит NotebookChat на MessageBubble"
```

---

### Task 7: Ретрофит `AdvisorFlow.tsx`

**Files:**
- Modify: `src/components/advisor/AdvisorFlow.tsx`

**Interfaces:**
- Consumes: `MessageBubble` (Task 2), `PersonaAvatar` (Task 1).
- Produces: тот же `Props`-интерфейс, вся логика (`thread`, `askFollowUp`, стадии) не меняется.

**Внимание:** этот файл активно дорабатывается (AI-советник, ТЗ v1.0). Перед началом — заново прочитать актуальный блок реплик (искать `thread.map` в файле), т.к. точные номера строк могли снова сместиться с момента написания этого плана.

- [ ] **Step 1: Импорт**

Добавить: `import { MessageBubble } from "@/components/MessageBubble";` и `import { PersonaAvatar } from "@/components/PersonaAvatar";`

- [ ] **Step 2: Заменить блок реплик**

Найти блок (по паттерну `thread.map((m, i) =>`):
```tsx
{thread.map((m, i) =>
  m.author === "user" ? (
    <div
      key={i}
      className="ml-8 rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/6 px-3 py-2 text-sm text-card-foreground"
    >
      {m.text}
    </div>
  ) : (
    <div key={i} className="flex gap-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/12">
        <Sparkle className="h-3.5 w-3.5 text-primary" />
      </span>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-secondary/40 px-3 py-2 text-sm leading-relaxed text-card-foreground">
        {m.text}
      </div>
    </div>
  ),
)}
```
заменить на:
```tsx
{thread.map((m, i) =>
  m.author === "user" ? (
    <MessageBubble key={i} variant="user" className="ml-8" bubbleClassName="px-3 py-2">
      {m.text}
    </MessageBubble>
  ) : (
    <MessageBubble
      key={i}
      variant="entity"
      avatar={
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/12">
          <Sparkle className="h-3.5 w-3.5 text-primary" />
        </span>
      }
      bubbleClassName="bg-secondary/40 px-3 py-2"
    >
      {m.text}
    </MessageBubble>
  ),
)}
```
(значок `Sparkle` в кружке — не персона с инициалами, поэтому `PersonaAvatar` здесь не подходит, оставляем как есть, как и указано в спеке; импорт `PersonaAvatar` в Step 1 в этом случае не понадобится — **не добавляй** его, если в файле не появится другое место с персонами. Смотри Step 3.)

- [ ] **Step 3: Проверить, нужен ли `PersonaAvatar` где-то ещё в файле**

Поискать в актуальной версии `AdvisorFlow.tsx` другие места с кружками-инициалами (например, если ТЗ v1.0 добавило отображение персон/участников) — если такие места есть, перевести их на `PersonaAvatar` по аналогии с Task 3. Если таких мест нет — убрать неиспользуемый импорт `PersonaAvatar` из Step 1 (не добавлять его вовсе).

- [ ] **Step 4: Проверить типы и линт**

Run: `npx tsc --noEmit && npx eslint src/components/advisor/AdvisorFlow.tsx`
Expected: без ошибок.

- [ ] **Step 5: Ручная проверка**

`npm run dev` → пройти сценарий советника до экрана рекомендации, задать уточняющий вопрос в блоке «Уточнить или изменить условия». Реплики выглядят как раньше (аватар со Sparkle, обводка у обеих сторон).

- [ ] **Step 6: Commit**

```bash
git add src/components/advisor/AdvisorFlow.tsx
git commit -m "Ретрофит AdvisorFlow на MessageBubble"
```

---

### Task 8: Ретрофит `Header.tsx`

**Files:**
- Modify: `src/components/Header.tsx`

**Interfaces:**
- Consumes: `PersonaAvatar` (Task 1).

- [ ] **Step 1: Импорт**

Добавить: `import { PersonaAvatar } from "@/components/PersonaAvatar";`

- [ ] **Step 2: Заменить аватар пользователя**

Заменить:
```tsx
<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
  МА
</span>
```
на:
```tsx
<PersonaAvatar initials="МА" size="md" className="bg-primary text-primary-foreground" />
```

- [ ] **Step 3: Проверить типы, линт**

Run: `npx tsc --noEmit && npx eslint src/components/Header.tsx`
Expected: без ошибок.

- [ ] **Step 4: Ручная проверка**

`npm run dev` → аватар в шапке выглядит идентично (синий кружок «МА», контрастный текст).

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx
git commit -m "Ретрофит Header на PersonaAvatar"
```

---

### Task 9: Финальная ручная проверка всех пяти фич

**Files:** нет изменений — только верификация.

- [ ] **Step 1: Запустить полный набор проверок**

Run: `npx tsc --noEmit && npx eslint src/routes/council.tsx src/components/PersonaAvatar.tsx src/components/MessageBubble.tsx src/components/ChatPanel.tsx src/components/notebook/NotebookChat.tsx src/components/advisor/AdvisorFlow.tsx src/components/Header.tsx && npx vitest run`
Expected: всё чисто, 15/15 тестов.

- [ ] **Step 2: Пройти все пять экранов в браузере**

`npm run dev` →
- `/council`: создать сессию, открыть существующую, задать follow-up, открыть «Изменить состав» — всё работает, вид не хуже, чем в Task 4.
- Карточка кейса → `ChatPanel` (боковой чат) → задать вопрос.
- Notebook → `NotebookChat` → задать вопрос с цитатами, лайкнуть, скопировать, пожаловаться.
- Advisor-флоу → дойти до рекомендации → задать уточняющий вопрос.
- Шапка (`Header`) — аватар пользователя на любой странице.

Проверить в светлой и тёмной теме хотя бы для `/council` и одного ещё экрана.

- [ ] **Step 3: Зафиксировать результат**

Если что-то из Step 2 не совпадает с ожиданием (регрессия внешнего вида/поведения) — вернуться к соответствующему Task и исправить перед тем, как считать план выполненным.
