import { redirect, notFound } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import StoryEditForm from "@/components/story/StoryEditForm";
import { getSessionUser } from "@/api/auth/session";
import { getOwnedStory } from "@/api/stories/service";
import { ForbiddenError, NotFoundError } from "@/api/common/errors";
import { prisma } from "@/api/db/prisma";
import { privatePageRobots } from "@/lib/seo/metadata";

export const metadata = { title: "แก้ไขเรื่องราว", robots: privatePageRobots };

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
    <PageContainer width="narrow">
      <PageHero
        title="แก้ไขเรื่องราว"
        description="ปรับปรุงเรื่องเล่าและตำแหน่งของคุณ แล้วบันทึกการเปลี่ยนแปลง"
      />
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
    </PageContainer>
  );
}
