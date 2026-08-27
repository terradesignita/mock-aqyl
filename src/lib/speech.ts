import { useCallback, useEffect, useRef, useState } from "react";

/** Минимальная часть Web Speech API, которой мы пользуемся — в lib.dom её нет. */
interface SpeechAlternative {
  transcript: string;
}
interface SpeechResult {
  isFinal: boolean;
  0: SpeechAlternative;
}
interface SpeechResultList {
  length: number;
  [index: number]: SpeechResult;
}
interface SpeechResultEvent {
  resultIndex: number;
  results: SpeechResultList;
}
interface SpeechErrorEvent {
  error: string;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Сколько ждём реакции браузера/микрофона, прежде чем признать зависание.
 *  BUG-25: без этого таймаута кнопка молча остаётся в исходном состоянии. */
const START_TIMEOUT_MS = 8000;

export type VoiceState = "unsupported" | "idle" | "requesting" | "listening";

/** Тексты ошибок приходят из словаря локали — сам хук строк не содержит. */
export interface VoiceMessages {
  notAllowed: string;
  noMic: string;
  network: string;
  noSpeech: string;
  aborted: string;
  generic: string;
  unsupported: string;
  startFailed: string;
  timeout: string;
}

function messageFor(code: string, m: VoiceMessages): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return m.notAllowed;
    case "audio-capture":
      return m.noMic;
    case "network":
      return m.network;
    case "no-speech":
      return m.noSpeech;
    case "aborted":
      return m.aborted;
    default:
      return m.generic;
  }
}

interface Options {
  /** Локализованные сообщения об ошибках и отказах. */
  messages: VoiceMessages;
  /** Промежуточный и финальный текст — вызывается по мере распознавания. */
  onText: (text: string) => void;
  /** Ошибка или зависание: показать пользователю. */
  onError: (message: string) => void;
  /** Запись реально началась — микрофон открыт. */
  onStart?: () => void;
  /** Финальный текст, если он есть. */
  onDone?: (text: string) => void;
}

/**
 * Голосовой ввод с явными состояниями: запрос разрешения → запись → результат.
 * Любой отказ, ошибка и зависание микрофона доходят до пользователя (BUG-25).
 */
export function useVoiceInput({ messages, onText, onError, onStart, onDone }: Options) {
  const [state, setState] = useState<VoiceState>("idle");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const cb = useRef({ messages, onText, onError, onStart, onDone });
  cb.current = { messages, onText, onError, onStart, onDone };

  useEffect(() => {
    if (!getCtor()) setState("unsupported");
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      recognitionRef.current?.abort();
    },
    [],
  );

  const stop = useCallback(() => {
    window.clearTimeout(timerRef.current);
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setState("unsupported");
      cb.current.onError(cb.current.messages.unsupported);
      return;
    }

    const rec = new Ctor();
    rec.lang = "ru-RU";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    let started = false;

    const finish = () => {
      window.clearTimeout(timerRef.current);
      recognitionRef.current = null;
      setState("idle");
    };

    rec.onstart = () => {
      started = true;
      window.clearTimeout(timerRef.current);
      setState("listening");
      cb.current.onStart?.();
    };
    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += chunk;
        else interim += chunk;
      }
      cb.current.onText((finalText + interim).trim());
    };
    rec.onerror = (event) => {
      finish();
      cb.current.onError(messageFor(event.error, cb.current.messages));
    };
    rec.onend = () => {
      finish();
      const value = finalText.trim();
      if (value) cb.current.onDone?.(value);
    };

    recognitionRef.current = rec;
    setState("requesting");
    try {
      rec.start();
    } catch {
      finish();
      cb.current.onError(cb.current.messages.startFailed);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      if (started) return;
      rec.abort();
      finish();
      cb.current.onError(cb.current.messages.timeout);
    }, START_TIMEOUT_MS);
  }, []);

  const toggle = useCallback(() => {
    if (state === "unsupported") {
      cb.current.onError(cb.current.messages.unsupported);
      return;
    }
    if (state === "idle") start();
    else stop();
  }, [state, start, stop]);

  return { state, toggle, active: state === "requesting" || state === "listening" };
}
