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

/** Review count is a transparent popularity proxy, not a claim of national rank. */
export function discoveryResults<T extends { trade: Trade | null; reviewCount: number; rating: number }>(results: T[], trade: Trade): T[] {
  return results.filter((r) => r.trade === null || r.trade === trade)
    .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
    .slice(0, 5);
}