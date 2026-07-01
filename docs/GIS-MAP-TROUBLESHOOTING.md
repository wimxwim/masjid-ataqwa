# GIS Map Troubleshooting

> Ditemukan saat development (Juni 2026). Disimpan sebagai catatan sebelum push/deploy.

## Gejala

Peta di `/admin/gis` muncul latar abu-abu dengan logo Leaflet + marker, tapi tile/gambar peta tidak tampak.

**Artinya:** Komponen Leaflet dan koordinat sudah berhasil di-render di browser. Bukan masalah SSR/blank 0px.

---

## Root Cause (sudah diperbaiki)

### Akar Masalah — OpenStreetMap HTTP tile redirect ke HTTPS

```
Tile URL (HTTP) → 301 Moved Permanently → HTTPS → Diblokir Mixed Content
```

Coba sendiri:
```bash
# OSM tile via HTTP → 301 redirect ke HTTPS
curl -sI "http://tile.openstreetmap.org/0/0/0.png" | head -5
# Output: HTTP/1.1 301 Moved Permanently → Location: https://...

# OSM tile via HTTPS → OK
curl -sI "https://tile.openstreetmap.org/0/0/0.png" | head -5
# Output: HTTP/2 200
```

Saat dev di `localhost:6790` (HTTP), browser:
1. Minta tile via HTTP → OSM redirect ke HTTPS
2. Browser blokir karena **Mixed Content** (HTTPS dari halaman HTTP)
3. Tile abu-abu

### Fix — Ganti tile provider ke CartoDB

CartoDB tiles support **HTTP dan HTTPS langsung** tanpa redirect:

```bash
curl -sI "http://a.basemaps.cartocdn.com/light_all/0/0/0.png" | head -5
# Output: HTTP/1.1 200 OK
```

Di `src/components/GisPage.tsx`:
```tsx
<TileLayer
  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
/>
```

**Kenapa tetap pakai `https://`?** Karena CartoDB tidak redirect, jadi aman. Browser hanya memblokir HTTPS dari URL HTTP yang *redirect* ke HTTPS — bukan HTTPS langsung.

---

## Catatan

- Masalah hanya terjadi di development (localhost/http). Di production dengan HTTPS, semua tile provider berjalan normal.
- File terkait: `src/components/GisPage.tsx` (TileLayer, MOSQUE_CENTER).
