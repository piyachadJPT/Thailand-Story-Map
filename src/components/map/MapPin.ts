import type { StoryMapPoint } from "@/models/types/story";
import { categoryColor, isCategorySlug, storyCategories } from "@/config/categories";

/*
 * Pins are small solid dots in the category color with a thin paper-colored
 * ring, anchored at their center. The button is larger than the dot so it is
 * still easy to tap. Mapbox owns the outer element's transform, so every visual
 * state (hover, focus, data-active, data-featured) is applied to the inner dot.
 */
const pinButtonClasses =
  "group/pin grid size-8 cursor-pointer place-items-center border-0 bg-transparent p-0 outline-none";

const pinDotClasses = [
  "block rounded-full bg-(--pin-color) ring-2 ring-card",
  "transition-[scale,box-shadow] duration-150 motion-reduce:transition-none",
  "group-hover/pin:scale-125",
  "group-focus-visible/pin:scale-125 group-focus-visible/pin:outline-2 group-focus-visible/pin:outline-offset-3 group-focus-visible/pin:outline-foreground",
  "group-data-active/pin:scale-150 group-data-active/pin:ring-foreground",
  "group-data-featured/pin:motion-safe:animate-pin-ping",
].join(" ");

/** Popup offset (px) so it opens just above a center-anchored dot. */
export const PIN_POPUP_OFFSET = 14;

function pinElement<T extends HTMLElement>(element: T, color: string, size: string) {
  element.className = pinButtonClasses;
  element.style.setProperty("--pin-color", color);
  const dot = document.createElement("span");
  dot.className = `${pinDotClasses} ${size}`;
  dot.setAttribute("aria-hidden", "true");
  element.append(dot);
  return element;
}

/** Story pin: category-colored dot, opens the story preview. */
export function createStoryPin(story: StoryMapPoint) {
  const category = storyCategories.find((item) => item.slug === story.categorySlug);
  const color = isCategorySlug(story.categorySlug)
    ? categoryColor(story.categorySlug)
    : (story.categoryColor ?? "var(--gold)");

  const button = document.createElement("button");
  button.type = "button";
  button.dataset.storyId = story.id;
  button.setAttribute("aria-label", `ดูรายละเอียด ${story.title} · ${category?.name ?? "เรื่องราว"}`);
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-expanded", "false");
  button.title = `${story.title} · กดดูรายละเอียด`;
  return pinElement(button, color, "size-3.5");
}

/** Gold dot for a searched place. */
export function createPlacePin() {
  return pinElement(document.createElement("div"), "var(--gold)", "size-4.5");
}

/** Ink dot for the location of a story being written (draggable). */
export function createDraftPin() {
  const element = pinElement(document.createElement("div"), "var(--primary)", "size-4.5");
  element.classList.add("size-10", "cursor-grab", "active:cursor-grabbing");
  element.classList.remove("size-8");
  return element;
}
