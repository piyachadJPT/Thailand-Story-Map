import { provinceRecords } from "@/lib/thai-provinces";
import { prisma } from "@/api/db/prisma";
import { jsonOk, handleRouteError } from "@/api/common/http";

export async function GET() {
  try {
    const findProvinces = () =>
      prisma.province.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      });
    const [categories, found] = await Promise.all([
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      findProvinces(),
    ]);
    // Seed any missing provinces (rare), then read the list again.
    const slugs = new Set(found.map((province) => province.slug));
    const missing = provinceRecords.filter((province) => !slugs.has(province.slug));
    let provinces = found;
    if (missing.length) {
      await prisma.province.createMany({ data: missing, skipDuplicates: true });
      provinces = await findProvinces();
    }
    return jsonOk({ categories, provinces });
  } catch (error) {
    return handleRouteError(error);
  }
}
