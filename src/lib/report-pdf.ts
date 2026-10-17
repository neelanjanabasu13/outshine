import type { Finding, Trade } from "./audit";
import type { Sop } from "./diy";

export interface PdfReportInput {
  name: string;
  address?: string;
  tradeLabel: string;
  trade: Trade;
  grade: string;
  areas: { area: string; grade: string }[];
  rivals: { name: string; grade: string }[];
  findings: Finding[];
  sops: Sop[];
}

/** Builds a searchable, text-based PDF with a clickable contents page and bookmarks. Browser only. */
export async function buildReportPdf(r: PdfReportInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 18, CW = W - M * 2;
  const ink: [number, number, number] = [20, 24, 33];
  const muted: [number, number, number] = [100, 106, 120];
  const accent: [number, number, number] = [107, 78, 245];
  let y = M;

  const footer = () => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...muted);
    doc.text(`FixFirst by Quietcrew · ${r.name}`, M, H - 10);
    doc.text(`Page ${doc.getNumberOfPages()}`, W - M, H - 10, { align: "right" });
  };
  const newPage = () => { footer(); doc.addPage(); y = M; };
  const ensure = (h: number) => { if (y + h > H - 20) newPage(); };
  const para = (text: string, size = 10, color = ink, style: "normal" | "bold" = "normal", indent = 0) => {
    doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
    if (size > 14) y += size * 0.25;
    const lines = doc.splitTextToSize(clean(text), CW - indent) as string[];
    const lh = size * 0.45;
    for (const l of lines) { ensure(lh); doc.text(l, M + indent, y); y += lh; }
    y += 1.5;
  };
  const heading = (text: string, size = 16) => { ensure(14); y += 3; para(text, size, ink, "bold"); y += 1; };
  const label = (text: string) => { ensure(10); y += 2; para(text.toUpperCase(), 8, accent, "bold"); };

  // Cover
  doc.setFillColor(...accent); doc.rect(0, 0, W, 6, "F");
  y = 40;
  para("FixFirst report and DIY pack", 11, accent, "bold");
  para(r.name, 28, ink, "bold");
  if (r.address) para(r.address, 10, muted);
  para(`${r.tradeLabel} · prepared ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, 10, muted);
  y += 10;
  doc.setFont("helvetica", "bold"); doc.setFontSize(64); doc.setTextColor(...accent); doc.text(r.grade, M, y + 18);
  doc.setFontSize(11); doc.setTextColor(...ink); doc.text("Overall grade", M + 30, y + 8);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...muted);
  doc.text(r.areas.map((a) => `${a.area} ${a.grade}`).join("   "), M + 30, y + 15);
  y += 34;
  para("This pack contains your free diagnostic followed by a step-by-step guide for every finding. Each guide tells you where to click, what to type and what to say, written for someone doing it for the first time.", 10, muted);

  // Contents placeholder page
  newPage();
  const tocPage = doc.getNumberOfPages();
  const toc: { title: string; page: number; level: number }[] = [];
  const mark = (title: string, level = 0) => { toc.push({ title, page: doc.getNumberOfPages(), level }); };

  // Diagnostic
  newPage();
  mark("Your diagnostic");
  heading("Your diagnostic", 20);
  label("Grades by area");
  r.areas.forEach((a) => para(`${a.area}: ${a.grade}`));
  if (r.rivals.length) { label("Nearby rivals"); r.rivals.forEach((c) => para(`${c.name}: ${c.grade}`)); }
  label("What is costing you the most");
  r.findings.forEach((f, i) => { para(`${i + 1}. ${f.title}`, 11, ink, "bold"); para(f.evidence, 10, muted, "normal", 4); para(f.impact, 10, ink, "normal", 4); });

  // SOPs
  r.sops.forEach((s, i) => {
    newPage();
    const f = r.findings[i]!;
    mark(`Guide ${i + 1}: ${f.title}`, 1);
    para(`GUIDE ${i + 1} · ${f.area.toUpperCase()} · ${s.time}`, 8, accent, "bold");
    heading(f.title, 18);
    para(s.goal, 11, muted);
    if (s.youNeed.length) { label("Before you start"); s.youNeed.forEach((x) => para(`• ${x}`, 10, ink, "normal", 2)); }
    if (s.rootCauses?.length) { label("Fix the cause first"); s.rootCauses.forEach((c) => { para(c.theme, 10, ink, "bold", 2); para(c.fix, 10, muted, "normal", 6); }); }
    label("Step by step");
    s.steps.forEach((st, j) => para(`${j + 1}.  ${st}`, 10, ink, "normal", 2));
    if (s.shotList?.length) { label("Your five-shot photo set"); s.shotList.forEach((c) => { para(c.shot, 10, ink, "bold", 2); para(c.how, 10, muted, "normal", 6); }); }
    if (s.scripts.length) {
      label("Word-for-word scripts");
      s.scripts.forEach((sc) => {
        para(sc.label, 10, ink, "bold", 2);
        const lines = doc.splitTextToSize(clean(sc.text), CW - 10) as string[];
        const h = lines.length * 4.5 + 6;
        ensure(h);
        doc.setFillColor(243, 241, 255); doc.roundedRect(M + 2, y - 4, CW - 2, h, 2, 2, "F");
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...ink);
        lines.forEach((l, k) => doc.text(l, M + 6, y + 0.5 + k * 4.5));
        y += h + 2;
      });
    }
    if (s.proTips.length) { label("Pro tips"); s.proTips.forEach((p) => para(`• ${p}`, 10, muted, "normal", 2)); }
    if (s.guardrails?.length) { label("Do not"); s.guardrails.forEach((g) => para(`• ${g}`, 10, ink, "normal", 2)); }
  });
  footer();

  // Fill contents with clickable links and bookmarks
  doc.setPage(tocPage);
  let ty = M + 4;
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...ink); doc.text("Contents", M, ty); ty += 12;
  toc.forEach((t) => {
    doc.setFont("helvetica", t.level ? "normal" : "bold"); doc.setFontSize(11); doc.setTextColor(...ink);
    const title = (doc.splitTextToSize(clean(t.title), CW - 20) as string[])[0] ?? "";
    doc.textWithLink(title, M + t.level * 5, ty, { pageNumber: t.page });
    doc.setTextColor(...muted); doc.text(String(t.page), W - M, ty, { align: "right" });
    doc.outline.add(null, clean(t.title), { pageNumber: t.page });
    ty += 8;
  });
  doc.setProperties({ title: `${r.name} FixFirst report`, author: "FixFirst by Quietcrew" });
  return doc.output("blob");
}

/** Built-in PDF fonts only cover basic Latin, so swap typographic characters for safe ones. */
function clean(s: string) {
  return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...").replace(/✓/g, "").replace(/[^\x20-\x7E£•·\n]/g, "");
}
