import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_businesses",
  title: "Search UK trade businesses",
  description: "Find UK cleaning, plumbing, electrical, landscaping or hair and beauty businesses by name and town, returning ids for get_business_report.",
  inputSchema: {
    query: z.string().trim().min(2).max(120).describe("Business name and town, e.g. 'Mops Stars Cleaning London'."),
    max: z.number().int().min(1).max(10).optional().describe("Maximum results, default 5."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, max }) => {
    const results: { id: string | null; name: string; address: string; rating: number; reviewCount: number; trade: string | null }[] = [];
    if (/mops\s*stars?/i.test(query)) results.push({ id: "mops-stars-cleaning", name: "Mops Stars Cleaning", address: "88 Upper Street, London N1", rating: 3.9, reviewCount: 14, trade: "cleaning" });
    const { searchPlaces } = await import("../../places.server");
    const found = await searchPlaces(query, max ?? 5);
    for (const r of found) results.push({ id: r.trade ? `live.${r.trade}.${r.placeId}` : null, name: r.name, address: r.address, rating: r.rating, reviewCount: r.reviewCount, trade: r.trade });
    const text = results.length
      ? results.map((r) => `${r.name} (${r.address}), ${r.rating} stars from ${r.reviewCount} reviews${r.id ? `, id ${r.id}` : ", outside the five supported trades"}`).join("\n")
      : "No matching businesses found.";
    return { content: [{ type: "text", text }], structuredContent: { results } };
  },
});
