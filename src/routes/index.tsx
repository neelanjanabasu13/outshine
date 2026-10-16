import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/Brand";
import { TRADES, type Trade } from "@/lib/audit";
import { BUSINESSES, TRADE_PHOTOS, type Business } from "@/lib/sample";

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

function Home() {
  const [q, setQ] = useState("");
  const [trade, setTrade] = useState<Trade | null>(null);
  const [picked, setPicked] = useState<Business | null>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return BUSINESSES.filter((b) => (!trade || b.trade === trade) && (!s || b.name.toLowerCase().includes(s) || b.area.toLowerCase().includes(s)));
  }, [q, trade]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-6 md:pt-12">
        <p className="animate-rise text-sm font-medium uppercase tracking-[0.2em] text-fix">Free · 60 seconds · No sign-up · UK trades</p>
        <h1 className="animate-rise mt-5 max-w-4xl text-4xl font-semibold leading-[0.95] md:text-6xl">
          How do you <em className="font-display italic text-brand-gradient">stack up against local rivals?</em>
        </h1>
        <p className="animate-rise mt-6 max-w-xl text-lg text-muted-foreground">
          See how you compare with nearby competitors, find out what is holding you back, and let our agent fix it for you.
        </p>

        <div className="mt-8 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TRADES) as Trade[]).map((t) => (
              <button key={t} onClick={() => { setTrade(trade === t ? null : t); setPicked(null); }}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${trade === t ? "border-ink bg-ink text-paper" : "border-border bg-card hover:border-ink"}`}>
                {TRADES[t].label}
              </button>
            ))}
          </div>

          {!picked ? (
            <div className="relative mt-4">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Your business name, e.g. Riverside Plumbing"
                className="w-full rounded-2xl border border-border bg-card px-6 py-5 text-lg shadow-[0_20px_50px_-30px_var(--ink)] outline-none focus:border-ink" />
              {(q.trim() || trade) && <ul className="mt-2 overflow-hidden rounded-2xl border border-border bg-card">
                {results.map((b) => (
                  <li key={b.id}>
                    <button onClick={() => setPicked(b)} className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-secondary">
                      <img src={TRADE_PHOTOS[b.trade]} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" width={40} height={40} />
                      <span className="flex-1"><span className="block font-medium">{b.name}</span><span className="text-sm text-muted-foreground">{b.address}</span></span>
                      <span className="text-xs text-muted-foreground">{TRADES[b.trade].label}</span>
                    </button>
                  </li>
                ))}
                {!results.length && <li className="px-5 py-4 text-sm text-muted-foreground">No match in the sample list yet. Live Google search arrives once it's connected.</li>}
              </ul>}
              <p className="mt-3 text-xs text-muted-foreground">Preview mode: these are sample businesses until live Google search is switched on.</p>
            </div>
          ) : (
            <div className="animate-rise mt-4 flex flex-col gap-5 rounded-3xl border border-border bg-card p-4 sm:flex-row sm:items-center">
              <img src={TRADE_PHOTOS[picked.trade]} alt={picked.name} className="h-32 w-full rounded-2xl object-cover sm:w-44" width={176} height={128} />
              <div className="flex-1">
                <p className="font-display text-2xl font-semibold">{picked.name}</p>
                <p className="text-sm text-muted-foreground">{picked.address}</p>
                <p className="mt-1 text-sm">{picked.signals.rating.toFixed(1)} ★ · {picked.signals.reviewCount} reviews</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => navigate({ to: "/scan/$id", params: { id: picked.id } })}
                    className="rounded-full bg-fix px-6 py-3 font-medium text-fix-foreground transition hover:opacity-90">Grade my business →</button>
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
      </main>
    </div>
  );
}
