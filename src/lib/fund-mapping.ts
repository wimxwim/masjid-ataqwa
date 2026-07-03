import type { FundType, AkadType } from "@/db/schema";

/** Mapping akad_type (donasi online) → fund_type (buku kas).
 *  Donasi online pake donasi enum: "zakat_mal", "zakat_fitrah", "infaq", "sedekah", "wakaf", "fidyah"
 *  Buku kas pake fund_type enum: "zakat_maal", "zakat_fitrah", "infaq_tidak_terikat", "wakaf_pokok", dsb.
 *  Ada inkonsistensi historis: donasi enum pakai "zakat_mal" (1 L), fund_type enum pakai "zakat_maal" (2 A). */
export const AKAD_TO_FUND: Record<string, string> = {
  zakat_fitrah: "zakat_fitrah",
  zakat_mal: "zakat_maal",
  infaq: "infaq_tidak_terikat",
  sedekah: "infaq_tidak_terikat",
  wakaf: "wakaf_pokok",
  fidyah: "infaq_tidak_terikat",
};

/** Mapping akad_type → category string + fund_type enum + akad (untuk buku besar). */
export const CATEGORY_MAP: Record<string, { category: string; fund_type: FundType; akad: AkadType }> = {
  zakat_fitrah: { category: "Zakat Fitrah", fund_type: "zakat_fitrah", akad: "tamlik" },
  zakat_mal: { category: "Zakat Maal", fund_type: "zakat_maal", akad: "tamlik" },
  infaq: { category: "Infaq", fund_type: "infaq_tidak_terikat", akad: "tabarru" },
  sedekah: { category: "Sedekah", fund_type: "infaq_tidak_terikat", akad: "tabarru" },
  wakaf: { category: "Wakaf", fund_type: "wakaf_pokok", akad: "wakaf" },
  fidyah: { category: "Fidyah", fund_type: "zakat_fitrah", akad: "tamlik" },
};
