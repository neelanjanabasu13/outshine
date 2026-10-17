import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { REFERENCES, REFERENCE_CITIES } from "./references";

export const getReference = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ city: z.enum(REFERENCE_CITIES), trade: z.enum(["plumbing", "electrician", "cleaning", "landscaping", "salon"]) }).parse(d))
  .handler(async ({ data }) => {
    const entry = REFERENCES.find((r) => r.city === data.city && r.trade === data.trade);
    if (!entry) return { entry: null, business: null, checkedAt: null };
    try {
      const { searchPlaces, getLiveBusiness } = await import("./places.server");
      const results = await searchPlaces(`${entry.name} ${entry.city} UK`);
      const match = results.find((r) => r.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(entry.name.toLowerCase().replace(/[^a-z0-9]/g, "")));
      if (!match) return { entry, business: null, checkedAt: null };
      const business = await getLiveBusiness(`live.${entry.trade}.${match.placeId}`, entry.trade, match.placeId, false);
      return { entry, business, checkedAt: new Date().toISOString() };
    } catch { return { entry, business: null, checkedAt: null }; }
  });