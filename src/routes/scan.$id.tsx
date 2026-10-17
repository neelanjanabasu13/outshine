import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Header } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Loader2, MapPin, Star, Store } from "lucide-react";
import { TRADES, type Trade } from "@/lib/audit";
import { getBusiness } from "@/lib/places.functions";
import { photoOf, TRADE_PHOTOS } from "@/lib/sample";

export const Route = createFileRoute("/scan/$id")({
  loader: async ({ params }) => {
    const b = await getBusiness({ data: { id: params.id } });
    if (!b) throw notFound();
    return { b };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Grading ${loaderData.b.name} · FixFirst` : "Grading · FixFirst" },
      { name: "description", content: "FixFirst is checking this business's Google profile against local competitors." },
      { property: "og:title", content: "Live audit in progress · FixFirst" },
      { property: "og:description", content: "Checking available Google reviews, photos and profile information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Scan,
});

const STAGE_MS = 4800;

// Words customers use about each trade, highlighted while reviews are read.
const REVIEW_WORDS: Record<Trade, string[]> = {
  plumbing: ["boiler", "leak", "quick", "tidy", "price", "professional", "friendly", "reliable", "recommend"],
  electrician: ["wiring", "safe", "quick", "tidy", "price", "professional", "friendly", "reliable", "recommend"],
  cleaning: ["clean", "spotless", "team", "thorough", "price", "professional", "friendly", "reliable", "recommend"],
  landscaping: ["garden", "patio", "lawn", "tidy", "price", "professional", "friendly", "reliable", "recommend"],
  salon: ["hair", "colour", "cut", "stylist", "price", "professional", "friendly", "welcoming", "recommend"],
};

function km(a?: { latitude: number; longitude: number }, b?: { latitude: number; longitude: number }) {
  if (!a || !b) return null;
  const r = (d: number) => (d * Math.PI) / 180;
  const x = Math.sin(r(b.latitude - a.latitude) / 2) ** 2 + Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(r(b.longitude - a.longitude) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
const distance = (d: number | null) => (d == null ? "nearby" : d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`);

function Highlight({ text, words }: { text: string; words: string[] }) {
  const re = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  return <>{text.split(re).map((part, i) => (i % 2 ? <mark key={i} className="rounded bg-secondary px-1 font-medium text-foreground">{part}</mark> : part))}</>;
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium shadow-sm">{children}</span>;
}

function ScanLine() {
  return <div className="pointer-events-none animate-laser absolute inset-x-0 h-px bg-foreground/40 shadow-[0_0_14px_4px_var(--border)]" />;
}

function Scan() {
  const { b } = Route.useLoaderData();
  const t = TRADES[b.trade];
  const navigate = useNavigate();
  const s = b.signals;
  const photos = ((b.gallery?.length ? b.gallery : [photoOf(b)]).filter(Boolean) as string[]).slice(0, 6);
  const hero = photos[0] ?? TRADE_PHOTOS[b.trade];
  const site = b.website ? b.website.replace(/^https?:\/\/(www\.)?/, "www.").replace(/\/.*$/, "") : null;
  const reviews = b.reviews.filter((r) => r.text).slice(0, 3);

  const stages = [
    { title: "Scanning Google Business Profile", sub: "Reviewing photos, rating, hours, address and business details." },
    { title: "Analysing Visual Content", sub: "Looking at every photo customers see before they decide to call." },
    { title: "Scanning Customer Reviews", sub: "Reading what your customers actually say." },
    { title: "Scanning Website", sub: `Checking your website for ${t.credential}.` },
    { title: "Scanning Nearby Market", sub: `Finding nearby ${t.label.toLowerCase()} businesses and how they compare.` },
  ];
  const total = stages.length * STAGE_MS;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Date.now() - start), 120);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    if (elapsed >= total + 600) navigate({ to: "/report/$id", params: { id: b.id } });
  }, [elapsed, total, b.id, navigate]);

  const stage = Math.min(Math.floor(elapsed / STAGE_MS), stages.length - 1);
  const within = Math.min(1, (elapsed - stage * STAGE_MS) / STAGE_MS);
  const pct = Math.min(100, Math.round((elapsed / total) * 100));
  const done = elapsed >= total;
  const st = stages[stage]!;

  const websiteChecks = [
    { label: "Website loads", ok: s.websiteCredential != null },
    { label: t.credential, ok: !!s.websiteCredential },
    { label: "Opening hours on Google", ok: s.hasHours },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-xl px-6 pb-20 pt-4 text-center">
        <div className="text-left">
          <Button asChild variant="link" className="px-0"><Link to="/"><ArrowLeft />Try another business</Link></Button>
        </div>
        <h1 className="mt-2 font-display text-xl font-semibold">{b.name}</h1>
        <p className="text-sm text-muted-foreground">{b.address}</p>

        <div className="mt-5 flex justify-center gap-2" aria-hidden>
          {stages.map((x, i) => (
            <span key={x.title} className={`h-1 rounded-full transition-all duration-500 ${i === stage && !done ? "w-10 bg-foreground" : i < stage || done ? "w-6 bg-foreground/70" : "w-6 bg-border"}`} />
          ))}
        </div>

        <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-secondary/40 text-left shadow-[0_20px_50px_-30px_var(--ink)]">
          {stage === 0 && (
            <div key="profile" className="animate-rise absolute inset-0">
              <img src={hero} alt={b.name} className="animate-kenburns h-full w-full object-cover" width={1024} height={768} />
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <Chip><Star className="h-3 w-3 fill-current text-fix" />{s.rating.toFixed(1)} · {s.reviewCount.toLocaleString("en-GB")}</Chip>
                {b.openNow != null && <Chip>{b.openNow ? "Open now" : "Closed"}</Chip>}
                <Chip>{t.label}</Chip>
              </div>
              <div className="absolute bottom-3 left-3"><Chip><MapPin className="h-3 w-3" />{b.address}</Chip></div>
              <ScanLine />
            </div>
          )}

          {stage === 1 && (
            <div key="photos" className="animate-rise absolute inset-0 grid grid-cols-3 grid-rows-2 gap-2 p-2">
              {Array.from({ length: 6 }, (_, i) => photos[i] ?? null).map((src, i) => {
                const active = Math.floor(within * 6) === i;
                return (
                  <div key={i} className={`overflow-hidden rounded-lg bg-secondary transition-all duration-300 ${active ? "scale-[1.04] ring-2 ring-foreground shadow-lg" : ""}`}>
                    {src ? <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-muted-foreground">No photo</div>}
                  </div>
                );
              })}
            </div>
          )}

          {stage === 2 && (
            <div key="reviews" className="animate-rise absolute inset-0 space-y-2 overflow-hidden p-3">
              {(reviews.length ? reviews : [{ author: "Google", stars: Math.round(s.rating), text: `${s.reviewCount.toLocaleString("en-GB")} reviews averaging ${s.rating.toFixed(1)} stars.`, replied: false }]).map((r, i) => (
                <div key={i} className="animate-rise rounded-xl border border-border bg-card p-3" style={{ animationDelay: `${i * 350}ms` }}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium"><span className="grid h-5 w-5 place-items-center rounded-full bg-secondary text-[10px]">{r.author.charAt(0)}</span>{r.author}</span>
                    <span className="text-fix">{"★".repeat(Math.max(1, Math.min(5, r.stars)))}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground"><Highlight text={r.text} words={REVIEW_WORDS[b.trade]} /></p>
                </div>
              ))}
              <ScanLine />
            </div>
          )}

          {stage === 3 && (
            <div key="site" className="animate-rise absolute inset-0 flex flex-col bg-card">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-border" />)}</span>
                <span className="flex-1 truncate rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{site ?? "No website listed on Google"}</span>
              </div>
              <div className="relative flex-1 space-y-2 p-4">
                <div className="h-3 w-2/3 rounded bg-secondary" />
                <div className="h-2 w-full rounded bg-secondary/70" />
                <div className="h-2 w-5/6 rounded bg-secondary/70" />
                <div className="h-16 w-full rounded bg-secondary/50" />
                <ScanLine />
                <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1.5">
                  {websiteChecks.filter((_, i) => within > 0.2 + i * 0.25).map((c) => (
                    <span key={c.label} className="animate-pop"><Chip>{c.label}<Check className={`h-3 w-3 ${c.ok ? "text-fix" : "text-muted-foreground/40"}`} /></Chip></span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stage === 4 && (
            <div key="market" className="animate-rise absolute inset-0 space-y-2 overflow-hidden p-3">
              {b.competitors.length ? b.competitors.map((c, i) => (
                <div key={c.name} className="animate-rise flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5" style={{ animationDelay: `${i * 600}ms` }}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary"><Store className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{t.label} · {distance(km(b.location, c.location))}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium"><Star className="h-3 w-3 fill-current text-fix" />{c.signals.rating.toFixed(1)}</span>
                </div>
              )) : <p className="p-4 text-sm text-muted-foreground">No nearby rivals returned by Google.</p>}
              <ScanLine />
            </div>
          )}
        </div>

        <p key={stage + String(done)} className="animate-rise mt-5 flex items-center justify-center gap-2 font-semibold">
          {done ? <Check className="h-4 w-4 text-fix" /> : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {done ? "Writing your report" : st.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{done ? "Putting your grade together." : st.sub}</p>

        <div className="mx-auto mt-5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-foreground transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">{pct}%</p>
      </main>
    </div>
  );
}
