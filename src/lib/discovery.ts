import type { Trade } from "./audit";

const QUERIES: Record<Trade, string> = {
  plumbing: "plumbers and heating engineers",
  electrician: "electricians",
  cleaning: "cleaning services",
  landscaping: "landscapers",
  salon: "hair and beauty salons",
};

export function discoveryQuery(trade: Trade, city: string): string {
  return `${QUERIES[trade]} in ${city} UK`;
}

/** Google text search ranks prominent, highly rated places first, so we also search a few local areas to reach ordinary businesses. */
const AREAS: Record<string, string[]> = {
  London: ["Croydon", "Ealing", "Walthamstow", "Lewisham", "Harrow"],
  Manchester: ["Salford", "Stockport", "Oldham"],
  Birmingham: ["Solihull", "Sutton Coldfield", "Erdington"],
  Leeds: ["Headingley", "Horsforth", "Morley"],
  Edinburgh: ["Leith", "Portobello", "Corstorphine"],
};
export function discoveryQueries(trade: Trade, city: string): string[] {
  return [discoveryQuery(trade, city), ...(AREAS[city] ?? []).map((a) => `${QUERIES[trade]} in ${a}, ${city} UK`)];
}

/** Likely to show real gaps on a public scan: below the 4.9 star / 250 review public targets. */
export const hasRoomToImprove = (r: { rating: number; reviewCount: number }) => r.rating < 4.8 || r.reviewCount < 250;

/**
 * Five businesses per trade: up to four with visible room to improve (most reviewed first, so they are
 * still recognisable local names), then the strongest local leader for contrast.
 */
export function discoveryResults<T extends { trade: Trade | null; reviewCount: number; rating: number }>(results: T[], trade: Trade): T[] {
  const pool = results.filter((r) => r.trade === null || r.trade === trade)
    .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
  const improvers = pool.filter(hasRoomToImprove).slice(0, 4);
  const leader = pool.find((r) => !hasRoomToImprove(r));
  const picked = leader ? [...improvers, leader] : improvers;
  return [...picked, ...pool.filter((r) => !picked.includes(r))].slice(0, 5);
}

const RANK: Record<string, number> = { F: 0, E: 1, D: 2, C: 3, B: 4, A: 5 };

/**
 * Picks five graded businesses: four with the most to fix (weakest grade first, then most reviewed so
 * they are recognisable names), then one A-grade leader for contrast when the area has one.
 */
export function pickDiscovery<T extends { grade: string; reviewCount: number }>(results: T[]): T[] {
  const byNeed = [...results].sort((a, b) => (RANK[a.grade] ?? 9) - (RANK[b.grade] ?? 9) || b.reviewCount - a.reviewCount);
  const improvers = byNeed.filter((r) => r.grade !== "A").slice(0, 4);
  const leader = byNeed.filter((r) => r.grade === "A").sort((a, b) => b.reviewCount - a.reviewCount)[0];
  const picked = leader ? [...improvers, leader] : improvers;
  return [...picked, ...byNeed.filter((r) => !picked.includes(r))].slice(0, 5);
}

/** Example pills: businesses rated 4.0 to 4.5 stars, which almost always have something to improve. */
export const inExampleRange = (r: { rating: number }) => r.rating >= 4.0 && r.rating <= 4.5;

export function pickExamples<T extends { grade: string; reviewCount: number; rating: number }>(results: T[]): T[] {
  const inRange = results.filter(inExampleRange).sort((a, b) => b.reviewCount - a.reviewCount);
  return inRange.slice(0, 8);
}
