import { Feather, MapPin } from "lucide-react";
import { categoryIcon, storyCategories } from "@/config/categories";

/**
 * Hidden set of lucide icons. Map pins are plain DOM nodes created outside
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
      <MapPin data-pin-icon="place" />
      <Feather data-pin-icon="draft" />
    </div>
  );
}
