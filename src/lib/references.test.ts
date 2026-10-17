import { describe, expect, it } from "vitest";
import { REFERENCES, REFERENCE_CITIES, referenceCity } from "./references";

describe("curated references", () => {
  it("has exactly one real named reference for each of the five trades in all five cities", () => {
    expect(REFERENCES).toHaveLength(25);
    for (const city of REFERENCE_CITIES) {
      for (const trade of ["plumbing", "electrician", "cleaning", "landscaping", "salon"]) {
        expect(REFERENCES.filter((r) => r.city === city && r.trade === trade)).toHaveLength(1);
      }
    }
    expect(REFERENCES.find((r) => r.city === "London" && r.trade === "cleaning")?.name).toBe("Fantastic Services");
  });
  it("keeps references city-specific and does not treat distant UK places as local", () => {
    expect(referenceCity("Borehamwood", { latitude: 51.657, longitude: -0.272 })).toBe("London");
    expect(referenceCity("Bristol", { latitude: 51.4545, longitude: -2.5879 })).toBeNull();
    expect(referenceCity("Leeds, UK")).toBe("Leeds");
  });
});