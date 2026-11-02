"use client";

import { createElement, useEffect, useRef, useState } from "react";
import type { Root } from "react-dom/client";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { readTheme } from "@/lib/theme";
import { categoryIcon } from "@/config/categories";
import styles from "@/app/story/[province]/[slug]/story.module.css";

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

function HeroPin({ categorySlug }: { categorySlug: string }) {
  return (
    <div className={styles.heroPin}>
      <svg className={styles.heroPinSvg} viewBox="0 0 48 62" aria-hidden="true">
        <path
          d="M24 2.5C13.2 2.5 5 11.2 5 22.2 5 36.4 24 59 24 59s19-22.6 19-36.8C43 11.2 34.8 2.5 24 2.5z"
          fill="var(--primary)"
          stroke="var(--card)"
          strokeWidth="2.5"
        />
      </svg>
      <span className={styles.heroPinIcon}>
        {createElement(categoryIcon(categorySlug), {
          size: 16,
          strokeWidth: 2,
        })}
      </span>
    </div>
  );
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!token);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !token) return;

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
      const mapboxgl = (await import("mapbox-gl")).default;
      const { createRoot } = await import("react-dom/client");
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
      root.render(createElement(HeroPin, { categorySlug }));
      marker = new mapboxgl.Marker({ element, anchor: "bottom" })
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
  }, [token, latitude, longitude, categorySlug]);

  return (
    <div className={styles.articleMap}>
      <div
        ref={containerRef}
        className={styles.articleMapCanvas}
        aria-hidden="true"
      />
      {failed && <div className={styles.mapFallback} aria-hidden="true" />}
      {failed && (
        <div className={styles.mapFallbackPin}>
          <HeroPin categorySlug={categorySlug} />
        </div>
      )}
      <div className={styles.mapCard}>
        <p className={styles.mapCardTitle}>{title}</p>
        <p className={styles.mapCardPlace}>{provinceName} · ประเทศไทย</p>
        <p className={styles.mapCardCoords}>
          {formatCoordinate(latitude, longitude)}
        </p>
        <Link href={href} className={styles.mapCardButton}>
          <MapPin className="h-4 w-4" aria-hidden="true" />
          ดูตำแหน่งบนแผนที่
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
