import MainLayout from "@/components/layout/MainLayout";

export default function CreateStoryPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">สร้างเรื่องเล่า</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          ฟอร์มหลายขั้น (หมวด → ปักหมุด → เนื้อหา → รูป) จะอยู่ที่{" "}
          <code className="text-xs">front/components/story</code> ใน Phase 3
        </p>
      </div>
    </MainLayout>
  );
}
