"use client";

import { createElement, useEffect, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { readTheme } from "@/lib/theme";
import StoryMapPin from "./StoryMapPin";

type Props = {
  token?: string;
  latitude: number;
  longitude: number;
  title: string;
  provinceName: string;
  categorySlug: string;
  href: string;
};

function formatCoordinate(latitude: number, longitude: number) {
  const latitudeLabel = `${Math.abs(latitude).toFixed(3)}° ${latitude >= 0 ? "N" : "S"}`;
  const longitudeLabel = `${Math.abs(longitude).toFixed(3)}° ${longitude >= 0 ? "E" : "W"}`;
  return `${latitudeLabel} · ${longitudeLabel}`;
}

export default function StoryLocationMap({
  token,
  latitude,
  longitude,
  title,
  provinceName,
  categorySlug,
  href,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!token);
  const [visible, setVisible] = useState(false);

  // Mapbox (JS and CSS) loads only when the map scrolls near the viewport.
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
    if (!visible || !container || !token) return;

    let map: import("mapbox-gl").Map | null = null;
    let marker: import("mapbox-gl").Marker | null = null;
    let root: Root | null = null;
    let observer: ResizeObserver | null = null;
    let disposed = false;
    const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    const mapStyle = () =>
      `mapbox://styles/mapbox/${readTheme() === "dark" ? "dark" : "light"}-v11`;
    const syncTheme = () => map?.setStyle(mapStyle());
    window.addEventListener("themechange", syncTheme);
    themeMedia.addEventListener("change", syncTheme);

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
      try {
        map = new mapboxgl.Map({
          container,
          style: mapStyle(),
          center: [longitude, latitude],
          zoom: 14.4,
          language: "th",
          attributionControl: false,
          interactive: true,
          pitch: 0,
          bearing: 0,
          fadeDuration: 0,
        });
      } catch {
        if (!disposed) setFailed(true);
        return;
      }

      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "top-left"
      );
      map.scrollZoom.disable();
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
      map.setPadding({ top: 24, bottom: 168, left: 16, right: 16 });

      const element = document.createElement("div");
      root = createRoot(element);
      root.render(createElement(StoryMapPin, { categorySlug }));
      marker = new mapboxgl.Marker({ element, anchor: "center" })
        .setLngLat([longitude, latitude])
        .addTo(map);

      observer = new ResizeObserver(() => map?.resize());
      observer.observe(container);
      map.on("load", () => map?.resize());
    })().catch(() => {
      if (!disposed) setFailed(true);
    });

    return () => {
      disposed = true;
      window.removeEventListener("themechange", syncTheme);
      themeMedia.removeEventListener("change", syncTheme);
      observer?.disconnect();
      marker?.remove();
      map?.remove();
      window.setTimeout(() => root?.unmount(), 0);
    };
  }, [visible, token, latitude, longitude, categorySlug]);

  return (
    <section
      ref={sectionRef}
      aria-label="ตำแหน่งบนแผนที่"
      className="relative h-80 overflow-hidden rounded-panel bg-muted ring-1 ring-border sm:h-96 [&_.mapboxgl-ctrl-bottom-left]:top-2! [&_.mapboxgl-ctrl-bottom-left]:right-2! [&_.mapboxgl-ctrl-bottom-left]:bottom-auto! [&_.mapboxgl-ctrl-bottom-left]:left-auto!"
    >
      {/* Mapbox styles its container as position: relative, so it sits in a positioned wrapper. */}
      {/* Not aria-hidden: Mapbox puts focusable controls inside. */}
      <div className="absolute inset-0">
        <div ref={containerRef} className="size-full" />
      </div>
      {failed ? (
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center bg-linear-to-br from-muted to-accent">
          <StoryMapPin categorySlug={categorySlug} />
        </div>
      ) : null}
      <div className="liquid-glass absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-end justify-between gap-3 rounded-2xl p-4">
        <div className="min-w-0">
          <p className="line-clamp-2 font-heading font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{provinceName} · ประเทศไทย</p>
          <p className="mt-0.5 text-xs text-gold-ink tabular-nums">
            {formatCoordinate(latitude, longitude)}
          </p>
        </div>
        <Link href={href} prefetch={false} className={buttonVariants({ size: "sm" })}>
          <MapPin aria-hidden="true" />
          ดูบนแผนที่
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
