import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Brand";
import { TRADES, type Trade } from "@/lib/audit";
import { TRADE_PHOTOS } from "@/lib/sample";
import { liveId, searchBusinesses } from "@/lib/places.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FixFirst · Free Google profile audit for UK trades" },
      { name: "description", content: "Get a free A to F grade for your plumbing, electrical, cleaning, landscaping or salon business in under a minute, then let our agent fix it." },
      { property: "og:title", content: "FixFirst · Free Google profile audit for UK trades" },
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
  const [trade, setTrade] = useState<Trade | null>(null);
  const [picked, setPicked] = useState<Hit | null>(null);
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const search = useServerFn(searchBusinesses);

  useEffect(() => {
    const s = q.trim();
    if (s.length < 3) { setHits([]); return; }
    let live = true;
    setLoading(true);
    const to = setTimeout(async () => {
      try {
        const r = await search({ data: { q: trade ? `${s} ${TRADES[trade].label}` : s } });
        if (live) { setHits(r.results); setErr(r.error); }
      } catch { if (live) setErr("Search is having a moment. Please try again."); }
      if (live) setLoading(false);
    }, 400);
    return () => { live = false; clearTimeout(to); };
  }, [q, trade, search]);

  const pickedTrade = picked ? (picked.trade ?? trade) : null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-6 md:pt-12">
        <p className="animate-rise text-sm font-medium uppercase tracking-[0.2em] text-fix">Free scan · No subscription · Pay only for the fixes you want</p>
        <h1 className="animate-rise mt-5 max-w-4xl text-4xl font-semibold leading-[0.95] md:text-6xl">
          How do you <em className="font-display italic text-brand-gradient">stack up against local rivals?</em>
        </h1>
        <p className="animate-rise mt-6 max-w-xl text-lg text-muted-foreground">
          We will find what is holding you back and <span className="font-semibold text-brand-gradient">fix it for you.</span>
        </p>

        <div className="mt-8 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TRADES) as Trade[]).map((t) => (
              <button key={t} onClick={() => setTrade(trade === t ? null : t)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${(picked ? pickedTrade : trade) === t ? "border-ink bg-ink text-paper" : "border-border bg-card hover:border-ink"}`}>
                {TRADES[t].label}
              </button>
            ))}
          </div>

          {!picked ? (
            <div className="relative mt-4">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Your business name and town, e.g. ProLux Cleaning London"
                className="w-full rounded-2xl border border-border bg-card px-6 py-5 text-lg shadow-[0_20px_50px_-30px_var(--ink)] outline-none focus:border-ink" />
              {q.trim().length >= 3 && <ul className="mt-2 overflow-hidden rounded-2xl border border-border bg-card">
                {hits.map((b) => (
                  <li key={b.placeId}>
                    <button onClick={() => setPicked(b)} className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-secondary">
                      {b.photo ? <img src={b.photo} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" width={40} height={40} /> : <span className="h-10 w-10 rounded-lg bg-secondary" />}
                      <span className="flex-1"><span className="block font-medium">{b.name}</span><span className="text-sm text-muted-foreground">{b.address}</span></span>
                      {b.rating > 0 && <span className="text-xs text-muted-foreground">{b.rating.toFixed(1)} ★</span>}
                    </button>
                  </li>
                ))}
                {loading && !hits.length && <li className="px-5 py-4 text-sm text-muted-foreground">Searching Google…</li>}
                {!loading && !hits.length && <li className="px-5 py-4 text-sm text-muted-foreground">{err ?? "No match on Google. Try adding your town or postcode."}</li>}
              </ul>}
            </div>
          ) : (
            <div className="animate-rise mt-4 flex flex-col gap-5 rounded-3xl border border-border bg-card p-4 sm:flex-row sm:items-center">
              <img src={picked.photo ?? TRADE_PHOTOS[pickedTrade ?? "cleaning"]} alt={picked.name} className="h-32 w-full rounded-2xl object-cover sm:w-44" width={176} height={128} />
              <div className="flex-1">
                <p className="font-display text-2xl font-semibold">{picked.name}</p>
                <p className="text-sm text-muted-foreground">{picked.address}</p>
                <p className="mt-1 text-sm">{picked.rating.toFixed(1)} ★ · {picked.reviewCount} reviews</p>
                {!pickedTrade && <p className="mt-2 text-sm text-fix">Pick your trade above so we compare you with the right rivals.</p>}
                <div className="mt-4 flex gap-3">
                  <button disabled={!pickedTrade} onClick={() => pickedTrade && navigate({ to: "/scan/$id", params: { id: liveId(pickedTrade, picked.placeId) } })}
                    className="rounded-full bg-fix px-6 py-3 font-medium text-fix-foreground transition hover:opacity-90 disabled:opacity-40">Grade my business →</button>
                  <button onClick={() => setPicked(null)} className="text-sm text-muted-foreground underline-offset-4 hover:underline">Not this one</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="mt-14">
          <h2 className="max-w-xl text-3xl font-semibold md:text-4xl">Customers decide in seconds. We make sure they pick you.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
            {[
              { img: TRADE_PHOTOS.plumbing, k: "01", t: "Compare", d: "You next to your three nearest rivals" },
              { img: TRADE_PHOTOS.salon, k: "02", t: "Find the problems", d: "Your top five, in plain English" },
              { img: TRADE_PHOTOS.landscaping, k: "03", t: "Get them fixed", d: "The agent does the work, not you" },
            ].map((c, i) => (
              <figure key={c.k} className={`group relative overflow-hidden rounded-[2rem] ${i === 0 ? "min-h-80" : "min-h-80"}`}>
                <img src={c.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-6 text-paper">
                  <span className="font-mono text-xs opacity-70">{c.k}</span>
                  <p className="font-display text-2xl font-semibold">{c.t}</p>
                  <p className="text-sm opacity-80">{c.d}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-8 rounded-[2rem] border border-border bg-card p-8 md:grid-cols-[1.3fr_1fr] md:p-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fix">No strings attached</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              No subscription, no free trial that <em className="font-display italic text-brand-gradient">quietly bills you.</em>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Other tools lock you into a monthly plan. Here the scan is free, and you only pay when you want our agent to do a fix for you, once, with nothing recurring.
            </p>
          </div>
          <ul className="flex flex-col justify-center gap-3">
            {["Your scan is always free", "Pay per fix, only if you want our agent to do it", "One payment, never a monthly bill"].map((t) => (
              <li key={t} className="flex items-center gap-3 rounded-2xl bg-accent px-5 py-4 font-medium text-accent-foreground">
                <span className="h-2 w-2 rounded-full bg-fix" />{t}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
