import { createElement } from "react";
import { categoryColor, categoryIcon } from "@/config/categories";

/**
 * Category-colored teardrop pin for the story and province mini maps
 * (rendered into Mapbox, anchored at its tip). Same look as the main map.
 */
export default function StoryMapPin({ categorySlug }: { categorySlug: string }) {
  return (
    <span
      className="relative block h-12 w-10 text-white"
      style={{ "--pin-color": categoryColor(categorySlug) } as React.CSSProperties}
    >
      <svg viewBox="0 0 32 40" aria-hidden="true" className="block size-full">
        <path
          d="M16 1.5C8 1.5 1.5 7.8 1.5 15.7c0 10.1 12.6 21 13.6 21.9a1.4 1.4 0 0 0 1.8 0c1-.9 13.6-11.8 13.6-21.9C30.5 7.8 24 1.5 16 1.5z"
          fill="var(--pin-color)"
          stroke="var(--card)"
          strokeWidth="1.5"
        />
      </svg>
      {createElement(categoryIcon(categorySlug), {
        "aria-hidden": true,
        strokeWidth: 2,
        className: "absolute top-[9.5px] left-1/2 size-5 -translate-x-1/2",
      })}
    </span>
  );
}
