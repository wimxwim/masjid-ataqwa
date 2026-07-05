"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { MustahikDb } from "@/types";
import { Phone } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Props {
  filtered: MustahikDb[];
  MOSQUE_CENTER: [number, number];
  desilColor: Record<string, string>;
  desilLabel: Record<string, string>;
  ringLabel: (r: number | null) => string;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const MOSQUE_SVG = `
<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
  <circle cx="22" cy="22" r="20" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
  <g fill="#ffffff">
    <rect x="13" y="11" width="4" height="18" rx="1"/>
    <circle cx="15" cy="10" r="2.5"/>
    <rect x="19" y="23" width="14" height="7" rx="1"/>
    <path d="M19 23 Q26 15 33 23 Z"/>
  </g>
</svg>`;

const mosqueIcon = L.divIcon({
  className: "mosque-marker-icon",
  html: MOSQUE_SVG,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

export default function MustahikMap({ filtered, MOSQUE_CENTER, desilColor, desilLabel, ringLabel }: Props) {
  return (
    <MapContainer
      center={MOSQUE_CENTER}
      zoom={15}
      className="w-full h-full"
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
      zoomControl={false}
    >
      <MapResizer />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {filtered.map((m) => {
        if (!m.lat || !m.lng) return null;
        const color = desilColor[m.desil_level || ""] || "#6b7280";
        return (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={9}
            pathOptions={{
              color: "white",
              weight: 3,
              fillColor: color,
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[180px]">
                <div className="font-bold text-sm">{m.name}</div>
                <div className="text-muted">{m.address}</div>
                {m.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.phone}</div>}
                <div className="flex items-center gap-2 pt-1 border-t border-outline mt-1">
                  <span>{desilLabel[m.desil_level || ""] || "-"}</span>
                  <span className="text-muted">•</span>
                  <span>{ringLabel(m.ring_number)}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Mosque marker — rendered last so it sits on top of mustahik (zIndexOffset + DOM order) */}
      <Marker
        position={MOSQUE_CENTER}
        icon={mosqueIcon}
        zIndexOffset={1000}
      >
        <Popup>
          <div className="text-xs font-bold">🕌 Masjid At-Taqwa Ulujami</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
