const russianAlphabet = [
  "а",
  "б",
  "в",
  "г",
  "д",
  "е",
  "ё",
  "ж",
  "з",
  "и",
  "й",
  "к",
  "л",
  "м",
  "н",
  "о",
  "п",
  "р",
  "с",
  "т",
  "у",
  "ф",
  "х",
  "ц",
  "ч",
  "ш",
  "щ",
  "ъ",
  "ы",
  "ь",
  "э",
  "ю",
  "я",
];

export function russianCompare(a: string, b: string) {
  const strA = a.toLowerCase().replace(/\s+/g, "");
  const strB = b.toLowerCase().replace(/\s+/g, "");

  const len = Math.max(strA.length, strB.length);

  for (let i = 0; i < len; i++) {
    const charA = strA[i] || "";
    const charB = strB[i] || "";

    const indexA = russianAlphabet.indexOf(charA) ?? 1000;
    const indexB = russianAlphabet.indexOf(charB) ?? 1000;

    if (indexA !== indexB) return indexA - indexB;
  }

  return 0;
}
