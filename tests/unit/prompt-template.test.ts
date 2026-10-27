import { describe, expect, it } from "vitest";
import { blankNames, fillTemplate, humanizeBlank, parseTemplate } from "@/lib/prompt-template";

describe("parseTemplate", () => {
  it("splits text and blanks in order", () => {
    expect(parseTemplate("A {{subject}} on a {{ place }}.")).toEqual([
      { type: "text", value: "A " },
      { type: "blank", name: "subject", raw: "{{subject}}" },
      { type: "text", value: " on a " },
      { type: "blank", name: "place", raw: "{{ place }}" },
      { type: "text", value: "." },
    ]);
  });

  it("handles templates with no blanks, only blanks, and adjacent blanks", () => {
    expect(parseTemplate("plain")).toEqual([{ type: "text", value: "plain" }]);
    expect(parseTemplate("")).toEqual([]);
    expect(parseTemplate("{{a}}{{b}}")).toEqual([
      { type: "blank", name: "a", raw: "{{a}}" },
      { type: "blank", name: "b", raw: "{{b}}" },
    ]);
  });

  it("ignores malformed braces and code-like content", () => {
    const t = "const x = {a: 1}; {{ 9bad }} {{}} {single} {{ok-name}}";
    const blanks = parseTemplate(t).filter((s) => s.type === "blank");
    expect(blanks).toEqual([{ type: "blank", name: "ok-name", raw: "{{ok-name}}" }]);
  });

  it("round-trips: joining raw segments returns the original", () => {
    const t = "Hi {{ name }}, meet {{friend}} at {{place}}!";
    const joined = parseTemplate(t)
      .map((s) => (s.type === "text" ? s.value : s.raw))
      .join("");
    expect(joined).toBe(t);
  });
});

describe("blankNames", () => {
  it("returns unique names in first-seen order", () => {
    expect(blankNames("{{b}} {{a}} {{b}} {{c}}")).toEqual(["b", "a", "c"]);
  });
});

describe("fillTemplate", () => {
  it("fills every occurrence and keeps unfilled blanks visible", () => {
    expect(fillTemplate("{{a}} and {{a}} with {{b}}", { a: "cats" })).toBe(
      "cats and cats with {{b}}",
    );
  });

  it("treats whitespace-only values as empty and trims values", () => {
    expect(fillTemplate("A {{x}}", { x: "   " })).toBe("A {{x}}");
    expect(fillTemplate("A {{x}}", { x: "  fox " })).toBe("A fox");
  });

  it("normalises spaced blanks when unfilled", () => {
    expect(fillTemplate("A {{ x }}", {})).toBe("A {{x}}");
  });
});

describe("humanizeBlank", () => {
  it("makes readable labels", () => {
    expect(humanizeBlank("camera_angle")).toBe("Camera angle");
    expect(humanizeBlank("brand-name")).toBe("Brand name");
    expect(humanizeBlank("productName")).toBe("Product name");
    expect(humanizeBlank("subject")).toBe("Subject");
  });
});
