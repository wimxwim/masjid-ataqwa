"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Konfirmasi Hapus",
  description,
  itemName,
  loading: externalLoading,
}: DeleteConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-surface rounded-2xl shadow-2xl border border-outline max-w-sm w-full overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-ink">
              {title}
            </h3>
            <p className="text-sm text-muted">
              {description ?? (itemName
                ? `Apakah Anda yakin ingin menghapus "${itemName}"? Tindakan ini tidak dapat dibatalkan.`
                : "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.")}
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            disabled={externalLoading}
            className="flex-1 bg-surface hover:bg-gray-50 text-ink font-bold py-2.5 rounded-xl text-xs border border-outline transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={externalLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            {externalLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menghapus...
              </>
            ) : (
              "Ya, Hapus"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
