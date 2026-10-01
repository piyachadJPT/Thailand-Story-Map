import { create } from "zustand";

export type MapSheet = "search" | "style" | "composer" | null;

export type MapFlyRequest = {
  id: number;
  longitude: number;
  latitude: number;
  zoom: number;
};

type MapSheetState = {
  mapCenter: { longitude: number; latitude: number };
  setMapCenter: (longitude: number, latitude: number) => void;
  sheet: MapSheet;
  openSheet: (sheet: Exclude<MapSheet, null>) => void;
  closeSheet: () => void;
  flyRequest: MapFlyRequest | null;
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;
};

export const useMapSheetStore = create<MapSheetState>((set) => ({
  mapCenter: { longitude: 100.5018, latitude: 13.7563 },
  setMapCenter: (longitude, latitude) =>
    set({ mapCenter: { longitude, latitude } }),
  sheet: null,
  openSheet: (sheet) => set({ sheet }),
  closeSheet: () => set({ sheet: null }),
  flyRequest: null,
  flyTo: (longitude, latitude, zoom = 14) =>
    set({
      flyRequest: { id: Date.now(), longitude, latitude, zoom },
    }),
}));
