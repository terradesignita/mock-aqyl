import { HelpHint } from "@/components/HelpHint";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Flag,
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
import { pluralRu } from "@/lib/utils";
import { MessageBubble } from "@/components/MessageBubble";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: string[];
  time: string;
  feedback?: "up" | "down";
}

interface Props {
  card: KnowledgeCardData;
  sources: NotebookSource[];
  selectedCitations: string[];
  onSaveNote: (text: string) => void;
  onOpenSource: (source: NotebookSource, highlight?: string) => void;
  onFeedback: (type: "up" | "down" | "report", question: string, reason?: string) => void;
  /** Question pushed from outside (e.g. "ask about this source") */
  pendingQuestion?: { text: string; nonce: number } | null;
}

const now = () => new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

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

function buildAnswer(card: KnowledgeCardData, question: string, cited: string[]): ChatMessage {
  const q = question.toLowerCase();
  let body: string;

  if (/риск|ограничен|подводн|против/.test(q)) {
    body = `Ограничения и риски:\n1. Контекст материала «${card.source}» отличается от площадок BI Group — нужна калибровка по объёму работ.\n2. Эффект проявляется на горизонте 2–3 кварталов, ранние замеры вводят в заблуждение.\n3. Без владельца процесса практика откатывается к прежнему состоянию.`;
  } else if (card.framework && /шаг|внедр|примен|план|чек-лист|step|how/.test(q)) {
    body = `На основе выбранных источников применение выглядит так:\n${card.framework
      .map((f, i) => `${i + 1}. ${f.step.replace(/^\d+\.\s*/, "")} — ${f.description}`)
      .join("\n")}`;
  } else if (/цифр|метрик|kpi|эффект|показател/.test(q)) {
    body = `Что измерять:\n• Базовый показатель до внедрения (замер 4 недели).\n• Ключевой эффект: ${card.core_insight}\n• Контрольная метрика качества, чтобы рост скорости не съедал качество.`;
  } else if (/почему|зачем|why|вывод|итог/.test(q)) {
    body = `Ключевой вывод: ${card.core_insight}`;
  } else if (/сравн|отлич|альтернатив/.test(q)) {
    body = `Отличие от текущей практики: материал предлагает управлять причиной, а не следствием. В направлении «${card.business_unit}» это означает перенос усилий на подготовительный этап.`;
  } else if (/источник|цитат|source|доказ/.test(q)) {
    body = `Ответ опирается на ${cited.length} выбранных фрагмента(ов) из материала «${card.source}» (${card.author}). Наведите на сноску, чтобы увидеть цитату, и нажмите — откроется читалка.`;
  } else if (/кратк|тезис|саммари|о чём|о чем/.test(q)) {
    body = `${card.executive_summary}\n\nКлючевой инсайт: ${card.core_insight}`;
  } else {
    body = `${card.executive_summary}\n\nКлючевой инсайт: ${card.core_insight}\n\nЕсли нужно — разложу на шаги внедрения или соберу список метрик.`;
  }

  return {
    id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    role: "assistant",
    text: withFootnotes(body, cited.length),
    citations: cited,
    time: now(),
  };
}

const ALL_SUGGESTIONS = [
  "Кратко о чём этот материал?",
  "Дай 5 тезисов для планёрки",
  "Как применить это у нас?",
  "Составь пошаговый план внедрения",
  "Какие риски и ограничения?",
  "Что может пойти не так на площадке?",
  "Какие метрики отслеживать?",
  "Сколько времени займёт внедрение?",
  "Чем это отличается от нашей практики?",
  "Кто должен быть владельцем процесса?",
  "Покажи источники и цитаты",
  "Сформулируй письмо руководителю",
  "Какие вопросы задать подрядчику?",
  "Переведи вывод на простой язык",
  "Сделай чек-лист на первую неделю",
];

export function NotebookChat({
  card,
  sources,
  selectedCitations,
  onSaveNote,
  onOpenSource,
  onFeedback,
  pendingQuestion,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pillOffset, setPillOffset] = useState(0);
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
    setPillOffset(0);
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
    setMessages((m) => [...m, { id: `u_${Date.now()}`, role: "user", text: value, time: now() }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, buildAnswer(card, value, selectedCitations)]);
      setThinking(false);
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
    toast.success(value === "up" ? "Спасибо, отметили как полезный" : "Учтём — ответ отмечен");
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
    if (!SR) {
      toast.error("Голосовой ввод не поддерживается в этом браузере");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "ru-RU";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += chunk;
        else interim += chunk;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = (event: any) => {
      setListening(false);
      toast.error(
        event.error === "not-allowed"
          ? "Нет доступа к микрофону"
          : "Не удалось распознать речь, попробуйте ещё раз",
      );
    };
    rec.onend = () => {
      setListening(false);
      const value = finalText.trim();
      if (value) {
        setInput(value);
        inputRef.current?.focus();
      }
    };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
    toast.info("Говорите — я записываю вопрос");
  };

  const copy = async (m: ChatMessage) => {
    await navigator.clipboard.writeText(m.text);
    setCopiedId(m.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const pills = useMemo(() => {
    const size = 6;
    return Array.from(
      { length: size },
      (_, i) => ALL_SUGGESTIONS[(pillOffset + i) % ALL_SUGGESTIONS.length],
    );
  }, [pillOffset]);

  const openCitation = (anchor: string) => {
    const src = sources.find((s) => s.anchor === anchor);
    if (src) onOpenSource(src, anchor);
  };

  const quoteFor = (anchor: string) => {
    const src = sources.find((s) => s.anchor === anchor);
    const fragment = src?.sections.find((s) => s.heading.startsWith("Фрагмент"))?.body;
    return {
      src,
      quote: (fragment ?? src?.sections[0]?.body ?? card.core_insight).split(". ")[0] + ".",
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
              aria-label={`Источник ${n}`}
            >
              {n}
            </button>
          </HoverCardTrigger>
          <HoverCardContent align="start" className="w-80 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-card-foreground">
              <Quote className="h-3 w-3 text-primary" /> Источник [{n}]
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">«{quote}»</p>
            <p className="mt-2 truncate text-xs font-medium text-primary">{src?.title ?? anchor}</p>
            <p className="text-xs text-muted-foreground">{src?.meta}</p>
            <p className="mt-2 text-xs text-muted-foreground opacity-70">
              Нажмите, чтобы открыть в читалке
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
            <Sparkle className="h-3.5 w-3.5 text-primary" /> AQYL ассистент
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Контекст: {selectedCitations.length} из {sources.length} источников
            <HelpHint
              side="left"
              text="Ассистент отвечает только по источникам, отмеченным в левой панели. Сноски [1], [2] в ответе ведут к конкретным цитатам."
            />
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
                                [{idx + 1}] {c}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-2.5 text-muted-foreground">
                      <button
                        onClick={() => setFeedback(m.id, i, "up")}
                        aria-label="Полезный ответ"
                        className={`grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-secondary ${
                          m.feedback === "up" ? "text-success" : ""
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setFeedback(m.id, i, "down")}
                        aria-label="Неудачный ответ"
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
                        Копировать
                      </button>
                      <button
                        onClick={() => onSaveNote(m.text)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <StickyNote className="h-3.5 w-3.5" /> В заметки
                      </button>
                      <button
                        onClick={() => setReportFor(reportFor === m.id ? null : m.id)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-secondary hover:text-destructive"
                      >
                        <Flag className="h-3.5 w-3.5" /> Сообщить об ошибке
                      </button>
                      <span className="ml-auto text-xs">{m.time}</span>
                    </div>

                    {reportFor === m.id && (
                      <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3">
                        <p className="text-xs font-semibold text-card-foreground">
                          Что не так с ответом?
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[
                            "Неверный факт",
                            "Цитата не соответствует",
                            "Ответ не по вопросу",
                            "Устаревшие данные",
                            "Конфиденциальные данные",
                          ].map((reason) => (
                            <button
                              key={reason}
                              onClick={() => {
                                setReportFor(null);
                                onFeedback("report", questionFor(i), reason);
                                toast.success(`Отправлено редакторам: «${reason}»`);
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
                Анализирую {selectedCitations.length}{" "}
                {pluralRu(selectedCitations.length, "источник", "источника", "источников")}...
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
              Ещё варианты
            </button>
          </div>

          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary">
            <label htmlFor="notebook-chat-question" className="sr-only">
              Вопрос по выбранным источникам
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
                listening
                  ? "Слушаю..."
                  : `Задайте вопрос по ${selectedCitations.length} выбранным источникам...`
              }
              className="min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            />
            <button
              onClick={toggleVoice}
              aria-label={listening ? "Остановить запись" : "Голосовой ввод"}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${
                listening
                  ? "animate-pulse border-destructive bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              onClick={() => ask(input)}
              disabled={!input.trim() || thinking}
              aria-label="Отправить"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primary"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground/60">
            AQYL — ИИ и может ошибаться. Пожалуйста, перепроверяйте факты и цитируемые источники.
          </p>
        </div>
      </div>
    </div>
  );
}
