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
      <div className="text-[10px] text-muted mt-1 flex justify-between">
        <span>📍 Geser pin merah ke lokasi persis rumah mustahik</span>
        <span className="font-mono">{position[0].toFixed(5)}, {position[1].toFixed(5)}</span>
      </div>
    </>
  );
}
