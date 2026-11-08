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

/** Popup offset (px) so it opens just above the pin's head. */
export const PIN_POPUP_OFFSET = 48;

/** Teardrop outline (drawn at 32×40, shown at 38×48), tip at the bottom center. */
const PIN_PATH =
  "M16 1.5C8 1.5 1.5 7.8 1.5 15.7c0 10.1 12.6 21 13.6 21.9a1.4 1.4 0 0 0 1.8 0c1-.9 13.6-11.8 13.6-21.9C30.5 7.8 24 1.5 16 1.5z";

/*
 * Solid teardrop in the category color with a white icon, anchored at its tip.
 * Mapbox owns the outer element's transform, so every visual state
 * (hover, focus, data-active, data-featured) is applied to the inner body.
 */
const pinButtonClasses =
  "group/pin block h-12 w-[38px] cursor-pointer border-0 bg-transparent p-0 outline-none";

const pinBodyClasses = [
  "relative block size-full origin-bottom text-white",
  "transition-transform duration-150 motion-reduce:transition-none",
  "group-hover/pin:scale-110",
  "group-focus-visible/pin:scale-110 group-focus-visible/pin:outline-2 group-focus-visible/pin:outline-offset-2 group-focus-visible/pin:outline-foreground",
  "group-data-active/pin:scale-125",
  "[&>svg:last-child]:absolute [&>svg:last-child]:top-[9px] [&>svg:last-child]:left-1/2 [&>svg:last-child]:size-5 [&>svg:last-child]:-translate-x-1/2 [&>svg:last-child]:stroke-2",
].join(" ");

/* Small ripple at the exact location, used for the featured pin. */
const pinBaseClasses =
  "absolute bottom-0 left-1/2 block size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-(--pin-color) opacity-0 group-data-featured/pin:opacity-100 group-data-featured/pin:motion-safe:animate-pin-ping";

const SVG_NS = "http://www.w3.org/2000/svg";

function pinShape() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 32 40");
  svg.setAttribute("class", "block size-full");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", PIN_PATH);
  path.setAttribute("fill", "var(--pin-color)");
  path.setAttribute("stroke", "var(--card)");
  path.setAttribute("stroke-width", "1.5");
  svg.append(path);
  return svg;
}

function pinElement<T extends HTMLElement>(element: T, color: string, icon: SVGElement | null) {
  element.className = pinButtonClasses;
  element.style.setProperty("--pin-color", color);
  const body = document.createElement("span");
  body.className = pinBodyClasses;
  body.setAttribute("aria-hidden", "true");
  const base = document.createElement("span");
  base.className = pinBaseClasses;
  body.append(base, pinShape());
  if (icon) body.append(icon);
  element.append(body);
  return element;
}

/** Story pin: category color and icon, opens the story preview. */
export function createStoryPin(story: StoryMapPoint, getIcon: PinIconSource) {
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
  return pinElement(button, color, getIcon(story.categorySlug));
}

/** Gold pin for a searched place. */
export function createPlacePin(getIcon: PinIconSource) {
  return pinElement(document.createElement("div"), "var(--gold)", getIcon("place"));
}

/** Ink pin for the location of a story being written (draggable). */
export function createDraftPin(getIcon: PinIconSource) {
  const element = pinElement(document.createElement("div"), "var(--primary)", getIcon("draft"));
  element.classList.add("cursor-grab", "active:cursor-grabbing");
  return element;
}
