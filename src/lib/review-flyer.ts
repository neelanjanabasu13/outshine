// Builds a print-ready A5 QR review card in the browser. Libraries load on demand to stay out of SSR.
export async function downloadReviewFlyer(opts: { name: string; phone: string; link: string }) {
  const [{ jsPDF }, QR] = await Promise.all([import("jspdf"), import("qrcode")]);
  const qr = await QR.toDataURL(opts.link, { margin: 1, width: 800, errorCorrectionLevel: "M" });
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const w = 148;
  doc.setFillColor(20, 20, 20); doc.rect(0, 0, w, 30, "F");
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text(doc.splitTextToSize(opts.name, w - 20), w / 2, 18, { align: "center" });
  doc.setTextColor(20, 20, 20); doc.setFontSize(24);
  doc.text("Happy with our work?", w / 2, 48, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(13);
  doc.text("Scan to leave us a quick Google review.", w / 2, 57, { align: "center" });
  doc.addImage(qr, "PNG", w / 2 - 40, 66, 80, 80);
  doc.setFontSize(11);
  doc.text("Point your phone camera at the code. It takes 30 seconds.", w / 2, 156, { align: "center" });
  doc.setFontSize(9); doc.setTextColor(110, 110, 110);
  doc.text(doc.splitTextToSize(opts.link, w - 24), w / 2, 168, { align: "center" });
  doc.setFontSize(12); doc.setTextColor(20, 20, 20); doc.setFont("helvetica", "bold");
  doc.text(`Thank you!  ${opts.phone}`, w / 2, 192, { align: "center" });
  doc.save(`${opts.name.replace(/[^a-z0-9]+/gi, "-")}-review-card.pdf`);
}
