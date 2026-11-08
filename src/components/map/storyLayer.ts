import mapboxgl from "mapbox-gl";
import type { StoryMapPoint } from "@/models/types/story";
import { createStoryPin } from "./MapPin";
import { createStoryPopup, type ActivePopup } from "./storyPopup";

/**
 * Story pins on the home map: loads them, handles the ?story= deep link,
 * and reacts to "story-created", "story-selected" and "stories-refresh".
 * Returns a cleanup function.
 */
export function attachStoryLayer(map: mapboxgl.Map) {
  let markers: mapboxgl.Marker[] = [];
  let loadGeneration = 0;
  let disposed = false;
  let focusedStoryId: string | null = new URLSearchParams(
    window.location.search
  ).get("story");
  let focusRequestedStory = Boolean(focusedStoryId);
  const activePopup: ActivePopup = { current: null };

  const createMarker = (story: StoryMapPoint) => {
    const pin = createStoryPin(story);
    return new mapboxgl.Marker({ element: pin, anchor: "center" })
      .setLngLat([story.longitude, story.latitude])
      .setPopup(createStoryPopup(story, pin, activePopup))
      .addTo(map);
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
          marker.togglePopup();
          if (focusRequestedStory) {
            map.flyTo({
              center: [story.longitude, story.latitude],
              zoom: 16,
              duration: 1200,
            });
            focusRequestedStory = false;
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
    if (!marker.getPopup()?.isOpen()) marker.togglePopup();
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
