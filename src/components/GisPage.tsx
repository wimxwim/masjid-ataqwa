"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { getMustahiks, createMustahik } from "@/lib/actions/mustahik";
import type { MustahikDb } from "@/types";
import { Map, Filter, Compass, Phone } from "lucide-react";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const MOSQUE_CENTER: [number, number] = [-6.228, 106.761];

const desilColor: Record<string, string> = {
  "1": "#ef4444",
  "2": "#f97316",
  "3": "#f59e0b",
  "4": "#14b8a6",
};

const desilLabel: Record<string, string> = {
  "1": "Desil 1: Sangat Miskin",
  "2": "Desil 2: Miskin",
  "3": "Desil 3: Hampir Miskin",
  "4": "Desil 4: Rentan",
};

const ringLabel = (r: number | null) => {
  if (!r) return "-";
  return [``, `Ring 1 (<500m)`, `Ring 2 (500m-1km)`, `Ring 3 (>1km)`][r] || `Ring ${r}`;
};

export default function GisPage() {
  const LRef = useRef<any>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [mustahikList, setMustahikList] = useState<MustahikDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRing, setSelectedRing] = useState<string>("All");
  const [selectedDesil, setSelectedDesil] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    import("leaflet").then((mod) => {
      LRef.current = mod.default || mod;
      setLeafletReady(true);
    });
  }, []);

  const getMarkerIcon = useCallback((desil: string | null) => {
    const L = LRef.current;
    if (!L) return null;
    const color = desilColor[desil || ""] || "#6b7280";
    return L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }, []);

  const mosqueIcon = useCallback(() => {
    const L = LRef.current;
    if (!L) return null;
    return L.divIcon({
      className: "",
      html: `<div style="width:24px;height:24px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:12px">🕌</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const d = await getMustahiks();
      setMustahikList(d);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = mustahikList.filter((m) => {
    if (selectedRing !== "All" && m.ring_number?.toString() !== selectedRing) return false;
    if (selectedDesil !== "All" && m.desil_level !== selectedDesil) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.address.toLowerCase().includes(q);
  });

  const showMap = leafletReady && typeof window !== "undefined";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8" id="gis-portal-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-b border-outline pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-extrabold text-ink tracking-tight flex items-center gap-2">
              <Map className="w-8 h-8 text-primary" />
              Community GIS (Pemetaan Sosial)
            </h1>
            <span className="text-xs bg-primary/20 text-primary font-bold px-2.5 py-0.5 rounded-full uppercase">GIS Admin</span>
          </div>
          <p className="text-muted text-xs sm:text-sm mt-1">
            {mustahikList.length} mustahik terdata — klik marker untuk detail
          </p>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Map */}
        <div className="lg:col-span-8 bg-ink rounded-2xl border border-outline shadow-2xl p-4 space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-muted px-1 border-b border-outline pb-3">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: "12s" }} />
              OpenStreetMap — Ulujami, Jakarta Selatan
            </span>
            <span className="font-mono text-[10px] text-muted">Pusat: {Math.abs(MOSQUE_CENTER[0]).toFixed(3)}°{MOSQUE_CENTER[0] < 0 ? "S" : "N"}, {MOSQUE_CENTER[1].toFixed(3)}°E</span>
          </div>

          <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-outline z-0">
            {showMap && (
              <MapContainer center={MOSQUE_CENTER} zoom={15} className="w-full h-full" zoomControl={false}>
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                {/* Mosque center marker */}
                <Marker position={MOSQUE_CENTER} icon={mosqueIcon()}>
                  <Popup>
                    <div className="text-xs font-bold">Masjid At-Taqwa Ulujami</div>
                  </Popup>
                </Marker>

                {/* Mustahik markers */}
                {filtered.map((m) => {
                  if (!m.lat || !m.lng) return null;
                  const icon = getMarkerIcon(m.desil_level);
                  if (!icon) return null;
                  return (
                    <Marker key={m.id} position={[m.lat, m.lng]} icon={icon}>
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
              </MapContainer>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-[10px] text-muted">
            <span className="font-bold text-ink uppercase tracking-wider">Desil:</span>
            {Object.entries(desilColor).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border border-white" style={{ background: v }} />
                {desilLabel[k]}
              </span>
            ))}
            <span className="flex items-center gap-1 ml-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
              Masjid At-Taqwa
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 bg-surface border border-outline rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filter & Pencarian
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Nama / Alamat</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mustahik..."
              className="w-full bg-bg border border-outline focus:border-primary focus:outline-none py-2 px-3.5 rounded-lg text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Ring</label>
            <select
              value={selectedRing}
              onChange={(e) => setSelectedRing(e.target.value)}
              className="w-full bg-bg border border-outline focus:border-primary focus:outline-none py-2 px-3.5 rounded-lg text-xs text-ink transition-colors"
            >
              <option value="All">Semua Ring</option>
              <option value="1">Ring 1 (&lt;500m)</option>
              <option value="2">Ring 2 (500m-1km)</option>
              <option value="3">Ring 3 (&gt;1km)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5">Desil</label>
            <select
              value={selectedDesil}
              onChange={(e) => setSelectedDesil(e.target.value)}
              className="w-full bg-bg border border-outline focus:border-primary focus:outline-none py-2 px-3.5 rounded-lg text-xs text-ink transition-colors"
            >
              <option value="All">Semua Desil</option>
              <option value="1">Desil 1: Sangat Miskin</option>
              <option value="2">Desil 2: Miskin</option>
              <option value="3">Desil 3: Hampir Miskin</option>
              <option value="4">Desil 4: Rentan</option>
            </select>
          </div>

          <div className="border-t border-outline pt-5 space-y-1">
            <div className="flex justify-between text-xs text-muted font-bold mb-3">
              <span>DAFTAR MUSTAHIK ({filtered.length})</span>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-xs" id="mustahik-sidebar-list">
              {filtered.length === 0 && !loading && (
                <p className="text-center py-6 text-xs text-muted">Belum ada mustahik terdaftar.</p>
              )}
              {filtered.map((m) => (
                <div key={m.id} className="p-2.5 border border-outline rounded-xl bg-surface">
                  <h4 className="font-semibold text-ink">{m.name}</h4>
                  <p className="text-[10px] text-muted truncate">{m.address}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold" style={{ color: desilColor[m.desil_level || ""] || "#6b7280" }}>
                      {desilLabel[m.desil_level || ""] || "-"}
                    </span>
                    <span className="text-[10px] text-muted">•</span>
                    <span className="text-[10px] text-muted">{ringLabel(m.ring_number)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
