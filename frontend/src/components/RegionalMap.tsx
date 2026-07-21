"use client";

/**
 * District-centroid heatmap using MapLibre GL + OpenStreetMap tiles
 * (Section 6 — free, no token limits, unlike Mapbox).
 *
 * Renders aggregated region markers only — never individual report pins,
 * consistent with the privacy design in services/aggregation.py.
 */

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface RegionPoint {
  region_state: string;
  region_district: string | null;
  total_reports: number;
  latitude: number;
  longitude: number;
}

export default function RegionalMap({ points }: { points: RegionPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              process.env.NEXT_PUBLIC_MAP_TILE_URL ||
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [78.9629, 22.5937], // India centroid
      zoom: 4,
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: maplibregl.Marker[] = [];
    points.forEach((p) => {
      const el = document.createElement("div");
      el.style.width = `${Math.min(10 + p.total_reports, 40)}px`;
      el.style.height = el.style.width;
      el.style.borderRadius = "50%";
      el.style.background = "rgba(249, 115, 22, 0.6)";
      el.style.border = "1px solid #F97316";

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.longitude, p.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setText(
            `${p.region_district ?? p.region_state}: ${p.total_reports} reports`
          )
        )
        .addTo(map);
      markers.push(marker);
    });

    return () => markers.forEach((m) => m.remove());
  }, [points]);

  return <div ref={containerRef} className="w-full h-96 rounded-lg overflow-hidden" />;
}
