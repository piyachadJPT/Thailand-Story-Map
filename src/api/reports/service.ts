import { prisma } from "@/api/db/prisma";
import type { CreateReportInput } from "@/models/schemas";

export async function createReport(input: CreateReportInput, reporterId?: string) {
  return prisma.report.create({
    data: {
      storyId: input.storyId,
      reason: input.reason,
      reporterId: reporterId ?? null,
    },
    select: { id: true, status: true, createdAt: true },
  });
}
