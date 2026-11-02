import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpen, MapPin, Pencil, Plus } from "lucide-react";
import { getSessionUser } from "@/api/auth/session";
import { prisma } from "@/api/db/prisma";
import { StoryStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "เรื่องราวของฉัน" };

const statuses = {
  DRAFT: { label: "ฉบับร่าง", style: "bg-muted text-muted-foreground" },
  PENDING: {
    label: "รอตรวจสอบ",
    style: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  APPROVED: {
    label: "เผยแพร่แล้ว",
    style: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  REJECTED: {
    label: "ไม่ผ่านการตรวจสอบ",
    style: "bg-destructive/10 text-destructive",
  },
} satisfies Record<StoryStatus, { label: string; style: string }>;

export default async function MyStoriesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=%2Fmy-stories");
  if (user.status === "BANNED") notFound();
  const stories = await prisma.story.findMany({
    where: { authorId: user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      status: true,
      rejectReason: true,
      updatedAt: true,
      images: {
        take: 1,
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: { url: true, altText: true },
      },
      category: { select: { name: true } },
      province: { select: { name: true, slug: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
  });

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              เรื่องราวของฉัน
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              เรื่องที่คุณเขียนทั้งหมด {stories.length.toLocaleString("th-TH")}{" "}
              เรื่อง · จัดการและแก้ไขได้ที่นี่
            </p>
          </div>
          <Link
            href="/?compose=1"
            className="bg-primary text-primary-foreground ml-auto inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            เขียนเรื่องราว
          </Link>
        </header>
        {stories.length === 0 ? (
          <div className="glass-card rounded-3xl px-6 py-14 text-center">
            <BookOpen
              className="text-primary mx-auto mb-4 h-10 w-10"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold">
              ยังไม่มีเรื่องราวที่คุณเขียน
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              เริ่มแบ่งปันเรื่องเล่า แล้วกลับมาจัดการเรื่องของคุณได้ที่นี่
            </p>
            <Link
              href="/?compose=1"
              className="text-primary mt-5 inline-flex min-h-11 items-center gap-2 font-medium underline underline-offset-4"
            >
              เขียนเรื่องแรก
              <Plus className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-4" aria-label="เรื่องราวที่ฉันเขียน">
            {stories.map((story) => (
              <li key={story.id} className="glass-card rounded-3xl p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {story.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.images[0].url}
                      alt={story.images[0].altText || `รูปปก ${story.title}`}
                      className="aspect-video w-full shrink-0 rounded-2xl object-cover sm:aspect-square sm:w-28"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`rounded-full px-3 py-1 font-medium ${statuses[story.status].style}`}
                      >
                        {statuses[story.status].label}
                      </span>
                      <span className="text-muted-foreground">
                        {story.category.name}
                      </span>
                      <span className="text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {story.province.name}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold [overflow-wrap:anywhere]">
                      {story.title}
                    </h2>
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed [overflow-wrap:anywhere]">
                      {story.summary}
                    </p>
                    <p className="text-muted-foreground mt-3 text-xs">
                      แก้ไขล่าสุด{" "}
                      <time dateTime={story.updatedAt.toISOString()}>
                        {story.updatedAt.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "Asia/Bangkok",
                        })}
                      </time>
                    </p>
                    {story.status === "REJECTED" && story.rejectReason && (
                      <p className="text-destructive mt-3 text-sm">
                        เหตุผล: {story.rejectReason}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {story.status === "APPROVED" && (
                      <Link
                        href={`/story/${story.province.slug}/${story.slug}`}
                        aria-label={`อ่านเรื่อง ${story.title}`}
                        className="border-border hover:bg-primary/5 inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm"
                      >
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                        อ่านเรื่อง
                      </Link>
                    )}
                    <Link
                      href={`/story/edit/${story.id}`}
                      aria-label={`แก้ไขเรื่อง ${story.title}`}
                      className="bg-primary text-primary-foreground inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium hover:opacity-90"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      แก้ไขเรื่องราว
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
