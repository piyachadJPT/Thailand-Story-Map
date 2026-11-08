import { GoldDivider } from "@/components/ui/gold-divider";
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
 * The story text in a ~680px column, then figures and a ลายประจำยาม end
 * ornament. No drop cap: Thai ::first-letter splits leading vowels from
 * their consonant. Font size is inherited from ReadingToolbar's setting.
 */
export default function StoryBody({ title, paragraphs, images, layout, provinceName }: StoryBodyProps) {
  return (
    <div className="mx-auto max-w-170 space-y-10">
      <div className="space-y-[1.15em] leading-[1.95] text-foreground wrap-anywhere">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="whitespace-pre-wrap"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {images.length > 0 ? (
        <StoryGallery images={images} layout={layout} title={title} provinceName={provinceName} />
      ) : null}

      <GoldDivider pattern="lai" className="mx-auto w-28" />
    </div>
  );
}
