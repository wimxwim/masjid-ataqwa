"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useState, useRef, useMemo, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  defaultLat?: number;
  defaultLng?: number;
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

export default function MapPicker({ defaultLat, defaultLng, onPositionChange }: Props) {
  const initPos: [number, number] = defaultLat && defaultLng ? [defaultLat, defaultLng] : MOSQUE_CENTER;
  const [position, setPosition] = useState<[number, number]>(initPos);
  const markerRef = useRef<any>(null);

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
  if (distance < 500) ringSuggestion = "Ring 1 (Sangat Dekat)";
  else if (distance <= 1000) ringSuggestion = "Ring 2 (Menengah)";
  else ringSuggestion = "Ring 3 (Jauh)";

  return (
    <>
      <style>{`
        .leaflet-container .leaflet-tile { max-width: none !important; }
        .leaflet-container { z-index: 0 !important; cursor: crosshair; }
      `}</style>
      <div className="w-full h-full relative overflow-hidden rounded-xl border border-outline bg-surface">
        <MapContainer 
          center={initPos} 
          zoom={15} 
          style={{ height: "100%", width: "100%", minHeight: "200px" }}
          zoomControl={true}
        >
          <MapResizer />
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
      <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-emerald-800">📏 Kalkulasi Jarak Real-time:</span>
          <p className="text-emerald-700 mt-0.5">Jarak atap rumah ke pusat Masjid: <strong className="font-mono text-emerald-900">{distance} meter</strong></p>
        </div>
        <div className="text-right">
          <span className="bg-emerald-200 text-emerald-800 font-bold px-2 py-1 rounded-md text-[10px] uppercase">
            Rekomendasi: {ringSuggestion}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-muted mt-1.5 flex justify-between px-1">
        <span>📍 Geser pin merah ke lokasi persis rumah mustahik</span>
        <span className="font-mono">{position[0].toFixed(5)}, {position[1].toFixed(5)}</span>
      </div>
    </>
  );
}
