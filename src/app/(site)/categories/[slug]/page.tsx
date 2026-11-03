import type { Metadata } from "next";
import CategoryListing, { categoryListingMetadata } from "@/components/listing/CategoryListing";
import { storyCategories } from "@/config/categories";
import { DEFAULT_SORT } from "@/lib/seo/listing";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return storyCategories.map((category) => ({ slug: category.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return categoryListingMetadata({ slug, sort: DEFAULT_SORT, page: 1 });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return <CategoryListing slug={slug} sort={DEFAULT_SORT} page={1} />;
}
