"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { StoryListItem } from "@/models/types/story";

const categories = [
  { name: "เรื่องลี้ลับ", slug: "ghost", icon: "👻" },
  { name: "ประวัติศาสตร์", slug: "history", icon: "🏛" },
  { name: "ตำนานพื้นบ้าน", slug: "legend", icon: "📖" },
  { name: "คดีอาชญากรรม", slug: "crime", icon: "🔪" },
  { name: "เรื่องเล่าท้องถิ่น", slug: "local", icon: "🧭" },
];

type SearchStatus = "idle" | "loading" | "ready" | "error";

export default function SearchSidebar() {
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [results, setResults] = useState<StoryListItem[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q && !categorySlug) {
      setResults([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const params = new URLSearchParams({ limit: "8" });
        if (q) params.set("q", q);
        if (categorySlug) params.set("categorySlug", categorySlug);
        const response = await fetch(`/api/stories?${params}`, { signal: controller.signal });
        const body = (await response.json()) as { data?: StoryListItem[]; message?: string };
        if (!response.ok) throw new Error(body.message || "ค้นหาไม่สำเร็จ");
        setResults(body.data ?? []);
        setStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults([]);
        setStatus("error");
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, categorySlug]);

  useEffect(() => {
    if (!mobileOpen) return;
    mobileInputRef.current?.focus();
  }, [mobileOpen]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
  }

  const searchField = (
    <form onSubmit={onSubmit}>
      <label className="relative block">
        <span className="sr-only">ค้นหาเรื่องเล่า</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ชื่อเรื่อง จังหวัด หรือตำนาน"
          className="h-10 w-full rounded-xl border border-violet-200/80 bg-white/80 pr-3 pl-9 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-400 focus:ring-3 focus:ring-violet-400/25 dark:border-white/10 dark:bg-white/5 dark:text-zinc-50"
        />
      </label>
    </form>
  );

  const categoryChips = (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((category) => {
        const selected = categorySlug === category.slug;
        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => setCategorySlug(selected ? null : category.slug)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              selected
                ? "bg-violet-600 text-white"
                : "bg-violet-500/10 text-violet-800 hover:bg-violet-500/15 dark:text-violet-200"
            }`}
            aria-pressed={selected}
          >
            <span className="mr-1" aria-hidden="true">
              {category.icon}
            </span>
            {category.name}
          </button>
        );
      })}
    </div>
  );

  const resultList = (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {status === "idle" && (
        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          พิมพ์คำค้นหรือเลือกหมวด แล้วเรื่องที่ตรงกันจะโผล่ที่นี่
        </p>
      )}
      {status === "loading" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">กำลังค้นหา...</p>
      )}
      {status === "error" && (
        <p className="text-sm text-rose-600 dark:text-rose-300">ค้นหาไม่สำเร็จ ลองอีกครั้ง</p>
      )}
      {status === "ready" && results.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">ไม่พบเรื่องที่ตรงกับคำค้น</p>
      )}
      {status === "ready" && results.length > 0 && (
        <ul className="space-y-1">
          {results.map((story) => (
            <li key={story.id}>
              <Link
                href={`/story/${story.provinceSlug}/${story.slug}`}
                className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-violet-500/10"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{story.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {story.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      <aside
        className="absolute top-4 bottom-4 left-4 z-30 hidden w-[22rem] flex-col rounded-3xl border border-white/70 bg-white/78 p-4 shadow-[0_20px_50px_-24px_rgba(49,24,90,0.45)] backdrop-blur-2xl lg:flex dark:border-white/10 dark:bg-zinc-950/75"
        aria-label="ค้นหาเรื่องเล่า"
      >
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-violet-700 dark:text-violet-300">
            สำรวจเรื่องราวบนแผนที่
          </p>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">ค้นหาเรื่องเล่า</h2>
        </div>
        <div className="mt-4">{searchField}</div>
        <div className="mt-3">{categoryChips}</div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">{resultList}</div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="absolute inset-0 z-30 bg-zinc-950/10 lg:hidden"
          aria-label="ปิดค้นหา"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-3 lg:hidden">
        {mobileOpen ? (
          <div className="animate-slide-up flex max-h-[min(70vh,28rem)] w-full max-w-md flex-col rounded-3xl border border-white/70 bg-white/82 p-3 shadow-[0_16px_40px_-16px_rgba(49,24,90,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/80">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">ค้นหาเรื่องเล่า</p>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
                aria-label="ปิดค้นหา"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={onSubmit}>
              <label className="relative block">
                <span className="sr-only">ค้นหาเรื่องเล่า</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  ref={mobileInputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ชื่อเรื่อง จังหวัด หรือตำนาน"
                  className="h-10 w-full rounded-xl border border-violet-200/80 bg-white/80 pr-3 pl-9 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-400 focus:ring-3 focus:ring-violet-400/25 dark:border-white/10 dark:bg-white/5 dark:text-zinc-50"
                />
              </label>
            </form>
            <div className="mt-3">{categoryChips}</div>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto">{resultList}</div>
          </div>
        ) : (
          <button
            type="button"
            className="flex h-12 items-center gap-2 rounded-full border border-white/70 bg-white/72 px-4 text-sm font-medium text-violet-700 shadow-[0_10px_40px_-16px_rgba(49,24,90,0.45)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-900/70 dark:text-violet-200"
            aria-label="เปิดค้นหา"
            aria-expanded={false}
            onClick={() => setMobileOpen(true)}
          >
            <Search className="h-4 w-4" />
            ค้นหา
          </button>
        )}
      </div>
    </>
  );
}
