import { describe, expect, it } from "vitest";
import { cappedGrade, evaluate, topProblems } from "./audit";
import { findBusiness, SEEDED_ID } from "./sample";

describe("judges' seeded business", () => {
  const b = findBusiness(SEEDED_ID)!;
  const f = evaluate(b.trade, b.signals, b.name, b.live);
  it("grades D or F", () => expect(["D", "F"]).toContain(cappedGrade(f)));
  it("includes the missing website among its listed problems", () => expect(topProblems(f, 8).some((p) => p.fix === "website")).toBe(true));
});
