"use client";

import ContentEditor from "@/components/story/form/ContentEditor";
import CoverImageInput from "@/components/story/form/CoverImageInput";
import SourceField from "@/components/story/form/SourceField";
import SummaryField from "@/components/story/form/SummaryField";
import TitleField from "@/components/story/form/TitleField";
import type { CoverImage } from "@/components/story/form/useCoverImage";

type StepContentProps = {
  hidden: boolean;
  cover: CoverImage;
  saving: boolean;
  isCrime: boolean;
};

/** Step 2 — เนื้อหา */
export default function StepContent({ hidden, cover, saving, isCrime }: StepContentProps) {
  return (
    <div data-step="1" hidden={hidden} className="space-y-6">
      <TitleField placeholder="เช่น ความทรงจำที่ตลาดเก่าริมแม่น้ำ" />
      <CoverImageInput image={cover} disabled={saving} />
      <SummaryField placeholder="เล่าใจความสำคัญสั้น ๆ ให้คนอ่านอยากรู้ต่อ" />
      <ContentEditor placeholder="เกิดอะไรขึ้น ที่นี่มีอะไรน่าสนใจ หรือมีความทรงจำอะไรที่อยากเล่า…" />
      <SourceField required={isCrime} requiredLabel="หลักฐานอ้างอิง" />
    </div>
  );
}
