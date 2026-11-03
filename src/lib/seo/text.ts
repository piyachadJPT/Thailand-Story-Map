const wordSegmenter = new Intl.Segmenter("th", { granularity: "word" });
const graphemeSegmenter = new Intl.Segmenter("th", { granularity: "grapheme" });

/** Plain single-line text: strips HTML/markdown markup and collapses whitespace. */
export function plainText(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>~]+/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cuts text to at most `max` characters (including the "…") on a word boundary.
 * Thai has no spaces, so words come from Intl.Segmenter; a single overlong word
 * falls back to grapheme clusters so vowels and tone marks stay on their consonant.
 */
export function truncateThai(text: string, max: number, ellipsis = "…"): string {
  const clean = plainText(text);
  if (clean.length <= max) return clean;
  const budget = max - ellipsis.length;
  let out = "";
  for (const { segment } of wordSegmenter.segment(clean)) {
    if (out.length + segment.length > budget) break;
    out += segment;
  }
  if (!out.trim()) {
    for (const { segment } of graphemeSegmenter.segment(clean)) {
      if (out.length + segment.length > budget) break;
      out += segment;
    }
  }
  return `${out.replace(/[\s,.;:!?\-–—]+$/u, "")}${ellipsis}`;
}

/** Cuts to `max` characters on a word boundary, without adding an ellipsis. */
export function cutAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  let out = "";
  for (const { segment } of wordSegmenter.segment(text)) {
    if (out.length + segment.length > max) break;
    out += segment;
  }
  if (!out) {
    for (const { segment } of graphemeSegmenter.segment(text)) {
      if (out.length + segment.length > max) break;
      out += segment;
    }
  }
  return out;
}

/** Thai words separated by zero-width spaces, so renderers without Thai line breaking can wrap. */
export function withThaiBreaks(text: string): string {
  return [...wordSegmenter.segment(text)].map((part) => part.segment).join("​");
}
