"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileCheck, Map, Users, Plus, BarChart3 } from "lucide-react";
import { getMustahiks } from "@/lib/actions/mustahik";
import { getAsnafList } from "@/lib/actions/asnaf";
import type { InsertAsnaf } from "@/lib/actions/asnaf";

export default function MustahikTab() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [ring1, setRing1] = useState(0);
  const [ring2, setRing2] = useState(0);
  const [ring3, setRing3] = useState(0);
  const [asnafBreakdown, setAsnafBreakdown] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    Promise.all([getMustahiks(), getAsnafList()]).then(([list, asnafs]) => {
      setTotal(list.length);
      setRing1(list.filter((m) => m.ring_number === 1).length);
      setRing2(list.filter((m) => m.ring_number === 2).length);
      setRing3(list.filter((m) => m.ring_number === 3 || (m.ring_number && m.ring_number > 2)).length);

      const asnafMap: Record<string, string> = {};
      for (const a of asnafs as (InsertAsnaf & { id: string })[]) {
        asnafMap[a.id] = a.name;
      }
      const counts: Record<string, number> = {};
      for (const m of list) {
        if (m.asnaf_id) {
          counts[m.asnaf_id] = (counts[m.asnaf_id] ?? 0) + 1;
        }
      }
      const breakdown = Object.entries(counts)
        .map(([id, count]) => ({ name: asnafMap[id] ?? "Unknown", count }))
        .sort((a, b) => b.count - a.count);
      setAsnafBreakdown(breakdown);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 reveal">
      <div className="glass-strong rounded-2xl shadow-2 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">Total Mustahik Terdata</p>
            <p className="text-2xl font-bold text-ink">{total} KK</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-outline pt-4 text-center text-xs text-muted">
          <div><span className="font-medium text-ink">{ring1}</span> Ring 1</div>
          <div><span className="font-medium text-ink">{ring2}</span> Ring 2</div>
          <div><span className="font-medium text-ink">{ring3}</span> Ring 3</div>
        </div>
      </div>

      {asnafBreakdown.length > 0 && (
        <div className="glass rounded-2xl shadow-2 p-6">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted" />
            <span className="text-sm font-medium text-ink">Distribusi Asnaf</span>
          </div>
          <div className="space-y-2">
            {asnafBreakdown.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-xs text-muted w-24 truncate">{a.name}</span>
                <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.max(4, (a.count / Math.max(...asnafBreakdown.map((x) => x.count))) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted w-8 text-right">{a.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/mustahik")}
          className="inline-flex items-center justify-center gap-2 glass border-white/40 text-ink rounded-xl hover:bg-surface/80 active:scale-95 transition-all px-5 py-4 text-sm font-semibold"
        >
          <Plus className="h-5 w-5 text-primary" />
          Kelola Mustahik
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/gis")}
          className="inline-flex items-center justify-center gap-2 glass border-white/40 text-ink rounded-xl hover:bg-surface/80 active:scale-95 transition-all px-5 py-4 text-sm font-semibold"
        >
          <Map className="h-5 w-5 text-primary" />
          Buka Peta GIS
        </button>
      </div>

      <div className="glass overflow-hidden rounded-[var(--radius-card)] shadow-2">
        <div className="flex items-center gap-2 border-b border-outline px-5 py-3">
          <FileCheck className="h-4 w-4 text-muted" />
          <span className="text-sm font-medium text-ink">Daftar Mustahik</span>
          <span className="ml-auto rounded-full bg-bg px-2 py-0.5 text-xs text-muted border border-outline">{total}</span>
        </div>
        <div className="p-6 text-center text-sm text-muted">
          <Users className="mx-auto mb-2 h-8 w-8" />
          <p>Kelola data mustahik di halaman <button onClick={() => router.push("/admin/mustahik")} className="text-primary underline hover:text-primary-deep font-semibold">Manajemen Mustahik</button></p>
        </div>
      </div>
    </div>
  );
}
