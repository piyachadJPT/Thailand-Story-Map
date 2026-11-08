import { categoryIcon, storyCategories } from "@/config/categories";
import { PenNib, PlaceMark } from "@/config/storyIcons";

/**
 * Hidden set of pin icons. Map pins are plain DOM nodes created outside
 * React, so they clone their icon from here (see clonePinIcon in MapPin.ts).
 */
export default function PinIconSprite({
  ref,
}: {
  ref: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} hidden aria-hidden="true">
      {storyCategories.map((category) => {
        const Icon = categoryIcon(category.slug);
        return <Icon key={category.slug} data-pin-icon={category.slug} />;
      })}
      <PlaceMark data-pin-icon="place" />
      <PenNib data-pin-icon="draft" />
    </div>
  );
}
