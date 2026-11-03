import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProvinceListing, { provinceListingMetadata } from "@/components/listing/ProvinceListing";
import { parseCategoryFilter, parsePage, parseSort } from "@/lib/seo/listing";

/**
 * Internal target of the /province/:slug?category=&sort=&page= rewrite (next.config.ts),
 * so filtered and paginated listings are ISR-cached too. Canonical points at the query URL.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string; category: string; sort: string; page: string }> };

async function parse(params: Props["params"]) {
  const raw = await params;
  const category = parseCategoryFilter(raw.category);
  const sort = parseSort(raw.sort);
  const page = parsePage(raw.page);
  if (!category || !sort || !page) notFound();
  return { slug: raw.slug, category, sort, page };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return provinceListingMetadata(await parse(params));
}

export default async function ProvinceVariantPage({ params }: Props) {
  return <ProvinceListing {...await parse(params)} />;
}
