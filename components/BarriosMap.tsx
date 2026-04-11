"use client";

import { useEffect, useRef } from "react";
import type { NeighborhoodArticle } from "@/lib/stats";
import { TOPIC_COLORS_HEX } from "./TopicBadge";
import type { Topic } from "@/lib/types";

interface BarrioFeature {
  type: "Feature";
  geometry: { type: string; coordinates: unknown };
  properties: {
    barrio: string;
    comuna: string;
    id_barrio: string;
    centroid_lat: number;
    centroid_lng: number;
  };
}

interface GeoJSON {
  type: "FeatureCollection";
  features: BarrioFeature[];
}

interface Props {
  articles: NeighborhoodArticle[];
}

export function BarriosMap({ articles }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    Promise.all([
      import("leaflet"),
      fetch("/barrios.geojson").then((r) => r.json() as Promise<GeoJSON>),
    ]).then(([L, geojson]) => {
      // Fix Leaflet's default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Build lookup: barrio name → articles
      const byNeighborhood = new Map<string, NeighborhoodArticle[]>();
      for (const a of articles) {
        const key = a.neighborhood.toLowerCase().trim();
        if (!byNeighborhood.has(key)) byNeighborhood.set(key, []);
        byNeighborhood.get(key)!.push(a);
      }

      const map = L.map(mapRef.current!, {
        center: [3.4516, -76.532],
        zoom: 12,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Base tile layer — dark style matching the dashboard
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // Draw barrio polygons
      L.geoJSON(geojson as Parameters<typeof L.geoJSON>[0], {
        style: (feature) => {
          const name = feature?.properties?.barrio?.toLowerCase()?.trim() ?? "";
          const hasNews = byNeighborhood.has(name);
          return {
            color: hasNews ? "#5588ff" : "#1a3a6a",
            weight: hasNews ? 1.5 : 0.6,
            fillColor: hasNews ? "#1a4fd6" : "#051828",
            fillOpacity: hasNews ? 0.30 : 0.05,
          };
        },
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.barrio ?? "";
          const key = name.toLowerCase().trim();
          const arts = byNeighborhood.get(key) ?? [];

          let popupHtml = `<div style="max-width:260px;font-family:system-ui;font-size:13px">
            <strong style="color:#ffffff">${name}</strong>
            <span style="color:#ffd700;font-size:11px;margin-left:6px">Comuna ${feature.properties?.comuna ?? ""}</span>`;

          if (arts.length > 0) {
            popupHtml += `<hr style="border-color:#1e2f4d;margin:6px 0">`;
            for (const a of arts.slice(0, 5)) {
              const color = TOPIC_COLORS_HEX[(a.topic ?? "General") as Topic] ?? "#64748b";
              popupHtml += `<div style="margin-bottom:6px">
                <span style="color:${color};font-size:10px;text-transform:uppercase">${a.topic ?? "General"}</span><br>
                <a href="${a.url}" target="_blank" rel="noopener"
                   style="color:#5588ff;text-decoration:none;line-height:1.3">
                  ${a.title}
                </a>
              </div>`;
            }
            if (arts.length > 5) {
              popupHtml += `<p style="color:#ffd700;font-size:11px">+${arts.length - 5} más</p>`;
            }
          }

          popupHtml += `</div>`;

          layer.bindPopup(popupHtml, {
            maxWidth: 280,
            className: "cali-popup",
          });
        },
      }).addTo(map);

      // Article count markers for barrios with news
      for (const feature of geojson.features) {
        const name = feature.properties.barrio?.toLowerCase()?.trim() ?? "";
        const arts = byNeighborhood.get(name);
        if (!arts?.length) continue;

        const { centroid_lat, centroid_lng, barrio, comuna } = feature.properties;
        if (!centroid_lat || !centroid_lng) continue;

        const color = TOPIC_COLORS_HEX[(arts[0].topic ?? "General") as Topic] ?? "#38bdf8";

        const icon = L.divIcon({
          html: `<div style="
            background:${color};
            color:#070d1a;
            border-radius:50%;
            width:22px;height:22px;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;
            box-shadow:0 0 6px ${color}88;
            cursor:pointer;
          ">${arts.length}</div>`,
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        let popupHtml = `<div style="max-width:260px;font-family:system-ui;font-size:13px">
          <strong style="color:#ffffff">${barrio}</strong>
          <span style="color:#ffd700;font-size:11px;margin-left:6px">Comuna ${comuna}</span>
          <hr style="border-color:#1e2f4d;margin:6px 0">`;

        for (const a of arts.slice(0, 5)) {
          const c = TOPIC_COLORS_HEX[(a.topic ?? "General") as Topic] ?? "#64748b";
          popupHtml += `<div style="margin-bottom:6px">
            <span style="color:${c};font-size:10px;text-transform:uppercase">${a.topic ?? "General"}</span><br>
            <a href="${a.url}" target="_blank" rel="noopener"
               style="color:#5588ff;text-decoration:none;line-height:1.3">
              ${a.title}
            </a>
          </div>`;
        }
        if (arts.length > 5) {
          popupHtml += `<p style="color:#ffd700;font-size:11px">+${arts.length - 5} noticias más</p>`;
        }
        popupHtml += `</div>`;

        L.marker([centroid_lat, centroid_lng], { icon })
          .bindPopup(popupHtml, { maxWidth: 280, className: "cali-popup" })
          .addTo(map);
      }
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [articles]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <style>{`
        .cali-popup .leaflet-popup-content-wrapper {
          background: #111111;
          border: 1px solid #2e2e2e;
          border-radius: 4px;
          color: #ffffff;
          font-family: "Share Tech Mono", monospace;
        }
        .cali-popup .leaflet-popup-tip { background: #111111; }
        .cali-popup .leaflet-popup-close-button { color: #ffd700; }
      `}</style>
      {/* position:relative wrapper so the map div can use absolute fill */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={mapRef} style={{ position: "absolute", inset: 0 }} />
      </div>
    </>
  );
}
