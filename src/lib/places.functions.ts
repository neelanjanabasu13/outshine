import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { findBusiness } from "./sample";

// Live ids look like "live.plumbing.<googlePlaceId>".
export const liveId = (trade: string, placeId: string) => `live.${trade}.${placeId}`;

export const searchBusinesses = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string().trim().min(2).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { searchPlaces } = await import("./places.server");
    try { return { results: await searchPlaces(data.q), error: null }; }
    catch { return { results: [], error: "Search is having a moment. Please try again." }; }
  });

export const getBusiness = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().min(1).max(400) }).parse(d))
  .handler(async ({ data }) => {
    const sample = findBusiness(data.id);
    if (sample) return sample;
    const [prefix, trade, ...rest] = data.id.split(".");
    const placeId = rest.join(".");
    const { getLiveBusiness, isTrade } = await import("./places.server");
    if (prefix !== "live" || !trade || !isTrade(trade) || !placeId) return null;
    try { return await getLiveBusiness(data.id, trade, placeId); } catch { return null; }
  });
