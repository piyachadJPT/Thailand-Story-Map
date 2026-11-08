import mapboxgl from "mapbox-gl";
import type { StoryMapPoint } from "@/models/types/story";
import { createStoryPin, PIN_POPUP_OFFSET, type PinIconSource } from "./MapPin";
import { createStoryPopup, type ActivePopup, type PopupRouter } from "./storyPopup";

/**
 * Story pins on the home map: loads them, handles the ?story= deep link,
 * and reacts to "story-created", "story-selected" and "stories-refresh".
 * Returns a cleanup function.
 */
export function attachStoryLayer(
  map: mapboxgl.Map,
  getIcon: PinIconSource,
  router: PopupRouter
) {
  let markers: mapboxgl.Marker[] = [];
  let loadGeneration = 0;
  let disposed = false;
  let focusedStoryId: string | null = new URLSearchParams(
    window.location.search
  ).get("story");
  let focusRequestedStory = Boolean(focusedStoryId);
  const activePopup: ActivePopup = { current: null };

  /*
   * Moves the camera so the open preview card (not the pin) lands in the middle
   * of the free map area. The card always sits above the pin, so the target is
   * shifted down by half the card's height. With a zoom it flies there (search,
   * deep link); without one it slides at the current zoom (pin tap).
   */
  const centerOnCard = (marker: mapboxgl.Marker, zoom?: number) => {
    const cardHeight = marker.getPopup()?.getElement()?.offsetHeight ?? 0;
    const camera = {
      center: marker.getLngLat(),
      offset: [0, Math.round((cardHeight + PIN_POPUP_OFFSET) / 2)] as [number, number],
      essential: true,
    };
    map.stop();
    if (zoom === undefined) map.easeTo({ ...camera, duration: 450 });
    else map.flyTo({ ...camera, zoom, duration: 1500 });
  };

  /** Opens the story's preview and flies so the card is centered. */
  const focusStory = (marker: mapboxgl.Marker, zoom: number) => {
    if (!marker.getPopup()?.isOpen()) marker.togglePopup();
    centerOnCard(marker, zoom);
  };

  const createMarker = (story: StoryMapPoint) => {
    const pin = createStoryPin(story, getIcon);
    const marker = new mapboxgl.Marker({ element: pin, anchor: "bottom" })
      .setLngLat([story.longitude, story.latitude])
      .setPopup(createStoryPopup(story, pin, activePopup, router))
      .addTo(map);
    // Mapbox toggles the popup from the map's click handler, which runs after
    // this one, so wait for the click to finish before checking.
    pin.addEventListener("click", () => {
      window.setTimeout(() => {
        if (marker.getPopup()?.isOpen()) centerOnCard(marker);
      }, 0);
    });
    return marker;
  };

  const loadStories = async () => {
    const generation = ++loadGeneration;
    try {
      const response = await fetch("/api/stories?view=map", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const body = (await response.json()) as { data?: StoryMapPoint[] };
      if (disposed || generation !== loadGeneration) return;
      markers.forEach((marker) => marker.remove());
      markers = (body.data ?? []).map((story) => {
        const marker = createMarker(story);
        if (story.id === focusedStoryId) {
          marker.getElement().dataset.featured = "true";
          if (focusRequestedStory) {
            focusStory(marker, 16);
            focusRequestedStory = false;
          } else {
            marker.togglePopup();
          }
        }
        return marker;
      });
    } catch {
      // Retain existing markers if the refresh fails.
    }
  };

  const onStoryCreated = (event: Event) => {
    const story = (event as CustomEvent<StoryMapPoint>).detail;
    focusedStoryId = story.id;
    markers = markers.filter((marker) => {
      if (marker.getElement().dataset.storyId !== story.id) return true;
      marker.remove();
      return false;
    });
    const marker = createMarker(story);
    marker.getElement().dataset.featured = "true";
    marker.togglePopup();
    markers.push(marker);
    void loadStories();
  };

  const onStorySelected = (event: Event) => {
    const story = (event as CustomEvent<StoryMapPoint>).detail;
    focusedStoryId = story.id;
    let marker = markers.find(
      (item) => item.getElement().dataset.storyId === story.id
    );
    if (!marker) {
      marker = createMarker(story);
      markers.push(marker);
    }
    focusStory(marker, 15);
  };

  const onStoriesRefresh = () => void loadStories();

  window.addEventListener("story-selected", onStorySelected);
  window.addEventListener("story-created", onStoryCreated);
  window.addEventListener("stories-refresh", onStoriesRefresh);
  void loadStories();

  return () => {
    disposed = true;
    window.removeEventListener("story-selected", onStorySelected);
    window.removeEventListener("story-created", onStoryCreated);
    window.removeEventListener("stories-refresh", onStoriesRefresh);
    markers.forEach((marker) => marker.remove());
  };
}
