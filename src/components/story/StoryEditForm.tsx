"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { Save } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import CategoryField from "./form/CategoryField";
import ContentEditor from "./form/ContentEditor";
import CoordinateFields from "./form/CoordinateFields";
import CoverImageInput from "./form/CoverImageInput";
import FormActions from "./form/FormActions";
import { Notice } from "@/components/ui/notice";
import LocationField from "./form/LocationField";
import { matchProvince } from "./form/matchProvince";
import ProvinceField from "./form/ProvinceField";
import SourceField from "./form/SourceField";
import SummaryField from "./form/SummaryField";
import TitleField from "./form/TitleField";
import type { FormOption } from "./form/types";
import { useCoverImage } from "./form/useCoverImage";
import { updateStory } from "./updateStory";

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

export default function StoryEditForm({
  story,
  categories,
  provinces,
}: {
  story: EditableStory;
  categories: FormOption[];
  provinces: FormOption[];
}) {
  const router = useRouter();
  const cover = useCoverImage(story.coverUrl);
  const [categoryId, setCategoryId] = useState(story.categoryId);
  const [provinceId, setProvinceId] = useState(story.provinceId);
  const [coords, setCoords] = useState({
    latitude: String(story.latitude),
    longitude: String(story.longitude),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isCrime = categories.find((item) => item.id === categoryId)?.slug === "crime";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const data = await updateStory(story.id, form, {
        coverUrl: await cover.upload(),
        categoryId,
      });
      if (data.status === "APPROVED") toast.success("บันทึกการแก้ไขแล้ว");
      else toast.success("บันทึกแล้ว เรื่องราวอยู่ระหว่างรอตรวจสอบ");
      router.push("/my-stories");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassPanel as="section" surface="solid" gilded padding="lg">
      <form onSubmit={submit} className="space-y-6">
        <fieldset disabled={saving} className="space-y-6 disabled:opacity-70">
          <CoverImageInput image={cover} disabled={saving} />
          <TitleField defaultValue={story.title} />
          <div className="grid gap-5 sm:grid-cols-2">
            <CategoryField options={categories} value={categoryId} onChange={setCategoryId} />
            <ProvinceField options={provinces} value={provinceId} onChange={setProvinceId} />
          </div>
          <SummaryField defaultValue={story.summary} />
          <ContentEditor defaultValue={story.content} />
          <LocationField
            hasPoint
            onError={setError}
            onLocate={(point) =>
              setCoords({ latitude: String(point.latitude), longitude: String(point.longitude) })
            }
            onPlace={(place) => {
              setCoords({ latitude: String(place.latitude), longitude: String(place.longitude) });
              const province = matchProvince(place, provinces);
              if (province) setProvinceId(province.id);
            }}
          >
            <CoordinateFields
              latitude={coords.latitude}
              longitude={coords.longitude}
              onChange={setCoords}
            />
          </LocationField>
          <SourceField required={isCrime} defaultValue={story.sourceUrl ?? ""} />
          <label className="flex min-h-11 items-center gap-3 text-sm text-foreground">
            <input
              name="isSensitive"
              type="checkbox"
              defaultChecked={story.isSensitive}
              className="size-4 accent-primary"
            />
            เนื้อหาเกี่ยวกับเหตุการณ์อ่อนไหว
          </label>
        </fieldset>
        {isCrime || story.needsReview ? (
          <Notice>เมื่อบันทึก เรื่องราวจะรอผู้ดูแลตรวจสอบก่อนเผยแพร่อีกครั้ง</Notice>
        ) : null}
        <FormActions error={error}>
          <Link
            href="/my-stories"
            aria-disabled={saving}
            onClick={(event) => {
              if (saving) event.preventDefault();
            }}
            className={buttonVariants({ variant: "ghost" })}
          >
            ยกเลิก
          </Link>
          <Button type="submit" disabled={saving}>
            <Save aria-hidden="true" />
            {saving ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}
          </Button>
        </FormActions>
      </form>
    </GlassPanel>
  );
}
