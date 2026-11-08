import Image from "next/image";
import { isOptimizableImage } from "@/lib/seo/images";

type StoryCoverProps = {
  url: string;
  alt: string;
};

/** Wide cover banner with a soft ink fade and a gold hairline. The page's LCP image. */
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
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-10 bottom-0 h-px bg-linear-to-r from-transparent via-gold/80 to-transparent"
      />
    </figure>
  );
}
