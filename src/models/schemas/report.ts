import { z } from "zod";
import { ReportReason } from "@/models/enums";

export const REPORT_DETAILS_MIN = 10;
export const REPORT_DETAILS_MIN_OTHER = 20;
export const REPORT_DETAILS_MAX = 1000;

export const createReportSchema = z
  .object({
    storyId: z.string().uuid(),
    reasonType: z.enum(Object.values(ReportReason) as [ReportReason, ...ReportReason[]], {
      error: "กรุณาเลือกประเภทการรายงาน",
    }),
    details: z
      .string()
      .trim()
      .min(REPORT_DETAILS_MIN, `กรุณาอธิบายอย่างน้อย ${REPORT_DETAILS_MIN} ตัวอักษร`)
      .max(REPORT_DETAILS_MAX, `รายละเอียดต้องยาวไม่เกิน ${REPORT_DETAILS_MAX} ตัวอักษร`),
  })
  .superRefine((value, context) => {
    if (value.reasonType === ReportReason.OTHER && value.details.length < REPORT_DETAILS_MIN_OTHER) {
      context.addIssue({
        code: "custom",
        path: ["details"],
        message: `เมื่อเลือก "อื่นๆ" กรุณาอธิบายอย่างน้อย ${REPORT_DETAILS_MIN_OTHER} ตัวอักษร`,
      });
    }
  });

export type CreateReportInput = z.infer<typeof createReportSchema>;
