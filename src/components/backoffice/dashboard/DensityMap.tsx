"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import "mapbox-gl/dist/mapbox-gl.css";
import MapUnavailable from "@/components/map/MapUnavailable";
import { styleUrl } from "@/components/map/mapStyles";
import { storyCategories } from "@/config/categories";
import { backofficeHref } from "@/config/backoffice";
import { Skeleton } from "@/components/ui/skeleton";
import { adminFetch, adminKeys } from "../api";
import type { MapPoint } from "./types";

const THAILAND_BOUNDS: [[number, number], [number, number]] = [
  [97.3, 5.6],
  [105.7, 20.5],
];

function cssColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#c8963e";
}

function toGeoJson(points: MapPoint[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
      properties: { id: point.id, title: point.title, category: point.categorySlug },
    })),
  };
}

/** Heatmap of published stories; zoom in for individual pins, click to open in the backoffice. */
export default function DensityMap({ token }: { token?: string }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!token);
  const points = useQuery({
    queryKey: adminKeys.overviewMap,
    queryFn: ({ signal }) => adminFetch<MapPoint[]>("/api/admin/overview/map", { signal }),
    staleTime: 60_000,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !token || !points.data) return;
    let map: import("mapbox-gl").Map | null = null;
    let observer: ResizeObserver | null = null;
    let disposed = false;
    const data = toGeoJson(points.data);

    const addLayers = () => {
      if (!map || map.getSource("stories")) return;
      const gold = cssColor("--gold");
      map.addSource("stories", { type: "geojson", data });
      map.addLayer({
        id: "stories-heat",
        type: "heatmap",
        source: "stories",
        maxzoom: 9,
        paint: {
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 14, 9, 28],
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.85, 9, 0],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.3,
            "rgba(200,150,62,0.35)",
            0.7,
            gold,
            1,
            cssColor("--cat-crime"),
          ],
        },
      });
      map.addLayer({
        id: "stories-points",
        type: "circle",
        source: "stories",
        minzoom: 6,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 3, 12, 7],
          "circle-color": [
            "match",
            ["get", "category"],
            ...storyCategories.flatMap((category) => [category.slug, cssColor(`--${category.colorToken}`)]),
            gold,
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0, 7.5, 1],
        },
      });
    };

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (disposed) return;
      if (!mapboxgl.supported(false)) return setFailed(true);
      mapboxgl.accessToken = token;
      try {
        map = new mapboxgl.Map({
          container,
          style: styleUrl("streets"),
          center: [101, 13],
          zoom: 4.6,
          attributionControl: false,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          scrollZoom: false,
          language: "th",
        });
      } catch {
        return setFailed(true);
      }
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
      map.on("style.load", addLayers);
      // The panel may still be laying out: size the map once it has real dimensions.
      observer = new ResizeObserver(() => map?.resize());
      observer.observe(container);
      map.once("load", () => {
        map?.resize();
        map?.fitBounds(THAILAND_BOUNDS, { padding: 16, duration: 0 });
      });
      map.on("click", "stories-points", (event) => {
        const id = event.features?.[0]?.properties?.id;
        if (typeof id === "string") router.push(backofficeHref(`/stories/${id}`));
      });
      map.on("mouseenter", "stories-points", () => {
        if (map) map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "stories-points", () => {
        if (map) map.getCanvas().style.cursor = "";
      });
      map.on("error", (event) => {
        if ((event.error as { status?: number } | undefined)?.status === 401) setFailed(true);
      });
    })().catch(() => {
      if (!disposed) setFailed(true);
    });

    const onTheme = () => {
      if (!map) return;
      map.setStyle(styleUrl("streets"));
    };
    window.addEventListener("themechange", onTheme);
    return () => {
      disposed = true;
      window.removeEventListener("themechange", onTheme);
      observer?.disconnect();
      map?.remove();
    };
  }, [token, points.data, router]);

  const count = points.data?.length ?? 0;
  return (
    <div
      className="relative h-80 overflow-hidden rounded-xl bg-muted sm:h-96"
      role="img"
      aria-label={`แผนที่ความหนาแน่นของเรื่องที่เผยแพร่ ${count} เรื่องทั่วประเทศไทย`}
    >
      {points.isPending && !failed ? <Skeleton className="absolute inset-0 rounded-xl" /> : null}
      {/* Mapbox forces its container to position: relative, so it fills a positioned wrapper. */}
      <div className="absolute inset-0">
        <div ref={containerRef} className="size-full" />
      </div>
      {failed ? <MapUnavailable invalidToken={Boolean(token)} /> : null}
    </div>
  );
}
