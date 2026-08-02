# Общие компоненты чата + редизайн Консилиума — спецификация

Дата: 2026-08-02

## Проблема

`src/routes/council.tsx` рисует реплики персон и пузыри пользователя вручную (raw div + Tailwind), скопировав стиль из `AdvisorFlow.tsx`. При этом в проекте есть три похожих, но независимо написанных чат-реализации (`ChatPanel.tsx`, `NotebookChat.tsx`, `AdvisorFlow.tsx`) — каждая со своим локальным стилем аватара и пузыря сообщения, без единого источника правды. shadcn/ui-примитивы (`Card`, `Badge`, `Avatar`) при этом определены в `src/components/ui/`, но нигде не используются — реальный переиспользуемый слой в проекте отсутствует.

Дополнительно: в существующем коде уже есть развилка в стиле пузыря пользователя — `ChatPanel`/`NotebookChat` используют сплошную заливку `bg-primary` + `flex justify-end`, а `AdvisorFlow` — обводку `border-primary/30 bg-primary/6` + отступ `ml-N`. Ни одна из них не выигрывает большинством (2 на 2).

## Решение

### 1. Новые общие компоненты

**`src/components/PersonaAvatar.tsx`** — кружок с инициалами. Владеет формой/размером, цвет передаётся снаружи:

```tsx
interface PersonaAvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl"; // h-6/h-7/h-9/h-14, текст 11px/xs/xs/sm
  ring?: boolean; // border-2 border-card — для стека аватаров (AvatarStack)
  className?: string; // цвет (bg-*) + доп. переопределения, мёржится через cn()
}
```

**`src/components/MessageBubble.tsx`** — тело реплики, два варианта:

```tsx
interface MessageBubbleProps {
  variant: "user" | "entity";
  avatar?: React.ReactNode;      // только entity
  title?: React.ReactNode;       // только entity — имя/роль
  accentClassName?: string;      // только entity — border-l-4 акцент (например border-l-emerald-700)
  bubbleClassName?: string;      // переопределение фона/цвета самой карточки (мёржится через cn(), например bg-secondary/40)
  footer?: React.ReactNode;      // цитаты/действия — остаются вне компонента, передаются готовым JSX
  className?: string;            // на внешнюю обёртку
  children: React.ReactNode;
}
```

`user`-вариант рендерит `rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/6 px-3 py-2 text-sm text-card-foreground` (канон — обводка, как в `AdvisorFlow`/текущем Консилиуме; **меняет** внешний вид `ChatPanel` и `NotebookChat`, которые сегодня используют сплошную заливку).

`entity`-вариант рендерит `flex gap-3` → `{avatar}` + карточку `rounded-2xl rounded-tl-sm border border-border bg-card p-3` с опциональным `title` и `footer`.

Действия/цитаты (`NotebookChat`'s thumbs up/down, copy, «в заметки», цитаты) остаются полностью в `NotebookChat.tsx` — передаются через `footer`, компонент не знает об этой логике.

### 2. Council на новых компонентах

- Реплики персон → `MessageBubble variant="entity"` с `avatar={<PersonaAvatar .../>}`, `title` (имя+роль), `accentClassName` — цветной левый бордер по персоне (уже одобренная правка, просто переезжает в общий компонент).
- Follow-up пользователя → `MessageBubble variant="user"`.
- `AvatarStack` (стек аватаров в истории сессий) → каждый элемент через `PersonaAvatar size="sm" ring`.
- `EmptyState` hero, чипы в `PersonaPicker`, чипы в `NewCouncilPanel`, значки в сайдбаре — все через `PersonaAvatar` соответствующего размера.
- `VerdictPanel`: «Открытые вопросы» — прямоугольные строки → круглые pill-чипы (паттерн из `NotebookChat`/`AdvisorFlow`: `rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs ... hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8 hover:text-primary`), сохраняя текущее поведение клика (задать вопрос совету).

### 3. Ретрофит существующих чат-фич

- **`ChatPanel.tsx`**: assistant-сообщение и user-пузырь переезжают на `MessageBubble` (assistant — `variant="entity"` без `avatar`/`title`; user — `variant="user"`, оборачивается в `flex justify-end` + `max-w-[85%]` как сейчас). Цитаты передаются через `footer`. Логика (`buildAnswer`, стейт, textarea, drawer-анимация) не трогается.
- **`NotebookChat.tsx`**: assistant-карточка → `MessageBubble variant="entity"` без аватара, `footer` = существующий блок цитат + action-бар (thumbs/copy/заметки/report) как есть. User-пузырь → `MessageBubble variant="user"` (меняет внешний вид с сплошной заливки на обводку — единственное намеренное визуальное изменение здесь). Footnotes, speech-to-text, suggested-pills, feedback-логика не трогаются.
- **`AdvisorFlow.tsx`**: уже ближе всего к канону — заменить локальную разметку на `MessageBubble`/`PersonaAvatar` с эквивалентными пропами (`bubbleClassName="bg-secondary/40"` для advisor-реплики, avatar — кружок с `Sparkle`).
- **`Header.tsx`**: текущий аватар пользователя (`bg-primary text-primary-foreground`) → `PersonaAvatar size="md" className="bg-primary text-primary-foreground"`.

Каждая фича проверяется визуально в браузере (скриншот до/после) — автотестов на эти компоненты в проекте нет.

## Вне рамок

- Логика/стейт существующих чат-фич (buildAnswer, feedback, speech-to-text, suggested-pills) не меняется — только то, как рендерится тело сообщения/аватар.
- Не мигрируем на shadcn/ui-примитивы (`Card`/`Badge`/`Avatar` из `ui/`) — новые общие компоненты пишутся в собственном стиле проекта (Tailwind + `cn()`), как и весь остальной код.
- Не меняем `Popover`/`Select`/`Button`/`Dialog` — они уже используются consistently, не требуют ретрофита.
