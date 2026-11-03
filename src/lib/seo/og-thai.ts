/**
 * Thai glyph selection for Open Graph images (Satori cannot run Kanit's own
 * substitution rules). Marks are swapped for the pre-positioned Kanit glyphs
 * mapped to private-use code points by scripts/build-og-fonts.py.
 */

const SMALL = 0xf700; // raised tone mark / lowered below-vowel
const NARROW = 0xf800; // shifted left for tall consonants

const TALL = new Set(["ป", "ฝ", "ฟ", "ฬ"]);
const ABOVE = new Set(["ั", "ิ", "ี", "ึ", "ื", "็", "ํ"]);
const TONE = new Set(["่", "้", "๊", "๋", "์"]);
const BELOW = new Set(["ุ", "ู", "ฺ"]);
const SARA_AM = "ำ";
/** ญ ฐ lose their lower tail, ฎ ฏ their short tail, when a below-vowel is attached. */
const TAILLESS: Record<string, number> = { "ญ": 0xf70d, "ฐ": 0xf710, "ฎ": 0xf70e, "ฏ": 0xf70f };

const isMark = (char: string) => ABOVE.has(char) || TONE.has(char) || BELOW.has(char);
const variant = (base: number, char: string) => String.fromCharCode(base + (char.charCodeAt(0) & 0xff));

export function shapeThaiForOg(text: string): string {
  const chars = [...text];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const consonant = chars[i];
    // Collect the marks stacked on this character.
    let end = i + 1;
    while (end < chars.length && isMark(chars[end])) end++;
    const marks = chars.slice(i + 1, end);
    if (!marks.length) {
      out += consonant;
      continue;
    }
    const tall = TALL.has(consonant);
    const hasAbove = marks.some((mark) => ABOVE.has(mark)) || chars[end] === SARA_AM;
    const hasBelow = marks.some((mark) => BELOW.has(mark));
    out += hasBelow && TAILLESS[consonant] ? String.fromCharCode(TAILLESS[consonant]) : consonant;
    for (const mark of marks) {
      if (ABOVE.has(mark)) out += tall ? variant(NARROW, mark) : mark;
      else if (TONE.has(mark)) out += hasAbove ? variant(SMALL, mark) : tall ? variant(NARROW, mark) : mark;
      else out += mark;
    }
    i = end - 1;
  }
  return out;
}
