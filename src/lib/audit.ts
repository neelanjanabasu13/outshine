// FixFirst benchmark catalogue and scoring engine. Pure functions, no I/O.
// When Google Places is connected, real profile data fills `Signals`; until then sample data does.

export type Trade = "plumbing" | "electrician" | "cleaning" | "landscaping" | "salon";
export type Area = "Reputation" | "Response" | "Activity" | "Visuals" | "Profile" | "Credentials";
export type Grade = "A" | "B" | "C" | "D" | "F";
export type FixKind = "review-replies" | "description" | "posts" | "review-request" | "website" | "photos";

export interface Signals {
  rating: number;
  reviewCount: number;
  reviewsLast90: number;
  replyRate: number; // 0..1 share of reviews with an owner reply
  photoCount: number;
  newestPhotoDays: number;
  descriptionLength: number;
  hasWebsite: boolean;
  hasHours: boolean;
  postsLast30: number;
  credentialMentioned: boolean;
  servicesListed: number;
  /** Live only: days since the newest review Google returns (Google returns up to five). null when none are returned. */
  newestReviewDays?: number | null;
  /** Live only: photos in Google's public feed uploaded by the business itself. */
  ownerPhotos?: number;
  /** Live only: whether the business's own website names a trade credential. null when there is no readable website. */
  websiteCredential?: boolean | null;
}

export interface TradeProfile {
  trade: Trade;
  label: string;
  credential: string; // the trade standard customers look for
  credentialWhy: string;
  credentialPlain: string; // what the badge means to a homeowner who has never heard of it
  avgJob: number; // typical job value in GBP, placeholder until real data
  expectedPhotos: string;
  minPhotos: number;
  minServices: number;
  weights: Record<Exclude<Area, "Activity">, number>;
}

export const TRADES: Record<Trade, TradeProfile> = {
  plumbing: {
    trade: "plumbing", label: "Plumbing & heating", credential: "Gas Safe registration",
    credentialWhy: "Anyone booking boiler or gas work checks for Gas Safe first, and Google shows it in the profile.",
    credentialPlain: "Checked and legally allowed to work on your gas boiler, so it is safe.", avgJob: 180,
    expectedPhotos: "the van, finished bathrooms, and boiler installs", minPhotos: 15, minServices: 6,
    weights: { Reputation: 25, Response: 20, Visuals: 15, Profile: 20, Credentials: 20 },
  },
  electrician: {
    trade: "electrician", label: "Electricians", credential: "NICEIC or NAPIT approval",
    credentialWhy: "Homeowners need Part P certified work, so NICEIC or NAPIT is the first trust signal they scan for.",
    credentialPlain: "Their wiring is inspected and signed off, so it passes building rules and insurance.", avgJob: 220,
    expectedPhotos: "consumer units, tidy wiring and EV charger installs", minPhotos: 12, minServices: 6,
    weights: { Reputation: 25, Response: 20, Visuals: 10, Profile: 20, Credentials: 25 },
  },
  cleaning: {
    trade: "cleaning", label: "Cleaning", credential: "Public liability insurance and a waste carrier licence",
    credentialWhy: "Cleaners are let into homes and offices, so proof of insurance and licensed waste removal wins the booking.",
    credentialPlain: "If something gets broken, you are covered, and rubbish is disposed of legally.", avgJob: 75,
    expectedPhotos: "before and after rooms, the team in uniform", minPhotos: 10, minServices: 5,
    weights: { Reputation: 30, Response: 25, Visuals: 15, Profile: 15, Credentials: 15 },
  },
  landscaping: {
    trade: "landscaping", label: "Landscaping", credential: "A waste carrier licence and APL or BALI membership",
    credentialWhy: "Garden waste must go with a licensed carrier, and APL or BALI membership reassures bigger-budget clients.",
    credentialPlain: "Garden waste goes somewhere legal, so you cannot be fined for fly-tipping.", avgJob: 450,
    expectedPhotos: "finished gardens, patios and seasonal before and afters", minPhotos: 20, minServices: 5,
    weights: { Reputation: 20, Response: 15, Visuals: 30, Profile: 20, Credentials: 15 },
  },
  salon: {
    trade: "salon", label: "Hair & beauty", credential: "Hygiene and treatment licences, plus stylist qualifications",
    credentialWhy: "Clients choose salons on looks and trust, so recent work photos and visible qualifications matter most.",
    credentialPlain: "Trained, qualified staff working in a clean, inspected space.", avgJob: 55,
    expectedPhotos: "recent cuts and colours, the interior, and the team", minPhotos: 25, minServices: 8,
    weights: { Reputation: 25, Response: 20, Visuals: 30, Profile: 15, Credentials: 10 },
  },
};

export interface Finding {
  id: string;
  area: Area;
  title: string;
  evidence: string;
  impact: string;
  before: string;
  after: string;
  fix: FixKind;
  score: number; // 0..1, where 1 is meeting the benchmark
  weight: number;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function evaluate(trade: Trade, s: Signals, businessName: string, publicOnly = false): Finding[] {
  if (publicOnly) return evaluatePublic(trade, s);
  const t = TRADES[trade];
  const w = t.weights;
  return [
    {
      id: "rating", area: "Reputation", fix: "review-request", weight: w.Reputation * 0.5,
      score: clamp((s.rating - 3.5) / 1.3),
      title: s.rating >= 4.7 ? "Rating is strong" : "Your star rating is losing you calls",
      evidence: `${s.rating.toFixed(1)} stars. Top local ${t.label.toLowerCase()} businesses average 4.8.`,
      impact: "Most people never call a trade rated below 4.5.",
      before: `${s.rating.toFixed(1)} ★ shown in Maps`, after: "A steady stream of fresh 5 ★ reviews from happy customers",
    },
    {
      id: "velocity", area: "Reputation", fix: "review-request", weight: w.Reputation * 0.5,
      score: clamp(s.reviewsLast90 / 12),
      title: "Too few new reviews lately",
      evidence: `${s.reviewsLast90} reviews in the last 90 days, out of ${s.reviewCount} in total. Leaders get 12 or more.`,
      impact: "Google favours businesses with recent reviews in local rankings.",
      before: "No routine for asking customers", after: "A friendly text sent after every job, with your review link",
    },
    {
      id: "replies", area: "Response", fix: "review-replies", weight: w.Response,
      score: clamp(s.replyRate / 0.9),
      title: "Reviews are going unanswered",
      evidence: `You've replied to ${Math.round(s.replyRate * 100)}% of reviews. Top businesses reply to over 90%.`,
      impact: "Unanswered complaints are read as not caring, and silence on praise wastes free marketing.",
      before: "“Took ages to show up.”  (no reply)", after: "A calm, personal reply from the owner, posted within a day",
    },
    {
      id: "photos", area: "Visuals", fix: "photos", weight: w.Visuals,
      score: clamp(s.photoCount / t.minPhotos) * (s.newestPhotoDays > 180 ? 0.5 : 1),
      title: s.photoCount < t.minPhotos ? "Not enough photos of your work" : "Your photos look out of date",
      evidence: `${s.photoCount} photos, newest from ${s.newestPhotoDays} days ago. Customers expect ${t.expectedPhotos}.`,
      impact: "Profiles with recent photos get far more direction requests and calls.",
      before: `${s.photoCount} photos, mostly old`, after: `A photo shot list for ${t.expectedPhotos}`,
    },
    {
      id: "description", area: "Profile", fix: "description", weight: w.Profile * 0.4,
      score: clamp(s.descriptionLength / 600) * (s.servicesListed >= t.minServices ? 1 : 0.7),
      title: "Your profile description undersells you",
      evidence: `${s.descriptionLength} characters and ${s.servicesListed} services listed. Google allows 750, and leaders list ${t.minServices} or more.`,
      impact: "The description is how Google matches you to searches like “emergency plumber near me”.",
      before: s.descriptionLength ? `“${businessName}. Call for a quote.”` : "No description at all",
      after: "750 characters covering services, areas and why people choose you",
    },
    {
      id: "website", area: "Profile", fix: "website", weight: w.Profile * 0.35,
      score: s.hasWebsite ? 1 : 0,
      title: "No website linked to your profile",
      evidence: s.hasWebsite ? "A website is linked." : "The website field on your Google profile is empty.",
      impact: "Without a site, people who want to check you out before calling go to a competitor.",
      before: "Website: none", after: `A live one-page site with click-to-call, reviews and a quote form`,
    },
    {
      id: "posts", area: "Profile", fix: "posts", weight: w.Profile * 0.25,
      score: clamp(s.postsLast30 / 4) * (s.hasHours ? 1 : 0.6),
      title: "Your profile looks inactive",
      evidence: `${s.postsLast30} Google posts in the last 30 days${s.hasHours ? "" : ", and no opening hours set"}.`,
      impact: "Weekly posts signal you're open for business and can lift you in the map pack.",
      before: "Last post: months ago", after: "Four ready-to-post updates for the coming month",
    },
    {
      id: "credential", area: "Credentials", fix: "description", weight: w.Credentials,
      score: s.credentialMentioned ? 1 : 0,
      title: "Customers can't see you're safe to hire",
      evidence: s.credentialMentioned ? `${t.credential} is mentioned.` : `There's no mention of ${t.credential.toLowerCase()} anywhere on your profile.`,
      impact: `${t.credentialWhy} In plain words for customers: ${t.credentialPlain}`,
      before: "Credentials not shown", after: `${t.credential}, explained in plain English: ${t.credentialPlain}`,
    },
  ];
}

export function scoreOf(findings: Finding[]): number {
  const total = findings.reduce((a, f) => a + f.weight, 0);
  const got = findings.reduce((a, f) => a + f.weight * f.score, 0);
  return total ? Math.round((got / total) * 100) : 0;
}

/** Review count at which the public review-volume check is fully met. */
export const PUBLIC_REVIEW_TARGET = 250;

/** Public profile grade only: unexposed fields never contribute a penalty or guessed score. */
function evaluatePublic(trade: Trade, s: Signals): Finding[] {
  const t = TRADES[trade];
  const photosTarget = Math.min(t.minPhotos, 10); // Places returns at most ten photos, not the full gallery.
  return [
    { id: "rating", area: "Reputation", fix: "review-request", weight: t.weights.Reputation, score: s.reviewCount > 0 ? clamp((s.rating - 4.3) / 0.6) : 0,
      title: s.rating >= 4.9 ? "Strong customer rating" : "Your customer rating could be stronger", evidence: `${s.rating.toFixed(1)} stars from ${s.reviewCount} Google reviews. The public-profile target is 4.9 stars, not a measured local average.`, impact: "Your rating helps customers decide whether to contact you.", before: `${s.rating.toFixed(1)} ★ on Google`, after: s.rating >= 4.9 ? `${s.rating.toFixed(1)} ★ kept up with a review request after every job` : `Towards 4.9 ★: ask every happy customer for a review straight after the job, so new 5 star reviews lift your average` },
    { id: "velocity", area: "Reputation", fix: "review-request", weight: t.weights.Reputation, score: clamp(Math.log10(s.reviewCount + 1) / Math.log10(PUBLIC_REVIEW_TARGET + 1)),
      title: "Build a broader base of customer reviews", evidence: `${s.reviewCount} Google reviews in total; the public-profile target is ${PUBLIC_REVIEW_TARGET}. Review recency and velocity cannot be verified from Google's limited sample.`, impact: "More genuine reviews give customers a broader base of evidence.", before: `${s.reviewCount} published reviews`, after: "A consistent process for requesting honest reviews after jobs" },
    { id: "photos", area: "Visuals", fix: "photos", weight: t.weights.Visuals / 2, score: clamp(s.photoCount / photosTarget),
      title: "Make your work easier to see", evidence: `${s.photoCount} photos returned by Google, which exposes up to ten, not the full gallery. This check targets ${photosTarget} visible photos; their dates and quality are not graded.`, impact: `Useful photos of ${t.expectedPhotos} help customers inspect your work.`, before: `${s.photoCount} photos available in the public feed`, after: `Add useful photos of ${t.expectedPhotos}` },
    { id: "website", area: "Profile", fix: "website", weight: t.weights.Profile / 4, score: s.hasWebsite ? 1 : 0,
      title: s.hasWebsite ? "Your website is linked" : "No website linked to your profile", evidence: s.hasWebsite ? "Google returns a website link." : "Google returns no website link.", impact: "A website gives customers somewhere to learn more before contacting you.", before: s.hasWebsite ? "Website linked" : "No website link returned", after: s.hasWebsite ? "Your website stays linked from your Google profile" : "A one-page website built for you in one click, in under a minute, with your real reviews, services, photos and click-to-call, ready to link from your Google profile" },
    { id: "hours", area: "Profile", fix: "description", weight: t.weights.Profile / 4, score: s.hasHours ? 1 : 0,
      title: s.hasHours ? "Your opening hours are available" : "Your opening hours are not available", evidence: s.hasHours ? "Google returns regular opening hours." : "Google returns no regular opening hours; confirm whether hours apply to your business.", impact: "Clear availability helps customers decide when to contact you.", before: s.hasHours ? "Opening hours available" : "No regular opening hours returned", after: "Accurate opening hours for your business" },
    ...(s.websiteCredential == null ? [] : [{ id: "credential", area: "Credentials" as Area, fix: "description" as FixKind, weight: t.weights.Credentials, score: s.websiteCredential ? 1 : 0,
      title: s.websiteCredential ? "Your website shows your credentials" : "Your website does not show your credentials", evidence: s.websiteCredential ? `Your website mentions ${t.credential.toLowerCase()} or a similar trade standard.` : `We read your website and found no mention of ${t.credential.toLowerCase()}.`, impact: `${t.credentialWhy} In plain words for customers: ${t.credentialPlain}`, before: "Credentials not shown on your site", after: `${t.credential}, explained in plain English` }]),
  ];
}

export function assessedAreaScores(findings: Finding[]): Partial<Record<Area, number>> {
  const scores = areaScores(findings);
  return Object.fromEntries(Object.entries(scores).filter(([area]) => findings.some((f) => f.area === area && f.weight > 0)));
}

export function gradeOf(score: number): Grade {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function areaScores(findings: Finding[]): Record<Area, number> {
  const out = {} as Record<Area, number>;
  (["Reputation", "Response", "Activity", "Visuals", "Profile", "Credentials"] as Area[]).forEach((a) => {
    const fs = findings.filter((f) => f.area === a);
    const tw = fs.reduce((x, f) => x + f.weight, 0) || 1;
    out[a] = Math.round((fs.reduce((x, f) => x + f.weight * f.score, 0) / tw) * 100);
  });
  return out;
}

/** The five biggest problems, ranked by points lost. */
export function topProblems(findings: Finding[], n = 5): Finding[] {
  return findings
    .filter((f) => f.score < 0.9)
    .sort((a, b) => b.weight * (1 - b.score) - a.weight * (1 - a.score))
    .slice(0, n);
}

export const PRICE_BUNDLE = 29.99;
export const PRICE_DIY = 7.99;
export const WAS_DIY = 14.99;
export const WAS_BUNDLE = 49.99;

/** An illustrative industry target, never presented as a real nearby business. */
export function benchmarkFindings(trade: Trade): Finding[] {
  const t = TRADES[trade];
  return evaluate(trade, {
    rating: 4.8, reviewCount: 120, reviewsLast90: 12, replyRate: 0.9,
    photoCount: t.minPhotos, newestPhotoDays: 60, descriptionLength: 750,
    hasWebsite: true, hasHours: true, postsLast30: 4,
    credentialMentioned: true, servicesListed: t.minServices,
  }, "Illustrative best-in-class profile");
}

/** What-if projection only. Selected findings meet their benchmark, not a live re-grade. */
export function projectFindings(findings: Finding[], selectedIds: string[]): Finding[] {
  return findings.map((f) => selectedIds.includes(f.id) ? { ...f, score: 1 } : f);
}

export function checkoutPrice(item: string): number {
  if (item === "all") return PRICE_BUNDLE;
  if (item === "diy") return PRICE_DIY;
  throw new Error("Unknown purchase item");
}

/** Rough monthly revenue going to better-looking rivals. Placeholder model until real call data exists:
 * each point behind the local leaders costs about 0.4 enquiries a month, a third of which become paid jobs. */
export function estimateLostRevenue(trade: Trade, yourScore: number, rivalsScore: number): { jobs: number; pounds: number } {
  const gap = Math.max(0, rivalsScore - yourScore);
  const jobs = Math.round(gap * 0.4 / 3);
  return { jobs, pounds: jobs * TRADES[trade].avgJob };
}

/** An A needs evidence in every area and no weak area; otherwise the best grade is B. */
export function cappedGrade(findings: Finding[]): Grade {
  const g = gradeOf(scoreOf(findings));
  const areas = new Set(findings.filter((f) => f.weight > 0).map((f) => f.area));
  // Public scans have no review-reply evidence, so Credentials is the area that must be checked.
  const complete = areas.has("Credentials");
  const weak = Object.values(assessedAreaScores(findings)).some((v) => gradeOf(v) === "D" || gradeOf(v) === "F");
  return g === "A" && (!complete || weak) ? "B" : g;
}
