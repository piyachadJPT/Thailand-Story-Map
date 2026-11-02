type StoryCoverProps = {
  url: string;
  alt: string;
};

/** Wide cover banner with a soft ink fade and a gold hairline. */
export default function StoryCover({ url, alt }: StoryCoverProps) {
  return (
    <figure className="relative overflow-hidden rounded-panel bg-muted shadow-lift ring-1 ring-border">
      {/* Uploaded images may use external storage URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} className="aspect-video w-full object-cover sm:aspect-21/9" />
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
