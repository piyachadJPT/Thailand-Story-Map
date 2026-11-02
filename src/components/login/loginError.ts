/** Auth.js error codes (?error=…) → messages shown on /login. Unchanged copy. */
const errorMessages: Record<string, string> = {
  Configuration: "ยังตั้งค่า Google OAuth ไม่ครบ ตรวจ AUTH_GOOGLE_ID และ AUTH_GOOGLE_SECRET",
  AccessDenied: "เข้าสู่ระบบไม่ได้ บัญชีถูกระงับ หรืออีเมล Google ยังไม่ยืนยัน",
  OAuthAccountNotLinked: "อีเมลนี้ผูกกับวิธีเข้าสู่ระบบอื่นแล้ว",
  Verification: "ลิงก์ยืนยันหมดอายุหรือถูกใช้ไปแล้ว",
};

export function loginErrorMessage(code: string | undefined, googleConfigured: boolean) {
  if (!code) return null;
  if (code === "Configuration" && googleConfigured) {
    return "เข้าสู่ระบบกับ Google แล้ว แต่ยังบันทึกบัญชีลงฐานข้อมูลไม่ได้";
  }
  return errorMessages[code] ?? "เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง";
}

export function safeCallbackUrl(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
