import { cn } from "@/lib/utils";

const sizes = {
  md: { svg: "size-6.5", spots: ["top-1.5 left-1.5", "top-1.5 right-1.5 -scale-x-100", "bottom-1.5 left-1.5 -scale-y-100", "bottom-1.5 right-1.5 -scale-100"] },
  sm: { svg: "size-5", spots: ["top-1 left-1", "top-1 right-1 -scale-x-100", "bottom-1 left-1 -scale-y-100", "bottom-1 right-1 -scale-100"] },
} as const;

type KrachengCornersProps = {
  /** md for pictures, sm for compact cards. */
  size?: keyof typeof sizes;
  /** Set the color here, e.g. "text-gold" or "text-ivory/90". */
  className?: string;
};

/**
 * Four กระจัง corner marks (two hairlines, a small diamond, a leaf pointing
 * inward) like the frame of a mural panel. Decorative: place inside a
 * `relative` parent; it never takes clicks.
 */
export default function KrachengCorners({ size = "md", className }: KrachengCornersProps) {
  const { svg, spots } = sizes[size];
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 z-10", className)}>
      {spots.map((spot) => (
        <svg key={spot} viewBox="0 0 26 26" fill="none" className={cn("absolute", svg, spot)}>
          <path d="M1 25V7M7 1h18" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 1l3.5 3.5L1 8zM1 1l3.5 3.5L8 1z" fill="currentColor" />
          <path d="M6 6c3 .5 5 3 5.5 6C9 11.5 6.5 9 6 6z" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </span>
  );
}
