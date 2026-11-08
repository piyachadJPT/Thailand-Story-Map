import { categoryColor } from "@/config/categories";

/**
 * Category-colored dot for the story and province mini maps (rendered into
 * Mapbox, anchored at its center). Same look as the main map's pins.
 */
export default function StoryMapPin({ categorySlug }: { categorySlug: string }) {
  return (
    <span
      className="grid size-8 place-items-center"
      style={{ "--pin-color": categoryColor(categorySlug) } as React.CSSProperties}
    >
      <span className="block size-4 rounded-full bg-(--pin-color) ring-2 ring-card outline-6 outline-(--pin-color)/20" />
    </span>
  );
}
