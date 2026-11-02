"use client";

import { useCallback, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import type { PlaceHit } from "@/components/map/geocode";
import { useMapSheetStore } from "@/components/map/mapSheetStore";
import { matchProvince } from "@/components/story/form/matchProvince";
import { useCoverImage } from "@/components/story/form/useCoverImage";
import ComposerForm from "./ComposerForm";
import ComposerPanel from "./ComposerPanel";
import ComposerTrigger from "./ComposerTrigger";
import PinModeBar from "./PinModeBar";
import { useComposerEvents } from "./useComposerEvents";
import { useComposerLocation } from "./useComposerLocation";
import { useComposerOptions } from "./useComposerOptions";
import { focusLater, useComposerSteps } from "./useComposerSteps";
import { useStorySubmit } from "./useStorySubmit";


export default function StoryComposer() {
  const cover = useCoverImage();
  const { data: session, status: sessionStatus } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [provinceId, setProvinceId] = useState("");
  const location = useComposerLocation();
  const { point, pinMode, updatePoint } = location;
  const [error, setError] = useState("");
  const onOptionsError = useCallback((message: string) => setError(message), []);
  const { categories, provinces, categoryId, setCategoryId } = useComposerOptions(open, onOptionsError);
  const sheet = useMapSheetStore((state) => state.sheet);
  const flyTo = useMapSheetStore((state) => state.flyTo);
  const isCrime = categories.find((item) => item.id === categoryId)?.slug === "crime";
  const { step, snapshot, goToStep, checkPlace } = useComposerSteps({
    formRef,
    provinceId,
    hasPoint: Boolean(point),
    setError,
  });

  function openComposer() {
    useMapSheetStore.getState().openSheet("composer");
    setOpen(true);
    goToStep(0);
    updatePoint(point);
    setError("");
    focusLater("story-composer");
  }
  function close() {
    useMapSheetStore.getState().closeSheet();
    triggerRef.current?.focus();
    location.stopPicking();
    setOpen(false);
    window.dispatchEvent(new CustomEvent("story-draft-location", { detail: null }));
  }
  const { saving, submit } = useStorySubmit({
    cover,
    point,
    provinceId,
    categoryId,
    isCrime,
    currentStep: step,
    goToStep,
    checkPlace,
    setError,
    onSaved: ({ published, mapPoint, point: savedPoint }) => {
      if (published && mapPoint) {
        window.dispatchEvent(new CustomEvent("story-created", { detail: mapPoint }));
      } else if (published) {
        window.dispatchEvent(new Event("stories-refresh"));
      }
      cover.select(null);
      setCategoryId("");
      setProvinceId("");
      location.clearPending();
      setError("");
      updatePoint(null);
      close();
      flyTo(savedPoint.longitude, savedPoint.latitude, 16);
      if (published) toast.success("เผยแพร่เรื่องราวแล้ว ดูหมุดได้ที่ตำแหน่งที่คุณบันทึก");
      else toast.success("บันทึกเรื่องราวและส่งตรวจสอบแล้ว หมุดจะแสดงหลังผู้ดูแลอนุมัติ");
    },
  });

  useComposerEvents({
    enabled: Boolean(session?.user),
    open,
    pinMode,
    onOpenRequest: openComposer,
    onMapPoint: location.receiveMapPoint,
    onEscape: () => {
      if (saving) return;
      if (pinMode) location.cancelPick();
      else close();
    },
  });

  if (sessionStatus === "loading") return null;
  if (!session?.user) return sheet === null ? <ComposerTrigger loggedIn={false} /> : null;

  return (
    <>
      {!open && sheet === null ? (
        <ComposerTrigger loggedIn ref={triggerRef} onOpen={openComposer} />
      ) : null}
      {open && pinMode ? (
        <PinModeBar
          hasPendingPoint={Boolean(location.pendingPoint)}
          onConfirm={() => {
            location.confirmPick();
            focusLater("story-location-button");
          }}
          onCancel={location.cancelPick}
        />
      ) : null}
      {open ? (
        <ComposerPanel hidden={pinMode} step={step} onStepChange={goToStep}>
          <ComposerForm
            formRef={formRef}
            step={step}
            onStepChange={goToStep}
            onSubmit={submit}
            onClose={close}
            checkPlace={checkPlace}
            error={error}
            onError={setError}
            saving={saving}
            canSubmit={Boolean(categoryId) && provinces.length > 0}
            isCrime={isCrime}
            cover={cover}
            snapshot={snapshot}
            categories={categories}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            provinces={provinces}
            provinceId={provinceId}
            onProvinceChange={setProvinceId}
            point={point}
            pinMode={pinMode}
            onPlace={(place: PlaceHit) => {
              location.goToPlace(place);
              const province = matchProvince(place, provinces);
              if (province) setProvinceId(province.id);
            }}
            onLocate={location.locate}
            onStartPick={location.startPick}
          />
        </ComposerPanel>
      ) : null}
    </>
  );
}
