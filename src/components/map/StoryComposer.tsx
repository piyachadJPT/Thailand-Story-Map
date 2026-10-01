"use client";

import Link from "next/link";
import { toast } from "react-toastify";
import type { StoryMapPoint } from "@/models/types/story";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  LocateFixed,
  ListFilter,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";
import StoryDropdown from "@/components/map/StoryDropdown";
import type { PlaceHit } from "@/components/map/geocode";
import { useMapSheetStore } from "@/components/map/mapSheetStore";

type Option = { id: string; name: string; slug: string };
type OptionsResponse = {
  data?: { categories: Option[]; provinces: Option[] };
  message?: string;
};
type Point = { longitude: number; latitude: number };

const inputClass =
  "liquid-field h-12 w-full rounded-xl px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm";
const labelClass = "mb-2 block text-sm font-medium text-foreground";

export default function StoryComposer() {
  const { data: session, status: sessionStatus } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [point, setPoint] = useState<Point | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<PlaceHit[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState("");
  const [pendingPoint, setPendingPoint] = useState<Point | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState("");
  const [pinMode, setPinMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isCrime =
    categories.find((category) => category.id === categoryId)?.slug === "crime";
  const sheet = useMapSheetStore((state) => state.sheet);
  const openSheet = useMapSheetStore((state) => state.openSheet);
  const closeSheet = useMapSheetStore((state) => state.closeSheet);
  const flyTo = useMapSheetStore((state) => state.flyTo);

  useEffect(() => {
    if (!session?.user) return;
    const onOpen = () => {
      useMapSheetStore.getState().openSheet("composer");
      setOpen(true);
      window.dispatchEvent(
        new CustomEvent("story-draft-location", { detail: point })
      );
      setError("");
      setNotice("");
      window.setTimeout(
        () => document.getElementById("story-title")?.focus(),
        0
      );
    };
    window.addEventListener("story-composer-open", onOpen);
    const url = new URL(window.location.href);
    if (url.searchParams.get("compose") === "1") {
      window.setTimeout(onOpen, 0);
      url.searchParams.delete("compose");
      window.history.replaceState(window.history.state, "", url.toString());
    }
    return () => window.removeEventListener("story-composer-open", onOpen);
  }, [session?.user, point]);

  useEffect(() => {
    const query = placeQuery.trim();
    if (!open || query.length < 2 || query === selectedPlace) {
      setPlaces([]);
      setPlaceSearchError("");
      setSearchingPlaces(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearchingPlaces(true);
      setPlaceSearchError("");
      void fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          const body = (await response.json()) as {
            data?: PlaceHit[];
            message?: string;
          };
          if (!response.ok)
            throw new Error(body.message || "ค้นหาสถานที่ไม่สำเร็จ");
          setPlaces(body.data ?? []);
        })
        .catch((cause: unknown) => {
          if (!controller.signal.aborted) {
            setPlaces([]);
            setPlaceSearchError(
              cause instanceof Error ? cause.message : "ค้นหาสถานที่ไม่สำเร็จ"
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchingPlaces(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, placeQuery, selectedPlace]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void fetch("/api/stories/options")
      .then(async (response) => {
        const body = (await response.json()) as OptionsResponse;
        if (!response.ok)
          throw new Error(body.message || "โหลดตัวเลือกไม่สำเร็จ");
        if (!active) return;
        const nextCategories = body.data?.categories ?? [];
        const nextProvinces = body.data?.provinces ?? [];
        setCategories(nextCategories);
        setProvinces(nextProvinces);
        setCategoryId((current) => current || nextCategories[0]?.id || "");
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "โหลดตัวเลือกไม่สำเร็จ"
          );
      });
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    const onLocation = (event: Event) => {
      const selected = (event as CustomEvent<Point>).detail;
      if (pinMode) {
        setPendingPoint(selected);
        window.dispatchEvent(
          new CustomEvent("story-draft-location", { detail: selected })
        );
      } else updatePoint(selected);
    };
    window.addEventListener("story-location-selected", onLocation);
    return () =>
      window.removeEventListener("story-location-selected", onLocation);
  }, [pinMode]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("story-pin-mode", { detail: pinMode })
    );
  }, [pinMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        if (pinMode) {
          updatePoint(point);
          setPinMode(false);
        } else {
          setOpen(false);
          useMapSheetStore.getState().closeSheet();
          window.dispatchEvent(
            new CustomEvent("story-draft-location", { detail: null })
          );
          triggerRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pinMode, saving, point]);

  function close() {
    closeSheet();
    triggerRef.current?.focus();
    setPinMode(false);
    setOpen(false);
    window.dispatchEvent(
      new CustomEvent("story-draft-location", { detail: null })
    );
  }

  function updatePoint(next: Point | null) {
    setPoint(next);
    window.dispatchEvent(
      new CustomEvent("story-draft-location", { detail: next })
    );
  }

  function selectPlace(place: PlaceHit) {
    updatePoint({ longitude: place.longitude, latitude: place.latitude });
    setPlaceQuery(place.title);
    setSelectedPlace(place.title);
    setPlaces([]);
    const address = `${place.title} ${place.subtitle}`;
    const matchedProvince =
      provinces.find((province) => address.includes(province.name)) ??
      (address.includes("กรุงเทพ")
        ? provinces.find((province) => province.slug === "bangkok")
        : undefined);
    if (matchedProvince) {
      setProvinceId(matchedProvince.id);
    }
    setPinMode(false);
    flyTo(place.longitude, place.latitude, Math.max(place.zoom, 16));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const formElement = event.currentTarget;
    setError("");
    setNotice("");
    if (!provinceId) {
      setError("กรุณาเลือกจังหวัดจากรายการที่แนะนำ");
      document.getElementById("story-province")?.focus();
      return;
    }
    if (!point) {
      document.getElementById("story-location-button")?.focus();
      setError(
        "กรุณาค้นหาสถานที่ ใช้ตำแหน่งปัจจุบัน หรือเลือกหมุดบนแผนที่ก่อนบันทึก"
      );
      return;
    }
    if (
      isCrime &&
      !(
        event.currentTarget.elements.namedItem("sourceUrl") as HTMLInputElement
      ).value.trim()
    ) {
      setError("คดีอาชญากรรมต้องมีลิงก์หลักฐานอ้างอิง");
      return;
    }

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const payload = {
      title,
      slug: `story-${Date.now()}`,
      summary: String(form.get("summary") ?? "").trim(),
      content: String(form.get("content") ?? "").trim(),
      latitude: point.latitude,
      longitude: point.longitude,
      provinceId,
      categoryId,
      ...(String(form.get("sourceUrl") ?? "").trim()
        ? { sourceUrl: String(form.get("sourceUrl")).trim() }
        : {}),
      isSensitive: isCrime,
      tagIds: [],
      images: [],
    };

    setSaving(true);
    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { status: string; mapPoint?: StoryMapPoint | null };
      };
      if (!response.ok)
        throw new Error(body.message || "บันทึกเรื่องราวไม่สำเร็จ");
      if (!body.success || !body.data)
        throw new Error(body.message || "บันทึกเรื่องราวไม่สำเร็จ");
      const published = body.data.status === "APPROVED";
      if (published && body.data.mapPoint) {
        window.dispatchEvent(
          new CustomEvent("story-created", { detail: body.data.mapPoint })
        );
      } else if (published) {
        window.dispatchEvent(new Event("stories-refresh"));
      }
      const savedPoint = point;
      formElement.reset();
      setCategoryId("");
      setProvinceId("");
      setPlaceQuery("");
      setSelectedPlace("");
      setPlaces([]);
      setPendingPoint(null);
      setPlaceSearchError("");
      setError("");
      setNotice("");
      updatePoint(null);
      close();
      flyTo(savedPoint.longitude, savedPoint.latitude, 16);
      if (published)
        toast.success("เผยแพร่เรื่องราวแล้ว ดูหมุดได้ที่ตำแหน่งที่คุณบันทึก");
      else
        toast.success(
          "บันทึกเรื่องราวและส่งตรวจสอบแล้ว หมุดจะแสดงหลังผู้ดูแลอนุมัติ"
        );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "บันทึกเรื่องราวไม่สำเร็จ"
      );
    } finally {
      setSaving(false);
    }
  }

  if (sessionStatus === "loading") return null;
  if (!session?.user) {
    if (sheet !== null) return null;
    return (
      <Link
        href="/login?callbackUrl=%2F"
        className="bg-primary text-primary-foreground shadow-primary/25 focus-visible:outline-primary absolute bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4rem)] left-1/2 z-40 inline-flex h-12 -translate-x-1/2 items-center gap-2 rounded-full px-5 text-sm font-semibold shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 lg:hidden"
      >
        <Plus className="h-4 w-4" /> เขียนเรื่องราว
      </Link>
    );
  }

  return (
    <>
      {!open && sheet === null && (
        <button
          type="button"
          ref={triggerRef}
          aria-expanded={open}
          aria-controls="story-composer"
          onClick={() => {
            openSheet("composer");
            setOpen(true);
            updatePoint(point);
            window.setTimeout(
              () => document.getElementById("story-title")?.focus(),
              0
            );
            setError("");
            setNotice("");
          }}
          className="bg-primary text-primary-foreground shadow-primary/25 focus-visible:outline-primary absolute bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4rem)] left-1/2 z-40 inline-flex h-12 -translate-x-1/2 items-center gap-2 rounded-full px-5 text-sm font-semibold shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 lg:hidden"
        >
          <Plus className="h-4 w-4" /> เขียนเรื่องราว
        </button>
      )}
      {open && pinMode && (
        <div
          className="liquid-glass absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl p-4"
          role="status"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {pendingPoint
                ? "ลากหมุดเพื่อปรับตำแหน่ง แล้วกดยืนยัน"
                : "แตะตำแหน่งบนแผนที่เพื่อวางหมุด"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              เลื่อนและซูมแผนที่ได้ ข้อมูลที่กรอกยังอยู่ครบ
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={!pendingPoint}
                onClick={() => {
                  if (pendingPoint) updatePoint(pendingPoint);
                  setPinMode(false);
                  window.setTimeout(
                    () =>
                      document.getElementById("story-location-button")?.focus(),
                    0
                  );
                }}
                className="bg-primary text-primary-foreground inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 text-sm font-semibold disabled:opacity-50"
              >
                ยืนยันตำแหน่ง
              </button>
              <button
                type="button"
                onClick={() => {
                  updatePoint(point);
                  setPinMode(false);
                }}
                className="text-foreground border-border min-h-11 rounded-xl border px-3 text-sm font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      {open && (
        <section
          id="story-composer"
          className={`liquid-glass absolute inset-x-2 top-20 bottom-2 z-[60] flex flex-col overflow-hidden rounded-[1.5rem] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[min(34rem,calc(100%-2rem))] ${pinMode ? "hidden" : ""}`}
          aria-label="เขียนเรื่องราว"
        >
          <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-4">
            <div>
              <p className="text-primary text-xs font-semibold tracking-wide">
                ปักหมุดเรื่องราว
              </p>
              <h2 className="font-heading text-lg font-semibold">
                เขียนเรื่องราว
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                เล่าเรื่องของคุณ แล้วปักหมุดให้คนอื่นค้นพบ
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="icon-well inline-flex h-9 w-9"
              aria-label="ปิด"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form
            ref={formRef}
            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pt-5"
            onSubmit={submit}
          >
            <h3 className="text-primary text-sm font-semibold">
              1. เรื่องราวที่อยากแบ่งปัน
            </h3>
            <div>
              <label className={labelClass} htmlFor="story-title">
                ชื่อเรื่อง
              </label>
              <input
                className={inputClass}
                id="story-title"
                name="title"
                placeholder="เช่น ความทรงจำที่ตลาดเก่าริมแม่น้ำ"
                required
                minLength={3}
                maxLength={200}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="story-category">
                ประเภทเรื่องราว
              </label>
              <StoryDropdown
                id="story-category"
                label="ประเภทเรื่องราว"
                options={categories}
                value={categoryId}
                onChange={setCategoryId}
                placeholder="เลือกประเภทเรื่องราว"
                searchPlaceholder="ค้นหาประเภทเรื่องราว"
                icon={<ListFilter className="h-4 w-4" />}
              />
            </div>
            <h3 className="text-primary border-border border-t pt-5 text-sm font-semibold">
              2. เรื่องนี้เกิดขึ้นที่ไหน
            </h3>
            <div>
              <label className={labelClass} htmlFor="story-province">
                ค้นหาและเลือกจังหวัด
              </label>
              <StoryDropdown
                id="story-province"
                label="จังหวัด"
                options={provinces}
                value={provinceId}
                onChange={setProvinceId}
                placeholder="เลือกจังหวัดที่เกิดเรื่องราว"
                searchPlaceholder="ค้นหาจังหวัด เช่น เชียงใหม่"
                icon={<MapPin className="h-4 w-4" />}
              />
              {provinces.length === 0 && (
                <p className="text-destructive mt-1 text-xs">
                  ยังไม่มีข้อมูลจังหวัด กรุณาติดต่อผู้ดูแลระบบ
                </p>
              )}
            </div>
            <div>
              <span className={labelClass}>ตำแหน่งบนแผนที่</span>
              <label className="relative mb-2 block">
                <span className="sr-only">ค้นหาสถานที่อย่างละเอียด</span>
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  className={`${inputClass} pl-9`}
                  type="search"
                  autoComplete="off"
                  value={placeQuery}
                  onChange={(event) => setPlaceQuery(event.target.value)}
                  placeholder="ค้นหาชื่อสถานที่ ที่อยู่ หรือจุดสังเกต"
                />
              </label>
              {(searchingPlaces || placeSearchError || places.length > 0) && (
                <div className="border-border bg-background/80 mb-2 max-h-36 space-y-1 overflow-y-auto rounded-xl border p-1.5">
                  {searchingPlaces && (
                    <p className="text-muted-foreground px-2 py-1.5 text-xs">
                      กำลังค้นหาสถานที่…
                    </p>
                  )}
                  {placeSearchError && (
                    <p
                      role="alert"
                      className="text-destructive px-2 py-1.5 text-xs"
                    >
                      {placeSearchError}
                    </p>
                  )}
                  {places.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => selectPlace(place)}
                      className="hover:bg-primary/10 block w-full rounded-lg px-2 py-1.5 text-left transition-colors"
                    >
                      <span className="text-foreground block text-xs font-medium">
                        {place.title}
                      </span>
                      {place.subtitle && (
                        <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-[0.68rem]">
                          {place.subtitle}
                        </span>
                      )}
                    </button>
                  ))}
                  {!searchingPlaces &&
                    !placeSearchError &&
                    places.length === 0 && (
                      <p className="text-muted-foreground px-2 py-1.5 text-xs">
                        ไม่พบสถานที่ ลองระบุชื่อย่านหรือจังหวัดเพิ่ม
                      </p>
                    )}
                </div>
              )}
              <button
                type="button"
                disabled={locating}
                onClick={() => {
                  if (!navigator.geolocation) {
                    setError(
                      "อุปกรณ์นี้ไม่รองรับการหาตำแหน่ง กรุณาค้นหาสถานที่หรือเลือกบนแผนที่"
                    );
                    return;
                  }
                  setLocating(true);
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const next = {
                        longitude: position.coords.longitude,
                        latitude: position.coords.latitude,
                      };
                      updatePoint(next);
                      flyTo(next.longitude, next.latitude, 16);
                      setLocating(false);
                    },
                    () => {
                      setLocating(false);
                      setError(
                        "หาตำแหน่งไม่ได้ กรุณาอนุญาตตำแหน่ง หรือค้นหาสถานที่แทน"
                      );
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                }}
                className="text-primary bg-primary/10 mb-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium disabled:opacity-50"
              >
                <LocateFixed className="h-4 w-4" />
                {locating ? "กำลังหาตำแหน่ง…" : "ใช้ตำแหน่งปัจจุบันของฉัน"}
              </button>
              <p className="text-muted-foreground mb-3 text-center text-xs">
                หรือ
              </p>
              {point && (
                <p
                  className="text-primary mb-2 flex items-center gap-2 text-sm"
                  role="status"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  เลือกตำแหน่งแล้ว
                </p>
              )}
              <button
                type="button"
                id="story-location-button"
                onClick={() => {
                  setPendingPoint(point);
                  setPinMode(true);
                  if (point) flyTo(point.longitude, point.latitude, 16);
                }}
                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${pinMode ? "border-primary bg-primary/15 text-primary" : "border-border bg-foreground/5 text-foreground hover:bg-primary/10"}`}
              >
                <MapPin className="h-4 w-4" />{" "}
                {pinMode
                  ? "คลิกตำแหน่งที่ต้องการบนแผนที่…"
                  : point
                    ? "เปลี่ยนตำแหน่งบนแผนที่"
                    : "เลือกตำแหน่งบนแผนที่"}
              </button>
            </div>
            <h3 className="text-primary border-border border-t pt-5 text-sm font-semibold">
              3. เล่าให้เราฟัง
            </h3>
            <div>
              <label className={labelClass} htmlFor="story-summary">
                สรุปเรื่อง
              </label>
              <textarea
                className="liquid-field text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50 min-h-24 w-full rounded-xl p-3 text-base outline-none focus-visible:ring-2 sm:text-sm"
                id="story-summary"
                name="summary"
                placeholder="เล่าใจความสำคัญสั้น ๆ ให้คนอ่านอยากรู้ต่อ"
                aria-describedby="story-summary-help"
                required
                minLength={10}
                maxLength={500}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="story-content">
                รายละเอียด
              </label>
              <textarea
                className="liquid-field text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50 min-h-44 w-full rounded-xl p-3 text-base outline-none focus-visible:ring-2 sm:text-sm"
                id="story-content"
                name="content"
                placeholder="เกิดอะไรขึ้น ที่นี่มีอะไรน่าสนใจ หรือมีความทรงจำอะไรที่อยากเล่า…"
                aria-describedby="story-content-help"
                required
                minLength={50}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="story-source">
                {isCrime
                  ? "หลักฐานอ้างอิง (จำเป็น)"
                  : "แหล่งข้อมูลอ้างอิง (ถ้ามี)"}
              </label>
              <input
                className={inputClass}
                id="story-source"
                name="sourceUrl"
                type="url"
                placeholder="https://…"
                required={isCrime}
              />
            </div>
            {isCrime && (
              <p className="text-foreground rounded-xl bg-amber-500/10 px-3 py-2 text-xs leading-relaxed">
                เรื่องคดีอาชญากรรมจะอยู่ในสถานะรอตรวจสอบและยังไม่เผยแพร่
                จนกว่าผู้ดูแลจะอนุมัติ
              </p>
            )}
            <div className="sticky bottom-0 -mx-5 space-y-3 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {error && (
                <p role="alert" className="text-destructive text-xs">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="text-primary text-xs">
                  {notice}
                </p>
              )}
              <button
                type="submit"
                disabled={saving || !categoryId || provinces.length === 0}
                className="bg-primary text-primary-foreground inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving
                  ? "กำลังบันทึก…"
                  : isCrime
                    ? "ส่งตรวจสอบ"
                    : "เผยแพร่เรื่องราว"}
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
