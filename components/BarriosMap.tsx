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

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export function BarriosMap({ articles }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    Promise.all([
      import("leaflet"),
      fetch("/barrios.geojson").then((r) => r.json() as Promise<GeoJSON>),
    ]).then(([L, geojson]) => {
      if (cancelled || !mapRef.current) return;
      if (mapInstanceRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

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

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      L.geoJSON(geojson as Parameters<typeof L.geoJSON>[0], {
        style: (feature) => {
          const name = feature?.properties?.barrio?.toLowerCase()?.trim() ?? "";
          const hasNews = byNeighborhood.has(name);
          return {
            color:       hasNews ? "#3333FF" : "#B8B2A8",
            weight:      hasNews ? 1.5 : 0.6,
            fillColor:   hasNews ? "#3333FF" : "#D4CFC6",
            fillOpacity: hasNews ? 0.18 : 0.05,
          };
        },
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.barrio ?? "";
          const key = name.toLowerCase().trim();
          const arts = byNeighborhood.get(key) ?? [];

          let popupHtml = `<div style="max-width:260px;font-family:system-ui;font-size:13px">
            <strong style="color:#1A1814">${name}</strong>
            <span style="color:#8C857C;font-size:11px;margin-left:6px">Comuna ${feature.properties?.comuna ?? ""}</span>`;

          if (arts.length > 0) {
            popupHtml += `<hr style="border-color:#D4CFC6;margin:6px 0">`;
            for (const a of arts.slice(0, 5)) {
              const color = TOPIC_COLORS_HEX[(a.topic ?? "General") as Topic] ?? "#6f6f6f";
              popupHtml += `<div style="margin-bottom:6px">
                <span style="color:${color};font-size:10px;text-transform:uppercase">${a.topic ?? "General"}</span>
                <span style="color:#8C857C;font-size:10px;margin-left:5px">${fmtDate(a.published_at)}</span><br>
                <a href="${a.url}" target="_blank" rel="noopener"
                   style="color:#3333FF;text-decoration:none;line-height:1.3">
                  ${a.title}
                </a>
              </div>`;
            }
            if (arts.length > 5) {
              popupHtml += `<p style="color:#8C857C;font-size:11px">+${arts.length - 5} más</p>`;
            }
          }

          popupHtml += `</div>`;

          layer.bindPopup(popupHtml, {
            maxWidth: 280,
            className: "cali-popup",
          });
        },
      }).addTo(map);

      for (const feature of geojson.features) {
        const name = feature.properties.barrio?.toLowerCase()?.trim() ?? "";
        const arts = byNeighborhood.get(name);
        if (!arts?.length) continue;

        const { centroid_lat, centroid_lng, barrio, comuna } = feature.properties;
        if (!centroid_lat || !centroid_lng) continue;

        const color = TOPIC_COLORS_HEX[(arts[0].topic ?? "General") as Topic] ?? "#3333FF";

        const icon = L.divIcon({
          html: `<div style="
            background:${color};
            color:#ffffff;
            border-radius:50%;
            width:22px;height:22px;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;
            box-shadow:0 1px 4px rgba(0,0,0,0.2);
            cursor:pointer;
          ">${arts.length}</div>`,
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        let popupHtml = `<div style="max-width:260px;font-family:system-ui;font-size:13px">
          <strong style="color:#1A1814">${barrio}</strong>
          <span style="color:#8C857C;font-size:11px;margin-left:6px">Comuna ${comuna}</span>
          <hr style="border-color:#D4CFC6;margin:6px 0">`;

        for (const a of arts.slice(0, 5)) {
          const c = TOPIC_COLORS_HEX[(a.topic ?? "General") as Topic] ?? "#6f6f6f";
          popupHtml += `<div style="margin-bottom:6px">
            <span style="color:${c};font-size:10px;text-transform:uppercase">${a.topic ?? "General"}</span>
            <span style="color:#8C857C;font-size:10px;margin-left:5px">${fmtDate(a.published_at)}</span><br>
            <a href="${a.url}" target="_blank" rel="noopener"
               style="color:#3333FF;text-decoration:none;line-height:1.3">
              ${a.title}
            </a>
          </div>`;
        }
        if (arts.length > 5) {
          popupHtml += `<p style="color:#8C857C;font-size:11px">+${arts.length - 5} noticias más</p>`;
        }
        popupHtml += `</div>`;

        L.marker([centroid_lat, centroid_lng], { icon })
          .bindPopup(popupHtml, { maxWidth: 280, className: "cali-popup" })
          .addTo(map);
      }
    });

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [articles]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <style>{`
        .cali-popup .leaflet-popup-content-wrapper {
          background: #FFFFFF;
          border: 1px solid #D4CFC6;
          border-radius: 4px;
          color: #1A1814;
          font-family: system-ui, sans-serif;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .cali-popup .leaflet-popup-tip { background: #FFFFFF; }
        .cali-popup .leaflet-popup-close-button { color: #3333FF; }
      `}</style>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={mapRef} style={{ position: "absolute", inset: 0 }} />
      </div>
    </>
  );
}
