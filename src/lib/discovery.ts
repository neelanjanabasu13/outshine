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

/** Example pills: businesses rated 3.4 to 4.0 stars, which almost always have something to improve. */
export const inExampleRange = (r: { rating: number }) => r.rating >= 3.4 && r.rating <= 4.0;

export function pickExamples<T extends { grade: string; reviewCount: number; rating: number }>(results: T[]): T[] {
  const inRange = results.filter(inExampleRange).sort((a, b) => b.reviewCount - a.reviewCount);
  return [...inRange, ...pickDiscovery(results.filter((r) => !inRange.includes(r)))].slice(0, 5);
}
