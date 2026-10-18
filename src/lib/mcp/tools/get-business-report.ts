import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_business_report",
  title: "Get Outshine report",
  description: "Get the free Outshine letter grade, top improvement areas and nearby rival grades for a business id from search_businesses.",
  inputSchema: { id: z.string().min(1).max(400).describe("Business id returned by search_businesses.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ id }) => {
    const { findBusiness } = await import("../../sample");
    const { evaluate, cappedGrade, topProblems, TRADES } = await import("../../audit");
    let b = findBusiness(id);
    if (!b) {
      const [prefix, trade, ...rest] = id.split(".");
      const { getLiveBusiness, isTrade } = await import("../../places.server");
      if (prefix !== "live" || !trade || !isTrade(trade) || !rest.length) throw new ToolError("Unknown business id. Use search_businesses first.");
      b = await getLiveBusiness(id, trade, rest.join("."));
    }
    const live = !!b.live;
    const findings = evaluate(b.trade, b.signals, b.name, live);
    const grade = cappedGrade(findings);
    const problems = topProblems(live ? findings.filter((f) => f.id !== "replies") : findings, 5).map((f) => ({ area: f.area, title: f.title, evidence: f.evidence }));
    const rivals = b.competitors.map((c) => ({ name: c.name, grade: cappedGrade(evaluate(b.trade, c.signals, c.name, live)) }));
    const report = { id: b.id, name: b.name, trade: TRADES[b.trade].label, area: b.area, grade, problems, rivals, url: `https://outshine.lovable.app/report/${b.id}` };
    const text = `${b.name} (${report.trade}, ${b.area}) has an overall grade of ${grade}.\n` +
      (problems.length ? `Ways to stand out:\n${problems.map((p) => `- ${p.area}: ${p.title} (${p.evidence})`).join("\n")}\n` : "No evidenced problems found.\n") +
      (rivals.length ? `Nearby rivals: ${rivals.map((r) => `${r.name} ${r.grade}`).join(", ")}\n` : "") + `Full report: ${report.url}`;
    return { content: [{ type: "text", text }], structuredContent: { report } };
  },
});
