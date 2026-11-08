import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StoryGallery from "./StoryGallery";
import type { StoryView } from "./storyView";

type StoryBodyProps = {
  title: string;
  paragraphs: string[];
  images: StoryView["bodyImages"];
  layout: StoryView["galleryLayout"];
  provinceName: string;
  /** Where "เดินทางต่อใน…" leads: more stories in the same province. Omitted in the backoffice preview. */
  continueHref?: string;
};

/**
 * The story text in a ~680px column, then figures, then ๛ (โคมูตร, the
 * manuscript end mark) and a link onward in the same province.
 * No drop cap: Thai ::first-letter splits leading vowels from their consonant.
 * Font size is inherited from ReadingToolbar's setting.
 */
export default function StoryBody({
  title,
  paragraphs,
  images,
  layout,
  provinceName,
  continueHref,
}: StoryBodyProps) {
  return (
    <div className="mx-auto max-w-170 space-y-10">
      <div className="text-foreground space-y-[1.15em] leading-[1.95] wrap-anywhere">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-wrap">
            {paragraph}
          </p>
        ))}
      </div>

      {images.length > 0 ? (
        <StoryGallery
          images={images}
          layout={layout}
          title={title}
          provinceName={provinceName}
        />
      ) : null}

      <div className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden="true"
          className="font-heading text-gold-ink text-4xl leading-none"
        >
          ๛
        </span>
        {continueHref ? (
          <Link
            href={continueHref}
            className="group/next text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-semibold outline-none focus-visible:ring-2"
          >
            <span className="border-gold border-b pb-0.5">
              เดินทางต่อใน{provinceName}
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover/next:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
