import { describe, expect, it } from "vitest";

import { countCharacters, countWords } from "./word-count";

describe("countWords", () => {
  it("counts runs of latin letters as one word", () => {
    expect(countWords("hello world")).toBe(2);
    expect(countWords("  spaced   out  ")).toBe(2);
    expect(countWords("don't stop-me now")).toBe(4);
  });

  it("counts each CJK character as a word", () => {
    expect(countWords("你好世界")).toBe(4);
    expect(countWords("我爱 Vue 3")).toBe(4);
  });

  it("mixes scripts without gluing them together", () => {
    expect(countWords("Hello 世界")).toBe(3);
    expect(countWords("2026 年 10 月")).toBe(4);
  });

  it("ignores punctuation and empty input", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("!!! ... 。。。")).toBe(0);
  });
});

describe("countCharacters", () => {
  it("counts visible characters, not ProseMirror structure", () => {
    expect(countCharacters("hello")).toBe(5);
    expect(countCharacters("你好")).toBe(2);
  });

  it("ignores line breaks", () => {
    expect(countCharacters("a\nb\r\nc")).toBe(3);
  });
});
