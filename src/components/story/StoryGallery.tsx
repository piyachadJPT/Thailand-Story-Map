import { cva } from "class-variance-authority";
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
      <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-gold-ink">
        <span aria-hidden="true" className="h-px w-6 bg-gold" />
        ภาพประกอบ
      </p>
      <div className={gridVariants({ layout })}>
        {images.map((image, index) => (
          <figure key={image.id} className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
            {/* Uploaded images may use external storage URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.altText || `ภาพประกอบ ${title}`}
              loading="lazy"
              className="aspect-4/3 w-full bg-muted object-cover"
            />
            <figcaption className="flex items-baseline gap-2 px-4 py-3 text-xs text-muted-foreground">
              <span className="font-heading font-semibold text-gold-ink tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {image.altText || provinceName}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
