import type { Metadata } from "next";
import ProvinceListing, { provinceListingMetadata } from "@/components/listing/ProvinceListing";
import { DEFAULT_SORT } from "@/lib/seo/listing";
import { provinceRecords } from "@/lib/thai-provinces";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return provinceRecords.map((province) => ({ slug: province.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return provinceListingMetadata({ slug, category: "all", sort: DEFAULT_SORT, page: 1 });
}

export default async function ProvincePage({ params }: Props) {
  const { slug } = await params;
  return <ProvinceListing slug={slug} category="all" sort={DEFAULT_SORT} page={1} />;
}
