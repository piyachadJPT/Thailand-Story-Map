import { createElement } from "react";
import { categoryColor, categoryIcon } from "@/config/categories";

/** Category-colored map pin for the story's mini map (rendered into Mapbox). */
export default function StoryMapPin({ categorySlug }: { categorySlug: string }) {
  return (
    <div
      className="relative grid size-11 place-items-center rounded-full border-2 border-(--pin-color) bg-card text-(--pin-color) shadow-lift ring-6 ring-(--pin-color)/20 after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-6 after:border-t-8 after:border-x-transparent after:border-t-(--pin-color)"
      style={{ "--pin-color": categoryColor(categorySlug) } as React.CSSProperties}
    >
      {createElement(categoryIcon(categorySlug), { "aria-hidden": true, className: "size-5" })}
    </div>
  );
}
