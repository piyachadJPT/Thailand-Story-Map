import { redirect, notFound } from "next/navigation";
import StoryEditForm from "@/components/story/StoryEditForm";
import { getSessionUser } from "@/api/auth/session";
import { getOwnedStory } from "@/api/stories/service";
import { ForbiddenError, NotFoundError } from "@/api/common/errors";
import { prisma } from "@/api/db/prisma";

export const metadata = { title: "แก้ไขเรื่องราว" };

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user)
    redirect(`/login?callbackUrl=${encodeURIComponent(`/story/edit/${id}`)}`);
  if (user.status === "BANNED") notFound();
  const story = await getOwnedStory(id, user.id).catch((error: unknown) => {
    if (error instanceof ForbiddenError || error instanceof NotFoundError)
      notFound();
    throw error;
  });
  const [categories, provinces] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.province.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
        <h1 className="mb-2 text-2xl font-semibold">แก้ไขเรื่องราว</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          ปรับปรุงเรื่องเล่าและตำแหน่งของคุณ แล้วบันทึกการเปลี่ยนแปลง
        </p>
        <StoryEditForm
          story={{
            id: story.id,
            coverUrl: story.images[0]?.url ?? null,
            title: story.title,
            summary: story.summary,
            content: story.content,
            categoryId: story.categoryId,
            provinceId: story.provinceId,
            latitude: story.latitude,
            longitude: story.longitude,
            sourceUrl: story.sourceUrl,
            isSensitive: story.isSensitive,
            needsReview:
              story.category.slug === "crime" || story.status !== "APPROVED",
          }}
          categories={categories}
          provinces={provinces}
        />
      </div>
    </>
  );
}
