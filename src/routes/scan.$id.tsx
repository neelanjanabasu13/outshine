import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TRADES } from "@/lib/audit";
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

type Frame = { src: string; caption: string };

function Scan() {
  const { b } = Route.useLoaderData();
  const t = TRADES[b.trade];
  const navigate = useNavigate();
  const s = b.signals;
  const own = (b.gallery?.length ? b.gallery : [photoOf(b)]).filter(Boolean) as string[];
  const first = own[0] ?? TRADE_PHOTOS[b.trade];
  const rivalPhotos = b.competitors.filter((c) => c.photo).map((c) => ({ src: c.photo as string, caption: `Rival · ${c.name}` }));
  const steps: { name: string; status: string; lines: string[]; pill: string; frames: Frame[] }[] = [
    {
      name: "Finding your profile", status: "Locating you on Google Maps",
      lines: [`Matched “${b.name}” on Google Maps`, b.address, `Category: ${t.label}`],
      pill: "Profile located", frames: [{ src: first, caption: "Google profile" }],
    },
    {
      name: "Reading reviews", status: "Reading your reviews",
      lines: [`${s.reviewCount.toLocaleString("en-GB")} reviews found`, `Average rating ${s.rating.toFixed(1)} ★`, ...(b.live ? [] : [`${s.reviewsLast90} in the last 90 days`])],
      pill: `${s.reviewCount.toLocaleString("en-GB")} reviews checked`, frames: own.slice(1, 2).map((src) => ({ src, caption: "Customer view" })),
    },
    {
      name: "Checking photos", status: "Looking through your photos",
      lines: b.live ? [`${s.photoCount} photos on your profile`, `${s.ownerPhotos ?? 0} uploaded by the business`, `Looking for ${t.expectedPhotos}`] : [`${s.photoCount} photos`, `Looking for ${t.expectedPhotos}`],
      pill: `${s.photoCount} photos scanned`, frames: own.slice(1).map((src, i) => ({ src, caption: `Photo ${i + 2} of ${own.length}` })),
    },
    {
      name: "Checking website and credentials", status: `Reading your website for ${t.credential}`,
      lines: b.live ? [s.hasWebsite ? "Website link found" : "No website link on Google", s.hasHours ? "Opening hours listed" : "No opening hours listed", s.websiteCredential == null ? "Website could not be read for credentials" : s.websiteCredential ? `Website mentions ${t.credential} ✓` : `Website does not mention ${t.credential} ✕`] : [`Searching for ${t.credential}`, s.credentialMentioned ? "Found a mention ✓" : "Not mentioned anywhere ✕"],
      pill: "Credentials checked", frames: [{ src: TRADE_PHOTOS[b.trade], caption: "Trade standards" }],
    },
    {
      name: "Comparing with competitors", status: "Sizing up local rivals",
      lines: b.competitors.map((c) => `${c.name}: ${c.signals.rating.toFixed(1)} ★, ${c.signals.reviewCount.toLocaleString("en-GB")} reviews`),
      pill: `${b.competitors.length} local rivals compared`, frames: rivalPhotos,
    },
  ];
  const all = steps.flatMap((st, i) => st.lines.map((l) => ({ i, l })));
  const [n, setN] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (n >= all.length) {
      const to = setTimeout(() => navigate({ to: "/report/$id", params: { id: b.id } }), 1400);
      return () => clearTimeout(to);
    }
    const to = setTimeout(() => setN((x) => x + 1), 750 + (n % 3) * 300);
    return () => clearTimeout(to);
  }, [n, all.length, b.id, navigate]);

  useEffect(() => {
    const iv = setInterval(() => setTick((x) => x + 1), 1600);
    return () => clearInterval(iv);
  }, []);

  const current = Math.min(all[n]?.i ?? steps.length, steps.length - 1);
  const done = n >= all.length;
  const pct = Math.round((n / all.length) * 100);
  const step = steps[current]!;
  const pool = step.frames.length ? steps[current].frames : [{ src: first, caption: "Google profile" }];
  const frame = pool[tick % pool.length]!;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-6 md:grid-cols-2">
        <div>
          <Button asChild variant="link" className="mb-4 px-0"><Link to="/"><ArrowLeft />Try another business</Link></Button>
          <div className="relative overflow-hidden rounded-3xl bg-secondary">
            <img key={frame.src + current} src={frame.src} alt={frame.caption} className="animate-kenburns aspect-video md:aspect-[4/3] w-full object-cover" width={1024} height={768} />
            <div className="absolute inset-0 bg-ink/25" />
            <div className="animate-laser absolute inset-x-0 h-0.5 bg-fix shadow-[0_0_24px_6px_var(--fix)]" />
            <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 font-mono text-xs">LIVE · {pct}%</span>
            <span key={frame.caption} className="animate-rise absolute bottom-4 left-4 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium">{frame.caption}</span>
          </div>
          <p key={current + String(done)} className="animate-rise mt-5 font-mono text-sm text-fix">
            {done ? "Writing your report…" : `${step.status}…`}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold">{b.name}</p>
          <p className="text-muted-foreground">{b.address}</p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-fix transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {steps.map((st, i) => (i < current || done) && (
              <span key={st.pill} className="animate-pop rounded-full border border-fix/40 bg-fix/10 px-3 py-1 text-xs font-medium">✓ {st.pill}</span>
            ))}
          </div>
        </div>
        <div>
          <ol className="space-y-5">
            {steps.map((st, i) => (
              <li key={st.name} className={`transition ${i > current && !done ? "opacity-30" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${i < current || done ? "bg-fix text-fix-foreground" : i === current ? "border-2 border-fix animate-pulse" : "border border-border"}`}>
                    {i < current || done ? "✓" : i + 1}
                  </span>
                  <span className="font-medium">{st.name}</span>
                </div>
                <ul className="ml-9 mt-2 space-y-1 font-mono text-xs text-muted-foreground">
                  {all.slice(0, n).filter((x) => x.i === i).map((x) => <li key={x.l} className="animate-rise">› {x.l}</li>)}
                  {i === current && !done && <li className="animate-caret">▍</li>}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}
