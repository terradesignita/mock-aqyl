import { describe, expect, it } from "vitest";
import { clampWidth } from "./useResizablePanel";

describe("clampWidth", () => {
  it("clamps values below the minimum up to the minimum", () => {
    expect(clampWidth(100, 220, 520)).toBe(220);
  });

  it("clamps values above the maximum down to the maximum", () => {
    expect(clampWidth(900, 220, 520)).toBe(520);
  });

  it("passes through values already inside the range", () => {
    expect(clampWidth(300, 220, 520)).toBe(300);
  });
});
