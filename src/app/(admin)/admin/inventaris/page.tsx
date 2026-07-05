import { Package, Construction } from "lucide-react";
import SmartEmptyState from "@/components/SmartEmptyState";

export default function InventarisPlaceholderPage() {
  return (
    <div className="space-y-6">
      <SmartEmptyState
        icon={Package}
        title="Fitur dalam pengembangan"
        description="Modul Inventaris Masjid untuk pencatatan aset barang, pemeliharaan sarana (AC, Sound System), dan log peminjaman sedang dalam tahap pengembangan (Fase 2). Integrasi dengan database sedang disiapkan."
        actionLabel="Kembali ke Dashboard"
        actionHref="/admin"
        ghostRows={0}
      />
    </div>
  );
}
