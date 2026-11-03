/**
 * Gives old "story-<timestamp>" slugs a readable slug from the title and keeps
 * the old URL working through story_slug_redirects (308 to the new URL).
 *   npm run seo:migrate-slugs            → dry run: prints old → new, writes nothing
 *   npm run seo:migrate-slugs -- --apply → writes (one transaction per story)
 */
import { PrismaClient } from "@prisma/client";
import { createStorySlug, LEGACY_SLUG } from "../src/lib/seo/slug";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const candidates = await prisma.story.findMany({
    where: { slug: { startsWith: "story-" } },
    select: { id: true, slug: true, title: true, status: true, province: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });
  const stories = candidates.filter((story) => LEGACY_SLUG.test(story.slug));
  if (!stories.length) {
    console.log("ไม่มีเรื่องที่ใช้ slug แบบเก่า (story-<ตัวเลข>)");
    return;
  }

  const plan = stories.map((story) => ({ ...story, next: createStorySlug(story.title) }));
  console.log(apply ? "APPLY — กำลังเขียนลงฐานข้อมูล\n" : "DRY RUN — ยังไม่เขียนอะไร (ใส่ --apply เพื่อเขียนจริง)\n");
  console.table(
    plan.map((item) => ({ status: item.status, province: item.province.slug, old: item.slug, new: item.next, title: item.title }))
  );
  if (!apply) return;

  let done = 0;
  for (const item of plan) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const slug = attempt === 1 ? item.next : createStorySlug(item.title);
      try {
        await prisma.$transaction([
          prisma.story.update({ where: { id: item.id, slug: item.slug }, data: { slug } }),
          prisma.storySlugRedirect.create({ data: { oldSlug: item.slug, storyId: item.id } }),
        ]);
        done++;
        break;
      } catch (error) {
        if (attempt === 3) console.error(`ข้าม ${item.slug}:`, error);
      }
    }
  }
  console.log(`\nย้ายแล้ว ${done}/${plan.length} เรื่อง`);
  console.log(
    "หน้าเรื่อง/จังหวัด/หมวด/sitemap ที่ cache ไว้จะอัปเดตเองภายใน 1 ชั่วโมง — ถ้าต้องการทันที ให้ redeploy"
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
