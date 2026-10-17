import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { checkoutPrice } from "./audit";

const STRIPE = "https://api.stripe.com/v1";

// Accept standard (sk_) and restricted (rk_) keys in live or test mode.
const KEY_SHAPE = /^(sk|rk)_(live|test)_[A-Za-z0-9]+$/;

function key() {
  const k = process.env["STRIPE_SECRET_KEY"];
  if (!k) throw new Error("Payments are not set up yet.");
  if (!KEY_SHAPE.test(k)) throw new Error("The saved Stripe key is not a secret or restricted key.");
  return k;
}

type StripeError = { message?: string; type?: string; code?: string };

/** Turns a Stripe error into a safe message, naming any missing permission and never echoing the key. */
function describe(err: StripeError | undefined, status: number) {
  const raw = (err?.message ?? "").replace(/\b(sk|rk)_(live|test)_[A-Za-z0-9*]+/g, "[key]");
  if (status === 403 || /permission/i.test(raw)) {
    const perms = Array.from(new Set(raw.match(/\brak_[a-z_]+/g) ?? []));
    return perms.length
      ? `Your Stripe key is missing these permissions: ${perms.join(", ")}.`
      : `Your Stripe key is missing a permission Stripe needs: ${raw}`;
  }
  return null;
}

/**
 * The address the customer's browser is actually on. Behind the preview and hosting proxies the
 * server's own URL is internal (e.g. localhost), so Stripe must return customers to the browser's origin.
 */
export function publicOrigin(req: Request): string {
  const valid = (o: string | null | undefined) => {
    if (!o) return null;
    try { const u = new URL(o); return u.protocol === "https:" || u.hostname === "localhost" ? u.origin : null; } catch { return null; }
  };
  const h = req.headers;
  const fromOrigin = valid(h.get("origin"));
  if (fromOrigin) return fromOrigin;
  const fromReferer = valid(h.get("referer"));
  if (fromReferer) return fromReferer;
  const host = h.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (host) return `${h.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https"}://${host}`;
  return new URL(req.url).origin;
}

/** Public address used when nothing better is known, so Stripe never sends a customer to an internal server. */
export const FALLBACK_ORIGIN = "https://id-preview--b9204ba5-a192-429c-bf6c-627e52123178.lovable.app";

const TRUSTED_HOST = /(^|\.)(lovable\.app|lovableproject\.com|lovable\.dev)$/;

/**
 * Where Stripe returns the customer. The browser's own address wins when it is one of our hosts;
 * otherwise the request headers are used, and an internal localhost address is never used unless the
 * browser itself is on localhost (local testing).
 */
export function returnOrigin(clientOrigin: string | undefined, req: Request): string {
  if (clientOrigin) {
    try {
      const u = new URL(clientOrigin);
      if (u.protocol === "https:" && TRUSTED_HOST.test(u.hostname)) return u.origin;
      if (u.hostname === "localhost") return u.origin;
    } catch { /* ignore malformed */ }
  }
  const fromHeaders = publicOrigin(req);
  try {
    const host = new URL(fromHeaders).hostname;
    if (host === "localhost" || host === "127.0.0.1") return FALLBACK_ORIGIN;
  } catch { return FALLBACK_ORIGIN; }
  return fromHeaders;
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ businessId: z.string().min(1).max(100), businessName: z.string().max(200), item: z.enum(["diy", "all"]), label: z.string().max(200), origin: z.string().max(200).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const origin = returnOrigin(data.origin, getRequest());
    const pence = Math.round(checkoutPrice(data.item) * 100);
    const name = data.item === "diy" ? `FixFirst DIY pack for ${data.businessName}` : `FixFirst done-for-you for ${data.businessName}`;
    const back = `${origin}/report/${encodeURIComponent(data.businessId)}`;
    const body = new URLSearchParams({
      mode: "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][unit_amount]": String(pence),
      "line_items[0][price_data][product_data][name]": name,
      "metadata[business_id]": data.businessId,
      "metadata[item]": data.item,
      success_url: `${back}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: back,
      allow_promotion_codes: "true",
    });
    const res = await fetch(`${STRIPE}/checkout/sessions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { id?: string; url?: string; error?: StripeError };
    if (!res.ok || !json.url) {
      const perm = describe(json.error, res.status);
      console.error("Stripe checkout failed", perm ?? json.error?.code ?? res.status);
      return { url: null, sessionId: null, error: perm ?? "We could not open the payment page. Please try again." };
    }
    return { url: json.url, sessionId: json.id ?? null, error: null };
  });

export const verifyCheckout = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ sessionId: z.string().regex(/^cs_[A-Za-z0-9_]+$/) }).parse(d))
  .handler(async ({ data }) => {
    const res = await fetch(`${STRIPE}/checkout/sessions/${data.sessionId}`, { headers: { Authorization: `Bearer ${key()}` } });
    if (!res.ok) {
      const err = ((await res.json().catch(() => ({}))) as { error?: StripeError }).error;
      const perm = describe(err, res.status);
      if (perm) console.error("Stripe verify failed", perm);
      return { paid: false, item: null as string | null, businessId: null as string | null, error: perm };
    }
    const s = (await res.json()) as { status?: string; payment_status?: string; metadata?: Record<string, string> };
    // A 100% promo code completes with "no_payment_required"; that is still a valid purchase.
    const paid = s.payment_status === "paid" || (s.status === "complete" && s.payment_status === "no_payment_required");
    return { paid, item: s.metadata?.["item"] ?? null, businessId: s.metadata?.["business_id"] ?? null, error: null };
  });
