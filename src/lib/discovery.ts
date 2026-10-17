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
