import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Brand";
import { TRADES, type Trade } from "@/lib/audit";
import { TRADE_PHOTOS } from "@/lib/sample";
import { discoverBusinesses, liveId, searchBusinesses } from "@/lib/places.functions";
import { Button } from "@/components/ui/button";
import { ReportStack } from "@/components/ReportStack";
import { TradeDeck } from "@/components/TradeDeck";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FixFirst · Free online presence audit for UK trades" },
      { name: "description", content: "Get a free A to F grade for your plumbing, electrical, cleaning, landscaping or salon business in under a minute, then let our agent fix it." },
      { property: "og:title", content: "FixFirst · Free online presence audit for UK trades" },
      { property: "og:description", content: "A to F grade, the five things costing you calls, and an agent that fixes them for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Hit = { placeId: string; name: string; address: string; rating: number; reviewCount: number; trade: Trade | null; photo: string | null };

function Home() {
  const [q, setQ] = useState("");
  const [trade, setTrade] = useState<Trade | null>("cleaning");
  const [city, setCity] = useState("London");
  const [picked, setPicked] = useState<Hit | null>(null);
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const search = useServerFn(searchBusinesses);
  const discover = useServerFn(discoverBusinesses);

  useEffect(() => {
    const s = q.trim();
    const browsing = s.length < 3 && trade !== null;
    if (s.length < 3 && !browsing) { setHits([]); setLoading(false); setErr(null); return; }
    let live = true;
    setLoading(true);
    setHits([]);
    setErr(null);
    const to = setTimeout(async () => {
      try {
        const r = await (browsing && trade ? discover({ data: { trade, city } }) : search({ data: { q: trade ? `${s} ${TRADES[trade].label}` : s } }));
        if (live) { setHits(r.results); setErr(r.error); }
      } catch { if (live) setErr("Search is having a moment. Please try again."); }
      if (live) setLoading(false);
    }, browsing ? 0 : 400);
    return () => { live = false; clearTimeout(to); };
  }, [q, trade, city, search, discover]);

  const pickedTrade = picked ? (picked.trade ?? trade) : null;
  const browsing = trade !== null && q.trim().length < 3;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 md:pt-14">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="animate-rise inline-block text-sm font-medium uppercase tracking-[0.2em] text-fix">One-off payments. No subscription.</p>
          <h1 className="animate-rise mt-6 font-display text-5xl font-extrabold leading-[0.95] md:text-6xl">
            Fix what's{" "}
            <span className="relative inline-block">
              <span aria-hidden className="animate-marker absolute inset-x-[-0.08em] bottom-[0.08em] -z-0 h-[0.38em] rounded-sm bg-grade-c/60" />
              <span className="relative">holding</span>
            </span>{" "}
            your business back.
          </h1>
          <p className="animate-rise mt-6 max-w-xl text-lg text-muted-foreground">
            Free scan of your Google listing and website against local rivals. Fix it yourself, or <span className="font-semibold text-brand-gradient">let our AI agent fix it for you.</span>
          </p>

          {!picked ? (
            <div className="relative mt-8 max-w-xl">
              <div className="flex items-stretch rounded-2xl border border-border bg-card shadow-[0_20px_50px_-30px_var(--ink)] focus-within:border-ink">
                <input aria-label="Business name and town" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Mops Stars Cleaning, London"
                  className="min-w-0 flex-1 rounded-l-2xl bg-transparent px-5 py-4 text-lg outline-none" />
                <span className="m-1.5 hidden items-center rounded-xl bg-fix px-5 font-semibold text-fix-foreground sm:flex">Scan free</span>
              </div>
              <div className="mt-5"><TradeDeck selected={trade} onPick={(t) => { setTrade(t); setQ(""); }} /></div>
              {browsing && <Carousel key={`${trade}-${city}`} opts={{ align: "start", slidesToScroll: 1 }} aria-label="Local businesses to try" className="animate-rise mt-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                    <span className="shrink-0">Try one in</span>
                    <select aria-label="Browse city" value={city} onChange={(e) => setCity(e.target.value)} className="cursor-pointer bg-transparent font-semibold text-foreground underline decoration-dotted underline-offset-4 outline-none">
                      {["London", "Manchester", "Birmingham", "Leeds", "Edinburgh"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <CarouselPrevious className="static h-7 w-7 translate-y-0" title="Previous businesses" />
                    <CarouselNext className="static h-7 w-7 translate-y-0" title="Next businesses" />
                  </div>
                </div>
                <div aria-busy={loading} className="h-24">
                  {hits.length > 0 ? <CarouselContent aria-label="Business results" className="-ml-3">
                    {hits.map((b) => <CarouselItem key={b.placeId} className="basis-[85%] pl-3 sm:basis-1/2">
                      <Button variant="outline" onClick={() => setPicked(b)} className="flex h-24 w-full justify-start gap-3 rounded-xl bg-card px-3 text-left whitespace-normal hover:-translate-y-0.5">
                        {b.photo ? <img src={b.photo} alt="" className="h-16 w-14 shrink-0 rounded-md object-cover" loading="lazy" width={56} height={64} /> : <span className="h-16 w-14 shrink-0 rounded-md bg-secondary" />}
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-sm font-semibold leading-5">{b.name}</span>
                          <span className="mt-1 block truncate text-xs text-muted-foreground">{b.address}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">{b.rating > 0 && `${b.rating.toFixed(1)} ★ · `}{b.reviewCount.toLocaleString("en-GB")} reviews</span>
                        </span>
                      </Button>
                    </CarouselItem>)}
                  </CarouselContent> : <div className="flex h-full items-center rounded-xl border border-border bg-card px-4 text-sm text-muted-foreground" role="status">
                    {loading ? "Finding local businesses…" : err ?? "No 4 to 4.5 star examples here. Try another city."}
                  </div>}
                </div>
              </Carousel>}
              {q.trim().length >= 3 && <ul aria-label="Business results" aria-busy={loading} className="absolute inset-x-0 z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-30px_var(--ink)] focus-within:border-ink">
                {hits.map((b) => (
                  <li key={b.placeId}>
                    <Button variant="ghost" onClick={() => setPicked(b)} className="flex h-auto w-full justify-start gap-4 rounded-none px-5 py-3 text-left whitespace-normal">
                      {b.photo ? <img src={b.photo} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" width={40} height={40} /> : <span className="h-10 w-10 rounded-lg bg-secondary" />}
                      <span className="min-w-0 flex-1"><span className="block font-medium">{b.name}</span><span className="text-sm text-muted-foreground">{b.address}</span></span>
                      <span className="shrink-0 text-right text-xs text-muted-foreground">{b.rating > 0 && <span className="block">{b.rating.toFixed(1)} ★</span>}<span>{b.reviewCount.toLocaleString("en-GB")} reviews</span></span>
                    </Button>
                  </li>
                ))}
                {loading && !hits.length && <li className="px-5 py-4 text-sm text-muted-foreground">Searching Google…</li>}
                {!loading && !hits.length && <li className="px-5 py-4 text-sm text-muted-foreground">{err ?? "No match on Google. Try adding your town or postcode."}</li>}
              </ul>}
            </div>
          ) : (
            <div className="animate-pop mt-8 flex max-w-xl flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-center">
              <img src={picked.photo ?? TRADE_PHOTOS[pickedTrade ?? "cleaning"]} alt={picked.name} className="h-32 w-full rounded-xl object-cover sm:w-40" width={160} height={128} />
              <div className="flex-1">
                <p className="font-display text-2xl font-extrabold">{picked.name}</p>
                <p className="text-sm text-muted-foreground">{picked.address}</p>
                <p className="mt-1 text-sm">{picked.rating.toFixed(1)} ★ · {picked.reviewCount} reviews</p>
                {!pickedTrade && <p className="mt-2 text-sm font-semibold text-fix">Pick your trade below so we compare you with the right rivals.</p>}
                <div className="mt-4 flex items-center gap-4">
                  <button disabled={!pickedTrade} onClick={() => pickedTrade && navigate({ to: "/scan/$id", params: { id: liveId(pickedTrade, picked.placeId) } })}
                    className="rounded-full bg-fix px-6 py-3 font-semibold text-fix-foreground transition hover:-translate-y-0.5 disabled:opacity-40">Grade my business →</button>
                  <button onClick={() => setPicked(null)} className="text-sm text-muted-foreground underline-offset-4 hover:underline">Not this one</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="pt-8"><ReportStack />
        </div>
        </div>


        <ul className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { k: "Spot the leaks", d: "Missing website, thin photos, unanswered reviews and gaps your rivals have already filled, found in under a minute.", bg: "bg-pop-yellow" },
            { k: "See who's winning nearby", d: "Your grade next to the three closest businesses in your trade, so you know exactly who is taking your calls.", bg: "bg-pop-mint" },
            { k: "Get it fixed, your way", d: "Follow our step-by-step DIY pack, or let our AI agent draft your review replies, your description and a one-page website for you.*", bg: "bg-pop-lilac" },
          ].map((c) => (
            <li key={c.k} className={`rounded-2xl border border-border bg-card p-6`}>
              <p className="font-display text-2xl font-extrabold">{c.k}</p>
              <p className="mt-2 text-muted-foreground">{c.d}</p>
            </li>
          ))}
        </ul>

        <section className="mt-14 grid gap-8 rounded-[2rem] border border-border bg-card p-8 md:grid-cols-[1.3fr_1fr] md:p-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fix">No strings attached</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">No subscription, and no free trial that quietly bills you.</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Your scan is free. Choose a DIY guide for £7.99 (launch price, usually £14.99), or let our AI agent prepare every fix for £29.99 (usually £49.99). Both cover your whole report with one payment.
            </p>
          </div>
          <ul className="flex flex-col justify-center gap-3">
            {[
              <>Your scan is always free</>,
              <>DIY pack £7.99 <s className="opacity-60">£14.99</s></>,
              <>Fix it for me £29.99 <s className="opacity-60">£49.99</s></>,
            ].map((t, i) => (
              <li key={i} className={`rounded-2xl bg-accent px-5 py-4 font-medium text-accent-foreground`}>{t}</li>
            ))}
          </ul>
        </section>
        <p className="mt-4 text-xs text-muted-foreground">*When a sign-in is needed, whether for Google, a website builder or another tool, our AI agent hands you the finished work with a one-click copy and open, so you only paste and save.</p>
      </main>
    </div>
  );
}
