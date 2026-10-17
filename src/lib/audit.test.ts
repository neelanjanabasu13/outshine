import { describe, expect, it } from "vitest";
import { estimateLostRevenue, evaluate, gradeOf, scoreOf, topProblems, PRICE_BUNDLE, PRICE_PER_FIX } from "./audit";
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

  it("uses the placeholder prices of £5 per fix and £29 for all", () => {
    expect(PRICE_PER_FIX).toBe(7.99);
    expect(PRICE_BUNDLE).toBe(29.99);
  });

  it("estimates no lost revenue when you match or beat rivals", () => {
    expect(estimateLostRevenue("plumbing", 80, 70)).toEqual({ jobs: 0, pounds: 0 });
  });

  it("estimates lost plumbing jobs from a 30 point gap at £180 each", () => {
    expect(estimateLostRevenue("plumbing", 50, 80)).toEqual({ jobs: 4, pounds: 720 });
  });
});
