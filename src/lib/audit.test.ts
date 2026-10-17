import { describe, expect, it } from "vitest";
import { estimateLostRevenue, evaluate, gradeOf, scoreOf, topProblems, PRICE_BUNDLE, PRICE_PER_FIX, PRICE_DIY, benchmarkFindings, projectFindings, areaScores, TRADES, checkoutPrice, type Trade } from "./audit";
import { BUSINESSES } from "./sample";

describe("grading", () => {
  it("maps scores to letter grades A to F", () => {
    expect(gradeOf(85)).toBe("A");
    expect(gradeOf(70)).toBe("B");
    expect(gradeOf(55)).toBe("C");
    expect(gradeOf(40)).toBe("D");
    expect(gradeOf(39)).toBe("F");
  });

  it("shows at most five problems", () => {
    for (const b of BUSINESSES) expect(topProblems(evaluate(b.trade, b.signals, b.name)).length).toBeLessThanOrEqual(5);
  });

  it("scores a business with every benchmark met at 100", () => {
    const s = { rating: 4.8, reviewCount: 300, reviewsLast90: 20, replyRate: 1, photoCount: 50, newestPhotoDays: 5, descriptionLength: 750, hasWebsite: true, hasHours: true, postsLast30: 4, credentialMentioned: true, servicesListed: 10 };
    expect(scoreOf(evaluate("plumbing", s, "X"))).toBe(100);
  });

  it("uses £7.99 per agent fix and £29.99 for all", () => {
    expect(PRICE_PER_FIX).toBe(7.99);
    expect(PRICE_BUNDLE).toBe(29.99);
  });

  it("prices the DIY pack separately at £11.99", () => {
    expect(PRICE_DIY).toBe(11.99);
    expect(checkoutPrice("diy")).toBe(11.99);
  });

  it("creates an A benchmark overall and in every area for each trade", () => {
    for (const trade of Object.keys(TRADES) as Trade[]) {
      const findings = benchmarkFindings(trade);
      expect(gradeOf(scoreOf(findings))).toBe("A");
      for (const score of Object.values(areaScores(findings))) expect(gradeOf(score)).toBe("A");
    }
  });

  it("projects selected improvements without changing the original audit", () => {
    const findings = evaluate(BUSINESSES[0].trade, BUSINESSES[0].signals, "Business");
    const before = scoreOf(findings);
    const projected = projectFindings(findings, findings.map((f) => f.id));
    expect(gradeOf(scoreOf(projected))).toBe("A");
    expect(scoreOf(findings)).toBe(before);
    expect(scoreOf(projectFindings(findings, []))).toBe(before);
  });

  it("charges the correct agent prices and rejects unknown purchases", () => {
    expect(checkoutPrice("all")).toBe(29.99);
    expect(checkoutPrice("description")).toBe(7.99);
    expect(() => checkoutPrice("anything")).toThrow();
  });

  it("estimates no lost revenue when you match or beat rivals", () => {
    expect(estimateLostRevenue("plumbing", 80, 70)).toEqual({ jobs: 0, pounds: 0 });
  });

  it("estimates lost plumbing jobs from a 30 point gap at £180 each", () => {
    expect(estimateLostRevenue("plumbing", 50, 80)).toEqual({ jobs: 4, pounds: 720 });
  });
});
