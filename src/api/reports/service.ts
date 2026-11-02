import { ReportStatus, StoryStatus } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import { ConflictError, NotFoundError } from "@/api/common/errors";
import type { CreateReportInput } from "@/models/schemas";

export const DUPLICATE_REPORT_MESSAGE = "คุณรายงานเรื่องนี้ไปแล้ว ทีมงานกำลังตรวจสอบ";

/** Only published stories can be reported. Signed-in users get one open report per story. */
export async function createReport(input: CreateReportInput, reporterId?: string) {
  const story = await prisma.story.findFirst({
    where: { id: input.storyId, status: StoryStatus.APPROVED },
    select: { id: true },
  });
  if (!story) throw new NotFoundError("ไม่พบเรื่องนี้");
  if (reporterId) {
    const existing = await prisma.report.findFirst({
      where: { storyId: input.storyId, reporterId, status: ReportStatus.OPEN },
      select: { id: true },
    });
    if (existing) throw new ConflictError(DUPLICATE_REPORT_MESSAGE);
  }
  return prisma.report.create({
    data: {
      storyId: input.storyId,
      reasonType: input.reasonType,
      reason: input.details,
      reporterId: reporterId ?? null,
    },
    select: { id: true, status: true, createdAt: true },
  });
}
