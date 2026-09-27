import { create } from "zustand";

export type MapSheet = "search" | "style" | null;

export type MapFlyRequest = {
  id: number;
  longitude: number;
  latitude: number;
  zoom: number;
};

type MapSheetState = {
  sheet: MapSheet;
  openSheet: (sheet: Exclude<MapSheet, null>) => void;
  closeSheet: () => void;
  flyRequest: MapFlyRequest | null;
  flyTo: (longitude: number, latitude: number, zoom?: number) => void;
};

export const useMapSheetStore = create<MapSheetState>((set) => ({
  sheet: null,
  openSheet: (sheet) => set({ sheet }),
  closeSheet: () => set({ sheet: null }),
  flyRequest: null,
  flyTo: (longitude, latitude, zoom = 14) =>
    set({
      flyRequest: { id: Date.now(), longitude, latitude, zoom },
    }),
}));
