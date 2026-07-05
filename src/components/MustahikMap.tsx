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

export default function MustahikMap({ filtered, MOSQUE_CENTER, desilColor, desilLabel, ringLabel }: Props) {
  const mosqueIcon = L.divIcon({
    className: "",
    html: `<div style="width:40px;height:40px;border-radius:50%;background:#10b981;border:4px solid white;box-shadow:0 3px 12px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:20px">🕌</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return (
    <>
      <style>{`
        .leaflet-container .leaflet-tile { max-width: none !important; }
        .leaflet-container { z-index: 0 !important; }
      `}</style>
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
      
        {/* Mosque center marker */}
        <Marker position={MOSQUE_CENTER} icon={mosqueIcon} zIndexOffset={1000}>
          <Popup>
            <div className="text-xs font-bold">Masjid At-Taqwa Ulujami</div>
          </Popup>
        </Marker>

        {/* Mustahik markers — CircleMarker (SVG) always visible at any zoom */}
        {filtered.map((m) => {
          if (!m.lat || !m.lng) return null;
          const color = desilColor[m.desil_level || ""] || "#6b7280";
          return (
            <CircleMarker
              key={m.id}
              center={[m.lat, m.lng]}
              radius={8}
              pathOptions={{
                color: "white",
                weight: 3,
                fillColor: color,
                fillOpacity: 0.9,
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
    </>
  );
}
