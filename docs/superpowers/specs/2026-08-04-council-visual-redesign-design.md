# Консилиум: визуальный редизайн (цвет, персоны, раскладка, движение)

## Контекст и цель

Функциональный редизайн Консилиума в живой групповой чат уже сдан (`docs/superpowers/specs/2026-08-04-council-live-chat-design.md`, `docs/superpowers/plans/2026-08-04-council-live-chat.md`). Пользователь оценил результат как «скучный» — не по функциям, а по внешнему виду: интерфейс использует нейтральную серо-белую палитру дизайн-системы почти без цвета, персоны различаются только тонкой левой полоской и кружком с инициалами, раскладка — типовой шаблон «сайдбар + чат», а движение ограничено fade-in и точками набора текста.

Цель этого документа — зафиксировать визуальный язык для той же функциональности: цвет и характер персон становятся ведущим визуальным элементом, а не декором поверх нейтрального шаблона. Все решения ниже утверждены пользователем через визуальный компаньон (мокапы в браузере) и текстовые уточнения — см. цепочку решений в конце документа.

**Не входит в этот документ:** углубление контента диалогов (расширение keyword-правил `buildFollowUpReplies`, реакции персон друг на друга в тексте) — это отдельная, параллельно согласованная задача по данным, не по визуалу.

## 1. Данные персон: два новых поля

`CouncilPersona` (`src/data/council.ts`) получает два новых обязательных поля, дополняющих существующие `id/name/initials/role/inspiredBy/color`:

```ts
export interface CouncilPersona {
  id: string;
  name: string;
  initials: string;
  role: string;
  inspiredBy: string;
  /** Tailwind bg-* класс — как раньше, источник для производных ring/tint классов. */
  color: string;
  /** HEX того же цвета — единственный способ получить настоящее значение цвета
   *  для inline-стилей (радиальный градиент обложки не построить статическими
   *  Tailwind-классами, т.к. комбинаций персон в совете слишком много для JIT). */
  hex: string;
  /** Короткое словом-тег архетипа для чипа под именем персоны. */
  tag: string;
}
```

Значения `hex` — те же оттенки Tailwind, что уже используются в `color`, просто как raw-значение:

| id | color (текущий) | hex | tag |
|---|---|---|---|
| founder | bg-amber-700 | #b45309 | Визионер |
| operator | bg-violet-600 | #7c3aed | Оператор |
| engineer | bg-blue-600 | #2563eb | Инженер |
| contrarian | bg-teal-700 | #0f766e | Скептик |
| industrialist | bg-orange-700 | #c2410c | Промышленник |
| product | bg-fuchsia-600 | #c026d3 | Продакт |
| brand | bg-rose-700 | #be123c | Бренд |
| platform | bg-indigo-600 | #4f46e5 | Платформа |
| competitor | bg-red-700 | #b91c1c | M&A |
| resilience | bg-cyan-700 | #0e7490 | Устойчивость |
| scale | bg-emerald-700 | #047857 | Масштаб |
| transform | bg-stone-600 | #57534e | Трансформация |

Оба поля — данные, не поведение: ничего в `buildOpeningMessages`/`buildFollowUpReplies` их не читает, guardrail-тест на реальные имена лидеров их не касается.

## 2. Производные Tailwind-классы (UI-слой)

В `src/routes/council.tsx` существующий `PERSONA_BORDER_CLASS` (color → `"border-l-<color>"`, использовался для старого приёма «полоска слева») заменяется на `PERSONA_VISUAL` — карту `color → { ring, tint, tintBorder }`:

```ts
const PERSONA_VISUAL: Record<string, { ring: string; tint: string; tintBorder: string }> = {
  "bg-amber-700": { ring: "border-amber-700", tint: "bg-amber-700/10", tintBorder: "border-amber-700/35" },
  "bg-violet-600": { ring: "border-violet-600", tint: "bg-violet-600/10", tintBorder: "border-violet-600/35" },
  "bg-blue-600": { ring: "border-blue-600", tint: "bg-blue-600/10", tintBorder: "border-blue-600/35" },
  "bg-teal-700": { ring: "border-teal-700", tint: "bg-teal-700/10", tintBorder: "border-teal-700/35" },
  "bg-orange-700": { ring: "border-orange-700", tint: "bg-orange-700/10", tintBorder: "border-orange-700/35" },
  "bg-fuchsia-600": { ring: "border-fuchsia-600", tint: "bg-fuchsia-600/10", tintBorder: "border-fuchsia-600/35" },
  "bg-rose-700": { ring: "border-rose-700", tint: "bg-rose-700/10", tintBorder: "border-rose-700/35" },
  "bg-indigo-600": { ring: "border-indigo-600", tint: "bg-indigo-600/10", tintBorder: "border-indigo-600/35" },
  "bg-red-700": { ring: "border-red-700", tint: "bg-red-700/10", tintBorder: "border-red-700/35" },
  "bg-cyan-700": { ring: "border-cyan-700", tint: "bg-cyan-700/10", tintBorder: "border-cyan-700/35" },
  "bg-emerald-700": { ring: "border-emerald-700", tint: "bg-emerald-700/10", tintBorder: "border-emerald-700/35" },
  "bg-stone-600": { ring: "border-stone-600", tint: "bg-stone-600/10", tintBorder: "border-stone-600/35" },
};
```

Все значения — литеральные строки в исходнике (требование Tailwind JIT), как и в существующем `PERSONA_BORDER_CLASS`. `/10` и `/35` — конкретные значения из утверждённого мокапа (заливка пузыря ~10-12%, рамка ~35%).

## 3. Идентичность персон: кольцо + тег роли

`PersonaAvatar` (`src/components/PersonaAvatar.tsx`) получает новый опциональный проп `ringClassName?: string` — рисует `border-2` вокруг круга поверх текущего фона:

```tsx
export interface PersonaAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials: string;
  size?: keyof typeof SIZE_CLASS;
  ring?: boolean;
  /** Кольцо цвета персоны — новое, для варианта C идентичности персон. */
  ringClassName?: string;
}
```

`className` продолжает задавать фон (`p.color`), `ringClassName` — `PERSONA_VISUAL[p.color].ring`. Существующий `ring?: boolean` (белая обводка для стека аватаров) остаётся отдельным пропом — оба класса применяются одновременно через `cn()`, если заданы оба.

Тег роли — новый маленький компонент прямо в `council.tsx` (не отдельный файл, слишком мал):

```tsx
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

Фон тега — сплошной цвет персоны (не tint), белый текст поверх — контраст закрыт тем же принципом, что уже используют `PersonaAvatar` (белый текст на насыщенном фоне из палитры amber-700/violet-600/etc., все с достаточной светлотой для 1000/700/600-оттенков Tailwind).

**Где используется (кольцо + тег вместе):** список выбора персон в `NewCouncilPanel` (шаг 1) и `PersonaPicker` — обе уже рендерят `PersonaAvatar` + имя/роль построчно; тег добавляется рядом с существующей строкой роли, кольцо — на аватар.

**Где используется только кольцо (без тега):** заголовок сообщения персоны в `SessionView` — там уже есть полный текст роли (`{p.name} · {p.role}`), рядом с ним короткий тег-дубликат читался бы избыточно. Кольцо на аватар добавляется, тег — нет.

**Где не используется ни то, ни другое:** маленькие аватары в стеке (`AvatarStack`, `size="sm"`/`"xs"`) — на таком размере кольцо+инициалы нечитаемы, там остаётся текущий плоский вид.

## 4. Пузыри сообщений: заливка цветом персоны

В `SessionView` персональный блок сообщения меняет фон с `bg-card` + `border-l-4` на `PERSONA_VISUAL[p.color].tint` + `PERSONA_VISUAL[p.color].tintBorder` (обычная рамка со всех сторон, без акцента только слева — левая полоска была компенсацией за монохромный фон, теперь фон сам несёт цвет):

```tsx
<div
  className={cn(
    "rounded-2xl rounded-tl-sm border p-3 text-sm leading-relaxed text-card-foreground",
    PERSONA_VISUAL[p.color].tint,
    PERSONA_VISUAL[p.color].tintBorder,
  )}
>
  {m.text}
</div>
```

Пузырь пользователя не меняется — он и так уже использует тот же паттерн (`bg-primary/6` + `border-primary/30`), просто с фиксированным primary вместо персонального цвета.

**Тёмная тема:** `/10` и `/35` — фиксированные модификаторы непрозрачности, не зависящие от темы. Требуется визуальная проверка в тёмной теме на реальных персонах при реализации — если конкретный оттенок читается мутно на тёмном `--card`, точечно поднять непрозрачность через `dark:bg-<color>/15` для этого оттенка, а не менять общую схему.

## 5. Раскладка: карточка-обложка и сайдбар

### Обложка чата

Текущий блок «Кейс» (плоская карточка с summary) и новый блок шапки чата (стек аватаров + название + «N участников») объединяются в один блок — компонент `ConversationCover` в `council.tsx`:

```tsx
function ConversationCover({ session }: { session: CouncilSession }) {
  const colors = session.personaIds.slice(0, 3).map((id) => getPersona(id).hex);
  const anchors = ["0% 0%", "100% 0%", "50% 100%"];
  const backgroundImage = colors
    .map((hex, i) => `radial-gradient(60% 90% at ${anchors[i]}, color-mix(in oklab, ${hex} 18%, transparent), transparent 65%)`)
    .join(", ");

  return (
    <div className="rounded-2xl border border-border p-4" style={{ backgroundImage, backgroundColor: "var(--color-card)" }}>
      <AvatarStack personaIds={session.personaIds} size="lg" />
      <h2 className="mt-3 text-lg font-bold text-foreground">{session.topic.title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{session.topic.summary}</p>
      <p className="mt-2 text-xs text-muted-foreground">{session.personaIds.length}{" "}{session.personaIds.length === 1 ? "участник" : "участника"} · на связи</p>
    </div>
  );
}
```

Технически это тот же приём, что уже используется в фоне `<body>` (`styles.css:230-234`, два `radial-gradient` с `color-mix(in oklab, ...)`), просто с цветами персон вместо `--primary`/`--accent` и до трёх точек вместо двух. `AvatarStack` получает новый проп `size` (по умолчанию `"sm"`, здесь — `"lg"`) для крупного отображения в обложке.

Заменяет собой существующий отдельный «шапка чата» блок и «Кейс»-карточку в `SessionView` — один компонент вместо двух.

### Сайдбар

`SessionRow` (`council.tsx`) получает тонкую цветную подложку от первой персоны сессии вместо плоского `hover:bg-secondary/50`:

```tsx
const accentHex = getPersona(session.personaIds[0]).hex;
// на wrapper-div строки:
style={{
  backgroundColor: `color-mix(in oklab, ${accentHex} 6%, var(--color-card))`,
  borderColor: `color-mix(in oklab, ${accentHex} 25%, transparent)`,
}}
```

Один цвет (не градиент из всех участников) — строка маленькая, многоцветный градиент на такой площади читался бы как шум, а не акцент. Стек аватаров (`AvatarStack`) в строке уже существует, увеличивать не нужно — новизна тут только в цветной подложке.

## 6. Движение

### Появление сообщений

Новый keyframe в `src/styles.css` (рядом с существующими `@utility shadow-soft` и т.п.):

```css
@keyframes message-pop {
  0% { opacity: 0; transform: translateY(10px) scale(0.92); }
  60% { opacity: 1; transform: translateY(0) scale(1.04); }
  100% { transform: scale(1); }
}

@utility animate-message-pop {
  animation: message-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

Заменяет текущий `animate-in fade-in slide-in-from-bottom-2 duration-300` на всех message-обёртках в `SessionView` (и персон, и пользователя). `prefers-reduced-motion: reduce` уже глобально зануляет `animation-duration` (`styles.css:258-263`) — работает без изменений.

### Пульсация во время печати

Индикатор «печатает» (три подпрыгивающих точки, уже реализован) получает пульсацию кольца на аватаре той же персоны:

```css
@keyframes typing-ring-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--pulse-color, currentColor) 50%, transparent); }
  50% { box-shadow: 0 0 0 6px color-mix(in oklab, var(--pulse-color, currentColor) 0%, transparent); }
}

@utility animate-typing-ring {
  animation: typing-ring-pulse 1.2s ease-out infinite;
}
```

На `PersonaAvatar` типирующей персоны — `className="animate-typing-ring" style={{ "--pulse-color": typingPersona.hex }}`. CSS-переменная нужна, т.к. цвет персоны рантайм-значение, а `@utility` — статическое правило.

### Реакции — анимация появления пилюли

При добавлении реакции сама пилюля появляется через тот же `animate-message-pop` (переиспользуется, отдельный keyframe не нужен).

## 7. Реакции на сообщения

### Данные

`CouncilChatMessage` (`src/data/council.ts`) получает новое опциональное поле:

```ts
export interface CouncilChatMessage {
  id: string;
  author: "user" | string;
  text: string;
  time: string;
  replyTo?: string;
  /** Эмодзи, которыми пользователь отреагировал на это сообщение персоны. */
  reactions?: string[];
}
```

Опциональное поле — обратной несовместимости со storage-схемой v3 нет, бампать ключ не нужно.

`useCouncilSessions` (`src/hooks/useAppState.ts`) получает новый метод:

```ts
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
```

Возвращается из хука вместе с существующими `addMessages`/`updatePersonas`/`remove`.

### UI

Фиксированный набор — 4 эмодзи: `👍 🤔 😮 🔥`. Никакого открытого пикера.

- Панель реакций видна **только у сообщений персон** (не у сообщений пользователя — реагирует только пользователь, персоны друг на друга и на пользователя в этой итерации не реагируют).
- Триггер появляется по hover на пузырь сообщения (на touch-устройствах — по тапу на сообщение, второй тап на эмодзи подтверждает выбор; реализация через тот же `group-hover` паттерн, что уже используется для кнопки удаления сессии в `SessionRow`).
- Уже активные реакции (пользователь уже нажал) отображаются постоянно под пузырём в виде мелких пилюль — не только на hover.
- Клик по эмодзи (активному или нет) — `toggleReaction(session.id, message.id, emoji)`.
- `aria-pressed` на каждой эмодзи-кнопке отражает состояние, `aria-label` — например `"Отреагировать 👍"`.

## 8. Тестирование и проверка

- Существующий guardrail-тест на реальные имена не трогается — новые поля (`hex`, `tag`, `reactions`) не текстовые генераторы.
- Новый тест в `council.test.ts`: каждая персона имеет непустые `hex` (валидный `#rrggbb`) и `tag`.
- Новый тест: `toggleReaction` добавляет и убирает эмодзи из `message.reactions`, не трогая остальные сообщения сессии.
- Ручная проверка в браузере (обе темы): аватары с кольцом+тегом в списке выбора персон и в чате; тонированные пузыри персон читаемы в тёмной теме; обложка чата с градиентом на сессиях с 1/2/3 участниками; сайдбар с цветной подложкой; pop-анимация новых сообщений; пульсация кольца во время «печати»; добавление/снятие реакции переживает reload страницы.
- `prefers-reduced-motion: reduce` — обе новые анимации (`message-pop`, `typing-ring-pulse`) должны схлопываться в мгновенное появление/отсутствие пульсации (уже покрыто глобальным правилом в `styles.css`, проверить, что оно применяется к `@utility`-анимациям так же, как к `animate-in`).

## Принятые решения (для справки)

1. Общее направление — «яркое и игривое» (в духе Telegram/Discord), а не премиальное-минималистичное или тёплое-иллюстративное.
2. Идентичность персон — вариант C: кольцо-акцент вокруг аватара + текстовый тег роли под именем (не эмодзи-бейдж).
3. Пузыри сообщений — вариант B: лёгкая заливка цветом персоны (~10-12%) + рамка того же цвета (не плоский нейтральный фон, не полностью закрашенный пузырь).
4. Раскладка — объединение карточки кейса и шапки чата в цветную «обложку» с градиентом из цветов участников; сайдбар — строки сессий со стеком аватаров и цветной подложкой.
5. Движение — вариант B: пружинное появление сообщений + пульсация кольца во время печати + эмодзи-реакции на сообщения.
6. Реакции — сохраняются в данные сессии (переживают reload), а не эффемерная анимация без сохранения.
