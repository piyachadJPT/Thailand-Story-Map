import MainLayout from "@/components/layout/MainLayout";

export default function AdminPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">แอดมิน</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          คิว Pending / Report ใช้ API{" "}
          <code className="text-xs">/api/admin/stories</code> และ UI ใน{" "}
          <code className="text-xs">front/components/admin</code>
        </p>
      </div>
    </MainLayout>
  );
}
