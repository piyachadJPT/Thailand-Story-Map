import {
  Ban,
  Copyright,
  EyeOff,
  Megaphone,
  MessageCircleQuestion,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReportReason } from "@/models/enums";

/** Report categories shown to readers and in the backoffice. */
export const reportReasons: {
  value: ReportReason;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { value: "FALSE_INFO", label: "ข้อมูลเท็จหรือบิดเบือน", hint: "ข้อเท็จจริงผิด หรือทำให้เข้าใจผิด", icon: ShieldAlert },
  { value: "INAPPROPRIATE", label: "เนื้อหาไม่เหมาะสม", hint: "รุนแรง หยาบคาย หรือสร้างความเกลียดชัง", icon: Ban },
  { value: "COPYRIGHT", label: "ละเมิดลิขสิทธิ์", hint: "ใช้ข้อความหรือรูปของผู้อื่นโดยไม่ได้รับอนุญาต", icon: Copyright },
  { value: "PRIVACY", label: "ละเมิดความเป็นส่วนตัว", hint: "เปิดเผยข้อมูลส่วนบุคคลของผู้อื่น", icon: EyeOff },
  { value: "SPAM", label: "สแปมหรือโฆษณา", hint: "ขายของ ลิงก์ชวนเชื่อ หรือเนื้อหาซ้ำ ๆ", icon: Megaphone },
  { value: "OTHER", label: "อื่นๆ", hint: "อธิบายปัญหาที่พบในช่องรายละเอียด", icon: MessageCircleQuestion },
];

export function reportReasonLabel(value: string) {
  return reportReasons.find((reason) => reason.value === value)?.label ?? value;
}
