import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import type { KnowledgeCardData } from "@/data/mockCards";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  citations?: string[];
}

interface ChatPanelProps {
  card: KnowledgeCardData | null;
  open: boolean;
  onClose: () => void;
}

function buildAnswer(card: KnowledgeCardData, question: string): ChatMessage {
  const q = question.toLowerCase();
  let body: string;

  if (card.framework && /как|шаг|внедр|прим|step|how/.test(q)) {
    body = `По этой карточке применение выглядит так:\n${card.framework
      .map((f) => `• ${f.step} — ${f.description}`)
      .join("\n")}`;
  } else if (/почему|зачем|why|вывод|итог/.test(q)) {
    body = `Ключевой вывод: ${card.core_insight}`;
  } else if (/источник|цитат|source/.test(q)) {
    body = `Материал опирается на ${card.citations.length} источника(ов). Основной — «${card.source}», автор: ${card.author}.`;
  } else {
    body = `${card.executive_summary}\n\nКлючевой инсайт: ${card.core_insight}`;
  }

  return {
    role: "assistant",
    text: body,
    citations: card.citations.map((c) => c.source_anchor),
  };
}

export function ChatPanel({ card, open, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [card?.id]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, card?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  if (!open || !card) return null;

  const send = () => {
    const text = input.trim();
    if (!text || thinking) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, buildAnswer(card, text)]);
      setThinking(false);
      inputRef.current?.focus();
    }, 550);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl animate-slide-in-right lg:w-[380px]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-card-foreground">Вопрос по карточке</p>
            <p className="truncate text-xs text-muted-foreground">{card.title}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Закрыть">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Спросите что-нибудь по этому материалу — например: «Как применить это у нас?» или
              «Какие источники?»
            </div>
          )}
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
          {thinking && (
            <p className="animate-pulse text-sm text-muted-foreground">Ищу в контексте...</p>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <label htmlFor="chat-panel-question" className="sr-only">
              Ваш вопрос по карточке
            </label>
            <textarea
              id="chat-panel-question"
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ваш вопрос..."
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-background p-2.5 text-base outline-none focus:border-primary sm:text-sm"
            />
            <Button size="icon" onClick={send} disabled={!input.trim() || thinking}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
