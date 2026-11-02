import { cn } from "@/lib/utils";

/** Stable hue per user id so letter avatars stay the same color. */
const tones = [
  "bg-cat-ghost/15 text-cat-ghost",
  "bg-cat-history/15 text-gold-ink",
  "bg-cat-legend/15 text-cat-legend",
  "bg-cat-crime/15 text-cat-crime",
  "bg-cat-local/15 text-cat-local",
];

function toneFor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return tones[Math.abs(hash) % tones.length];
}

const sizes = { xs: "size-6 text-[0.65rem]", sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-[72px] text-2xl" };

export default function Avatar({
  id,
  name,
  image,
  size = "sm",
  className,
}: {
  id: string;
  name: string | null | undefined;
  image?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  if (image) {
    return (
      // Google profile photos are external; skip the image optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className={cn("shrink-0 rounded-full object-cover ring-1 ring-border", sizes[size], className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold",
        toneFor(id),
        sizes[size],
        className
      )}
    >
      {(name?.trim() || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}
