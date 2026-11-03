"use client";

import { createElement, useEffect, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import StoryMapPin from "@/components/story/StoryMapPin";
import { readTheme } from "@/lib/theme";

export type ProvincePoint = {
  id: string;
  title: string;
  href: string;
  latitude: number;
  longitude: number;
  categorySlug: string;
};

type Props = {
  token?: string;
  provinceName: string;
  points: ProvincePoint[];
};

/**
 * Pins of a province's stories. Mapbox (JS and CSS) loads only when the map
 * scrolls near the viewport, so it never competes with the page's LCP.
 */
export default function ProvinceStoryMap({ token, provinceName, points }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(!token);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !token) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [token]);

  useEffect(() => {
    const container = containerRef.current;
    if (!visible || !container || !token || points.length === 0) return;
    let map: import("mapbox-gl").Map | null = null;
    const roots: Root[] = [];
    let disposed = false;
    const mapStyle = () => `mapbox://styles/mapbox/${readTheme() === "dark" ? "dark" : "light"}-v11`;
    const syncTheme = () => map?.setStyle(mapStyle());
    window.addEventListener("themechange", syncTheme);

    (async () => {
      const [{ default: mapboxgl }, { createRoot }] = await Promise.all([
        import("mapbox-gl"),
        import("react-dom/client"),
        import("mapbox-gl/dist/mapbox-gl.css"),
      ]);
      if (disposed) return;
      if (!mapboxgl.supported(false)) {
        setFailed(true);
        return;
      }
      mapboxgl.accessToken = token;
      const bounds = new mapboxgl.LngLatBounds();
      points.forEach((point) => bounds.extend([point.longitude, point.latitude]));
      map = new mapboxgl.Map({
        container,
        style: mapStyle(),
        bounds,
        fitBoundsOptions: { padding: 56, maxZoom: 13 },
        language: "th",
        attributionControl: false,
        fadeDuration: 0,
      });
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      map.scrollZoom.disable();
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();

      for (const point of points) {
        const element = document.createElement("a");
        element.href = point.href;
        element.setAttribute("aria-label", point.title);
        element.title = point.title;
        const root = createRoot(element);
        root.render(createElement(StoryMapPin, { categorySlug: point.categorySlug }));
        roots.push(root);
        new mapboxgl.Marker({ element, anchor: "bottom" })
          .setLngLat([point.longitude, point.latitude])
          .addTo(map);
        // Mapbox marks markers role="img"; these are links, so keep their native role.
        element.removeAttribute("role");
      }
    })().catch(() => {
      if (!disposed) setFailed(true);
    });

    return () => {
      disposed = true;
      window.removeEventListener("themechange", syncTheme);
      map?.remove();
      window.setTimeout(() => roots.forEach((root) => root.unmount()), 0);
    };
  }, [visible, token, points]);

  return (
    <section
      ref={sectionRef}
      aria-label={`แผนที่เรื่องเล่าใน${provinceName}`}
      className="relative h-72 overflow-hidden rounded-panel bg-muted shadow-lift ring-1 ring-border sm:h-96"
    >
      <div className="absolute inset-0">
        <div ref={containerRef} className="size-full" />
      </div>
      {failed || !visible ? (
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-muted to-accent p-6 text-center">
          {failed ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">แผนที่ขนาดเล็กไม่พร้อมใช้งานในตอนนี้</p>
              <Link href="/" prefetch={false} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <MapIcon aria-hidden="true" />
                เปิดแผนที่หลัก
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
