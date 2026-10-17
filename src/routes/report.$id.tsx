import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { gradeColor, Header } from "@/components/Brand";
import { areaScores, estimateLostRevenue, evaluate, gradeOf, PRICE_BUNDLE, PRICE_PER_FIX, scoreOf, topProblems, TRADES, type Area, type Finding } from "@/lib/audit";
import { runAgent } from "@/lib/agent";
import { findBusiness, TRADE_PHOTOS, type Business } from "@/lib/sample";

export const Route = createFileRoute("/report/$id")({
  loader: ({ params }) => {
    const b = findBusiness(params.id);
    if (!b) throw notFound();
    return { b };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.b.name} report · FixFirst` : "Report · FixFirst" },
      { name: "description", content: "Letter grade, competitor comparison and the five fixes that matter most." },
      { property: "og:title", content: loaderData ? `${loaderData.b.name}'s FixFirst grade` : "FixFirst report" },
      { property: "og:description", content: "See the grade and the five things costing this business calls." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Report,
});

function Report() {
  const { b } = Route.useLoaderData();
  const findings = evaluate(b.trade, b.signals, b.name);
  const score = scoreOf(findings);
  const grade = gradeOf(score);
  const areas = areaScores(findings);
  const comps = b.competitors.map((c) => {
    const f = evaluate(b.trade, c.signals, c.name);
    return { ...c, score: scoreOf(f), areas: areaScores(f) };
  });
  const avgTop = Math.round(comps.reduce((a, c) => a + c.score, 0) / comps.length);
  const problems = topProblems(findings);
  const lost = estimateLostRevenue(b.trade, score, avgTop);
  const [all, setAll] = useState(false);
  const [paidItem, setPaidItem] = useState<string | null>(null);
  const verify = useServerFn(verifyCheckout);
  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("session_id");
    if (!sid) return;
    verify({ data: { sessionId: sid } }).then((r) => {
      if (!r.paid || r.businessId !== b.id) return;
      if (r.item === "all") setAll(true); else setPaidItem(r.item);
      window.history.replaceState(null, "", window.location.pathname);
    }).catch(() => {});
  }, [b.id, verify]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-28">
        <section className="animate-rise pt-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{TRADES[b.trade].label} · {b.area}</p>
          <h1 className="mt-2 text-4xl font-semibold md:text-6xl">{b.name}</h1>
          <div className="mt-8 overflow-hidden rounded-[2rem] bg-ink p-8 text-paper md:p-12">
            {lost.jobs > 0 ? (
              <>
                <p className="text-sm uppercase tracking-[0.2em] opacity-60">Likely going to rivals each month</p>
                <p className="mt-3 font-display text-6xl font-semibold md:text-8xl">£{lost.pounds.toLocaleString("en-GB")}</p>
                <p className="mt-4 max-w-xl text-lg opacity-80">That is about {lost.jobs} jobs a month that pick a nearby competitor, because their profile gives customers more reasons to trust them first.</p>
              </>
            ) : (
              <>
                <p className="text-sm uppercase tracking-[0.2em] opacity-60">Good news</p>
                <p className="mt-3 font-display text-5xl font-semibold md:text-7xl">You're ahead locally.</p>
                <p className="mt-4 max-w-xl text-lg opacity-80">Customers comparing you with nearby rivals are more likely to call you. Let's keep it that way.</p>
              </>
            )}
            <p className="mt-6 text-xs opacity-40">Estimate based on your score gap and a typical {TRADES[b.trade].label.toLowerCase()} job of £{TRADES[b.trade].avgJob}.</p>
          </div>
        </section>

        <section className="mt-16 grid items-center gap-12 md:grid-cols-[auto_1fr]">
          <Gauge score={score} grade={grade} />
          <div>
            <h2 className="text-2xl font-semibold">Your trust score</h2>
            <p className="mt-3 max-w-lg text-lg text-muted-foreground">
              You scored <b className="text-foreground">{score} out of 100</b>, a grade {grade}. The three nearest top competitors average <b className="text-foreground">{avgTop}</b>.
              It measures how confident a stranger feels about calling you after a quick look.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-semibold">You, next to the competition</h2>
          <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2">
            {[{ name: b.name, score, you: true }, ...comps.map((c) => ({ name: c.name, score: c.score, you: false }))].map((c) => {
              const g = gradeOf(c.score);
              return (
                <div key={c.name} className={`min-w-56 flex-1 snap-start overflow-hidden rounded-3xl border bg-card ${c.you ? "border-ink" : "border-border"}`}>
                  <img src={TRADE_PHOTOS[b.trade]} alt="" loading="lazy" width={400} height={200} className={`h-32 w-full object-cover ${c.you ? "" : "grayscale"}`} />
                  <div className="flex items-end justify-between p-4">
                    <div><p className="text-xs text-muted-foreground">{c.you ? "You" : "Nearby"}</p><p className="font-medium leading-tight">{c.name}</p></div>
                    <p className={`font-display text-4xl font-bold ${gradeColor(g)}`}>{g}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Competitor photos will come from Google once live search is connected.</p>
        </section>

        <section className="mt-20 grid items-center gap-10 md:grid-cols-2">
          <Radar you={areas} them={comps[0]!.areas} />
          <div>
            <h2 className="text-2xl font-semibold">Where you're winning, and losing</h2>
            <ul className="mt-6 space-y-4">
              {(Object.keys(areas) as Area[]).map((a) => (
                <li key={a}>
                  <div className="flex justify-between text-sm"><span>{a}</span><span className="font-mono">{areas[a]} / {comps[0]!.areas[a]}</span></div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-fix" style={{ width: `${areas[a]}%` }} /></div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">You vs {comps[0]!.name}, the strongest local profile.</p>
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-3xl font-semibold md:text-4xl">The {problems.length} things costing you the most</h2>
          <div className="mt-10 space-y-6">
            {problems.map((f, i) => <ProblemCard key={f.id} f={f} n={i + 1} b={b} autoRun={all} />)}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] bg-ink p-8 text-paper md:p-12">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-display text-3xl font-semibold md:text-4xl">Fix all of it for £{PRICE_BUNDLE.toFixed(2)}.</p>
              <p className="mt-2 max-w-md opacity-70">Every fix above, done by the agent, plus a free re-check in 30 days so you can see your new grade.</p>
            </div>
            <PayButton b={b} item="all" label="Every fix" className="rounded-full bg-fix px-8 py-4 font-medium text-fix-foreground hover:opacity-90 disabled:opacity-50">Fix everything →</PayButton>
          </div>
          <p className="mt-6 text-xs opacity-50">One payment, never a monthly bill. Test mode: use card 4242 4242 4242 4242.</p>
        </section>
      </main>
    </div>
  );
}

function PayButton({ b, item, label, className, children }: { b: Business; item: string; label: string; className: string; children: React.ReactNode }) {
  const go = useServerFn(createCheckout);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <button disabled={busy} className={className} onClick={async () => {
        setBusy(true); setErr(null);
        try {
          const r = await go({ data: { businessId: b.id, businessName: b.name, item, label } });
          if (r.url) { window.location.href = r.url; return; }
          setErr(r.error);
        } catch { setErr("We could not open the payment page. Please try again."); }
        setBusy(false);
      }}>{busy ? "Opening secure payment…" : children}</button>
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
    </div>
  );
}

function ProblemCard({ f, n, b, autoRun }: { f: Finding; n: number; b: Business; autoRun: boolean }) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [step, setStep] = useState(0);
  const [showAfter, setShowAfter] = useState(false);
  const [copied, setCopied] = useState(false);
  const run = runAgent(f.fix, b);
  const severity = f.score < 0.35 ? "bg-grade-f" : f.score < 0.7 ? "bg-grade-d" : "bg-grade-c";

  useEffect(() => { if (autoRun && state === "idle") setState("running"); }, [autoRun, state]);
  useEffect(() => {
    if (state !== "running") return;
    if (step >= run.steps.length) { setState("done"); setShowAfter(true); return; }
    const to = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(to);
  }, [state, step, run.steps.length]);

  return (
    <article className="animate-rise grid gap-8 rounded-[2rem] border border-border bg-card p-6 md:grid-cols-[1.1fr_1fr] md:p-8">
      <div>
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${severity}`} />
          <span className="font-mono text-xs text-muted-foreground">0{n} · {f.area}</span>
        </div>
        <h3 className="mt-3 text-2xl font-semibold">{f.title}</h3>
        <p className="mt-3"><span className="text-muted-foreground">Evidence: </span>{f.evidence}</p>
        <p className="mt-2 text-muted-foreground">{f.impact}</p>
        {state === "idle" && (
          <PayButton b={b} item={f.id} label={f.title} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50">
            Fix it for me · £{PRICE_PER_FIX.toFixed(2)}
          </PayButton>
        )}
        {state !== "idle" && (
          <ul className="mt-6 space-y-1.5 font-mono text-xs">
            {run.steps.map((s, i) => (
              <li key={s} className={i < step ? "text-fix" : i === step && state === "running" ? "text-foreground" : "text-muted-foreground/40"}>
                {i < step ? "✓" : i === step && state === "running" ? "●" : "○"} {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col">
        <div className="inline-flex self-start rounded-full bg-secondary p-1 text-xs">
          {(["Before", "After"] as const).map((l) => (
            <button key={l} onClick={() => setShowAfter(l === "After")}
              className={`rounded-full px-4 py-1.5 ${showAfter === (l === "After") ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
        <div className={`mt-3 flex-1 rounded-2xl p-5 text-sm ${showAfter ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
          {!showAfter && <p>{f.before}</p>}
          {showAfter && state !== "done" && <p>{f.after}</p>}
          {showAfter && state === "done" && (
            f.fix === "website" ? (
              <div>
                <p className="font-medium">{run.output}</p>
                <Link to="/site/$id" params={{ id: b.id }} target="_blank" className="mt-3 inline-block rounded-full bg-fix px-5 py-2 text-fix-foreground">Open your website ↗</Link>
              </div>
            ) : (
              <div>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap font-sans">{run.output}</pre>
                <button onClick={() => { navigator.clipboard.writeText(run.output); setCopied(true); }}
                  className="mt-4 rounded-full bg-fix px-5 py-2 text-fix-foreground">{copied ? "Copied ✓" : "Copy"}</button>
              </div>
            )
          )}
        </div>
      </div>
    </article>
  );
}

function Gauge({ score, grade }: { score: number; grade: ReturnType<typeof gradeOf> }) {
  const [v, setV] = useState(0);
  useEffect(() => { const to = setTimeout(() => setV(score), 150); return () => clearTimeout(to); }, [score]);
  const r = 88, c = 2 * Math.PI * r;
  return (
    <div className="relative h-56 w-56">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--secondary)" strokeWidth="14" />
        <circle cx="100" cy="100" r={r} fill="none" stroke={`var(--grade-${grade.toLowerCase()})`} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div><p className={`font-display text-7xl font-bold leading-none ${gradeColor(grade)}`}>{grade}</p><p className="mt-1 font-mono text-sm text-muted-foreground">{score}/100</p></div>
      </div>
    </div>
  );
}

function Radar({ you, them }: { you: Record<Area, number>; them: Record<Area, number> }) {
  const keys = Object.keys(you) as Area[];
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    return [150 + Math.cos(a) * v * 1.1, 150 + Math.sin(a) * v * 1.1];
  };
  const poly = (d: Record<Area, number>) => keys.map((k, i) => pt(i, d[k]).join(",")).join(" ");
  return (
    <svg viewBox="-50 -10 400 320" className="mx-auto w-full max-w-sm">
      {[25, 50, 75, 100].map((r) => <polygon key={r} points={keys.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="var(--border)" />)}
      <polygon points={poly(them)} fill="var(--muted-foreground)" fillOpacity="0.12" stroke="var(--muted-foreground)" strokeDasharray="4 4" />
      <polygon points={poly(you)} fill="var(--fix)" fillOpacity="0.25" stroke="var(--fix)" strokeWidth="2" />
      {keys.map((k, i) => { const [x, y] = pt(i, 125); return <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="var(--foreground)">{k}</text>; })}
    </svg>
  );
}
