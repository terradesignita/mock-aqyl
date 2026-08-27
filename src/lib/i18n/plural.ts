/**
 * Правила согласования существительного с числом. У каждого языка своё:
 * русский — три формы, английский — две, казахский после числительного
 * существительное не изменяет (3 файл, а не 3 файлдар).
 */

/** Русский: 1 файл, 2 файла, 5 файлов, 11 файлов. */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** Английский: 1 file, 2 files. */
export function pluralEn(n: number, one: string, other: string): string {
  return n === 1 ? one : other;
}
