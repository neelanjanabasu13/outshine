import { describe, expect, it, vi } from "vitest";
vi.mock("@tanstack/react-start/server", () => ({ getRequest: () => null }));
import { publicOrigin } from "./checkout.functions";

const req = (headers: Record<string, string>) => new Request("http://localhost:8080/_serverFn/x", { method: "POST", headers });

describe("Stripe return address", () => {
  it("returns customers to the browser's public address, not the internal server", () => {
    expect(publicOrigin(req({ origin: "https://id-preview--abc.lovable.app" }))).toBe("https://id-preview--abc.lovable.app");
  });
  it("uses the forwarded host when the browser sends no origin", () => {
    expect(publicOrigin(req({ "x-forwarded-host": "fixfirst.lovable.app" }))).toBe("https://fixfirst.lovable.app");
  });
});
