"use client";

import type { PlaceHit } from "@/components/map/geocode";
import CategoryField from "@/components/story/form/CategoryField";
import LocationField from "@/components/story/form/LocationField";
import ProvinceField from "@/components/story/form/ProvinceField";
import type { FormOption, Point } from "@/components/story/form/types";

type StepPlaceProps = {
  hidden: boolean;
  categories: FormOption[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  provinces: FormOption[];
  provinceId: string;
  onProvinceChange: (id: string) => void;
  hasPoint: boolean;
  pinMode: boolean;
  onPlace: (place: PlaceHit) => void;
  onLocate: (point: Point) => void;
  onStartPick: () => void;
  onError: (message: string) => void;
};

/** Step 1 — ประเภท & ตำแหน่ง */
export default function StepPlace(props: StepPlaceProps) {
  return (
    <div data-step="0" hidden={props.hidden} className="space-y-6">
      <CategoryField
        options={props.categories}
        value={props.categoryId}
        onChange={props.onCategoryChange}
      />
      <ProvinceField
        label="ค้นหาและเลือกจังหวัด"
        options={props.provinces}
        value={props.provinceId}
        onChange={props.onProvinceChange}
      />
      <LocationField
        hasPoint={props.hasPoint}
        onPlace={props.onPlace}
        onLocate={props.onLocate}
        onError={props.onError}
        pick={{ active: props.pinMode, onStart: props.onStartPick }}
      />
    </div>
  );
}
