const THAI_DIGITS = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];

/** Replaces Arabic digits with Thai digits; other characters are kept. */
export function toThaiDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => THAI_DIGITS[Number(digit)]);
}

/**
 * Two-digit decorative ordinal in Thai digits: 1 → "๐๑", 12 → "๑๒".
 * For ornaments only (step numbers, figure numbers); keep Arabic digits for data.
 */
export function thaiOrdinal(value: number): string {
  return toThaiDigits(String(value).padStart(2, "0"));
}
