import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/api/db/prisma";
import { databaseMock, restoreDatabaseMocksAfterEach } from "@/api/testing/prismaMock";
import { lookupStory } from "./public";

restoreDatabaseMocksAfterEach();

const story = (overrides: Record<string, unknown> = {}) => ({
  id: "s1",
  slug: "ป่าช้าผีดุ-bkap8h",
  status: "APPROVED",
  province: { slug: "lamphun", name: "ลำพูน", region: "ภาคเหนือ" },
  ...overrides,
});

test("the canonical URL renders the story", async () => {
  databaseMock(prisma.story, "findUnique", async () => story());
  const result = await lookupStory("lamphun", "ป่าช้าผีดุ-bkap8h");
  assert.equal(result.kind, "story");
});

test("a wrong province redirects to the story's real province", async () => {
  databaseMock(prisma.story, "findUnique", async () => story());
  const result = await lookupStory("bangkok", "ป่าช้าผีดุ-bkap8h");
  assert.deepEqual(result, { kind: "redirect", path: { provinceSlug: "lamphun", slug: "ป่าช้าผีดุ-bkap8h" } });
});

test("an old slug in StorySlugRedirect redirects to the current URL", async () => {
  databaseMock(prisma.story, "findUnique", async () => null);
  const redirects = databaseMock(prisma.storySlugRedirect, "findUnique", async () => ({
    story: { slug: "ป่าช้าผีดุ-bkap8h", status: "APPROVED", province: { slug: "lamphun" } },
  }));
  const result = await lookupStory("lamphun", "story-1790846198691");
  assert.deepEqual(result, { kind: "redirect", path: { provinceSlug: "lamphun", slug: "ป่าช้าผีดุ-bkap8h" } });
  assert.deepEqual((redirects.mock.calls[0].arguments[0] as unknown as { where: unknown }).where, {
    oldSlug: "story-1790846198691",
  });
});

test("unpublished stories are missing (404), also through an old slug", async () => {
  databaseMock(prisma.story, "findUnique", async () => story({ status: "PENDING" }));
  assert.deepEqual(await lookupStory("lamphun", "ป่าช้าผีดุ-bkap8h"), { kind: "missing" });

  databaseMock(prisma.story, "findUnique", async () => null);
  databaseMock(prisma.storySlugRedirect, "findUnique", async () => ({
    story: { slug: "x", status: "REJECTED", province: { slug: "lamphun" } },
  }));
  assert.deepEqual(await lookupStory("lamphun", "story-1"), { kind: "missing" });
});

test("an unknown slug is missing", async () => {
  databaseMock(prisma.story, "findUnique", async () => null);
  databaseMock(prisma.storySlugRedirect, "findUnique", async () => null);
  assert.deepEqual(await lookupStory("lamphun", "nope"), { kind: "missing" });
});
