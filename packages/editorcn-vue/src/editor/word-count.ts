const CJK =
  /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/;

/**
 * Counts words the way a Chinese/English editor should: every CJK character is
 * a word, and contiguous runs of other scripts count as one word each.
 */
export const countWords = (text: string): number => {
  let words = 0;
  let inWord = false;
  for (const char of text) {
    if (CJK.test(char)) {
      words += 1;
      inWord = false;
    } else if (/[\p{L}\p{N}]/u.test(char)) {
      if (!inWord) {
        words += 1;
        inWord = true;
      }
    } else if (/['’]/.test(char) && inWord) {
      // Apostrophes keep a contraction together ("don't").
      continue;
    } else {
      inWord = false;
    }
  }
  return words;
};

/** Visible characters, excluding line/paragraph breaks. */
export const countCharacters = (text: string): number =>
  [...text.replace(/[\n\r]/g, "")].length;
