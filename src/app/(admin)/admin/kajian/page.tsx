import { Library } from "lucide-react";
import SmartEmptyState from "@/components/SmartEmptyState";

export default function KajianPlaceholderPage() {
  return (
    <div className="space-y-6">
      <SmartEmptyState
        icon={Library}
        title="Fitur Kajian & Silabus"
        description="Modul untuk merekam kurikulum dakwah, silabus kajian, dan streaming video sedang dalam tahap pengembangan (Fase 2). Database tabel kajian_silabus sudah tersambung."
        actionLabel="Kembali ke Dashboard"
        actionHref="/admin"
        ghostRows={0}
      />
    </div>
  );
}
