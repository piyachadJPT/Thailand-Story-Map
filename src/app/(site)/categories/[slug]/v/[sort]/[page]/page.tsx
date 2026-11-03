import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryListing, { categoryListingMetadata } from "@/components/listing/CategoryListing";
import { parsePage, parseSort } from "@/lib/seo/listing";

/**
 * Internal target of the /categories/:slug?sort=&page= rewrite (next.config.ts),
 * so sorted and paginated listings are ISR-cached too. Canonical points at the query URL.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string; sort: string; page: string }> };

async function parse(params: Props["params"]) {
  const raw = await params;
  const sort = parseSort(raw.sort);
  const page = parsePage(raw.page);
  if (!sort || !page) notFound();
  return { slug: raw.slug, sort, page };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryListingMetadata(await parse(params));
}

export default async function CategoryVariantPage({ params }: Props) {
  return <CategoryListing {...await parse(params)} />;
}
