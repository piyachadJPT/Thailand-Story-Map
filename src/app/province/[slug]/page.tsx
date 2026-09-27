import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ slug: string }> };

export default async function ProvinceLandingPage({ params }: Props) {
  const { slug } = await params;

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold capitalize text-zinc-900 dark:text-zinc-50">
          เรื่องเล่าในจังหวัด: {slug.replace(/-/g, " ")}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          SEO landing ต่อจังหวัด — filter stories ด้วย <code className="text-xs">provinceSlug</code>
        </p>
      </div>
    </MainLayout>
  );
}
