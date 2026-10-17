import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { PRICE_BUNDLE, PRICE_PER_FIX } from "./audit";

const STRIPE = "https://api.stripe.com/v1";

function key() {
  const k = process.env["STRIPE_SECRET_KEY"];
  if (!k) throw new Error("Payments are not set up yet.");
  return k;
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ businessId: z.string().min(1).max(100), businessName: z.string().max(200), item: z.string().min(1).max(60), label: z.string().max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const origin = new URL(getRequest().url).origin;
    const bundle = data.item === "all";
    const pence = Math.round((bundle ? PRICE_BUNDLE : PRICE_PER_FIX) * 100);
    const name = bundle ? `FixFirst: every fix for ${data.businessName}` : `FixFirst fix: ${data.label}`;
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
    });
    const res = await fetch(`${STRIPE}/checkout/sessions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { url?: string; error?: { message?: string } };
    if (!res.ok || !json.url) {
      console.error("Stripe checkout failed", json.error?.message);
      return { url: null, error: "We could not open the payment page. Please try again." };
    }
    return { url: json.url, error: null };
  });

export const verifyCheckout = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ sessionId: z.string().regex(/^cs_[A-Za-z0-9_]+$/) }).parse(d))
  .handler(async ({ data }) => {
    const res = await fetch(`${STRIPE}/checkout/sessions/${data.sessionId}`, { headers: { Authorization: `Bearer ${key()}` } });
    if (!res.ok) return { paid: false, item: null as string | null, businessId: null as string | null };
    const s = (await res.json()) as { payment_status?: string; metadata?: Record<string, string> };
    return { paid: s.payment_status === "paid", item: s.metadata?.["item"] ?? null, businessId: s.metadata?.["business_id"] ?? null };
  });
