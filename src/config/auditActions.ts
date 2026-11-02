import {
  CheckCircle2,
  EyeOff,
  KeyRound,
  LogIn,
  LogOut,
  RotateCcw,
  ShieldBan,
  ShieldCheck,
  ThumbsDown,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export const AUDIT_TARGET = {
  STORY: "STORY",
  REPORT: "REPORT",
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type AuditTargetType = (typeof AUDIT_TARGET)[keyof typeof AUDIT_TARGET];

export const AUDIT_ACTION = {
  STORY_APPROVE: "STORY_APPROVE",
  STORY_REJECT: "STORY_REJECT",
  STORY_HIDE: "STORY_HIDE",
  STORY_RESTORE: "STORY_RESTORE",
  REPORT_DISMISS: "REPORT_DISMISS",
  REPORT_HIDE_STORY: "REPORT_HIDE_STORY",
  USER_BAN: "USER_BAN",
  USER_UNBAN: "USER_UNBAN",
  ADMIN_LOGIN: "ADMIN_LOGIN",
  ADMIN_LOGOUT_ALL: "ADMIN_LOGOUT_ALL",
  ADMIN_PASSWORD_CHANGE: "ADMIN_PASSWORD_CHANGE",
} as const;
export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

type Tone = "success" | "warning" | "destructive" | "neutral";

/** Display copy for each action. `verb` reads as "<admin> <verb> <target>". */
export const auditActionMeta: Record<
  string,
  { label: string; verb: string; icon: LucideIcon; tone: Tone }
> = {
  STORY_APPROVE: { label: "อนุมัติเรื่อง", verb: "อนุมัติเรื่อง", icon: CheckCircle2, tone: "success" },
  STORY_REJECT: { label: "ปฏิเสธเรื่อง", verb: "ปฏิเสธเรื่อง", icon: XCircle, tone: "destructive" },
  STORY_HIDE: { label: "ซ่อนเรื่อง", verb: "ซ่อนเรื่อง", icon: EyeOff, tone: "destructive" },
  STORY_RESTORE: { label: "กู้คืนเรื่อง", verb: "กู้คืนเรื่อง", icon: RotateCcw, tone: "success" },
  REPORT_DISMISS: {
    label: "ปิดรายงาน (ไม่มีมูล)",
    verb: "ปิดรายงานว่าไม่มีมูลของเรื่อง",
    icon: ThumbsDown,
    tone: "neutral",
  },
  REPORT_HIDE_STORY: {
    label: "ซ่อนเรื่องจากรายงาน",
    verb: "ซ่อนเรื่องตามรายงานของ",
    icon: EyeOff,
    tone: "destructive",
  },
  USER_BAN: { label: "ระงับผู้ใช้", verb: "ระงับผู้ใช้", icon: ShieldBan, tone: "destructive" },
  USER_UNBAN: { label: "ยกเลิกระงับผู้ใช้", verb: "ยกเลิกระงับผู้ใช้", icon: ShieldCheck, tone: "success" },
  ADMIN_LOGIN: { label: "เข้าสู่ระบบ", verb: "เข้าสู่ระบบ", icon: LogIn, tone: "neutral" },
  ADMIN_LOGOUT_ALL: {
    label: "ออกจากระบบอุปกรณ์อื่น",
    verb: "ออกจากระบบทุกอุปกรณ์อื่น",
    icon: LogOut,
    tone: "neutral",
  },
  ADMIN_PASSWORD_CHANGE: {
    label: "เปลี่ยนรหัสผ่าน",
    verb: "เปลี่ยนรหัสผ่าน",
    icon: KeyRound,
    tone: "warning",
  },
  // Values written before the backoffice existed.
  APPROVE: { label: "อนุมัติเรื่อง (เดิม)", verb: "อนุมัติเรื่อง", icon: CheckCircle2, tone: "success" },
  REJECT: { label: "ปฏิเสธเรื่อง (เดิม)", verb: "ปฏิเสธเรื่อง", icon: XCircle, tone: "destructive" },
};

export function auditMeta(action: string) {
  return (
    auditActionMeta[action] ?? { label: action, verb: action, icon: CheckCircle2, tone: "neutral" as Tone }
  );
}

/** Actions that mean a story was taken down at some point. */
export const STORY_TAKEDOWN_ACTIONS = [
  AUDIT_ACTION.STORY_REJECT,
  AUDIT_ACTION.STORY_HIDE,
  AUDIT_ACTION.REPORT_HIDE_STORY,
  "REJECT",
];
