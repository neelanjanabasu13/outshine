import { describe, expect, it } from "vitest";
import { discoveryQuery, discoveryResults } from "./discovery";

describe("trade discovery", () => {
  it("searches London businesses without needing a typed business name", () => {
    expect(discoveryQuery("plumbing", "London")).toBe("plumbers and heating engineers in London UK");
    expect(discoveryQuery("cleaning", "Manchester")).toBe("cleaning services in Manchester UK");
  });
  it("shows five matching businesses ordered by review count without changing the search results", () => {
    const results = [20, 80, 10, 50, 30, 60].map((reviewCount) => ({ trade: "cleaning" as const, reviewCount, rating: 4.5 }));
    const other = { trade: "plumbing" as const, reviewCount: 200, rating: 5 };
    expect(discoveryResults([...results, other], "cleaning").map((r) => r.reviewCount)).toEqual([80, 60, 50, 30, 20]);
    expect(results.map((r) => r.reviewCount)).toEqual([20, 80, 10, 50, 30, 60]);
  });
});