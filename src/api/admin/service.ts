import { StoryStatus } from "@prisma/client";
import { prisma } from "@/api/db/prisma";
import { NotFoundError } from "@/api/common/errors";

export async function listPendingStories() {
  return prisma.story.findMany({
    where: { status: StoryStatus.PENDING },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      author: { select: { id: true, name: true, email: true } },
      province: { select: { slug: true, name: true } },
      category: { select: { slug: true, name: true } },
    },
  });
}

export async function moderateStory(
  storyId: string,
  action: "APPROVE" | "REJECT",
  adminId: string,
  rejectReason?: string,
) {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new NotFoundError("Story not found");

  const status = action === "APPROVE" ? StoryStatus.APPROVED : StoryStatus.REJECTED;

  const [updated] = await prisma.$transaction([
    prisma.story.update({
      where: { id: storyId },
      data: {
        status,
        rejectReason: action === "REJECT" ? rejectReason ?? "Rejected by moderator" : null,
      },
      select: { id: true, status: true, slug: true },
    }),
    prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetId: storyId,
        note: rejectReason,
      },
    }),
  ]);

  return updated;
}
