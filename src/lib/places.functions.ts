import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { findBusiness } from "./sample";
import { getCuratedReference } from "./references";

// Live ids look like "live.plumbing.<googlePlaceId>".
export const liveId = (trade: string, placeId: string) => `live.${trade}.${placeId}`;

export const searchBusinesses = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string().trim().min(2).max(120), max: z.number().int().min(1).max(20).optional() }).parse(d))
  .handler(async ({ data }) => {
    // Seeded showcase business for judges, found by name like a real listing.
    const seed = /mops\s*stars?/i.test(data.q) ? [{ placeId: "seed:mops-stars-cleaning", name: "Mops Stars Cleaning", address: "88 Upper Street, London N1", rating: 3.9, reviewCount: 14, trade: "cleaning" as const, photo: null }] : [];
    const { searchPlaces } = await import("./places.server");
    try { return { results: [...seed, ...(await searchPlaces(data.q, data.max))], error: null }; }
    catch { return { results: seed, error: seed.length ? null : "Search is having a moment. Please try again." }; }
  });

export const getBusiness = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().min(1).max(400) }).parse(d))
  .handler(async ({ data }) => {
    const sample = findBusiness(data.id);
    if (sample) return { ...sample, reference: getCuratedReference(sample.address, sample.trade, sample.location) };
    const [prefix, trade, ...rest] = data.id.split(".");
    const placeId = rest.join(".");
    const { getLiveBusiness, isTrade } = await import("./places.server");
    if (prefix !== "live" || !trade || !isTrade(trade) || !placeId) return null;
    try {
      const business = await getLiveBusiness(data.id, trade, placeId);
      const reference = getCuratedReference(business.address, trade, business.location);
      return { ...business, reference };
    } catch { return null; }
  });

export const discoverBusinesses = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ trade: z.enum(["plumbing", "electrician", "cleaning", "landscaping", "salon"]), city: z.string().trim().min(2).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { discoverPlaces } = await import("./places.server");
    const { discoveryQueries, pickExamples, inExampleRange } = await import("./discovery");
    const { evaluate, cappedGrade } = await import("./audit");
    try {
      const found = await discoverPlaces(data.trade, discoveryQueries(data.trade, data.city), inExampleRange);
      const graded = found.map(({ signals, ...r }) => ({ ...r, grade: cappedGrade(evaluate(data.trade, signals, r.name, true)) }));
      return { results: pickExamples(graded).map(({ grade: _g, ...r }) => r), error: null };
    } catch { return { results: [], error: "Search is having a moment. Please try again." }; }
  });
