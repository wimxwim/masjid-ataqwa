"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
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
  const getMarkerIcon = (desil: string | null) => {
    const color = desilColor[desil || ""] || "#6b7280";
    return L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  };

  const mosqueIcon = L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:12px">🕌</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
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
      
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          disableClusteringAtZoom={17}
        >
          {/* Mosque center marker */}
          <Marker position={MOSQUE_CENTER} icon={mosqueIcon}>
            <Popup>
              <div className="text-xs font-bold">Masjid At-Taqwa Ulujami</div>
            </Popup>
          </Marker>

          {/* Mustahik markers */}
          {filtered.map((m) => {
            if (!m.lat || !m.lng) return null;
            return (
              <Marker key={m.id} position={[m.lat, m.lng]} icon={getMarkerIcon(m.desil_level)}>
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
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  );
}
