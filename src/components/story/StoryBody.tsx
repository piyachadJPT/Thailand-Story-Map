import StoryGallery from "./StoryGallery";
import type { StoryView } from "./storyView";

type StoryBodyProps = {
  title: string;
  paragraphs: string[];
  images: StoryView["bodyImages"];
  layout: StoryView["galleryLayout"];
  provinceName: string;
};

/**
 * The story text in a ~680px column with a gold drop cap, then figures and
 * an end ornament. Font size is inherited from ReadingToolbar's setting.
 */
export default function StoryBody({ title, paragraphs, images, layout, provinceName }: StoryBodyProps) {
  return (
    <div className="mx-auto max-w-170 space-y-10">
      <div className="space-y-[1.15em] leading-[1.95] text-foreground wrap-anywhere">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="whitespace-pre-wrap first:first-letter:float-left first:first-letter:mt-1 first:first-letter:mr-3 first:first-letter:font-heading first:first-letter:text-[3.4em] first:first-letter:leading-[0.9] first:first-letter:font-semibold first:first-letter:text-gold-ink"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {images.length > 0 ? (
        <StoryGallery images={images} layout={layout} title={title} provinceName={provinceName} />
      ) : null}

      <div aria-hidden="true" className="flex items-center gap-4 text-gold">
        <span className="h-px flex-1 bg-linear-to-r from-transparent to-gold/60" />
        ✦
        <span className="h-px flex-1 bg-linear-to-l from-transparent to-gold/60" />
      </div>
    </div>
  );
}
