import type { Trade } from "./audit";

export const REFERENCE_CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Edinburgh"] as const;
export type ReferenceCity = typeof REFERENCE_CITIES[number];
export type ReferenceEntry = { city: ReferenceCity; trade: Trade; name: string; website: string; source: string };

/** Editorial selections only. Current Google evidence, not this catalogue, determines the grade. */
export const REFERENCES: ReferenceEntry[] = [];

export function referenceCity(address: string, location?: { latitude: number; longitude: number }): ReferenceCity | null {
  const exact = REFERENCE_CITIES.find((city) => new RegExp(`\\b${city}\\b`, "i").test(address));
  if (exact) return exact;
  if (!location) return null;
  const centres: Record<ReferenceCity, [number, number]> = { London: [51.5074, -0.1278], Manchester: [53.4808, -2.2426], Birmingham: [52.4862, -1.8904], Leeds: [53.8008, -1.5491], Edinburgh: [55.9533, -3.1883] };
  return [...REFERENCE_CITIES].sort((a, b) => {
    const distance = (city: ReferenceCity) => (centres[city][0] - location.latitude) ** 2 + ((centres[city][1] - location.longitude) * Math.cos(location.latitude * Math.PI / 180)) ** 2;
    return distance(a) - distance(b);
  })[0] ?? null;
}