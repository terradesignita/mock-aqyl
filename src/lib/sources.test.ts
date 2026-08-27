import { describe, expect, it } from "vitest";
import {
  deriveTitle,
  extensionOf,
  familyOf,
  formatBytes,
  isAcceptedFormat,
  sourceToMarkdown,
  stageIdsFor,
  triageFiles,
  uploadedSource,
} from "@/lib/sources";
import { ru } from "@/lib/i18n/ru";
import { en } from "@/lib/i18n/en";
import { kk } from "@/lib/i18n/kk";

describe("проверка форматов загрузки", () => {
  it("определяет расширение, в том числе у составных имён", () => {
    expect(extensionOf("konspekt.final.PDF")).toBe("pdf");
    expect(extensionOf("без-точки")).toBe("");
  });

  it("принимает форматы тренингов, включая слайды и видео", () => {
    expect(isAcceptedFormat("deck.pdf")).toBe(true);
    expect(isAcceptedFormat("record.m4a")).toBe(true);
    expect(isAcceptedFormat("deck.pptx")).toBe(true);
    expect(isAcceptedFormat("record.mp4")).toBe(true);
  });

  it("отклоняет таблицы, архивы и файлы без расширения", () => {
    expect(isAcceptedFormat("table.csv")).toBe(false);
    expect(isAcceptedFormat("budget.xlsx")).toBe(false);
    expect(isAcceptedFormat("materials.zip")).toBe(false);
    expect(isAcceptedFormat("README")).toBe(false);
  });

  it("разделяет пачку файлов на принятые и отклонённые — без молчаливых отказов", () => {
    const files = ["a.md", "b.pptx", "c.wav", "d.csv"].map((name) => ({ name }) as unknown as File);
    const { accepted, rejected } = triageFiles(files);
    expect(accepted.map((f) => f.name)).toEqual(["a.md", "b.pptx", "c.wav"]);
    expect(rejected.map((f) => f.name)).toEqual(["d.csv"]);
  });
});

describe("выгрузка источника", () => {
  it("считает размер в человеческих единицах", () => {
    expect(formatBytes(512, ru)).toBe("512 Б");
    expect(formatBytes(2048, ru)).toBe("2 КБ");
    expect(formatBytes(3 * 1024 * 1024, ru)).toBe("3.0 МБ");
    expect(formatBytes(2048, en)).toBe("2 KB");
  });

  it("собирает markdown с заголовком и всеми разделами", () => {
    const source = uploadedSource(
      {
        id: "u1",
        title: "Конспект тренинга",
        format: "MD",
        size: "12 КБ",
        date: "21.08.2026",
      },
      ru,
    );
    const md = sourceToMarkdown(source);
    expect(md.startsWith("# Конспект тренинга")).toBe(true);
    expect(md).toContain("## Содержимое");
    expect(md).toContain("MD · 12 КБ");
  });
});

describe("пайплайн обработки", () => {
  it("подбирает цепочку этапов под формат", () => {
    const labels = (name: string) => stageIdsFor(name);
    expect(labels("konspekt.md")).toEqual(["queued", "embedding", "wiki"]);
    expect(labels("otchet.pdf")).toEqual(["queued", "parsing", "embedding", "wiki"]);
    expect(labels("deka.pptx")).toEqual(["queued", "converting", "parsing", "embedding", "wiki"]);
    expect(labels("zapis.mp3")).toEqual(["queued", "transcribing", "embedding", "wiki"]);
    expect(labels("zapis.mp4")).toEqual([
      "queued",
      "extracting",
      "transcribing",
      "embedding",
      "wiki",
    ]);
  });

  it("относит расширение к семейству материалов", () => {
    expect(familyOf("a.md")).toBe("text");
    expect(familyOf("a.docx")).toBe("document");
    expect(familyOf("a.pptx")).toBe("slides");
    expect(familyOf("a.wav")).toBe("audio");
    expect(familyOf("a.mov")).toBe("video");
  });
});

describe("название материала", () => {
  it("берёт заголовок из содержимого текстового файла", async () => {
    const file = new File(
      ["# Выход BI Group на рынок Грузии\n\nКонтекст и вводные."],
      "cjm-test-georgia.md",
      { type: "text/markdown" },
    );
    expect(await deriveTitle(file, ru, "ru-RU")).toBe("Выход BI Group на рынок Грузии");
  });

  it("берёт первое предложение, если заголовка нет", async () => {
    const file = new File(
      ["Сервисная культура строится на ритуалах. Второе предложение."],
      "n.txt",
    );
    expect(await deriveTitle(file, ru, "ru-RU")).toBe("Сервисная культура строится на ритуалах.");
  });

  it("выводит название из таймстемпа для аудио", async () => {
    const file = new File([""], "audio_2026-04-07_14-24-15.mp3");
    expect(await deriveTitle(file, ru, "ru-RU")).toBe("Аудиозапись от 7 апреля 2026 г., 14:24");
    expect(await deriveTitle(file, en, "en-US")).toBe("Audio recording from April 7, 2026, 14:24");
    expect(await deriveTitle(file, kk, "kk-KZ")).toContain("Аудиожазба");
  });

  it("причёсывает имя файла, когда больше опереться не на что", async () => {
    const file = new File([""], "lessons_learned-severny.pdf");
    expect(await deriveTitle(file, ru, "ru-RU")).toBe("Lessons learned severny");
  });
});
