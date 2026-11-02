import type { StoryMapPoint } from "@/models/types/story";
import { categoryColor, isCategorySlug, storyCategories } from "@/config/categories";

/** Returns a fresh copy of a sprite icon (see PinIconSprite). */
export type PinIconSource = (key: string) => SVGElement | null;

export function clonePinIcon(sprite: HTMLElement | null, key: string) {
  const icon =
    sprite?.querySelector<SVGElement>(`[data-pin-icon="${key}"]`) ??
    sprite?.querySelector<SVGElement>('[data-pin-icon="place"]');
  return (icon?.cloneNode(true) as SVGElement | undefined) ?? null;
}

/*
 * Mapbox owns the outer element's transform, so every visual state
 * (hover, focus, data-active, data-featured) is applied to the inner medallion.
 */
const pinButtonClasses =
  "group/pin flex h-13 w-11 cursor-pointer items-start justify-center border-0 bg-transparent p-0 outline-none";

const pinMedallionClasses = [
  "relative grid size-10 place-items-center rounded-full border-2 border-(--pin-color) bg-card text-(--pin-color) shadow-lift",
  "transition-[scale,box-shadow] duration-150 motion-reduce:transition-none [&_svg]:size-5",
  "after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-6 after:border-t-8 after:border-x-transparent after:border-t-(--pin-color)",
  "group-hover/pin:scale-110 group-hover/pin:ring-4 group-hover/pin:ring-(--pin-color)/25",
  "group-focus-visible/pin:scale-110 group-focus-visible/pin:outline-3 group-focus-visible/pin:outline-offset-4 group-focus-visible/pin:outline-foreground",
  "group-data-active/pin:scale-115 group-data-active/pin:ring-6 group-data-active/pin:ring-(--pin-color)/30",
  "group-data-featured/pin:motion-safe:animate-pin-ping",
].join(" ");

function pinElement<T extends HTMLElement>(
  element: T,
  color: string,
  icon: SVGElement | null
) {
  element.className = pinButtonClasses;
  element.style.setProperty("--pin-color", color);
  const medallion = document.createElement("span");
  medallion.className = pinMedallionClasses;
  medallion.setAttribute("aria-hidden", "true");
  if (icon) medallion.append(icon);
  element.append(medallion);
  return element;
}

/** Story pin: category color and icon, opens the story preview. */
export function createStoryPin(story: StoryMapPoint, getIcon: PinIconSource) {
  const category = storyCategories.find(
    (item) => item.slug === story.categorySlug
  );
  const color = isCategorySlug(story.categorySlug)
    ? categoryColor(story.categorySlug)
    : (story.categoryColor ?? "var(--gold)");

  const button = document.createElement("button");
  button.type = "button";
  button.dataset.storyId = story.id;
  button.setAttribute(
    "aria-label",
    `ดูรายละเอียด ${story.title} · ${category?.name ?? "เรื่องราว"}`
  );
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-expanded", "false");
  button.title = `${story.title} · กดดูรายละเอียด`;
  return pinElement(button, color, getIcon(story.categorySlug));
}

/** Gold pin for a searched place. */
export function createPlacePin(getIcon: PinIconSource) {
  return pinElement(document.createElement("div"), "var(--gold)", getIcon("place"));
}

/** Ink pin for the location of a story being written (draggable). */
export function createDraftPin(getIcon: PinIconSource) {
  const element = pinElement(
    document.createElement("div"),
    "var(--primary)",
    getIcon("draft")
  );
  element.classList.add("cursor-grab", "active:cursor-grabbing");
  return element;
}
