import type { Finding, Trade } from "./audit";
import type { Sop } from "./diy";
import { SCREEN_NOTE, TOOLS_DISCLAIMER, type UiScreen } from "./sop-visuals";

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

type RGB = [number, number, number];

/**
 * Builds a searchable, continuous document-style PDF (no forced page per section)
 * with clickable contents, bookmarks, interface diagrams and prompt boxes. Browser only.
 */
export async function buildReportPdf(r: PdfReportInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 16, CW = W - M * 2, TOP = 20, BOTTOM = H - 16;
  const ink: RGB = [20, 24, 33], muted: RGB = [95, 101, 115], accent: RGB = [107, 78, 245], tint: RGB = [243, 241, 255], line: RGB = [222, 224, 230];
  let y = TOP;

  const chrome = () => {
    const n = doc.getNumberOfPages();
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...muted);
    if (n > 1) { doc.text(`${clean(r.name)}  ·  Outshine report and DIY pack`, M, 11); doc.setDrawColor(...line); doc.line(M, 13, W - M, 13); }
    doc.text("Outshine by Quietcrew", M, H - 8);
    doc.text(`Page ${n}`, W - M, H - 8, { align: "right" });
  };
  const newPage = () => { doc.addPage(); chrome(); y = TOP; };
  const ensure = (h: number) => { if (y + h > BOTTOM) newPage(); };
  const lines = (text: string, size: number, width: number) => { doc.setFontSize(size); return doc.splitTextToSize(clean(text), width) as string[]; };
  const para = (text: string, size = 9.5, color: RGB = ink, style: "normal" | "bold" | "italic" = "normal", indent = 0, after = 1.2) => {
    doc.setFont("helvetica", style); doc.setTextColor(...color);
    const ls = lines(text, size, CW - indent); const lh = size * 0.42;
    for (const l of ls) { ensure(lh); doc.text(l, M + indent, y); y += lh; }
    y += after;
  };
  const label = (text: string, color: RGB = accent) => { ensure(12); y += 2.5; para(text.toUpperCase(), 7.5, color, "bold", 0, 0.8); };
  const bullet = (text: string, color: RGB = ink) => {
    doc.setFont("helvetica", "normal"); doc.setTextColor(...color);
    const ls = lines(text, 9.5, CW - 6); const lh = 4;
    ls.forEach((l, i) => { ensure(lh); if (i === 0) { doc.setFillColor(...color); doc.circle(M + 1.5, y - 1.2, 0.7, "F"); } doc.text(l, M + 5, y); y += lh; });
    y += 0.8;
  };
  const numbered = (n: number, text: string) => {
    doc.setFont("helvetica", "normal"); doc.setTextColor(...ink);
    const ls = lines(text, 9.5, CW - 9); const lh = 4;
    ensure(lh + 1);
    doc.setFillColor(...accent); doc.circle(M + 2.5, y - 1.3, 2.3, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(255, 255, 255); doc.text(String(n), M + 2.5, y - 0.3, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...ink);
    ls.forEach((l) => { ensure(lh); doc.text(l, M + 8, y); y += lh; });
    y += 1.2;
  };
  const box = (title: string, body: string, opts: { links?: { name: string; url: string }[]; footnote?: string } = {}) => {
    const bl = lines(body, 9, CW - 10);
    const fl = opts.footnote ? lines(opts.footnote, 7.5, CW - 10) : [];
    const h = 8 + bl.length * 3.9 + (opts.links ? 6 : 0) + fl.length * 3.3 + 3;
    if (h < BOTTOM - TOP) ensure(h);
    const top = y;
    doc.setFillColor(...tint); doc.roundedRect(M, top, CW, Math.min(h, BOTTOM - top), 2, 2, "F");
    doc.setFillColor(...accent); doc.rect(M, top, 1.2, Math.min(h, BOTTOM - top), "F");
    y = top + 5.5;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...ink); doc.text(lines(title, 9, CW - 10)[0] ?? "", M + 5, y); y += 4.5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...ink);
    bl.forEach((l) => { if (y > BOTTOM - 2) { newPage(); doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...ink); } doc.text(l, M + 5, y); y += 3.9; });
    if (opts.links) {
      y += 1.5; let x = M + 5;
      doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(...muted); doc.text("Open in:", x, y); x += 14;
      doc.setTextColor(...accent);
      opts.links.forEach((l) => { doc.textWithLink(l.name, x, y, { url: l.url }); x += doc.getTextWidth(l.name) + 5; });
      y += 4.5;
    }
    if (fl.length) { doc.setFont("helvetica", "italic"); doc.setFontSize(7.5); doc.setTextColor(...muted); fl.forEach((l) => { doc.text(l, M + 5, y); y += 3.3; }); }
    y += 4;
  };
  const screen = (s: UiScreen, x: number, top: number, w: number) => {
    const rowH = 7, cap = lines(s.caption, 7.5, w - 6);
    const h = 9 + 6 + s.rows.length * (rowH + 1.5) + cap.length * 3.2 + 6;
    doc.setDrawColor(...line); doc.setFillColor(255, 255, 255); doc.roundedRect(x, top, w, h, 2, 2, "FD");
    doc.setFillColor(246, 247, 249); doc.rect(x + 0.3, top + 0.3, w - 0.6, 7, "F");
    doc.setFillColor(200, 203, 210); doc.circle(x + 3.5, top + 3.8, 0.9, "F"); doc.circle(x + 6.5, top + 3.8, 0.9, "F");
    doc.setFillColor(255, 255, 255); doc.roundedRect(x + 10, top + 1.6, w - 13, 4.4, 1, 1, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...muted); doc.text(lines(s.url, 6.5, w - 16)[0] ?? "", x + 12, top + 4.7);
    let ry = top + 13;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...ink); doc.text(clean(s.title), x + 3, ry); ry += 3;
    s.rows.forEach((row) => {
      if (row.kind === "field") { doc.setFillColor(246, 247, 249); doc.setDrawColor(...line); doc.roundedRect(x + 3, ry, w - 6, rowH, 1.2, 1.2, "FD"); }
      else if (row.kind === "button") { doc.setDrawColor(...line); doc.roundedRect(x + 3, ry, w - 6, rowH, 1.2, 1.2, "S"); }
      if (row.mark) { doc.setDrawColor(...accent); doc.setLineWidth(0.6); doc.roundedRect(x + 3, ry, w - 6, rowH, 1.2, 1.2, "S"); doc.setLineWidth(0.2);
        doc.setFillColor(...accent); doc.circle(x + 7, ry + rowH / 2, 2, "F"); doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(255, 255, 255); doc.text(String(row.mark), x + 7, ry + rowH / 2 + 0.9, { align: "center" }); }
      doc.setFont("helvetica", row.mark ? "bold" : "normal"); doc.setFontSize(7.5); doc.setTextColor(...(row.kind === "text" ? muted : ink));
      doc.text(lines(row.text, 7.5, w - 16)[0] ?? "", x + (row.mark ? 11 : 5), ry + rowH / 2 + 1);
      ry += rowH + 1.5;
    });
    doc.setDrawColor(...line); doc.line(x, ry + 0.5, x + w, ry + 0.5); ry += 4;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...muted); cap.forEach((l) => { doc.text(l, x + 3, ry); ry += 3.2; });
    return h;
  };
  const screens = (list: UiScreen[]) => {
    const gap = 4, w = (CW - gap) / 2;
    for (let i = 0; i < list.length; i += 2) {
      const pair = list.slice(i, i + 2);
      const est = Math.max(...pair.map((s) => 9 + 6 + s.rows.length * 8.5 + lines(s.caption, 7.5, w - 6).length * 3.2 + 4));
      ensure(est + 2);
      const hs = pair.map((s, k) => screen(s, M + k * (w + gap), y, w));
      y += Math.max(...hs) + 3;
    }
    para(SCREEN_NOTE, 7.5, muted, "italic", 0, 2);
  };

  // ---- Page 1: masthead, scorecard, contents ----
  chrome();
  doc.setFillColor(...accent); doc.rect(0, 0, W, 4, "F");
  y = 18;
  para("OUTSHINE REPORT AND DIY PACK", 8, accent, "bold", 0, 1);
  y += 6;
  para(r.name, 22, ink, "bold", 0, 1);
  para([r.address, r.tradeLabel, `Prepared ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`].filter(Boolean).join("  ·  "), 9, muted, "normal", 0, 4);

  const cardTop = y;
  doc.setFillColor(...tint); doc.roundedRect(M, cardTop, CW, 26, 2, 2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(40); doc.setTextColor(...accent); doc.text(r.grade, M + 6, cardTop + 19);
  doc.setFontSize(8); doc.setTextColor(...muted); doc.text("OVERALL GRADE", M + 24, cardTop + 7);
  let ax = M + 24;
  r.areas.forEach((a) => { doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...ink); doc.text(a.grade, ax, cardTop + 16); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...muted); doc.text(clean(a.area), ax, cardTop + 21); ax += Math.max(24, doc.getTextWidth(clean(a.area)) + 8); });
  y = cardTop + 32;
  para("Your free diagnostic comes first, followed by a step-by-step guide for each finding. Guides show the exact screens to use, word-for-word scripts and ready-made AI prompts, written for someone doing this for the first time.", 9.5, muted, "normal", 0, 3);

  label("Contents");
  const tocPage = doc.getNumberOfPages();
  const tocY = y;
  const toc: { title: string; page: number; level: number }[] = [];
  y += (r.sops.length + 1) * 5.5 + 3;
  const mark = (title: string, level = 0) => toc.push({ title, page: doc.getNumberOfPages(), level });

  // ---- Diagnostic (flows on) ----
  const section = (title: string, level = 0) => { ensure(24); y += 3; doc.setDrawColor(...line); doc.line(M, y, W - M, y); y += 6; mark(title, level); };
  section("Your diagnostic");
  para("Your diagnostic", 15, ink, "bold", 0, 1);
  if (r.rivals.length) {
    label("Nearby rivals");
    r.rivals.forEach((c) => { ensure(5); doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...ink); doc.text(clean(c.name), M, y); doc.setFont("helvetica", "bold"); doc.text(c.grade, W - M, y, { align: "right" }); y += 4.6; });
  }
  label("What is costing you the most");
  r.findings.forEach((f, i) => { para(`${i + 1}. ${f.title}`, 10, ink, "bold", 0, 0.6); para(f.evidence, 9, muted, "normal", 4, 0.6); para(f.impact, 9, ink, "normal", 4, 2); });

  // ---- Guides (continuous) ----
  r.sops.forEach((s, i) => {
    const f = r.findings[i]!;
    section(`Guide ${i + 1}: ${f.title}`, 1);
    para(`GUIDE ${i + 1}  ·  ${f.area.toUpperCase()}  ·  ${s.time.toUpperCase()}`, 7.5, accent, "bold", 0, 1);
    y += 3; para(f.title, 14, ink, "bold", 0, 1);
    para(s.goal, 9.5, muted, "normal", 0, 1);
    if (s.youNeed.length) { label("Before you start"); s.youNeed.forEach((x) => bullet(x)); }
    if (s.rootCauses?.length) { label("Fix the cause first"); s.rootCauses.forEach((c) => { para(c.theme, 9.5, ink, "bold", 0, 0.3); para(c.fix, 9, muted, "normal", 0, 1.5); }); }
    label("Step by step");
    s.steps.forEach((st, j) => numbered(j + 1, st));
    if (s.screens?.length) { label("What you will see"); screens(s.screens); }
    if (s.shotList?.length) { label("Your five-shot photo set"); s.shotList.forEach((c) => { para(c.shot, 9.5, ink, "bold", 0, 0.3); para(c.how, 9, muted, "normal", 0, 1.5); }); }
    if (s.tools?.length) {
      label("Popular no-code tools");
      s.tools.forEach((t) => { ensure(5); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...accent); doc.textWithLink(t.name, M, y, { url: t.url }); doc.setFont("helvetica", "normal"); doc.setTextColor(...muted); doc.text(clean(`${t.bestFor}  ·  ${t.url.replace(/^https:\/\//, "")}`), M + 32, y); y += 4.8; });
      para(TOOLS_DISCLAIMER, 8, muted, "italic", 0, 2);
    }
    if (s.prompts?.length) { label("Ready-made AI prompts"); s.prompts.forEach((p) => box(p.label, p.text, { links: p.openIn, footnote: `Fill in the [square brackets] first.${s.tools ? "" : " " + TOOLS_DISCLAIMER}` })); }
    if (s.scripts.length) { label("Word-for-word scripts"); s.scripts.forEach((sc) => box(sc.label, sc.text)); }
    if (f.fix === "website") box("Rather not do it yourself?", "Choose Done for you on your report and our AI agent builds your one-page website in under a minute, using your real business details and reviews.");
    if (s.proTips.length) { label("Pro tips"); s.proTips.forEach((p) => bullet(p, muted)); }
    if (s.guardrails?.length) { label("Do not", [190, 40, 50]); s.guardrails.forEach((g) => bullet(g)); }
  });

  // ---- Fill contents ----
  doc.setPage(tocPage);
  let ty = tocY + 1;
  toc.forEach((t) => {
    doc.setFont("helvetica", t.level ? "normal" : "bold"); doc.setFontSize(9.5); doc.setTextColor(...ink);
    const title = lines(t.title, 9.5, CW - 20)[0] ?? "";
    doc.textWithLink(title, M + t.level * 4, ty, { pageNumber: t.page });
    doc.setTextColor(...muted); doc.text(String(t.page), W - M, ty, { align: "right" });
    doc.outline.add(null, clean(t.title), { pageNumber: t.page });
    ty += 5.5;
  });
  doc.setProperties({ title: `${r.name} Outshine report`, author: "Outshine by Quietcrew" });
  return doc.output("blob");
}

export interface FreeReportInput {
  name: string; address?: string; tradeLabel: string; grade: string;
  areas: { area: string; grade: string }[];
  rivals: { name: string; grade: string }[];
  findings: { title: string; evidence: string; impact: string }[];
  tips: { title: string; body: string }[];
}

/** Styled one-to-two page free report: brand band, grade badge, area tiles, rivals, findings. */
export async function buildFreeReportPdf(r: FreeReportInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 16, CW = W - M * 2;
  const ink: RGB = [20, 24, 33], muted: RGB = [95, 101, 115], coral: RGB = [233, 69, 96], gold: RGB = [242, 170, 60], violet: RGB = [107, 78, 245], cream: RGB = [250, 246, 238], line: RGB = [222, 224, 230];
  const gradeRGB = (g: string): RGB => ({ A: [34, 160, 90], B: [90, 170, 60], C: [230, 160, 30], D: [235, 110, 40], F: [210, 50, 60] } as Record<string, RGB>)[g] ?? muted;
  let y = 0;
  const footer = () => { doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...muted); doc.text("Outshine by Quietcrew  ·  quietcrew.ai", M, H - 8); doc.text(`Page ${doc.getNumberOfPages()}`, W - M, H - 8, { align: "right" }); };
  const ensure = (h: number) => { if (y + h > H - 18) { doc.addPage(); footer(); y = 20; } };

  // Brand band: coral to gold stripes
  const steps = 40;
  for (let i = 0; i < steps; i++) { const t = i / (steps - 1); doc.setFillColor(coral[0] + (gold[0] - coral[0]) * t, coral[1] + (gold[1] - coral[1]) * t, coral[2] + (gold[2] - coral[2]) * t); doc.rect((W / steps) * i, 0, W / steps + 0.3, 42, "F"); }
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.text("Outshine", M, 20);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.textWithLink("by Quietcrew", M, 26, { url: "https://quietcrew.ai/" });
  doc.setFontSize(8); doc.text("FREE ONLINE PRESENCE REPORT", W - M, 20, { align: "right" });
  doc.text(new Date().toLocaleDateString("en-GB"), W - M, 26, { align: "right" });
  footer();

  // Business + grade badge
  y = 58;
  doc.setTextColor(...muted); doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.text(clean(r.tradeLabel).toUpperCase(), M, y);
  doc.setTextColor(...ink); doc.setFontSize(20); const nameLines = doc.splitTextToSize(clean(r.name), CW - 45) as string[]; doc.text(nameLines, M, y + 9);
  let ny = y + 9 + nameLines.length * 8;
  if (r.address) { doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...muted); doc.text(doc.splitTextToSize(clean(r.address), CW - 45), M, ny); ny += 6; }
  const gc = gradeRGB(r.grade);
  doc.setFillColor(...gc); doc.circle(W - M - 17, y + 8, 17, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(30); doc.text(r.grade, W - M - 17, y + 13, { align: "center" });
  doc.setFontSize(7); doc.setTextColor(...muted); doc.text("OVERALL GRADE", W - M - 17, y + 31, { align: "center" });
  y = Math.max(ny, y + 36) + 6;

  // Area tiles
  if (r.areas.length) {
    const n = r.areas.length, gap = 4, tw = (CW - gap * (n - 1)) / n;
    r.areas.forEach((a, i) => { const x = M + i * (tw + gap); doc.setFillColor(...cream); doc.roundedRect(x, y, tw, 22, 2, 2, "F"); doc.setFillColor(...gradeRGB(a.grade)); doc.rect(x, y, tw, 1.4, "F"); doc.setTextColor(...muted); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text(clean(a.area), x + 4, y + 8); doc.setTextColor(...gradeRGB(a.grade)); doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text(a.grade, x + 4, y + 18); });
    y += 30;
  }

  const heading = (t: string) => { ensure(14); doc.setTextColor(...violet); doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(t.toUpperCase(), M, y); doc.setDrawColor(...line); doc.line(M, y + 2, W - M, y + 2); y += 8; };

  if (r.rivals.length) {
    heading("You and your nearby rivals");
    [{ name: `${r.name} (you)`, grade: r.grade }, ...r.rivals].forEach((c) => { ensure(8); doc.setTextColor(...ink); doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(clean(c.name), M, y); doc.setFillColor(...gradeRGB(c.grade)); doc.roundedRect(W - M - 10, y - 4.5, 10, 6, 1.5, 1.5, "F"); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.text(c.grade, W - M - 5, y, { align: "center" }); y += 8; });
    y += 3;
  }

  if (r.findings.length) {
    heading("What is holding you back the most");
    r.findings.forEach((f, i) => {
      doc.setFontSize(9); const ev = doc.splitTextToSize(clean(f.evidence), CW - 14) as string[]; const im = doc.splitTextToSize(clean(f.impact), CW - 14) as string[];
      const h = 9 + (ev.length + im.length) * 4 + 4; ensure(h);
      doc.setFillColor(...cream); doc.roundedRect(M, y - 4, CW, h, 2, 2, "F"); doc.setFillColor(...coral); doc.rect(M, y - 4, 1.2, h, "F");
      doc.setFillColor(...coral); doc.circle(M + 6, y + 0.5, 2.6, "F"); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(String(i + 1), M + 6, y + 1.5, { align: "center" });
      doc.setTextColor(...ink); doc.setFontSize(10.5); doc.text(clean(f.title), M + 11, y + 1.5);
      let fy = y + 7; doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...ink); ev.forEach((l) => { doc.text(l, M + 11, fy); fy += 4; }); doc.setTextColor(...muted); im.forEach((l) => { doc.text(l, M + 11, fy); fy += 4; });
      y += h + 3;
    });
  } else if (r.tips.length) {
    heading("Ideas to stay ahead");
    r.tips.forEach((t) => { doc.setFontSize(9); const b = doc.splitTextToSize(clean(t.body), CW - 6) as string[]; ensure(6 + b.length * 4); doc.setTextColor(...ink); doc.setFont("helvetica", "bold"); doc.text(clean(t.title), M, y); y += 4.5; doc.setFont("helvetica", "normal"); doc.setTextColor(...muted); b.forEach((l) => { doc.text(l, M, y); y += 4; }); y += 3; });
  }

  // Next step callout
  ensure(26); y += 2;
  doc.setFillColor(...ink); doc.roundedRect(M, y, CW, 22, 3, 3, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("Ready to outshine them?", M + 6, y + 8);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.text("Get the DIY pack with ready-to-use wording and step-by-step guides, or let our AI agent do it for you.", M + 6, y + 14);
  doc.setTextColor(...gold); doc.textWithLink("outshine.lovable.app", M + 6, y + 19, { url: "https://outshine.lovable.app" });

  doc.setProperties({ title: `${r.name} free Outshine report`, author: "Outshine by Quietcrew" });
  return doc.output("blob");
}

/** Built-in PDF fonts only cover basic Latin, so swap typographic characters for safe ones. */
function clean(s: string) {
  return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...").replace(/★/g, "*").replace(/✓/g, "").replace(/[^\x20-\x7E£•·\n]/g, "");
}
