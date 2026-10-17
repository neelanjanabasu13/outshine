import { describe, expect, it } from "vitest";
import { reviewLink } from "./agent";
describe("reviewLink", () => {
  it("builds Google's review page from a live place id", () => {
    expect(reviewLink({ id: "live.salon.ChIJabc" })).toBe("https://search.google.com/local/writereview?placeid=ChIJabc");
  });
  it("returns null for demo businesses", () => { expect(reviewLink({ id: "demo-1" })).toBeNull(); });
});
