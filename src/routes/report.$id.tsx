import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowUpRight, Check, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createCheckout, verifyCheckout } from "@/lib/checkout.functions";
import { gradeColor, Header } from "@/components/Brand";
import { areaScores, benchmarkFindings, evaluate, gradeOf, PRICE_BUNDLE, PRICE_DIY, PRICE_PER_FIX, projectFindings, scoreOf, topProblems, TRADES, type Area, type Finding } from "@/lib/audit";
import { runAgent } from "@/lib/agent";
import { diyInstructions } from "@/lib/diy";
import { getBusiness } from "@/lib/places.functions";
import { photoOf, TRADE_PHOTOS, type Business } from "@/lib/sample";

export const Route = createFileRoute("/report/$id")({
  loader: async ({ params }) => {
    const b = await getBusiness({ data: { id: params.id } });
    if (!b) throw notFound();
    return { b };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.b.name} report · FixFirst` : "Report · FixFirst" },
      { name: "description", content: "Your letter grade, nearby competitors, an illustrative best-in-class benchmark and the fixes that matter." },
      { property: "og:title", content: loaderData ? `${loaderData.b.name}'s FixFirst grade` : "FixFirst report" },
      { property: "og:description", content: "Compare your profile with local rivals and preview how improvements could change your grade." },
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
  const benchmark = areaScores(benchmarkFindings(b.trade));
  const comps = b.competitors.map((c) => {
    const f = evaluate(b.trade, c.signals, c.name);
    return { ...c, score: scoreOf(f), areas: areaScores(f) };
  }).sort((a, c) => c.score - a.score);
  const problems = topProblems(b.live ? findings.filter((f) => f.id !== "replies") : findings);
  const [selected, setSelected] = useState<string[]>([]);
  const projected = projectFindings(findings, selected);
  const projectedScore = scoreOf(projected);
  const projectedGrade = gradeOf(projectedScore);
  const projectedAreas = areaScores(projected);
  const [paidItems, setPaidItems] = useState<string[]>([]);
  const [pendingSession, setPendingSession] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const verify = useServerFn(verifyCheckout);
  const all = paidItems.includes("all");
  const diy = paidItems.includes("diy");

  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("session_id");
    if (sid) setPendingSession(sid);
  }, [b.id]);

  useEffect(() => {
    if (!pendingSession) return;
    let active = true;
    let attempts = 0;
    const check = async () => {
      attempts += 1;
      try {
        const r = await verify({ data: { sessionId: pendingSession } });
        if (active && r.paid && r.businessId === b.id && r.item) {
          const item = r.item;
          setPaidItems((items) => items.includes(item) ? items : [...items, item]);
          setPendingSession(null);
          setPaymentMessage("Payment confirmed. Your purchase is ready below.");
          window.history.replaceState(null, "", window.location.pathname);
        }
      } catch {
        if (active) setPaymentMessage("Payment confirmation is taking a little longer. Please keep this page open.");
      }
      if (active && attempts >= 100) {
        setPendingSession(null);
        setPaymentMessage("Payment has not been confirmed. If you completed checkout, return using the link on the payment page.");
      }
    };
    void check();
    const interval = setInterval(check, 3000);
    return () => { active = false; clearInterval(interval); };
  }, [pendingSession, b.id, verify]);

  const downloadDIY = () => {
    const text = `${b.name}\nFixFirst DIY pack\n\n` + problems.map((f) => `${f.title}\n${f.evidence}\n\n${diyInstructions(f, b.trade).map((s, i) => `${i + 1}. ${s}`).join("\n")}\n`).join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "fixfirst-diy-pack.txt"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-40">
        <Button asChild variant="link" className="h-auto px-0 py-2"><Link to="/"><ArrowLeft />Try another business</Link></Button>
        <section className="animate-rise pt-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{TRADES[b.trade].label} · {b.area}</p>
          <h1 className="mt-2 break-words text-4xl font-semibold md:text-6xl">{b.name}</h1>
          <div className="mt-8 grid items-center gap-8 border-y border-border py-8 sm:grid-cols-[auto_1fr]">
            <Gauge score={score} grade={grade} />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Your overall grade</p>
              <h2 className="mt-3 text-3xl font-semibold">{grade === "A" ? "A strong profile, with room to stay ahead." : "A clearer path to a stronger profile."}</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">Your grade is {grade}, based on reputation, response, visuals, profile and credentials, weighted for {TRADES[b.trade].label.toLowerCase()}.</p>
              {b.live && <p className="mt-3 max-w-xl text-xs text-muted-foreground">Provisional audit from public Google data. Replies, post activity and photo dates are not available, while review activity and profile completeness use partial data. This is not a Google ranking or a measure of customer clicks.</p>}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {(Object.keys(areas) as Area[]).map((area) => <div key={area} className="border-b border-border pb-4"><p className="text-sm text-muted-foreground">{area}</p><p className={`mt-2 font-display text-4xl font-semibold ${gradeColor(gradeOf(areas[area]))}`}>{gradeOf(areas[area])}</p></div>)}
          </div>
        </section>

        <section className="mt-12 border-y border-border py-8" id="pricing">
          <h2 className="text-2xl font-semibold">Choose how you want to fix it</h2>
          <p className="mt-2 text-muted-foreground">One payment, never a subscription. Your scan and findings stay free.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <p className="font-medium">Free scan</p><p className="font-display text-3xl font-semibold">Free</p>
              <p className="flex-1 text-sm text-muted-foreground">Your grade, nearby rivals and the problems worth fixing.</p>
              <p className="flex items-center gap-2 text-sm text-grade-a"><Check className="h-4 w-4" />Your report is ready</p>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium">DIY pack</p><p className="font-display text-3xl font-semibold">£{PRICE_DIY.toFixed(2)}</p>
              <p className="flex-1 text-sm text-muted-foreground">A downloadable, step-by-step guide to every finding in your report. You make the changes.</p>
              {diy ? <Button onClick={downloadDIY} variant="outline"><Download />Download DIY pack</Button> : <PayButton b={b} item="diy" label="DIY pack" onSession={setPendingSession} variant="outline">Get my DIY pack · £{PRICE_DIY.toFixed(2)}</PayButton>}
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium">Fix it for me</p><p className="font-display text-3xl font-semibold"><span className="mr-2 text-lg text-muted-foreground line-through">£49.99</span>£{PRICE_BUNDLE.toFixed(2)}</p>
              <p className="flex-1 text-sm text-muted-foreground">The agent prepares every fix, or choose one below for £{PRICE_PER_FIX.toFixed(2)}.</p>
              {all ? <p className="text-grade-a">Your agent drafts are unlocked below.</p> : <PayButton b={b} item="all" label="Every fix" onSession={setPendingSession}>Fix it for me · £{PRICE_BUNDLE.toFixed(2)}</PayButton>}
            </div>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Test payments only. Agent output is currently a draft preview, not automatic changes to your Google profile. No real money is charged.</p>
          {pendingSession && <p role="status" className="mt-3 text-sm">Complete the secure payment in the new tab, then return here.</p>}
          {paymentMessage && <p role="status" className="mt-3 text-sm">{paymentMessage}</p>}
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">You, your nearby rivals, and best-in-class</h2>
          <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2">
            {[{ name: b.name, score, category: "You", photo: photoOf(b) }, ...comps.map((c) => ({ name: c.name, score: c.score, category: "Nearby rival", photo: c.photo ?? TRADE_PHOTOS[b.trade] })), { name: `Best-in-class ${TRADES[b.trade].label.toLowerCase()}`, score: scoreOf(benchmarkFindings(b.trade)), category: "Illustrative benchmark", photo: TRADE_PHOTOS[b.trade] }].map((c) => {
              const g = gradeOf(c.score);
              return <div key={c.name} className={`w-56 shrink-0 snap-start overflow-hidden rounded-lg border bg-card ${c.category === "You" ? "border-ink" : "border-border"}`}>
                <img src={c.photo} alt="" loading="lazy" width={400} height={200} className="h-32 w-full object-cover" />
                <div className="p-4"><p className="text-xs text-muted-foreground">{c.category}</p><div className="mt-2 flex items-start justify-between gap-3"><p className="break-words font-medium leading-tight">{c.name}</p><p className={`shrink-0 font-display text-4xl font-bold ${gradeColor(g)}`}>{g}</p></div></div>
              </div>;
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{b.live ? "Nearby profiles are from Google. " : "Nearby profiles are demo data. "}The A-grade benchmark is an illustrative {TRADES[b.trade].label.toLowerCase()} profile, not a real business or a local rival.</p>
        </section>

        <section className="mt-16 grid items-center gap-10 md:grid-cols-2">
          <Radar you={selected.length ? projectedAreas : areas} them={benchmark} />
          <div>
            <h2 className="text-2xl font-semibold">What best-in-class looks like</h2>
            <div className="mt-5 grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-3 text-sm">
              <span /><span className="text-muted-foreground">You</span><span className="text-muted-foreground">Target</span>
              {(Object.keys(areas) as Area[]).map((a) => <div key={a} className="contents"><span>{a}</span><span className={`font-semibold ${gradeColor(gradeOf(areas[a]))}`}>{gradeOf(areas[a])}</span><span className="font-semibold text-grade-a">A</span></div>)}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{TRADES[b.trade].minPhotos} useful photos of {TRADES[b.trade].expectedPhotos}, a clear description, real credentials explained simply, and a steady flow of honest reviews.</p>
          </div>
        </section>

        <section className="mt-16 border-y border-border py-8">
          <div className="grid gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-3xl font-semibold">See what could change</h2>
              <p className="mt-3 text-sm text-muted-foreground">Projected grade if each selected improvement meets its benchmark, not a live update or a promise of more customers.</p>
              <div className="mt-6 space-y-4">
                {findings.filter((f) => f.score < 1 && (!b.live || f.id !== "replies")).map((f) => <label key={f.id} className="flex cursor-pointer items-start gap-3 text-sm"><Checkbox aria-label={f.title} checked={selected.includes(f.id)} onCheckedChange={(checked) => setSelected((ids) => checked === true ? [...ids, f.id] : ids.filter((id) => id !== f.id))} /><span>{f.after}</span></label>)}
              </div>
              <Button variant="ghost" className="mt-4" disabled={!selected.length} onClick={() => setSelected([])}><RotateCcw />Reset improvements</Button>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="mb-3 text-sm text-muted-foreground">Projected overall grade</p>
              <Gauge score={projectedScore} grade={projectedGrade} />
              <p role="status" className="mt-3 text-sm">{selected.length ? `${grade} → ${projectedGrade}` : `Current grade: ${grade}`}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">{(Object.keys(projectedAreas) as Area[]).map((a) => <span key={a}>{a} <b className={gradeColor(gradeOf(projectedAreas[a]))}>{gradeOf(projectedAreas[a])}</b></span>)}</div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold md:text-4xl">The {problems.length} things costing you the most</h2>
          <div className="mt-8 space-y-6">{problems.map((f, i) => <ProblemCard key={f.id} f={f} n={i + 1} b={b} autoRun={all || paidItems.includes(f.id)} onSession={setPendingSession} />)}</div>
        </section>
      </main>
      {!all && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3"><p className="text-sm text-muted-foreground">Free scan · DIY £{PRICE_DIY.toFixed(2)} · Agent £{PRICE_BUNDLE.toFixed(2)}</p><PayButton b={b} item="all" label="Every fix" onSession={setPendingSession}>Fix it for me · £{PRICE_BUNDLE.toFixed(2)}</PayButton></div></div>}
    </div>
  );
}

function PayButton({ b, item, label, children, onSession, variant = "default" }: { b: Business; item: string; label: string; children: React.ReactNode; onSession: (id: string) => void; variant?: "default" | "outline" }) {
  const go = useServerFn(createCheckout);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  return <div>
    <Button disabled={busy} variant={variant} className="h-auto min-h-10 w-full whitespace-normal py-3" onClick={async () => {
      // Open synchronously so browsers do not block the tab after the async RPC.
      const tab = window.open("about:blank", "_blank");
      if (tab) {
        tab.opener = null;
        tab.document.title = "Opening secure payment · FixFirst";
        tab.document.body.textContent = "Opening your secure Stripe payment page. Please keep this tab open.";
      }
      setBusy(true); setErr(null); setCheckoutUrl(null);
      try {
        const r = await go({ data: { businessId: b.id, businessName: b.name, item, label } });
        if (r.url) {
          setCheckoutUrl(r.url);
          if (r.sessionId) onSession(r.sessionId);
          if (tab) tab.location.replace(r.url);
          else setErr("Your browser blocked the new tab. Open secure payment using the link below.");
        } else { tab?.close(); setErr(r.error); }
      } catch { tab?.close(); setErr("We could not open the payment page. Please try again."); }
      setBusy(false);
    }}>{busy ? "Opening secure payment…" : children}<ArrowUpRight /></Button>
    {err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}
    {checkoutUrl && <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm underline underline-offset-4">Open secure payment in a new tab ↗</a>}
  </div>;
}

function ProblemCard({ f, n, b, autoRun, onSession }: { f: Finding; n: number; b: Business; autoRun: boolean; onSession: (id: string) => void }) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [step, setStep] = useState(0);
  const [showAfter, setShowAfter] = useState(false);
  const [copied, setCopied] = useState(false);
  const run = runAgent(f.fix, b);
  useEffect(() => { if (autoRun && state === "idle") setState("running"); }, [autoRun, state]);
  useEffect(() => {
    if (state !== "running") return;
    if (step >= run.steps.length) { setState("done"); setShowAfter(true); return; }
    const to = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(to);
  }, [state, step, run.steps.length]);
  return <article className="animate-rise grid gap-8 rounded-lg border border-border bg-card p-6 md:grid-cols-[1.1fr_1fr] md:p-8">
    <div>
      <p className="text-xs text-muted-foreground">0{n} · {f.area}</p>
      <h3 className="mt-3 text-2xl font-semibold">{f.title}</h3>
      <p className="mt-3"><span className="text-muted-foreground">Evidence: </span>{f.evidence}</p>
      <p className="mt-2 text-muted-foreground">{f.impact}</p>
      {state === "idle" && <div className="mt-6"><PayButton b={b} item={f.id} label={f.title} onSession={onSession}>Agent fix · £{PRICE_PER_FIX.toFixed(2)}</PayButton></div>}
      {state !== "idle" && <ul className="mt-6 space-y-1.5 text-xs">{run.steps.map((s, i) => <li key={s} className={i < step ? "text-fix" : "text-muted-foreground"}>{i < step ? "✓" : "○"} {s}</li>)}</ul>}
    </div>
    <div className="flex flex-col">
      <div className="inline-flex self-start gap-1 text-xs">{(["Before", "After"] as const).map((l) => <Button key={l} size="sm" variant={showAfter === (l === "After") ? "secondary" : "ghost"} onClick={() => setShowAfter(l === "After")}>{l}</Button>)}</div>
      <div className={`mt-3 flex-1 rounded-lg p-5 text-sm ${showAfter ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
        {!showAfter && <p>{f.before}</p>}
        {showAfter && state !== "done" && <p>{f.after}</p>}
        {showAfter && state === "done" && (f.fix === "website" ? <div><p className="font-medium">Your draft website is ready to preview.</p><Button asChild className="mt-3"><Link to="/site/$id" params={{ id: b.id }} target="_blank">Preview website<ArrowUpRight /></Link></Button></div> : <div><pre className="max-h-72 overflow-auto whitespace-pre-wrap font-sans">{run.output}</pre><Button className="mt-4" onClick={async () => { try { await navigator.clipboard.writeText(run.output); setCopied(true); } catch { setCopied(false); } }}>{copied ? "Copied ✓" : "Copy draft"}</Button></div>)}
      </div>
    </div>
  </article>;
}

function Gauge({ score, grade }: { score: number; grade: ReturnType<typeof gradeOf> }) {
  const [v, setV] = useState(0);
  useEffect(() => { const to = setTimeout(() => setV(score), 150); return () => clearTimeout(to); }, [score]);
  const r = 88, c = 2 * Math.PI * r;
  return <div className="relative h-48 w-48 shrink-0">
    <svg viewBox="0 0 200 200" aria-hidden="true" className="h-full w-full -rotate-90"><circle cx="100" cy="100" r={r} fill="none" stroke="var(--secondary)" strokeWidth="14" /><circle cx="100" cy="100" r={r} fill="none" stroke={`var(--grade-${grade.toLowerCase()})`} strokeWidth="14" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} className="transition-all duration-700 motion-reduce:transition-none" /></svg>
    <div className="absolute inset-0 grid place-items-center"><p className={`font-display text-7xl font-bold leading-none ${gradeColor(grade)}`}>{grade}</p></div>
  </div>;
}

function Radar({ you, them }: { you: Record<Area, number>; them: Record<Area, number> }) {
  const keys = Object.keys(you) as Area[];
  const pt = (i: number, v: number) => { const a = (Math.PI * 2 * i) / keys.length - Math.PI / 2; return [150 + Math.cos(a) * v * 1.1, 150 + Math.sin(a) * v * 1.1]; };
  const poly = (d: Record<Area, number>) => keys.map((k, i) => pt(i, d[k]).join(",")).join(" ");
  return <div><svg viewBox="-50 -10 400 320" role="img" aria-label="Your profile compared with the illustrative A-grade benchmark" className="mx-auto w-full max-w-sm">{[25, 50, 75, 100].map((r) => <polygon key={r} points={keys.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="var(--border)" />)}<polygon points={poly(them)} fill="var(--grade-a)" fillOpacity="0.12" stroke="var(--grade-a)" strokeDasharray="4 4" /><polygon points={poly(you)} fill="var(--fix)" fillOpacity="0.25" stroke="var(--fix)" strokeWidth="2" />{keys.map((k, i) => { const [x, y] = pt(i, 125); return <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="var(--foreground)">{k}</text>; })}</svg><p className="text-center text-xs"><span className="text-fix">Your profile / projection</span> · <span className="text-grade-a">A-grade benchmark</span></p></div>;
}
