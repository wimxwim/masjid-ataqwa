"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ZakatPage from "@/components/ZakatPage";

function DonasiContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  return <ZakatPage initialSelectedType={type || undefined} />;
}

export default function DonasiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Memuat...</div>}>
      <DonasiContent />
    </Suspense>
  );
}
