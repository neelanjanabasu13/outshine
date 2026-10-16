import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Brand";
import { TRADES } from "@/lib/audit";
import { findBusiness, TRADE_PHOTOS } from "@/lib/sample";

export const Route = createFileRoute("/scan/$id")({
  loader: ({ params }) => {
    const b = findBusiness(params.id);
    if (!b) throw notFound();
    return { b };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Grading ${loaderData.b.name} · FixFirst` : "Grading · FixFirst" },
      { name: "description", content: "FixFirst is checking this business's Google profile against local competitors." },
      { property: "og:title", content: "Live audit in progress · FixFirst" },
      { property: "og:description", content: "Checking reviews, photos, profile and trade credentials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Scan,
});

function Scan() {
  const { b } = Route.useLoaderData();
  const t = TRADES[b.trade];
  const navigate = useNavigate();
  const s = b.signals;
  const steps = [
    { name: "Finding your profile", lines: [`Matched “${b.name}” on Google Maps`, `${b.address}`, `Category: ${t.label}`] },
    { name: "Reading reviews", lines: [`${s.reviewCount} reviews found, average ${s.rating.toFixed(1)} ★`, `${s.reviewsLast90} in the last 90 days`, `Owner replied to ${Math.round(s.replyRate * 100)}%`] },
    { name: "Checking photos", lines: [`${s.photoCount} photos, newest ${s.newestPhotoDays} days old`, `Looking for ${t.expectedPhotos}`] },
    { name: "Checking trade standards", lines: [`Searching for ${t.credential}`, s.credentialMentioned ? "Found a mention ✓" : "Not mentioned anywhere ✕"] },
    { name: "Comparing with competitors", lines: b.competitors.map((c) => `${c.name}: ${c.signals.rating.toFixed(1)} ★, ${c.signals.reviewCount} reviews`) },
  ];
  const all = steps.flatMap((st, i) => st.lines.map((l) => ({ i, l })));
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= all.length) {
      const to = setTimeout(() => navigate({ to: "/report/$id", params: { id: b.id } }), 1200);
      return () => clearTimeout(to);
    }
    const to = setTimeout(() => setN((x) => x + 1), 650 + (n % 3) * 250);
    return () => clearTimeout(to);
  }, [n, all.length, b.id, navigate]);

  const current = n < all.length ? all[n]!.i : steps.length;
  const pct = Math.round((n / all.length) * 100);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-6 md:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-3xl">
            <img src={TRADE_PHOTOS[b.trade]} alt={b.name} className="aspect-[4/3] w-full object-cover" width={1024} height={768} />
            <div className="absolute inset-0 bg-ink/20" />
            <div className="animate-laser absolute inset-x-0 h-0.5 bg-fix shadow-[0_0_24px_6px_var(--fix)]" />
            <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 font-mono text-xs">LIVE · {pct}%</span>
          </div>
          <p className="mt-5 font-display text-3xl font-semibold">{b.name}</p>
          <p className="text-muted-foreground">{b.address}</p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-fix transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div>
          <ol className="space-y-5">
            {steps.map((st, i) => (
              <li key={st.name} className={`transition ${i > current ? "opacity-30" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${i < current ? "bg-fix text-fix-foreground" : i === current ? "border-2 border-fix" : "border border-border"}`}>
                    {i < current ? "✓" : i + 1}
                  </span>
                  <span className="font-medium">{st.name}</span>
                </div>
                <ul className="ml-9 mt-2 space-y-1 font-mono text-xs text-muted-foreground">
                  {all.slice(0, n).filter((x) => x.i === i).map((x) => <li key={x.l} className="animate-rise">› {x.l}</li>)}
                  {i === current && <li className="animate-caret">▍</li>}
                </ul>
              </li>
            ))}
          </ol>
          {n >= all.length && <p className="animate-rise mt-8 font-display text-2xl">Writing your report…</p>}
        </div>
      </main>
    </div>
  );
}
