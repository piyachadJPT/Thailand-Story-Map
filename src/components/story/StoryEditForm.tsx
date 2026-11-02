"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { Save } from "lucide-react";
import CoverImageInput, { useCoverImage } from "./CoverImageInput";

type Option = { id: string; name: string; slug: string };
type EditableStory = {
  id: string;
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  provinceId: string;
  latitude: number;
  longitude: number;
  sourceUrl: string | null;
  isSensitive: boolean;
  needsReview: boolean;
  coverUrl: string | null;
};
const fieldClass =
  "liquid-field mt-2 min-h-12 w-full rounded-xl px-3 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm";

export default function StoryEditForm({
  story,
  categories,
  provinces,
}: {
  story: EditableStory;
  categories: Option[];
  provinces: Option[];
}) {
  const router = useRouter();
  const cover = useCoverImage(story.coverUrl);
  const [categoryId, setCategoryId] = useState(story.categoryId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isCrime =
    categories.find((item) => item.id === categoryId)?.slug === "crime";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const coverUrl = await cover.upload();
      const response = await fetch(
        `/api/stories/manage/${encodeURIComponent(story.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coverUrl,
            title: String(form.get("title")).trim(),
            summary: String(form.get("summary")).trim(),
            content: String(form.get("content")).trim(),
            categoryId,
            provinceId: String(form.get("provinceId")),
            latitude: Number(form.get("latitude")),
            longitude: Number(form.get("longitude")),
            sourceUrl: String(form.get("sourceUrl")).trim() || null,
            isSensitive: form.get("isSensitive") === "on",
          }),
        }
      );
      const body = await response.json();
      if (!response.ok || !body.success || !body.data)
        throw new Error(body.message || "บันทึกไม่สำเร็จ กรุณาลองใหม่");
      if (body.data.status === "APPROVED") {
        toast.success("บันทึกการแก้ไขแล้ว");
      } else {
        toast.success("บันทึกแล้ว เรื่องราวอยู่ระหว่างรอตรวจสอบ");
      }
      router.push("/my-stories");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="glass-card space-y-5 rounded-3xl p-5 sm:p-8"
    >
      <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
        <CoverImageInput image={cover} disabled={saving} />
        <label className="block text-sm font-medium">
          ชื่อเรื่อง
          <input
            name="title"
            defaultValue={story.title}
            required
            minLength={3}
            maxLength={200}
            className={fieldClass}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            ประเภทเรื่องราว
            <select
              name="categoryId"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
              className={fieldClass}
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            จังหวัด
            <select
              name="provinceId"
              defaultValue={story.provinceId}
              required
              className={fieldClass}
            >
              {provinces.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium">
          สรุปเรื่อง
          <textarea
            name="summary"
            defaultValue={story.summary}
            required
            minLength={10}
            maxLength={500}
            className={`${fieldClass} min-h-28`}
          />
        </label>
        <label className="block text-sm font-medium">
          รายละเอียด
          <textarea
            name="content"
            defaultValue={story.content}
            required
            minLength={50}
            className={`${fieldClass} min-h-72`}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            ละติจูด
            <input
              name="latitude"
              type="number"
              step="any"
              min={-90}
              max={90}
              defaultValue={story.latitude}
              required
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-medium">
            ลองจิจูด
            <input
              name="longitude"
              type="number"
              step="any"
              min={-180}
              max={180}
              defaultValue={story.longitude}
              required
              className={fieldClass}
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          แหล่งข้อมูลอ้างอิง{isCrime ? " (จำเป็น)" : " (ถ้ามี)"}
          <input
            name="sourceUrl"
            type="url"
            defaultValue={story.sourceUrl ?? ""}
            required={isCrime}
            placeholder="https://…"
            className={fieldClass}
          />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            name="isSensitive"
            type="checkbox"
            defaultChecked={story.isSensitive}
            className="h-4 w-4"
          />
          เนื้อหาเกี่ยวกับเหตุการณ์อ่อนไหว
        </label>
      </fieldset>
      {(isCrime || story.needsReview) && (
        <p className="rounded-xl bg-amber-500/10 p-3 text-sm">
          เมื่อบันทึก เรื่องราวจะรอผู้ดูแลตรวจสอบก่อนเผยแพร่อีกครั้ง
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <div className="border-border flex flex-wrap items-center justify-end gap-3 border-t pt-5">
        <Link
          href="/my-stories"
          aria-disabled={saving}
          onClick={(event) => {
            if (saving) event.preventDefault();
          }}
          className="inline-flex min-h-12 items-center rounded-xl px-5 text-sm"
        >
          ยกเลิก
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}
        </button>
      </div>
    </form>
  );
}
