import { test, expect } from "vitest";
import { buildReportPdf } from "./report-pdf";
import { evaluate, topProblems } from "./audit";
import { sopFor } from "./diy";
import { BUSINESSES } from "./sample";
test("full report PDF builds with a contents page and one guide per finding", async () => {
  const b = (BUSINESSES as any[]).find((x) => x.trade === "plumbing");
  const fs = topProblems(evaluate(b.trade, b.signals, b.name, false));
  const blob = await buildReportPdf({ name: b.name, tradeLabel: "Plumbing", trade: b.trade, grade: "C", areas: [{ area: "Reputation", grade: "C" }], rivals: [{ name: "Rival", grade: "B" }], findings: fs, sops: fs.map((f) => sopFor(f, b.trade, b.name)) });
  expect(blob.size).toBeGreaterThan(1000);
});
