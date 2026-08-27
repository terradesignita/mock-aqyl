import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Flag,
  Loader2,
  Quote,
  Shuffle,
  Mic,
  MicOff,
  Sparkle,
  StickyNote,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import type { KnowledgeCardData } from "@/data/mockCards";
import type { NotebookSource } from "@/lib/sources";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useVoiceInput } from "@/lib/speech";
import { BCP47, useI18n, useT, type Dictionary } from "@/lib/i18n";
import { MessageBubble } from "@/components/MessageBubble";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: string[];
  time: string;
  feedback?: "up" | "down";
  /** Отказ по отсутствию контекста — без действий и оценок. */
  refusal?: boolean;
}

interface Props {
  card: KnowledgeCardData;
  sources: NotebookSource[];
  selectedCitations: string[];
  onSaveNote: (text: string) => void;
  onOpenSource: (source: NotebookSource, highlight?: string) => void;
  onFeedback: (type: "up" | "down" | "report", question: string, reason?: string) => void;
  /** Вопрос отправлен — попадает в журнал активности. */
  onAsk?: (question: string) => void;
  /** Question pushed from outside (e.g. "ask about this source") */
  pendingQuestion?: { text: string; nonce: number } | null;
}

const timeIn = (bcp47: string) =>
  new Date().toLocaleTimeString(bcp47, { hour: "2-digit", minute: "2-digit" });

/** Adds inline footnote markers [1], [2]... to the end of meaningful lines. */
function withFootnotes(body: string, count: number) {
  if (count === 0) return body;
  let n = 0;
  return body
    .split("\n")
    .map((line) => {
      if (!line.trim() || line.trim().length < 25) return line;
      n += 1;
      return `${line} [${((n - 1) % count) + 1}]`;
    })
    .join("\n");
}

const messageId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/** Ответ, когда контекст пуст: ассистент обязан отказаться, а не отвечать по снятым источникам. */
function buildRefusal(t: Dictionary, time: string): ChatMessage {
  return {
    id: messageId("a"),
    role: "assistant",
    text: t.chat.refusal,
    citations: [],
    time,
    refusal: true,
  };
}

/** Ключевые слова вопроса — по одному набору на язык интерфейса. */
const INTENT = {
  risks: /риск|ограничен|подводн|против|risk|limitation|downside|тәуекел|шектеу/,
  steps: /шаг|внедр|примен|план|чек-лист|step|how|rollout|plan|checklist|қадам|енгіз|жоспар/,
  metrics: /цифр|метрик|kpi|эффект|показател|metric|number|measure|метрика|өлше|көрсеткіш/,
  why: /почему|зачем|why|вывод|итог|takeaway|conclusion|неге|тұжырым/,
  compare: /сравн|отлич|альтернатив|compare|differ|alternative|салыстыр|ерекшел/,
  sources: /источник|цитат|source|доказ|quote|evidence|дереккөз|дәйексөз/,
  summary: /кратк|тезис|саммари|о чём|о чем|brief|summary|about|қысқа|тезис|туралы/,
};

function buildAnswer(
  card: KnowledgeCardData,
  question: string,
  cited: string[],
  t: Dictionary,
  time: string,
): ChatMessage {
  const q = question.toLowerCase();
  let body: string;

  if (INTENT.risks.test(q)) {
    body = t.chat.answerRisks(card.source, card.business_unit);
  } else if (card.framework && INTENT.steps.test(q)) {
    body = t.chat.answerSteps(
      card.framework
        .map((f, i) => `${i + 1}. ${f.step.replace(/^\d+\.\s*/, "")} — ${f.description}`)
        .join("\n"),
    );
  } else if (INTENT.metrics.test(q)) {
    body = t.chat.answerMetrics(card.core_insight);
  } else if (INTENT.why.test(q)) {
    body = t.chat.answerWhy(card.core_insight);
  } else if (INTENT.compare.test(q)) {
    body = t.chat.answerCompare(card.business_unit);
  } else if (INTENT.sources.test(q)) {
    body = t.chat.answerSources(cited.length, card.source, card.author);
  } else if (INTENT.summary.test(q)) {
    body = t.chat.answerSummary(card.executive_summary, card.core_insight);
  } else {
    body = t.chat.answerDefault(card.executive_summary, card.core_insight);
  }

  return {
    id: messageId("a"),
    role: "assistant",
    text: withFootnotes(body, cited.length),
    citations: cited,
    time,
  };
}

export function NotebookChat({
  card,
  sources,
  selectedCitations,
  onSaveNote,
  onOpenSource,
  onFeedback,
  onAsk,
  pendingQuestion,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pillOffset, setPillOffset] = useState(0);
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const answerTimerRef = useRef<number | undefined>(undefined);
  const t = useT();
  const { locale } = useI18n();
  const bcp47 = BCP47[locale];
  const now = () => timeIn(bcp47);

  const voice = useVoiceInput({
    messages: t.voice,
    onText: setInput,
    onError: (message) => toast.error(message),
    onStart: () => toast.info(t.chat.voiceStarted),
    onDone: () => inputRef.current?.focus(),
  });

  // Отложенный ответ привязан к кейсу: при переходе на другой кейс таймер снимается,
  // иначе ответ по прошлому материалу дописывается в чат нового.
  useEffect(() => {
    setMessages([]);
    setInput("");
    setPillOffset(0);
    setThinking(false);
    return () => {
      window.clearTimeout(answerTimerRef.current);
      answerTimerRef.current = undefined;
    };
  }, [card.id]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [card.id, thinking]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const ask = (text: string) => {
    const value = text.trim();
    if (!value || thinking) return;
    setMessages((m) => [...m, { id: messageId("u"), role: "user", text: value, time: now() }]);
    setInput("");

    // Пустой контекст — сразу честный отказ, без имитации анализа.
    if (selectedCitations.length === 0) {
      setMessages((m) => [...m, buildRefusal(t, now())]);
      return;
    }

    onAsk?.(value);
    setThinking(true);
    answerTimerRef.current = window.setTimeout(() => {
      setMessages((m) => [...m, buildAnswer(card, value, selectedCitations, t, now())]);
      setThinking(false);
      answerTimerRef.current = undefined;
    }, 550);
  };

  const askRef = useRef(ask);
  askRef.current = ask;
  useEffect(() => {
    if (pendingQuestion?.text) askRef.current(pendingQuestion.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion?.nonce]);

  const questionFor = (index: number) =>
    [...messages]
      .slice(0, index)
      .reverse()
      .find((m) => m.role === "user")?.text ?? card.title;

  const setFeedback = (id: string, index: number, value: "up" | "down") => {
    const already = messages.find((x) => x.id === id)?.feedback === value;
    setMessages((m) =>
      m.map((x) => (x.id === id ? { ...x, feedback: already ? undefined : value } : x)),
    );
    if (!already) onFeedback(value, questionFor(index));
    toast.success(value === "up" ? t.chat.markedHelpful : t.chat.markedNotHelpful);
  };

  const copy = async (m: ChatMessage) => {
    await navigator.clipboard.writeText(m.text);
    setCopiedId(m.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const pills = useMemo(() => {
    const size = 6;
    const all = t.chat.suggestions;
    return Array.from({ length: size }, (_, i) => all[(pillOffset + i) % all.length]);
  }, [pillOffset, t]);

  const openCitation = (anchor: string) => {
    const src = sources.find((s) => s.anchor === anchor);
    if (src) onOpenSource(src, anchor);
  };

  /** Подпись цитаты — по физическому источнику, чтобы два фрагмента не выглядели одинаково. */
  const sourceLabel = (anchor: string) => {
    const src = sources.find((s) => s.anchor === anchor);
    if (!src) return anchor;
    return `${src.format} · ${src.title}`;
  };

  const quoteFor = (anchor: string) => {
    const src = sources.find((s) => s.anchor === anchor);
    // `quote` заполняется при сборке источника — не ищем раздел по названию,
    // иначе поиск сломается при смене языка интерфейса.
    const fragment = src?.quote ?? src?.sections[0]?.body;
    return {
      src,
      quote: (fragment ?? card.core_insight).split(". ")[0] + ".",
    };
  };

  /** Splits assistant text on [n] markers and renders hoverable footnotes. */
  const renderWithFootnotes = (text: string, cited: string[]) => {
    if (cited.length === 0) return text;
    return text.split(/(\[\d+\])/g).map((chunk, i) => {
      const match = /^\[(\d+)\]$/.exec(chunk);
      if (!match) return <span key={i}>{chunk}</span>;
      const n = Number(match[1]);
      const anchor = cited[n - 1];
      if (!anchor) return <span key={i}>{chunk}</span>;
      const { src, quote } = quoteFor(anchor);
      return (
        <HoverCard key={i} openDelay={120} closeDelay={80}>
          <HoverCardTrigger asChild>
            <button
              onClick={() => openCitation(anchor)}
              className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded border border-primary/35 bg-primary/10 px-1 align-super text-xs font-semibold leading-none text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={t.chat.sourceN(n)}
            >
              {n}
            </button>
          </HoverCardTrigger>
          <HoverCardContent align="start" className="w-80 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-card-foreground">
              <Quote className="h-3 w-3 text-primary" /> {t.chat.sourceBracket(n)}
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">«{quote}»</p>
            <p className="mt-2 truncate text-xs font-medium text-primary">{src?.title ?? anchor}</p>
            <p className="text-xs text-muted-foreground">{src?.meta}</p>
            <p className="mt-2 text-xs text-muted-foreground opacity-70">
              {t.chat.clickToOpenReader}
            </p>
          </HoverCardContent>
        </HoverCard>
      );
    });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 bg-background px-4 pt-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-card-foreground shadow-sm">
            <Sparkle className="h-3.5 w-3.5 text-primary" /> {t.chat.assistant}
          </span>
          <span
            className={`flex items-center gap-1.5 text-xs ${
              selectedCitations.length === 0
                ? "font-semibold text-warning"
                : "text-muted-foreground"
            }`}
          >
            {selectedCitations.length === 0 && <AlertTriangle className="h-3.5 w-3.5" />}
            {t.chat.contextOf(selectedCitations.length, sources.length)}
          </span>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-full h-6 bg-gradient-to-b from-background to-transparent"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm leading-relaxed text-card-foreground">
                {card.executive_summary}
              </p>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%]">
                  <MessageBubble variant="user" bubbleClassName="px-4 py-2.5 font-medium">
                    {m.text}
                  </MessageBubble>
                  <p className="mt-1 text-right text-xs text-muted-foreground">{m.time}</p>
                </div>
              </div>
            ) : (
              <MessageBubble
                key={m.id}
                variant="entity"
                bubbleClassName="p-5 rounded-tl-2xl"
                bodyClassName="leading-7 whitespace-pre-line"
                footer={
                  <>
                    {m.citations && m.citations.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
                        {m.citations.map((c, idx) => (
                          <li key={c}>
                            <button
                              onClick={() => openCitation(c)}
                              className="inline-flex max-w-[280px] items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                              title={c}
                            >
                              <Quote className="h-3 w-3 shrink-0 text-primary" />
                              <span className="truncate">
                                [{idx + 1}] {sourceLabel(c)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {m.refusal ? (
                      <p className="mt-3 border-t border-border pt-2.5 text-right text-xs text-muted-foreground">
                        {m.time}
                      </p>
                    ) : (
                      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-2.5 text-muted-foreground">
                        <button
                          onClick={() => setFeedback(m.id, i, "up")}
                          aria-label={t.chat.helpful}
                          className={`grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-secondary ${
                            m.feedback === "up" ? "text-success" : ""
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setFeedback(m.id, i, "down")}
                          aria-label={t.chat.notHelpful}
                          className={`grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-secondary ${
                            m.feedback === "down" ? "text-destructive" : ""
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                        <span className="mx-1 h-4 w-px bg-border" />
                        <button
                          onClick={() => copy(m)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          {copiedId === m.id ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {t.common.copy}
                        </button>
                        <button
                          onClick={() => onSaveNote(m.text)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <StickyNote className="h-3.5 w-3.5" /> {t.chat.toNotes}
                        </button>
                        <button
                          onClick={() => setReportFor(reportFor === m.id ? null : m.id)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary hover:text-destructive"
                        >
                          <Flag className="h-3.5 w-3.5" /> {t.chat.reportError}
                        </button>
                        <span className="ml-auto text-xs">{m.time}</span>
                      </div>
                    )}

                    {reportFor === m.id && (
                      <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3">
                        <p className="text-xs font-semibold text-card-foreground">
                          {t.chat.reportQuestion}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[
                            t.chat.reasonWrongFact,
                            t.chat.reasonWrongQuote,
                            t.chat.reasonOffTopic,
                            t.chat.reasonOutdated,
                            t.chat.reasonConfidential,
                          ].map((reason) => (
                            <button
                              key={reason}
                              onClick={() => {
                                setReportFor(null);
                                onFeedback("report", questionFor(i), reason);
                                toast.success(t.chat.reportSent(reason));
                              }}
                              className="rounded-full border border-border bg-card px-2.5 py-1 text-xs transition-colors hover:border-destructive hover:text-destructive"
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                }
              >
                {renderWithFootnotes(m.text, m.citations ?? [])}
              </MessageBubble>
            ),
          )}

          {thinking && (
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-4">
              <span className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                    style={{ animationDelay: `${d * 120}ms` }}
                  />
                ))}
              </span>
              <span className="text-sm text-muted-foreground">
                {t.chat.thinking(selectedCitations.length)}
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="relative z-20 bg-background px-4 pb-5 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-background to-transparent"
        />
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {pills.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-[color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-sm"
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => setPillOffset((o) => o + 6)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Shuffle className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />{" "}
              {t.chat.moreSuggestions}
            </button>
          </div>

          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary">
            <label htmlFor="notebook-chat-question" className="sr-only">
              {t.chat.questionLabel}
            </label>
            <textarea
              id="notebook-chat-question"
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              placeholder={
                voice.state === "requesting"
                  ? t.chat.placeholderRequesting
                  : voice.state === "listening"
                    ? t.chat.placeholderListening
                    : selectedCitations.length === 0
                      ? t.chat.placeholderEmpty
                      : t.chat.placeholder(selectedCitations.length)
              }
              className="min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            />
            <button
              onClick={voice.toggle}
              disabled={voice.state === "unsupported"}
              aria-label={voice.active ? t.dashboard.voiceStop : t.dashboard.voiceInput}
              title={
                voice.state === "unsupported"
                  ? t.dashboard.voiceUnsupported
                  : voice.active
                    ? t.dashboard.voiceStop
                    : t.dashboard.voiceInput
              }
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors disabled:opacity-40 ${
                voice.active
                  ? "animate-pulse border-destructive bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {voice.state === "requesting" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : voice.active ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => ask(input)}
              disabled={!input.trim() || thinking}
              aria-label={t.chat.send}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primary"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground/60">
            {t.common.aiDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
