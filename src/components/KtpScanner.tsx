"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, ScanLine, CheckCircle2, AlertCircle } from "lucide-react";
import { extractNikFromOcr, extractNameFromOcr, extractAddressFromOcr } from "@/lib/nik-utils";

export type KtpData = {
  nik: string;
  name: string | null;
  address: string | null;
};

type Props = {
  onScan: (data: KtpData) => void;
  onClear: () => void;
};

export default function KtpScanner({ onScan, onClear }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<KtpData | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const processImage = async (imgSrc: string) => {
    setImage(imgSrc);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(imgSrc, "ind", {
        logger: (m) => {
          if (m.status === "recognizing text") void m.progress;
        },
      });
      const text = data.text;
      const nik = extractNikFromOcr(text);

      if (!nik) {
        setError("Tidak dapat menemukan NIK (16 digit) di foto. Coba foto ulang dengan pencahayaan cukup.");
        return;
      }

      const name = extractNameFromOcr(text);
      const address = extractAddressFromOcr(text);

      const parsed: KtpData = { nik, name, address };
      setResult(parsed);
      onScan(parsed);
    } catch {
      setError("Gagal memproses foto. Coba ulangi.");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => processImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setError("Kamera tidak dapat diakses. Gunakan upload foto.");
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    stopCamera();
    processImage(dataUrl);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError("");
    onClear();
    stopCamera();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-ink flex items-center gap-1.5">
          <ScanLine className="w-3.5 h-3.5 text-primary" />
          Scan KTP Otomatis
        </label>
        {result && (
          <button onClick={handleReset} className="text-xs text-muted hover:text-red-500 flex items-center gap-1">
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {!image && !loading && (
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bg border border-outline rounded-xl text-sm text-muted hover:border-primary hover:text-primary transition-all"
          >
            <Upload className="w-4 h-4" /> Upload Foto
          </button>
          <button
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bg border border-outline rounded-xl text-sm text-muted hover:border-primary hover:text-primary transition-all"
          >
            <Camera className="w-4 h-4" /> Kamera
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        </div>
      )}

      {/* Camera preview */}
      {streamRef.current && !image && (
        <div className="relative rounded-xl overflow-hidden border border-outline bg-black">
          <video ref={videoRef} className="w-full h-48 object-cover" playsInline />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-32 border-2 border-dashed border-white/50 rounded-lg" />
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
            <button onClick={captureFromCamera}
              className="bg-white text-ink px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-gray-100 transition-all">
              Ambil Foto
            </button>
            <button onClick={handleReset}
              className="bg-red-500 text-white px-4 py-2 rounded-full text-sm shadow-lg hover:bg-red-600 transition-all">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Image preview */}
      {image && !loading && (
        <div className="relative rounded-xl overflow-hidden border border-outline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="KTP" className="w-full h-48 object-contain bg-black/5" />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 bg-bg rounded-xl border border-outline">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted">Memproses KTP...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Data Terdeteksi
          </div>
          <div className="text-xs text-emerald-800 space-y-0.5">
            <p><span className="font-medium">NIK:</span> {result.nik}</p>
            {result.name && <p><span className="font-medium">Nama:</span> {result.name}</p>}
            {result.address && <p><span className="font-medium">Alamat:</span> {result.address}</p>}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
