import { provinceRecords } from "../src/lib/thai-provinces";
import { PrismaClient } from "@prisma/client";

/** Seed uses direct connection — pooler (6543) often fails for long scripts */
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
  },
});

const categories = [
  { name: "เรื่องลี้ลับ", slug: "ghost", icon: "👻", color: "#7c3aed" },
  { name: "ประวัติศาสตร์", slug: "history", icon: "🏛", color: "#b45309" },
  { name: "ตำนานพื้นบ้าน", slug: "legend", icon: "📖", color: "#059669" },
  { name: "คดีอาชญากรรม", slug: "crime", icon: "🔪", color: "#dc2626" },
  { name: "เรื่องเล่าท้องถิ่น", slug: "local", icon: "🧭", color: "#0284c7" },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  for (const p of provinceRecords) {
    await prisma.province.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log(
    "Seed OK:",
    categories.length,
    "categories,",
    provinceRecords.length,
    "provinces"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
