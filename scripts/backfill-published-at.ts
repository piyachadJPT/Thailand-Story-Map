/**
 * Sets publishedAt = createdAt for APPROVED stories that have no publish date yet
 * (stories approved before the publishedAt column existed).
 *   npm run seo:backfill-published            → dry run: prints what would change
 *   npm run seo:backfill-published -- --apply → writes
 */
import { PrismaClient, StoryStatus } from "@prisma/client";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const stories = await prisma.story.findMany({
    where: { status: StoryStatus.APPROVED, publishedAt: null },
    select: { id: true, slug: true, title: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  if (!stories.length) {
    console.log("ทุกเรื่องที่เผยแพร่แล้วมี publishedAt ครบ");
    return;
  }
  console.log(apply ? "APPLY — กำลังเขียนลงฐานข้อมูล\n" : "DRY RUN — ยังไม่เขียนอะไร (ใส่ --apply เพื่อเขียนจริง)\n");
  console.table(stories.map((story) => ({ slug: story.slug, title: story.title, publishedAt: story.createdAt.toISOString() })));
  if (!apply) return;
  let done = 0;
  for (const story of stories) {
    // updateMany + publishedAt: null never overwrites a date set in the meantime.
    const { count } = await prisma.story.updateMany({
      where: { id: story.id, publishedAt: null },
      data: { publishedAt: story.createdAt },
    });
    done += count;
  }
  console.log(`\nตั้งค่าแล้ว ${done}/${stories.length} เรื่อง`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
