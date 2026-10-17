import { describe, expect, it } from "vitest";
import { discoveryQuery, discoveryResults, pickDiscovery } from "./discovery";

describe("trade discovery", () => {
  it("searches London businesses without needing a typed business name", () => {
    expect(discoveryQuery("plumbing", "London")).toBe("plumbers and heating engineers in London UK");
    expect(discoveryQuery("cleaning", "Manchester")).toBe("cleaning services in Manchester UK");
  });
  it("leads with businesses below the public targets and keeps one strong leader for contrast", () => {
    const mk = (reviewCount: number, rating: number) => ({ trade: "plumbing" as const, reviewCount, rating });
    const out = discoveryResults([mk(900, 4.9), mk(700, 5), mk(400, 4.5), mk(120, 4.9), mk(60, 4.2), mk(30, 4.6), mk(10, 3.9)], "plumbing");
    expect(out.map((r) => r.reviewCount)).toEqual([400, 120, 60, 30, 900]);
  });
  it("shows five matching businesses ordered by review count without changing the search results", () => {
    const results = [20, 80, 10, 50, 30, 60].map((reviewCount) => ({ trade: "cleaning" as const, reviewCount, rating: 4.5 }));
    const other = { trade: "plumbing" as const, reviewCount: 200, rating: 5 };
    expect(discoveryResults([...results, other], "cleaning").map((r) => r.reviewCount)).toEqual([80, 60, 50, 30, 20]);
    expect(results.map((r) => r.reviewCount)).toEqual([20, 80, 10, 50, 30, 60]);
  });
  it("browsing shows four businesses with real problems before one A-grade leader", () => {
    const mk = (grade: string, reviewCount: number) => ({ grade, reviewCount });
    const out = pickDiscovery([mk("A", 900), mk("A", 300), mk("B", 500), mk("C", 200), mk("D", 50), mk("C", 400), mk("B", 80)]);
    expect(out.map((r) => `${r.grade}${r.reviewCount}`)).toEqual(["D50", "C400", "C200", "B500", "A900"]);
  });
});

import { pickExamples as _pe, inExampleRange as _ir } from "./discovery";
describe("example pills", () => {
  it("only treats 4.0 to 4.5 stars as in range", () => {
    expect(_ir({ rating: 4.5 })).toBe(true);
    expect(_ir({ rating: 4.0 })).toBe(true);
    expect(_ir({ rating: 3.9 })).toBe(false);
    expect(_ir({ rating: 4.6 })).toBe(false);
  });
  it("leads with in-range businesses", () => {
    const r = [{ grade: "A", reviewCount: 900, rating: 4.9 }, { grade: "C", reviewCount: 50, rating: 4.2 }];
    expect(_pe(r).map((b) => b.rating)).toEqual([4.2]);
  });
});
