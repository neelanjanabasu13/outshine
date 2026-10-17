import { describe, expect, it } from "vitest";
import { estimateLostRevenue, evaluate, gradeOf, scoreOf, topProblems, PRICE_BUNDLE, PRICE_DIY, benchmarkFindings, projectFindings, areaScores, assessedAreaScores, TRADES, checkoutPrice, type Trade } from "./audit";
import { BUSINESSES } from "./sample";

describe("grading", () => {
  it("does not penalise live businesses for unexposed fields", () => {
    const s = { ...BUSINESSES[0]?.signals, rating: 4.9, reviewCount: 250, photoCount: 10, hasWebsite: true, hasHours: true, reviewsLast90: 0, replyRate: 0, newestPhotoDays: 0, descriptionLength: 0, postsLast30: 0, credentialMentioned: false, servicesListed: 0 };
    for (const trade of Object.keys(TRADES) as Trade[]) {
      const f = evaluate(trade, s, "Real profile", true);
      expect(gradeOf(scoreOf(f))).toBe("A");
      expect(Object.keys(assessedAreaScores(f)).sort()).toEqual(["Profile", "Reputation", "Visuals"]);
      expect(f.map((x) => x.id)).toEqual(["rating", "velocity", "photos", "website", "hours"]);
      expect(scoreOf(evaluate(trade, { ...s, replyRate: 1, postsLast30: 4, credentialMentioned: true, descriptionLength: 750, reviewsLast90: 100 }, "Same profile", true))).toBe(scoreOf(f));
    }
  });

  it("uses actual exposed photo counts and keeps live gaps actionable", () => {
    const b = BUSINESSES[0];
    if (!b) throw new Error("Missing fixture");
    const f = evaluate("cleaning", { ...b.signals, photoCount: 2, hasWebsite: false, hasHours: false }, "Real profile", true);
    expect(f.find((x) => x.id === "photos")?.score).toBe(0.2);
    expect(f.find((x) => x.id === "website")?.score).toBe(0);
    expect(f.find((x) => x.id === "hours")?.score).toBe(0);
    expect(gradeOf(scoreOf(f))).not.toBe("A");
  });
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

  it("charges a fixed £29.99 for the whole done-for-you report", () => {
    expect(PRICE_BUNDLE).toBe(29.99);
    expect(checkoutPrice("all")).toBe(29.99);
  });

  it("prices the DIY pack separately at £7.99", () => {
    expect(PRICE_DIY).toBe(7.99);
    expect(checkoutPrice("diy")).toBe(7.99);
  });

  it("creates an A benchmark overall and in every area for each trade", () => {
    for (const trade of Object.keys(TRADES) as Trade[]) {
      const findings = benchmarkFindings(trade);
      expect(gradeOf(scoreOf(findings))).toBe("A");
      for (const score of Object.values(areaScores(findings))) expect(gradeOf(score)).toBe("A");
    }
  });

  it("projects selected improvements without changing the original audit", () => {
    const business = BUSINESSES[0];
    if (!business) throw new Error("Expected a demo business");
    const findings = evaluate(business.trade, business.signals, "Business");
    const before = scoreOf(findings);
    const projected = projectFindings(findings, findings.map((f) => f.id));
    expect(gradeOf(scoreOf(projected))).toBe("A");
    expect(scoreOf(findings)).toBe(before);
    expect(scoreOf(projectFindings(findings, []))).toBe(before);
  });

  it("rejects every individual-fix purchase", () => {
    for (const item of ["rating", "velocity", "replies", "photos", "description", "website", "posts", "credential"]) {
      expect(() => checkoutPrice(item)).toThrow("Unknown purchase item");
    }
  });

  it("rejects unknown purchases and keeps the scan outside paid checkout", () => {
    expect(() => checkoutPrice("scan")).toThrow();
    expect(() => checkoutPrice("anything")).toThrow();
  });

  it("estimates no lost revenue when you match or beat rivals", () => {
    expect(estimateLostRevenue("plumbing", 80, 70)).toEqual({ jobs: 0, pounds: 0 });
  });

  it("estimates lost plumbing jobs from a 30 point gap at £180 each", () => {
    expect(estimateLostRevenue("plumbing", 50, 80)).toEqual({ jobs: 4, pounds: 720 });
  });
});

import { cappedGrade as _cappedGrade } from "./audit";
describe("cappedGrade", () => {
  it("caps public-only A grades at B", () => { expect(_cappedGrade(100, true)).toBe("B"); });
  it("keeps A when full evidence exists", () => { expect(_cappedGrade(100, false)).toBe("A"); });
  it("leaves lower public grades unchanged", () => { expect(_cappedGrade(0, true)).toBe(_cappedGrade(0, false)); });
});

describe("public grades spread", () => {
  const base = { ...BUSINESSES[0]!.signals, photoCount: 10, hasWebsite: true, hasHours: true };
  const g = (rating: number, reviewCount: number) => _cappedGrade(scoreOf(evaluate("cleaning", { ...base, rating, reviewCount }, "x", true)), true);
  it("gives a typical 4.6 star, 40 review profile a lower grade than a 5.0 star, 1,100 review one", () => {
    expect(g(4.6, 40)).not.toBe(g(5.0, 1100));
  });
  it("grades 5.0 stars and 1,100 reviews as B", () => { expect(g(5.0, 1100)).toBe("B"); });
  it("grades 4.2 stars and 15 reviews below C", () => { expect(["D", "F"]).toContain(g(4.2, 15)); });
});
