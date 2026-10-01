import { provinceRecords } from "@/lib/thai-provinces";
import { prisma } from "@/api/db/prisma";
import { jsonOk, handleRouteError } from "@/api/common/http";

export async function GET() {
  try {
    const existing = await prisma.province.findMany({ select: { slug: true } });
    const slugs = new Set(existing.map((province) => province.slug));
    const missing = provinceRecords.filter(
      (province) => !slugs.has(province.slug)
    );
    if (missing.length) {
      await prisma.province.createMany({ data: missing, skipDuplicates: true });
    }
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
    return jsonOk({ categories, provinces });
  } catch (error) {
    return handleRouteError(error);
  }
}
