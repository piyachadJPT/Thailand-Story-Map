import mapboxgl from "mapbox-gl";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import type { StoryMapPoint } from "@/models/types/story";
import { PIN_POPUP_OFFSET } from "./MapPin";
import StoryPreviewCard from "./StoryPreviewCard";

/** Only one story preview is open at a time. */
export type ActivePopup = { current: mapboxgl.Popup | null };

const SCROLL_KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];

/**
 * Builds the preview popup for a story pin. The React card is mounted only
 * while the popup is open, so hundreds of pins stay cheap.
 */
export function createStoryPopup(
  story: StoryMapPoint,
  pin: HTMLElement,
  active: ActivePopup
) {
  const container = document.createElement("div");
  const popup = new mapboxgl.Popup({
    offset: PIN_POPUP_OFFSET,
    closeButton: false,
    maxWidth: "min(320px, calc(100vw - 32px))",
    className: "story-map-popup",
    focusAfterOpen: false,
  }).setDOMContent(container);
  let root: Root | null = null;

  const close = () => {
    popup.remove();
    pin.focus({ preventScroll: true });
  };

  container.addEventListener("keydown", (event) => {
    // Keep native text scrolling without moving the map underneath.
    if (SCROLL_KEYS.includes(event.key)) event.stopPropagation();
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
    }
  });

  popup.on("open", () => {
    if (active.current !== popup) active.current?.remove();
    active.current = popup;
    const element = popup.getElement();
    element?.setAttribute("role", "dialog");
    element?.setAttribute("aria-label", `รายละเอียด ${story.title}`);
    pin.setAttribute("aria-expanded", "true");
    pin.dataset.active = "true";

    root = createRoot(container);
    flushSync(() => root?.render(<StoryPreviewCard story={story} onClose={close} />));
    // Re-run placement now that the card has its real size.
    popup.setLngLat(popup.getLngLat());
  });

  popup.on("close", () => {
    pin.setAttribute("aria-expanded", "false");
    delete pin.dataset.active;
    if (active.current === popup) active.current = null;
    const closing = root;
    root = null;
    // Unmount after the current event so React is not mid-render.
    window.setTimeout(() => closing?.unmount(), 0);
  });

  return popup;
}
