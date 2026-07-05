"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useState, useRef, useMemo, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  defaultLat?: number;
  defaultLng?: number;
  externalOverride?: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
}

// Center to Mosque if no default provided
const MOSQUE_CENTER: [number, number] = [-6.228, 106.761];

// Kalkulasi Jarak Geospasial Fisika Matematis (Haversine Formula) 
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius bumi dalam meter
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(dp/2) * Math.sin(dp/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
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

function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { animate: true, duration: 1 });
  }, [map, position]);
  return null;
}

export default function MapPicker({ defaultLat, defaultLng, externalOverride, onPositionChange }: Props) {
  const initPos: [number, number] = defaultLat && defaultLng ? [defaultLat, defaultLng] : MOSQUE_CENTER;
  const [position, setPosition] = useState<[number, number]>(initPos);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (externalOverride) {
      setPosition(externalOverride);
    }
  }, [externalOverride]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          onPositionChange(lat, lng);
        }
      },
    }),
    [onPositionChange]
  );

  const pinIcon = L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const distance = Math.round(getDistanceInMeters(MOSQUE_CENTER[0], MOSQUE_CENTER[1], position[0], position[1]));
  
  let ringSuggestion = "";
  if (distance <= 70) ringSuggestion = "Ring 1 (<=70m)";
  else if (distance <= 140) ringSuggestion = "Ring 2 (<=140m)";
  else if (distance <= 300) ringSuggestion = "Ring 3 (<=300m)";
  else if (distance <= 700) ringSuggestion = "Ring 4 (<=700m)";
  else ringSuggestion = "Luar Ring (>700m)";

  return (
    <>
      <style>{`
        .leaflet-container .leaflet-tile { max-width: none !important; }
        .leaflet-container { z-index: 0 !important; cursor: crosshair; }
      `}</style>
      <div className="w-full h-[250px] relative overflow-hidden rounded-xl border border-outline bg-surface">
        <MapContainer 
          center={initPos} 
          zoom={15} 
          style={{ height: "100%", width: "100%", minHeight: "200px" }}
          zoomControl={true}
        >
          <MapResizer />
          <MapUpdater position={position} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={pinIcon}
          />
        </MapContainer>
      </div>
      <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-emerald-800 flex items-center gap-1.5 text-sm">
            📏 Jarak dari Masjid
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md tracking-wide" title="Rumus Haversine — kalkulasi jarak geospasial antara dua titik koordinat di permukaan bumi">Haversine Formula</span>
          </span>
          <span className="bg-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-xs uppercase tracking-wide">
            {ringSuggestion}
          </span>
        </div>
        <p className="text-emerald-700 text-xs">
          Jarak atap rumah ke pusat Masjid: <strong className="font-mono text-emerald-900 text-sm">{distance} meter</strong>
        </p>
        <p className="text-[11px] text-emerald-600/80 italic leading-relaxed">
          Teknologi <strong>Rumus Haversine</strong> — kalkulasi jarak geospasial yang menghitung jarak akurat antar titik koordinat di permukaan bumi. Banyak digunakan dalam penelitian pemetaan sosial dan distribusi bantuan di Indonesia.
        </p>
      </div>
      <div className="text-[11px] text-muted mt-1.5 flex justify-between px-1">
        <span>📍 Geser pin merah ke lokasi persis rumah mustahik</span>
        <span className="font-mono">{position[0].toFixed(5)}, {position[1].toFixed(5)}</span>
      </div>
    </>
  );
}
