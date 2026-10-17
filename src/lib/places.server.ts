// Live Google Places (New) lookups, mapped into the same Business shape the sample data uses.
import { TRADES, type Signals, type Trade } from "./audit";
import type { Business } from "./sample";

const API = "https://places.googleapis.com/v1";
const key = () => {
  const k = process.env["GOOGLE_PLACES_API_KEY"];
  if (!k) throw new Error("Google search is not set up.");
  return k;
};

const TRADE_QUERY: Record<Trade, string> = {
  plumbing: "plumber", electrician: "electrician", cleaning: "cleaning service", landscaping: "landscaper", salon: "hair salon",
};
const CREDENTIAL_WORDS: Record<Trade, RegExp> = {
  plumbing: /gas ?safe/i,
  electrician: /niceic|napit|part p|eca\b/i,
  cleaning: /insured|insurance|dbs[ -]checked|dbs checks?|waste carrier|safecontractor|bics/i,
  landscaping: /bali|apl|waste carrier|insured/i,
  salon: /qualified|nvq|licen[cs]ed|hygiene/i,
};
const DEFAULT_SERVICES: Record<Trade, string[]> = {
  plumbing: ["Boiler servicing", "Boiler installs", "Emergency leaks", "Bathrooms", "Radiators"],
  electrician: ["Fault finding", "Rewires", "Consumer units", "EICR certificates", "EV chargers"],
  cleaning: ["Regular cleans", "Deep cleans", "End of tenancy", "Office cleaning", "Oven cleaning"],
  landscaping: ["Garden design", "Patios", "Turfing", "Fencing", "Planting"],
  salon: ["Cut & finish", "Colour", "Blow dry", "Treatments", "Bridal"],
};

export function guessTrade(types: string[] = [], name = ""): Trade | null {
  const t = types.join(" ") + " " + name.toLowerCase();
  if (/plumb|heating|boiler|gas/.test(t)) return "plumbing";
  if (/electric/.test(t)) return "electrician";
  if (/hair|beauty|salon|nail|barber|spa/.test(t)) return "salon";
  if (/landscap|garden/.test(t)) return "landscaping";
  if (/clean|maid|housekeep/.test(t)) return "cleaning";
  return null;
}

async function post(path: string, body: unknown, mask: string) {
  const res = await fetch(`${API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key(), "X-Goog-FieldMask": mask },
    body: JSON.stringify(body),
  });
  if (!res.ok) { console.error("Places error", res.status, await res.text()); throw new Error("Google search failed"); }
  return res.json() as Promise<any>;
}

export async function searchPlaces(q: string, max = 8) {
  const json = await post("places:searchText", { textQuery: q, regionCode: "GB", maxResultCount: max },
    "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.photos");
  return ((json.places ?? []) as any[]).map((p) => ({
    placeId: p.id as string,
    name: p.displayName?.text ?? "",
    address: p.formattedAddress ?? "",
    rating: p.rating ?? 0,
    reviewCount: p.userRatingCount ?? 0,
    trade: guessTrade(p.types, p.displayName?.text),
    photo: p.photos?.[0]?.name ? photoUrl(p.photos[0].name) : null,
  }));
}

export const photoUrl = (name: string) => `/api/public/photo?name=${encodeURIComponent(name)}`;

const FIELDS = "id,displayName,formattedAddress,shortFormattedAddress,addressComponents,location,rating,userRatingCount,reviews,photos,websiteUri,regularOpeningHours,editorialSummary,nationalPhoneNumber,types";

/** Reads the business's own homepage and checks it for trade credentials. null when no website can be read. */
async function websiteCredential(url: string | undefined, trade: Trade): Promise<boolean | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { "User-Agent": "Mozilla/5.0 (compatible; FixFirst audit)" }, redirect: "follow" });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 400_000).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ");
    return CREDENTIAL_WORDS[trade].test(html);
  } catch { return null; }
}

function toSignals(p: any, trade: Trade, credential: boolean | null = null): Signals {
  const now = Date.now();
  const dates = ((p.reviews ?? []) as any[]).map((r) => Date.parse(r.publishTime)).filter((n) => !Number.isNaN(n));
  const owner = (p.displayName?.text ?? "").trim().toLowerCase();
  const reviews = (p.reviews ?? []) as any[];
  const text = [p.displayName?.text, p.editorialSummary?.text, ...reviews.map((r) => r.text?.text)].join(" ");
  return {
    rating: p.rating ?? 0,
    reviewCount: p.userRatingCount ?? 0,
    // Unavailable fields are placeholders for the shared shape and excluded by public-only grading.
    reviewsLast90: 0,
    replyRate: 0,
    photoCount: p.photos?.length ?? 0,
    newestPhotoDays: 0,
    descriptionLength: 0,
    hasWebsite: !!p.websiteUri,
    hasHours: !!p.regularOpeningHours,
    postsLast30: 0,
    credentialMentioned: false,
    servicesListed: 0,
    newestReviewDays: dates.length ? Math.max(0, Math.floor((now - Math.max(...dates)) / 86_400_000)) : null,
    ownerPhotos: ((p.photos ?? []) as any[]).filter((ph) => (ph.authorAttributions ?? []).some((a: any) => (a.displayName ?? "").trim().toLowerCase() === owner)).length,
    websiteCredential: credential,
  };
}

export async function getLiveBusiness(id: string, trade: Trade, placeId: string, includeCompetitors = true): Promise<Business> {
  const res = await fetch(`${API}/places/${encodeURIComponent(placeId)}?languageCode=en-GB&regionCode=GB`, {
    headers: { "X-Goog-Api-Key": key(), "X-Goog-FieldMask": FIELDS },
  });
  if (!res.ok) { console.error("Place details", res.status, await res.text()); throw new Error("Business not found"); }
  const p = (await res.json()) as any;
  const town = (p.addressComponents ?? []).find((c: any) => c.types?.includes("postal_town") || c.types?.includes("locality"))?.longText;

  const ownCredential = websiteCredential(p.websiteUri, trade);
  let competitors: Business["competitors"] = [];
  if (p.location && includeCompetitors) {
    const near = await post("places:searchText", {
      textQuery: TRADE_QUERY[trade], regionCode: "GB", maxResultCount: 8,
      locationBias: { circle: { center: p.location, radius: 3000 } },
    }, "places." + FIELDS.split(",").join(",places."));
    const picked = ((near.places ?? []) as any[]).filter((c) => c.id !== p.id).slice(0, 3);
    const creds = await Promise.all(picked.map((c) => websiteCredential(c.websiteUri, trade)));
    competitors = picked.map((c, i) => ({
      name: c.displayName?.text ?? "Nearby business",
      signals: toSignals(c, trade, creds[i] ?? null),
      photo: c.photos?.[0]?.name ? photoUrl(c.photos[0].name) : undefined,
    }));
  }

  return {
    id, name: p.displayName?.text ?? "Your business", trade,
    location: p.location,
    address: p.formattedAddress ?? "", area: town ?? p.shortFormattedAddress ?? "your area",
    phone: p.nationalPhoneNumber ?? "",
    signals: toSignals(p, trade, await ownCredential),
    services: DEFAULT_SERVICES[trade],
    reviews: ((p.reviews ?? []) as any[]).slice(0, 3).map((r) => ({
      author: r.authorAttribution?.displayName ?? "Customer", stars: r.rating ?? 5, text: r.text?.text ?? "", replied: false,
    })),
    competitors,
    photo: p.photos?.[0]?.name ? photoUrl(p.photos[0].name) : undefined,
    gallery: ((p.photos ?? []) as any[]).slice(0, 6).filter((ph) => ph.name).map((ph) => photoUrl(ph.name)),
    live: true,
  };
}

export const isTrade = (t: string): t is Trade => t in TRADES;
