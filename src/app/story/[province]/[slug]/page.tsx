import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ province: string; slug: string }> };

export default async function StoryDetailPage({ params }: Props) {
  const { province, slug } = await params;

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{province}</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{slug}</h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          SSR/ISR + ดึงจาก <code className="text-xs">/api/stories/{province}/{slug}</code> ใน
          Phase 3
        </p>
      </div>
    </MainLayout>
  );
}
