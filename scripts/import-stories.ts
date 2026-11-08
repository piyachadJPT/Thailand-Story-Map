/**
 * Imports the finished stories in docs/stories/0N-*.md into the database as one
 * author, uploading each cover from public/story-covers to the cover bucket.
 *
 *   npm run stories:import -- --email you@example.com [--apply]
 *
 * Without --apply it only validates and prints what it would do. Stories whose
 * title the author already has are skipped, so it is safe to re-run.
 */
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";
import { PrismaClient, StoryStatus } from "@prisma/client";
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";
import { COVER_BUCKET } from "../src/lib/storage/images";
import { createStorySlug, slugBase } from "../src/lib/seo/slug";
import { createStorySchema } from "../src/models/schemas/story";

const DOCS = join(__dirname, "..", "docs", "stories");
const COVERS = join(__dirname, "..", "public", "story-covers");

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

type Parsed = {
  id: string;
  meta: Record<string, any>;
  content: string;
  references: string[];
};

function parseFile(file: string): Parsed[] {
  const text = readFileSync(join(DOCS, file), "utf8");
  return text
    .split(/^## (?=[a-z]+-\d\d\. )/m)
    .slice(1)
    .map((block) => {
      const id = block.match(/^([a-z]+-\d\d)\./)![1];
      const meta = yaml.load(block.match(/```yaml\n([\s\S]*?)\n```/)![1]) as Record<string, any>;
      const content = block.match(/### content\n([\s\S]*?)\n### references/)![1].trim();
      const refs = block.match(/### references\n([\s\S]*?)\n### fact_check/)![1];
      const references = refs
        .split("\n")
        .filter((l) => /^\d+\. /.test(l))
        .map((l) => l.replace(/ — (เข้าถึงเมื่อ|ยืนยัน|ใช้เป็น).*$/, "").trim());
      return { id, meta, content, references };
    });
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const email = args[args.indexOf("--email") + 1];
  if (!email) throw new Error("--email is required");
  const author = await prisma.user.findUniqueOrThrow({ where: { email } });
  const [categories, provinces] = await Promise.all([
    prisma.category.findMany(),
    prisma.province.findMany(),
  ]);
  const existing = new Set(
    (await prisma.story.findMany({ where: { authorId: author.id }, select: { title: true } })).map((s) => s.title)
  );

  const stories = readdirSync(DOCS)
    .filter((f) => /^0[1-5]-.*\.md$/.test(f))
    .sort()
    .flatMap(parseFile);

  const problems: string[] = [];
  const ready = stories.flatMap((s) => {
    const m = s.meta;
    const category = categories.find((c) => c.slug === m.category);
    const province = provinces.find((p) => p.name === m.province);
    if (!category || !province) {
      problems.push(`${s.id}: category/province not found (${m.category}/${m.province})`);
      return [];
    }
    const refs = s.references.length ? `\n\nแหล่งอ้างอิง\n${s.references.join("\n")}` : "";
    const parsed = createStorySchema.safeParse({
      title: m.title,
      summary: m.summary,
      content: s.content + refs,
      latitude: m.latitude,
      longitude: m.longitude,
      provinceId: province.id,
      categoryId: category.id,
      sourceUrl: m.source_url || undefined,
      isSensitive: Boolean(m.is_sensitive),
    });
    if (!parsed.success) {
      problems.push(`${s.id}: ${parsed.error.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`);
      return [];
    }
    if (category.slug === "crime" && !m.source_url) {
      problems.push(`${s.id}: crime story without source_url`);
      return [];
    }
    return [{ s, data: parsed.data, isCrime: category.slug === "crime" }];
  });

  console.log(`parsed ${stories.length}, valid ${ready.length}, already imported ${ready.filter((r) => existing.has(r.data.title)).length}`);
  problems.forEach((p) => console.log("PROBLEM", p));
  if (!apply || problems.length) {
    console.log(apply ? "not applying: fix problems first" : "dry run only (add --apply)");
    return;
  }

  const client = createSupabaseAdminClient();
  let done = 0;
  for (const { s, data, isCrime } of ready) {
    if (existing.has(data.title)) continue;
    const file = readFileSync(join(COVERS, `${s.id}.webp`));
    const path = `${author.id}/${randomUUID()}.webp`;
    const up = await client.storage.from(COVER_BUCKET).upload(path, file, {
      contentType: "image/webp",
      cacheControl: "31536000",
    });
    if (up.error) throw new Error(`${s.id}: upload failed: ${up.error.message}`);
    const coverUrl = client.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl;

    const tagIds: string[] = [];
    for (const name of (s.meta.tags ?? []).slice(0, 20) as string[]) {
      const slug = slugBase(String(name));
      if (!slug) continue;
      const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name: String(name), slug } });
      tagIds.push(tag.id);
    }

    // Crime stories go through review like any other crime submission.
    const status = isCrime ? StoryStatus.PENDING : StoryStatus.APPROVED;
    const { tagIds: _t, images: _i, coverUrl: _c, status: _s, ...rest } = data;
    await prisma.story.create({
      data: {
        ...rest,
        slug: createStorySlug(data.title),
        authorId: author.id,
        status,
        publishedAt: status === StoryStatus.APPROVED ? new Date() : null,
        tags: { create: [...new Set(tagIds)].map((tagId) => ({ tagId })) },
        images: { create: [{ url: coverUrl, altText: s.meta.cover?.alt_text ?? data.title, sortOrder: 0 }] },
      },
    });
    done++;
    console.log("imported", s.id, status);
  }
  console.log("done", done);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
