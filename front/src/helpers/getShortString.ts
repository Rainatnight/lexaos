/**
 * Возвращает укороченную версию строки с "..." в конце, если длина превышает maxLength
 * @param text - исходная строка
 * @param maxLength - максимальная длина строки
 * @returns укороченная строка
 */
export const getShortString = (text: string, maxLength: number) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};
