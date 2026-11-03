import { test } from "node:test";
import assert from "node:assert/strict";
/* Tests read deep JSON-LD fields; a loose record type keeps them short. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;

import {
  articleJsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  graph,
  serializeJsonLd,
  siteJsonLd,
} from "./jsonld";

const base = {
  title: "เงาในพระที่นั่งวิมานเมฆ",
  summary: "เรื่องเล่าของเงาที่ปรากฏตอนพลบค่ำ",
  path: "/story/bangkok/%E0%B9%80%E0%B8%87%E0%B8%B2-abc123",
  images: ["https://x.supabase.co/storage/v1/object/public/c/1.png", "/og/story/bangkok/a"],
  publishedAt: "2026-10-01T10:30:36.885Z",
  updatedAt: "2026-10-02T10:30:36.885Z",
  authorName: "สมชาย",
  categoryName: "เรื่องลี้ลับ",
  place: { provinceName: "กรุงเทพมหานคร", latitude: 13.77, longitude: 100.51 },
};

/** Every value is present: no undefined, null, "" or empty arrays/objects. */
function assertNoEmpty(value: unknown, path = "$") {
  assert.notEqual(value, undefined, `${path} is undefined`);
  assert.notEqual(value, null, `${path} is null`);
  assert.notEqual(value, "", `${path} is empty`);
  if (Array.isArray(value)) {
    assert.ok(value.length > 0, `${path} is an empty array`);
    value.forEach((item, i) => assertNoEmpty(item, `${path}[${i}]`));
  } else if (value && typeof value === "object") {
    assert.ok(Object.keys(value).length > 0, `${path} is an empty object`);
    for (const [key, item] of Object.entries(value)) assertNoEmpty(item, `${path}.${key}`);
  }
}

test("Article has every field that has data, with absolute URLs", () => {
  const article = articleJsonLd(base) as Loose;
  assert.equal(article["@type"], "Article");
  assert.equal(article.headline, base.title);
  assert.equal(article.datePublished, base.publishedAt);
  assert.equal(article.dateModified, base.updatedAt);
  assert.deepEqual(article.author, { "@type": "Person", name: "สมชาย" });
  assert.equal(article.inLanguage, "th");
  assert.equal(article.articleSection, "เรื่องลี้ลับ");
  assert.equal(article.mainEntityOfPage["@id"], `http://localhost:3000${base.path}`);
  assert.deepEqual(article.image, [base.images[0], "http://localhost:3000/og/story/bangkok/a"]);
  assert.equal(article.contentLocation["@type"], "Place");
  assert.deepEqual(article.contentLocation.geo, { "@type": "GeoCoordinates", latitude: 13.77, longitude: 100.51 });
  assert.deepEqual(article.contentLocation.address, {
    "@type": "PostalAddress",
    addressRegion: "กรุงเทพมหานคร",
    addressCountry: "TH",
  });
  assert.ok(article.publisher["@id"].endsWith("#organization"));
  assert.equal("aggregateRating" in article, false);
  assertNoEmpty(article);
});

test("Article without author or images omits those fields instead of leaving them empty", () => {
  const article = articleJsonLd({ ...base, images: [], authorName: "" }) as Record<string, unknown>;
  assert.equal("image" in article, false);
  assert.equal("author" in article, false);
  assertNoEmpty(article);
});

test("headline is at most 110 characters", () => {
  const article = articleJsonLd({ ...base, title: "เรื่องเล่า".repeat(30) }) as { headline: string };
  assert.ok(article.headline.length <= 110);
});

test("BreadcrumbList positions start at 1 with absolute item URLs", () => {
  const crumbs = breadcrumbJsonLd([
    { name: "หน้าแรก", path: "/" },
    { name: "เชียงใหม่", path: "/province/chiang-mai" },
  ]) as { itemListElement: { position: number; item: string }[] };
  assert.deepEqual(
    crumbs.itemListElement.map((item) => [item.position, item.item]),
    [
      [1, "http://localhost:3000"],
      [2, "http://localhost:3000/province/chiang-mai"],
    ]
  );
});

test("CollectionPage lists items, and drops the list when there are none", () => {
  const full = collectionPageJsonLd({ name: "n", description: "d", path: "/x", items: [{ name: "a", path: "/a" }] }) as Loose;
  assert.equal(full.mainEntity["@type"], "ItemList");
  assert.equal(full.mainEntity.itemListElement[0].url, "http://localhost:3000/a");
  const empty = collectionPageJsonLd({ name: "n", description: "d", path: "/x", items: [] }) as Loose;
  assert.equal("mainEntity" in empty, false);
});

test("site graph has Organization and WebSite, without a SearchAction", () => {
  const site = siteJsonLd() as { "@graph": Record<string, unknown>[] };
  assert.deepEqual(site["@graph"].map((node) => node["@type"]), ["Organization", "WebSite"]);
  assert.equal(JSON.stringify(site).includes("SearchAction"), false);
  assert.equal("sameAs" in site["@graph"][0], false, "no empty sameAs");
});

test("serialized JSON-LD cannot close the script tag", () => {
  const evil = '</script><script>alert("x")</script> & co';
  const json = serializeJsonLd(graph(articleJsonLd({ ...base, categoryName: evil, authorName: evil })));
  assert.equal(json.includes("</script"), false);
  assert.equal(json.includes("<"), false);
  assert.equal(json.includes(">"), false);
  assert.equal(json.includes("&"), false);
  // Still valid JSON that round-trips to the original text.
  const parsed = JSON.parse(json) as { "@graph": { articleSection: string; author: { name: string } }[] };
  assert.equal(parsed["@graph"][0].articleSection, evil);
  assert.equal(parsed["@graph"][0].author.name, evil);
});
