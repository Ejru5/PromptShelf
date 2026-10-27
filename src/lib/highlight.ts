import { cacheLife } from "next/cache";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const LANGS = {
  tsx: () => import("shiki/langs/tsx.mjs"),
  ts: () => import("shiki/langs/typescript.mjs"),
  js: () => import("shiki/langs/javascript.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  bash: () => import("shiki/langs/bash.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
} as const;
const ALIASES: Record<string, keyof typeof LANGS> = {
  typescript: "ts",
  javascript: "js",
  sh: "bash",
  shell: "bash",
  md: "markdown",
  yml: "yaml",
  py: "python",
};
const THEME = "github-dark-default";

let highlighter: Promise<HighlighterCore> | undefined;
function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [import("shiki/themes/github-dark-default.mjs")],
    langs: Object.values(LANGS).map((load) => load()),
    // The JS engine avoids shipping/initialising Oniguruma WASM on the server.
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** Syntax-highlight code to HTML. Unknown languages fall back to plain text. */
export async function highlightCode(code: string, language: string): Promise<string> {
  const h = await getHighlighter();
  const key = (ALIASES[language] ?? language) as keyof typeof LANGS;
  const lang =
    key in LANGS ? (key === "ts" ? "typescript" : key === "js" ? "javascript" : key) : "text";
  return h.codeToHtml(code, { lang, theme: THEME });
}

/**
 * Cached wrapper used by server components: the output is pure for a given input,
 * and the highlighter reads the clock internally, which Cache Components only
 * allows inside a cache scope.
 */
export async function highlight(code: string, language: string): Promise<string> {
  "use cache";
  cacheLife("max");
  return highlightCode(code, language);
}
