import { afterEach, test, mock } from "node:test";
import assert from "node:assert/strict";
import { uploadStoryCover, validateOwnedCover } from "./service";
import {
  MAX_IMAGE_BYTES,
  detectImageType,
  ownedCoverPath,
} from "@/lib/storage/images";
import { prisma } from "@/api/db/prisma";
import { createStory, updateStory } from "@/api/stories/service";
import { createStorySchema, updateStorySchema } from "@/models/schemas/story";
import type { Prisma } from "@prisma/client";

const authorId = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const baseUrl = "https://storage-test.supabase.co";
const coverUrl = `${baseUrl}/storage/v1/object/public/story-covers/${authorId}/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb.png`;
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const restoreDatabase: (() => void)[] = [];
function databaseMock<T extends object>(
  delegate: T,
  key: keyof T,
  implementation: (...args: unknown[]) => unknown
) {
  const original = delegate[key];
  const replacement = mock.fn(implementation);
  Reflect.set(delegate, key, replacement);
  restoreDatabase.push(() => {
    Reflect.set(delegate, key, original);
  });
  return replacement;
}
const previousEnv = { ...process.env };
afterEach(() => {
  mock.restoreAll();
  restoreDatabase
    .splice(0)
    .reverse()
    .forEach((restore) => restore());
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    if (previousEnv[name] === undefined) delete process.env[name];
    else process.env[name] = previousEnv[name];
  }
});
function storageMock() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = baseUrl;
  process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
  return mock.method(globalThis, "fetch", async () =>
    Response.json({ public: true, id: "story-covers" })
  );
}
const input = {
  title: "เรื่องทดสอบ",
  summary: "สรุปเรื่องสำหรับทดสอบ",
  content: "รายละเอียดเรื่องราวสำหรับทดสอบ".repeat(5),
  latitude: 13,
  longitude: 100,
  provinceId: authorId,
  categoryId: authorId,
  sourceUrl: null,
  isSensitive: false,
};
function storyMocks() {
  databaseMock(prisma.story, "findUnique", async () => ({
    id: "story",
    authorId,
    status: "APPROVED",
    category: { slug: "memory" },
    images: [
      { id: "cover", url: "https://old.example/cover.png" },
      { id: "gallery", url: "https://old.example/gallery.png" },
    ],
  }));
  databaseMock(prisma.category, "findUnique", async () => ({ slug: "memory" }));
  databaseMock(prisma.province, "findUnique", async () => ({
    slug: "bangkok",
  }));
  return databaseMock(prisma.story, "update", async () => ({
    id: "story",
    slug: "story",
    status: "APPROVED",
  }));
}

test("recognizes supported image signatures and rejects renamed non-images", () => {
  assert.equal(detectImageType(png), "image/png");
  assert.equal(detectImageType(new Uint8Array([255, 216, 255])), "image/jpeg");
  assert.equal(
    detectImageType(new TextEncoder().encode("RIFF0000WEBP")),
    "image/webp"
  );
  assert.equal(detectImageType(new TextEncoder().encode("<svg></svg>")), null);
  assert.equal(detectImageType(new Uint8Array()), null);
});
test("rejects other users, domains and paths for covers", () => {
  assert.ok(ownedCoverPath(coverUrl, baseUrl, authorId));
  assert.equal(ownedCoverPath(coverUrl, baseUrl, "another-user"), null);
  assert.equal(
    ownedCoverPath(
      coverUrl.replace(baseUrl, "https://evil.example"),
      baseUrl,
      authorId
    ),
    null
  );
  assert.equal(
    ownedCoverPath(`${coverUrl}/../other.png`, baseUrl, authorId),
    null
  );
});
test("upload enforces size and actual content type", async () => {
  await assert.rejects(
    uploadStoryCover(
      new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.png", {
        type: "image/png",
      }),
      authorId
    ),
    /5 MB/
  );
  await assert.rejects(
    uploadStoryCover(
      new File(["fake"], "fake.png", { type: "image/png" }),
      authorId
    ),
    /JPG/
  );
  await assert.rejects(
    uploadStoryCover(
      new File([png], "fake.jpg", { type: "image/jpeg" }),
      authorId
    ),
    /JPG/
  );
});
test("uploads to the user's folder with a generated filename", async () => {
  const calls = storageMock();
  const result = await uploadStoryCover(
    new File([png], "cover.png", { type: "image/png" }),
    authorId
  );
  assert.ok(ownedCoverPath(result.url, baseUrl, authorId));
  assert.equal(calls.mock.callCount(), 2);
});
test("missing server secret returns a clear configuration error", async () => {
  delete process.env.SUPABASE_SECRET_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  await assert.rejects(
    uploadStoryCover(
      new File([png], "cover.png", { type: "image/png" }),
      authorId
    ),
    /ยังไม่พร้อม/
  );
});
test("creates the public bucket on the first upload", async () => {
  storageMock();
  let calls = 0;
  mock.method(globalThis, "fetch", async () => {
    calls += 1;
    return calls === 1
      ? Response.json(
          {
            message: "Bucket not found",
            statusCode: "404",
            error: "not_found",
          },
          { status: 404 }
        )
      : Response.json({ public: true, id: "story-covers" });
  });
  const result = await uploadStoryCover(
    new File([png], "cover.png", { type: "image/png" }),
    authorId
  );
  assert.ok(ownedCoverPath(result.url, baseUrl, authorId));
  assert.equal(calls, 4);
});
test("storage upload failure is reported rather than returning an unusable URL", async () => {
  storageMock();
  mock.method(
    globalThis,
    "fetch",
    async (_url: unknown, init: RequestInit | undefined) =>
      init?.method === "POST"
        ? Response.json(
            { message: "Upload denied", statusCode: "403", error: "denied" },
            { status: 403 }
          )
        : Response.json({ public: true, id: "story-covers" })
  );
  await assert.rejects(
    uploadStoryCover(
      new File([png], "cover.png", { type: "image/png" }),
      authorId
    ),
    /อัปโหลดรูปไม่สำเร็จ/
  );
});
test("unowned cover is rejected before contacting storage", async () => {
  const calls = storageMock();
  await assert.rejects(
    validateOwnedCover(coverUrl, "another-user"),
    /อัปโหลดเอง/
  );
  assert.equal(calls.mock.callCount(), 0);
});
test("creating a story saves the uploaded cover first", async () => {
  storageMock();
  databaseMock(prisma.category, "findUnique", async () => ({ slug: "memory" }));
  const created = databaseMock(prisma.story, "create", async () => ({
    id: "story",
    title: input.title,
    slug: "test",
    summary: input.summary,
    latitude: 13,
    longitude: 100,
    status: "APPROVED",
    viewCount: 0,
    category: { slug: "memory", color: null },
    province: { slug: "bangkok" },
  }));
  const parsed = createStorySchema.parse({
    ...input,
    sourceUrl: undefined,
    slug: "test",
    coverUrl,
    images: [{ url: "https://example.com/gallery.png" }],
  });
  await createStory(parsed, authorId);
  const args = created.mock.calls[0].arguments[0] as Prisma.StoryCreateArgs;
  assert.deepEqual(args.data.images, {
    create: [
      { url: coverUrl, altText: input.title, sortOrder: 0 },
      { url: "https://example.com/gallery.png", sortOrder: 1 },
    ],
  });
});
test("editing replaces only the cover and preserves gallery images", async () => {
  storageMock();
  const updated = storyMocks();
  await updateStory(
    "story",
    updateStorySchema.parse({ ...input, coverUrl }),
    authorId
  );
  const args = updated.mock.calls[0].arguments[0] as Prisma.StoryUpdateArgs;
  assert.deepEqual(args.data.images, {
    update: {
      where: { id: "cover" },
      data: { url: coverUrl, altText: input.title },
    },
  });
});
test("text-only edits preserve existing images and removing a cover only removes that record", async () => {
  const updated = storyMocks();
  await updateStory("story", updateStorySchema.parse(input), authorId);
  assert.equal(
    (updated.mock.calls[0].arguments[0] as Prisma.StoryUpdateArgs).data.images,
    undefined
  );
  await updateStory(
    "story",
    updateStorySchema.parse({ ...input, coverUrl: null }),
    authorId
  );
  assert.deepEqual(
    (updated.mock.calls[1].arguments[0] as Prisma.StoryUpdateArgs).data.images,
    { delete: { id: "cover" } }
  );
});
test("another author cannot edit a story or its cover", async () => {
  const updated = storyMocks();
  await assert.rejects(
    updateStory(
      "story",
      updateStorySchema.parse({ ...input, coverUrl }),
      "another-user"
    ),
    /ตัวเอง/
  );
  assert.equal(updated.mock.callCount(), 0);
});
