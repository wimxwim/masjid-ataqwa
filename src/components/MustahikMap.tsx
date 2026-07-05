"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
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

      <CircleMarker
        center={MOSQUE_CENTER}
        radius={14}
        pathOptions={{
          color: "#065f46",
          weight: 4,
          fillColor: "#10b981",
          fillOpacity: 1,
        }}
      >
        <Tooltip direction="top" offset={[0, -14]} permanent>
          <span className="font-bold text-xs">🕌 Masjid At-Taqwa</span>
        </Tooltip>
        <Popup>
          <div className="text-xs font-bold">Masjid At-Taqwa Ulujami</div>
        </Popup>
      </CircleMarker>

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
    </MapContainer>
  );
}
