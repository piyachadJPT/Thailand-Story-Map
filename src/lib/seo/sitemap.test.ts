import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/api/db/prisma";
import { callArg, databaseMock, restoreDatabaseMocksAfterEach } from "@/api/testing/prismaMock";
import { BACKOFFICE_PATH } from "@/config/backoffice";
import sitemap from "@/app/sitemap";

restoreDatabaseMocksAfterEach();

function mockDatabase() {
  const stories = databaseMock(prisma.story, "findMany", async () => [
    {
      slug: "ป่าช้าผีดุ-bkap8h",
      updatedAt: new Date("2026-10-02T00:00:00Z"),
      province: { slug: "lamphun" },
      images: [{ url: "https://x.supabase.co/storage/v1/object/public/c/1.png" }],
    },
    { slug: "story-1790850775612", updatedAt: new Date("2026-10-03T00:00:00Z"), province: { slug: "bangkok" }, images: [] },
  ]);
  // Only provinces that have APPROVED stories come back from the groupBy.
  const groups = databaseMock(prisma.story, "groupBy", async () => [
    { provinceId: "p-lamphun", _max: { updatedAt: new Date("2026-10-02T00:00:00Z") } },
    { provinceId: "p-bangkok", _max: { updatedAt: new Date("2026-10-03T00:00:00Z") } },
  ]);
  databaseMock(prisma.province, "findMany", async () => [
    { id: "p-lamphun", slug: "lamphun" },
    { id: "p-bangkok", slug: "bangkok" },
  ]);
  return { stories, groups };
}

test("lists only APPROVED stories and provinces that have them", async () => {
  const { stories, groups } = mockDatabase();
  const entries = await sitemap();
  assert.deepEqual(callArg<{ where: unknown }>(stories).where, { status: "APPROVED" });
  assert.deepEqual(callArg<{ where: unknown }>(groups).where, { status: "APPROVED" });
  const urls = entries.map((entry) => entry.url);
  assert.ok(urls.includes("http://localhost:3000/province/lamphun"));
  assert.ok(urls.includes("http://localhost:3000/province/bangkok"));
  assert.equal(urls.includes("http://localhost:3000/province/chiang-mai"), false, "no empty provinces");
  for (const slug of ["ghost", "history", "legend", "crime", "local"]) {
    assert.ok(urls.includes(`http://localhost:3000/categories/${slug}`));
  }
  for (const path of ["", "/categories", "/province", "/places", "/contribute", "/about", "/privacy", "/terms"]) {
    assert.ok(urls.includes(`http://localhost:3000${path}`), path);
  }
});

test("Thai slugs are percent-encoded; lastModified and cover image are set", async () => {
  mockDatabase();
  const entries = await sitemap();
  const story = entries.find((entry) => entry.url.includes("/story/lamphun/"));
  assert.equal(story?.url, `http://localhost:3000/story/lamphun/${encodeURIComponent("ป่าช้าผีดุ-bkap8h")}`);
  assert.match(story!.url, /^[\x21-\x7e]+$/, "ASCII only");
  assert.deepEqual(story?.lastModified, new Date("2026-10-02T00:00:00Z"));
  assert.deepEqual(story?.images, ["https://x.supabase.co/storage/v1/object/public/c/1.png"]);
  const noCover = entries.find((entry) => entry.url.includes("story-1790850775612"));
  assert.equal(noCover && "images" in noCover, false);
});

test("never lists private pages, API, backoffice or paginated URLs", async () => {
  mockDatabase();
  const text = (await sitemap()).map((entry) => entry.url).join("\n");
  for (const fragment of ["/login", "/my-stories", "/story/edit", "/api/", BACKOFFICE_PATH, "?page=", "?"]) {
    assert.equal(text.includes(fragment), false, fragment);
  }
});
