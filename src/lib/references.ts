import type { Trade } from "./audit";

export const REFERENCE_CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Edinburgh"] as const;
export type ReferenceCity = typeof REFERENCE_CITIES[number];
export type ReferenceEntry = { city: ReferenceCity; trade: Trade; name: string; website: string; source: string };

/** Editorial selections only. Current Google evidence, not this catalogue, determines the grade. */
export const REFERENCES: ReferenceEntry[] = [];

export function referenceCity(address: string): ReferenceCity | null {
  return REFERENCE_CITIES.find((city) => new RegExp(`\\b${city}\\b`, "i").test(address)) ?? null;
}