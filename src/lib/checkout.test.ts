import { describe, expect, it, vi } from "vitest";
vi.mock("@tanstack/react-start/server", () => ({ getRequest: () => null }));
import { FALLBACK_ORIGIN, publicOrigin, returnOrigin } from "./checkout.functions";

const req = (headers: Record<string, string>) => new Request("http://localhost:8080/_serverFn/x", { method: "POST", headers });

describe("Stripe return address", () => {
  it("returns customers to the browser's public address, not the internal server", () => {
    expect(publicOrigin(req({ origin: "https://id-preview--abc.lovable.app" }))).toBe("https://id-preview--abc.lovable.app");
  });
  it("uses the forwarded host when the browser sends no origin", () => {
    expect(publicOrigin(req({ "x-forwarded-host": "fixfirst.lovable.app" }))).toBe("https://fixfirst.lovable.app");
  });
});

describe("Stripe return origin chosen at checkout", () => {
  it("uses the browser's public preview address when the page sends it", () => {
    expect(returnOrigin("https://id-preview--abc.lovable.app", req({}))).toBe("https://id-preview--abc.lovable.app");
  });
  it("never returns a paying customer to the internal localhost server", () => {
    expect(returnOrigin(undefined, req({}))).toBe(FALLBACK_ORIGIN);
  });
  it("ignores an untrusted address sent by the page", () => {
    expect(returnOrigin("https://evil.example.com", req({}))).toBe(FALLBACK_ORIGIN);
  });
});
