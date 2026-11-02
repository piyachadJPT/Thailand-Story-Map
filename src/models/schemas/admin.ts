import { z } from "zod";
import { ReportReason } from "@/models/enums";

const reason = z
  .string({ error: "กรุณาระบุเหตุผล" })
  .trim()
  .min(3, "เหตุผลต้องยาวอย่างน้อย 3 ตัวอักษร")
  .max(500, "เหตุผลต้องยาวไม่เกิน 500 ตัวอักษร");
const optionalNote = z.string().trim().max(500, "หมายเหตุต้องยาวไม่เกิน 500 ตัวอักษร").optional();

export const adminLoginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, "กรุณากรอกชื่อผู้ใช้").max(64),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน").max(256),
});

export const adminPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านเดิม").max(256),
  newPassword: z.string().min(1).max(256),
});

export const moderateStorySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("APPROVE") }),
  z.object({ action: z.literal("REJECT"), reason }),
  z.object({ action: z.literal("HIDE"), reason }),
  z.object({ action: z.literal("RESTORE") }),
]);
export type ModerateStoryInput = z.infer<typeof moderateStorySchema>;
export type StoryModerationAction = ModerateStoryInput["action"];

export const resolveReportsSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("DISMISS"), note: optionalNote }),
  z.object({ action: z.literal("HIDE_STORY"), note: reason }),
]);
export type ResolveReportsInput = z.infer<typeof resolveReportsSchema>;

export const moderateUserSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("BAN"), reason, hideStories: z.boolean().default(false) }),
  z.object({ action: z.literal("UNBAN"), reason: optionalNote }),
]);
export type ModerateUserInput = z.infer<typeof moderateUserSchema>;

const page = z.coerce.number().int().min(1).max(10_000).default(1);
const pageSize = z.coerce.number().int().min(1).max(50).default(20);
const flag = z
  .enum(["1", "0", "true", "false"])
  .optional()
  .transform((value) => value === "1" || value === "true");
const search = z.string().trim().max(100).optional();

export const paginationSchema = z.object({ page, pageSize });

export const adminStoriesQuerySchema = z.object({
  page,
  pageSize,
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  q: search,
  categoryId: z.string().uuid().optional(),
  provinceId: z.string().uuid().optional(),
  hasReports: flag,
  sort: z.enum(["oldest", "newest", "reports"]).optional(),
});
export type AdminStoriesQuery = z.infer<typeof adminStoriesQuerySchema>;

export const adminReportsQuerySchema = z.object({
  page,
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["OPEN", "RESOLVED"]).default("OPEN"),
  reasonType: z.enum(Object.values(ReportReason) as [ReportReason, ...ReportReason[]]).optional(),
});
export type AdminReportsQuery = z.infer<typeof adminReportsQuerySchema>;

export const adminUsersQuerySchema = z.object({
  page,
  pageSize,
  q: search,
  tab: z.enum(["all", "active", "banned", "admin"]).default("all"),
  hasReports: flag,
  noStories: flag,
  sort: z.enum(["recent", "stories", "reports", "name"]).default("recent"),
});
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional();

export const adminAuditQuerySchema = z.object({
  page,
  pageSize: z.coerce.number().int().min(1).max(50).default(30),
  action: z.string().trim().max(40).optional(),
  adminId: z.string().uuid().optional(),
  from: day,
  to: day,
});
export type AdminAuditQuery = z.infer<typeof adminAuditQuerySchema>;

export const overviewRangeSchema = z.object({
  range: z.coerce
    .number()
    .refine((value) => [7, 30, 90].includes(value), "ช่วงเวลาต้องเป็น 7, 30 หรือ 90 วัน")
    .default(30),
});

export const adminSearchSchema = z.object({ q: z.string().trim().min(1).max(100) });
