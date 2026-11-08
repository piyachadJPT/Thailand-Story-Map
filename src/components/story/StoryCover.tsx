import Image from "next/image";
import { isOptimizableImage } from "@/lib/seo/images";

type StoryCoverProps = {
  url: string;
  alt: string;
};

/** Wide cover banner with a gold rule along the bottom. The page's LCP image. */
export default function StoryCover({ url, alt }: StoryCoverProps) {
  return (
    <figure className="relative aspect-video overflow-hidden rounded-panel bg-muted ring-1 ring-border sm:aspect-21/9">
      <Image
        src={url}
        alt={alt}
        fill
        preload
        fetchPriority="high"
        loading="eager"
        sizes="(min-width: 1024px) 976px, calc(100vw - 32px)"
        unoptimized={!isOptimizableImage(url)}
        className="object-cover"
      />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-gold" />
    </figure>
  );
}
