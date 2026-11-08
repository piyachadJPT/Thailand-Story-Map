import Image from "next/image";
import { cva } from "class-variance-authority";
import { isOptimizableImage } from "@/lib/seo/images";
import { thaiOrdinal } from "@/lib/thai-digits";
import type { GalleryLayout } from "./storyView";

const gridVariants = cva("grid gap-3", {
  variants: {
    layout: {
      single: "grid-cols-1",
      pair: "sm:grid-cols-2",
      mosaic: "sm:grid-cols-2 sm:[&>figure:first-child]:col-span-2",
    },
  },
});

type StoryGalleryProps = {
  images: { id: string; url: string; altText: string | null }[];
  layout: GalleryLayout;
  title: string;
  provinceName: string;
};

/** "ภาพประกอบ" — numbered figures below the text. */
export default function StoryGallery({ images, layout, title, provinceName }: StoryGalleryProps) {
  return (
    <section aria-label="ภาพประกอบ" className="space-y-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-chad">
        <span aria-hidden="true" className="text-base text-gold-ink">๏</span>
        ภาพประกอบ
      </p>
      <div className={gridVariants({ layout })}>
        {images.map((image, index) => (
          <figure key={image.id} className="overflow-hidden rounded-lg bg-card ring-1 ring-border">
            <div className="relative aspect-4/3 w-full bg-muted">
              <Image
                src={image.url}
                alt={image.altText || `ภาพประกอบ ${title}`}
                fill
                sizes={layout === "single" ? "(min-width: 768px) 680px, 100vw" : "(min-width: 768px) 340px, 100vw"}
                unoptimized={!isOptimizableImage(image.url)}
                className="object-cover"
              />
            </div>
            <figcaption className="flex items-baseline gap-2 px-4 py-3 text-xs text-muted-foreground">
              <span className="font-heading font-bold text-gold-ink tabular-nums">
                {thaiOrdinal(index + 1)}
              </span>
              {image.altText || provinceName}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
