import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface PdfEntry {
  transaction_date: string | null;
  category: string | null;
  description: string | null;
  amount: number | string | null;
  type: string | null;
}

interface PdfSummary {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
  totalDonasi: number;
}

export async function generateTransparansiPdf(
  entries: PdfEntry[],
  summary: PdfSummary,
  mosqueName: string,
  monthLabel: string,
) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const FONT_SIZE_TITLE = 16;
  const FONT_SIZE_SUBTITLE = 9;
  const FONT_SIZE_BODY = 7;
  const FONT_SIZE_HEADER = 8;
  const PAGE_MARGIN = 40;
  const TABLE_TOP = 520;
  const ROW_H = 15;

  const GRAY = rgb(0.4, 0.4, 0.4);
  const DARK = rgb(0.1, 0.1, 0.1);
  const GREEN = rgb(0.02, 0.5, 0.2);
  const RED = rgb(0.8, 0.2, 0.1);
  const LIGHT_BG = rgb(0.97, 0.97, 0.97);
  const WHITE = rgb(1, 1, 1);
  const PAGE_W = 595;

  function drawHeader(page: ReturnType<typeof doc.addPage>, title: string) {
    page.drawRectangle({
      x: 0, y: 770, width: 595, height: 80,
      color: rgb(0.02, 0.4, 0.15),
    });
    page.drawText(mosqueName, { x: PAGE_MARGIN, y: 795, font: bold, size: FONT_SIZE_TITLE, color: WHITE });
    page.drawText("Laporan Transparansi Keuangan Masjid", { x: PAGE_MARGIN, y: 778, font, size: 10, color: rgb(0.8, 1, 0.9) });
    page.drawText(`Periode: ${monthLabel}`, { x: PAGE_MARGIN, y: 808, font, size: 9, color: rgb(0.7, 0.95, 0.85) });
  }

  function drawFooter(page: ReturnType<typeof doc.addPage>, pageNum: number, total: number) {
    page.drawLine({
      start: { x: PAGE_MARGIN, y: 50 }, end: { x: PAGE_W - PAGE_MARGIN, y: 50 },
      thickness: 0.5, color: GRAY,
    });
    page.drawText(`Dicetak: ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, {
      x: PAGE_MARGIN, y: 36, font, size: 7, color: GRAY,
    });
    page.drawText(`Halaman ${pageNum} dari ${total}`, {
      x: PAGE_W - PAGE_MARGIN - 60, y: 36, font, size: 7, color: GRAY,
    });
  }

  function drawSummaryBox(page: ReturnType<typeof doc.addPage>, y: number) {
    const items = [
      { label: "Total Pemasukan", value: `Rp ${summary.totalPemasukan.toLocaleString("id-ID")}`, color: GREEN },
      { label: "Total Pengeluaran", value: `Rp ${summary.totalPengeluaran.toLocaleString("id-ID")}`, color: RED },
      { label: "Saldo Kas", value: `Rp ${summary.saldo.toLocaleString("id-ID")}`, color: DARK },
      { label: "Total Donasi", value: `Rp ${summary.totalDonasi.toLocaleString("id-ID")}`, color: GREEN },
    ];

    page.drawRectangle({
      x: PAGE_MARGIN - 5, y: y - 45, width: PAGE_W - 2 * PAGE_MARGIN + 10, height: 50,
      color: LIGHT_BG,
    });

    items.forEach((item, i) => {
      const x = PAGE_MARGIN + i * ((PAGE_W - 2 * PAGE_MARGIN) / 4);
      page.drawText(item.label, { x, y: y - 15, font, size: 7, color: GRAY });
      page.drawText(item.value, { x, y: y - 33, font: mono, size: 8, color: item.color });
    });
  }

  function drawTableHeader(page: ReturnType<typeof doc.addPage>, y: number) {
    const cols: { label: string; w: number }[] = [
      { label: "Tanggal", w: 70 },
      { label: "Kategori", w: 68 },
      { label: "Keterangan", w: 155 },
      { label: "Jumlah", w: 75 },
      { label: "Tipe", w: 50 },
    ];
    page.drawRectangle({
      x: PAGE_MARGIN - 2, y: y - ROW_H, width: PAGE_W - 2 * PAGE_MARGIN + 4, height: ROW_H,
      color: rgb(0.02, 0.4, 0.15),
    });
    let cx = PAGE_MARGIN;
    for (const c of cols) {
      page.drawText(c.label, { x: cx + 4, y: y - ROW_H + 4, font: bold, size: FONT_SIZE_HEADER, color: WHITE });
      cx += c.w;
    }
  }

  const COL_SPEC: { w: number; align?: "left" | "right" }[] = [
    { w: 70 }, { w: 68 }, { w: 155 }, { w: 75, align: "right" }, { w: 50 },
  ];

  function drawTableRow(page: ReturnType<typeof doc.addPage>, entry: PdfEntry, y: number, isEven: boolean) {
    if (isEven) {
      page.drawRectangle({
        x: PAGE_MARGIN - 2, y: y - ROW_H, width: PAGE_W - 2 * PAGE_MARGIN + 4, height: ROW_H,
        color: rgb(0.98, 0.98, 0.98),
      });
    }
    const date = entry.transaction_date ? String(entry.transaction_date).slice(0, 10) : "-";
    const cat = entry.category ?? "-";
    const desc = entry.description ?? "-";
    const amt = Number(entry.amount) || 0;
    const type = entry.type ?? "-";
    const isIncome = type === "Pemasukan";

    const maxDescLen = 36;
    const descTrunc = desc.length > maxDescLen ? desc.slice(0, maxDescLen) + "…" : desc;

    const c0 = COL_SPEC[0]!;
    const c1 = COL_SPEC[1]!;
    const c2 = COL_SPEC[2]!;
    const c3 = COL_SPEC[3]!;
    let cx = PAGE_MARGIN;
    page.drawText(date, { x: cx + 4, y: y - ROW_H + 4, font: mono, size: FONT_SIZE_BODY, color: GRAY });
    cx += c0.w;
    page.drawText(cat, { x: cx + 4, y: y - ROW_H + 4, font, size: FONT_SIZE_BODY, color: DARK });
    cx += c1.w;
    page.drawText(descTrunc, { x: cx + 4, y: y - ROW_H + 4, font, size: FONT_SIZE_BODY, color: DARK });
    cx += c2.w;
    page.drawText(`Rp ${amt.toLocaleString("id-ID")}`, {
      x: cx + 4, y: y - ROW_H + 4, font: mono, size: FONT_SIZE_BODY, color: isIncome ? GREEN : DARK,
    });
    cx += c3.w;
    page.drawText(isIncome ? "Pemasukan" : "Pengeluaran", {
      x: cx + 4, y: y - ROW_H + 4, font: bold, size: FONT_SIZE_BODY, color: isIncome ? GREEN : RED,
    });
  }

  const TOTAL_PAGES = Math.ceil(entries.length / 30) + 1 || 1;

  for (let pageIdx = 0; pageIdx < TOTAL_PAGES; pageIdx++) {
    const page = doc.addPage([595, 842]);
    drawHeader(page, "Laporan Keuangan Masjid");
    drawFooter(page, pageIdx + 1, TOTAL_PAGES);

    if (pageIdx === 0) {
      drawSummaryBox(page, 700);

      drawTableHeader(page, 630);

      const pageEntries = entries.slice(0, 30);
      pageEntries.forEach((entry, i) => {
        drawTableRow(page, entry, 630 - (i + 1) * ROW_H, i % 2 === 0);
      });
    } else {
      const start = 30 + (pageIdx - 1) * 35;
      const pageEntries = entries.slice(start, start + 35);
      drawTableHeader(page, 740);

      pageEntries.forEach((entry, i) => {
        drawTableRow(page, entry, 740 - (i + 1) * ROW_H, i % 2 === 0);
      });
    }
  }

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
}
