import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowUpRight, Check, Copy, Download, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createCheckout, verifyCheckout } from "@/lib/checkout.functions";
import { gradeColor, Header } from "@/components/Brand";
import { assessedAreaScores, cappedGrade, evaluate, gradeOf, PRICE_BUNDLE, PRICE_DIY, WAS_BUNDLE, WAS_DIY, projectFindings, scoreOf, topProblems, TRADES, type Area, type Finding } from "@/lib/audit";
import { AGENT_ACTION, runAgent } from "@/lib/agent";
import { sopFor } from "@/lib/diy";
import { SCREEN_NOTE, TOOLS_DISCLAIMER, type UiScreen } from "@/lib/sop-visuals";

function ScreenDiagram({ s }: { s: UiScreen }) {
  return <figure className="overflow-hidden rounded-lg border border-border bg-background">
    <div className="flex items-center gap-2 border-b border-border bg-secondary px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /><span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
      <span className="ml-2 truncate rounded bg-background px-2 py-0.5 text-[11px] text-muted-foreground">{s.url}</span>
    </div>
    <div className="space-y-2 p-3">
      <p className="text-xs font-semibold">{s.title}</p>
      {s.rows.map((r) => <div key={r.text} className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-xs ${r.kind === "button" ? "border border-border" : r.kind === "field" ? "border border-dashed border-border bg-secondary" : "text-muted-foreground"} ${r.mark ? "ring-2 ring-fix" : ""}`}>
        {r.mark && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-fix text-[10px] font-bold text-fix-foreground">{r.mark}</span>}
        <span className="truncate">{r.text}</span>
      </div>)}
    </div>
    <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">{s.caption}</figcaption>
  </figure>;
}
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
      { name: "description", content: "Your evidence-based letter grade, nearby competitors, real city reference businesses and the fixes that matter." },
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
  const findings = evaluate(b.trade, b.signals, b.name, b.live);
  const score = scoreOf(findings);
  const grade = cappedGrade(findings);
  const areas = assessedAreaScores(findings);
  const areaList: Area[] = b.live ? ["Reputation", "Visuals", "Profile", "Credentials"] : ["Reputation", "Response", "Visuals", "Profile", "Credentials"];
  const reference = b.reference;
  const referenceBusiness = reference?.business;
  const referenceFindings = referenceBusiness ? evaluate(b.trade, referenceBusiness.signals, referenceBusiness.name, true) : [];
  const benchmark = referenceBusiness ? assessedAreaScores(referenceFindings) : null;
  const comps = b.competitors.map((c) => {
    const f = evaluate(b.trade, c.signals, c.name, b.live);
    return { ...c, score: scoreOf(f), grade: cappedGrade(f), areas: assessedAreaScores(f) };
  }).sort((a, c) => c.score - a.score);
  const problems = topProblems(b.live ? findings.filter((f) => f.id !== "replies") : findings);
  const [selected, setSelected] = useState<string[]>([]);
  const projected = projectFindings(findings, selected);
  const projectedScore = scoreOf(projected);
  const projectedGrade = cappedGrade(projected);
  const allClear = problems.length === 0;
  const projectedAreas = assessedAreaScores(projected);
  const [paidItems, setPaidItems] = useState<string[]>([]);
  const [pendingSession, setPendingSession] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const verify = useServerFn(verifyCheckout);
  const all = paidItems.includes("all");
  const diy = paidItems.includes("diy");

  useEffect(() => {
    // Restore a previously verified purchase so returning owners keep their unlock.
    try {
      const saved = window.localStorage.getItem(`fixfirst-paid-${b.id}`);
      if (saved) setPaidItems(JSON.parse(saved) as string[]);
    } catch { /* private mode etc. */ }
    const sid = new URLSearchParams(window.location.search).get("session_id");
    if (sid) setPendingSession(sid);
  }, [b.id]);

  useEffect(() => {
    if (!paidItems.length) return;
    try { window.localStorage.setItem(`fixfirst-paid-${b.id}`, JSON.stringify(paidItems)); } catch { /* ignore */ }
  }, [paidItems, b.id]);

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

  const [pdfBusy, setPdfBusy] = useState(false);
  const downloadDIY = async () => {
    setPdfBusy(true);
    try {
      const { buildReportPdf } = await import("@/lib/report-pdf");
      const blob = await buildReportPdf({
        name: b.name, address: b.address, tradeLabel: TRADES[b.trade].label, trade: b.trade, grade,
        areas: areaList.filter((a) => areas[a] !== undefined).map((a) => ({ area: a, grade: gradeOf(areas[a]!) })),
        rivals: comps.map((c) => ({ name: c.name, grade: c.grade })),
        findings: problems, sops: problems.map((f) => sopFor(f, b.trade, b.name)),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${b.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-fixfirst-pack.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } finally { setPdfBusy(false); }
  };

  const downloadReport = () => {
    const lines = [`${b.name}`, `${b.address}`, `FixFirst free report · ${TRADES[b.trade].label}`, "", `Overall grade: ${grade}`,
      ...areaList.filter((a) => areas[a] !== undefined).map((a) => `${a}: ${gradeOf(areas[a]!)}`),
      "", "Nearby rivals:", ...comps.map((c) => `- ${c.name}: ${c.grade}`),
      "", problems.length ? "What is costing you the most:" : "Nothing to fix on the public profile. Ideas to stay ahead:",
      ...(problems.length ? problems.map((f, i) => `${i + 1}. ${f.title}\n   ${f.evidence}\n   ${f.impact}`) : extraTips(b.trade).map((t) => `- ${t.title}: ${t.body}`)),
      "", "FixFirst by Quietcrew · https://quietcrew.ai/"];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "fixfirst-free-report.txt"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-40">
        <Button asChild variant="link" className="h-auto px-0 py-2"><Link to="/"><ArrowLeft />Try another business</Link></Button>
        <section className="animate-rise pt-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{TRADES[b.trade].label} · {b.area}</p>
          {b.address && <p className="mt-1 text-sm text-muted-foreground">{b.address}{b.phone ? ` · ${b.phone}` : ""}</p>}
          <h1 className="mt-2 break-words text-4xl font-semibold md:text-6xl">{b.name}</h1>
          <div className="mt-8 grid items-center gap-8 border-y border-border py-8 sm:grid-cols-[auto_1fr]">
            <Gauge score={score} grade={grade} />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Your overall grade</p>
              <h2 className="mt-3 text-3xl font-semibold">{allClear ? "Nothing to fix in the public profile we can see." : grade === "A" ? "A strong profile, with room to stay ahead." : "A clearer path to a stronger profile."}</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">Your grade is {grade}, based on {b.live ? "customer rating, review volume, how recent the newest review is, photos you upload yourself, website, opening hours and the credentials named on your own website" : "reputation, response, visuals, profile and credentials"}, weighted for {TRADES[b.trade].label.toLowerCase()}.</p>
              {b.live && <p className="mt-3 max-w-xl text-xs text-muted-foreground">Public-profile grade, not a rating of service quality or a Google ranking. Every point comes from Google or your own website. Owner replies to reviews are not graded because Google does not publish them. We only show areas we can actually grade from this evidence.</p>}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {areaList.filter((area) => areas[area] !== undefined).map((area) => { const value = areas[area]; return <div key={area} className="border-b border-border pb-4"><p className="text-sm text-muted-foreground">{area}</p>{value === undefined ? <p className="mt-2 text-sm text-muted-foreground">Not assessed</p> : <p className={`mt-2 font-display text-4xl font-semibold ${gradeColor(gradeOf(value))}`}>{gradeOf(value)}</p>}</div>; })}
          </div>
        </section>

        {allClear ? <section className="mt-12 border-y border-border py-8"><p className="flex items-center gap-2 text-grade-a"><Check className="h-5 w-5" />All clear</p><h2 className="mt-2 text-2xl font-semibold">Every public signal we can check already meets the standard</h2><p className="mt-2 max-w-2xl text-muted-foreground">There is nothing for a DIY pack or the agent to fix, so we will not ask you to pay for anything. There is always room to grow, though, and these habits are what keep the strongest {TRADES[b.trade].label.toLowerCase()} businesses ahead in areas Google does not show us.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">{extraTips(b.trade).map((t) => <li key={t.title} className="border-l-2 border-fix pl-4"><p className="font-medium">{t.title}</p><p className="mt-1 text-sm text-muted-foreground">{t.body}</p></li>)}</ul>
          {reference?.entry && <div className="mt-6 rounded-lg border border-border bg-card p-5"><p className="text-xs text-muted-foreground">A strong {reference.entry.city} profile we keep for comparison</p><p className="mt-1 text-lg font-semibold">{reference.entry.name}</p><p className="mt-1 text-sm text-muted-foreground">A real local business we picked as a reference. It is worth looking at how they present their services, photos and replies to reviews.</p><Button asChild variant="link" className="h-auto px-0"><a href={reference.entry.website} target="_blank" rel="noopener noreferrer">See their profile<ArrowUpRight /></a></Button></div>}</section> : <section className="mt-12 border-y border-border py-8" id="pricing">
          <h2 className="text-2xl font-semibold">Choose how you want to fix it</h2>
          <p className="mt-2 text-muted-foreground">Your scan stays free. Each paid option covers your whole report at a fixed price, however many fixes you need, with no subscription.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <p className="font-medium">Free scan</p><p className="font-display text-3xl font-semibold">Free</p>
              <p className="flex-1 text-sm text-muted-foreground">Your grade, nearby rivals and the problems worth fixing.</p>
              <p className="flex items-center gap-2 text-sm text-grade-a"><Check className="h-4 w-4" />Your report is ready</p>
              <Button onClick={downloadReport} className="h-auto min-h-10 w-full whitespace-normal py-3"><Download />Download free report</Button>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium">DIY pack</p><p className="font-display text-3xl font-semibold"><span className="mr-2 text-lg text-muted-foreground line-through">£{WAS_DIY.toFixed(2)}</span>£{PRICE_DIY.toFixed(2)}</p>
              <p className="flex-1 text-sm text-muted-foreground">A downloadable, step-by-step guide to every finding in your report. You make the changes.</p>
              {diy ? <Button onClick={downloadDIY} disabled={pdfBusy} className="h-auto min-h-10 w-full whitespace-normal py-3"><Download />{pdfBusy ? "Preparing PDF..." : "Download full PDF report"}</Button> : <PayButton b={b} item="diy" label="DIY pack" onSession={setPendingSession}>Get my DIY pack · £{PRICE_DIY.toFixed(2)}</PayButton>}
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-medium">Done for you</p><p className="font-display text-3xl font-semibold"><span className="mr-2 text-lg text-muted-foreground line-through">£{WAS_BUNDLE.toFixed(2)}</span>£{PRICE_BUNDLE.toFixed(2)}</p>
              <p className="flex-1 text-sm text-muted-foreground">The agent prepares all the fixes in your report for one fixed price.</p>
              {all ? <p className="text-grade-a">Your agent drafts are unlocked below.</p> : <PayButton b={b} item="all" label="Every fix" onSession={setPendingSession}>Fix it for me · £{PRICE_BUNDLE.toFixed(2)}</PayButton>}
            </div>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Secure one-off payment through Stripe. Agent output is currently a draft preview, not automatic changes to your Google profile.</p>
          {pendingSession && <p role="status" className="mt-3 text-sm">Complete the secure payment in the new tab, then return here.</p>}
          {paymentMessage && <p role="status" className="mt-3 text-sm">{paymentMessage}</p>}
        </section>}

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">You, your nearby rivals, and a real reference</h2>
          <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2">
            {[{ name: b.name, score, grade, category: "You", photo: photoOf(b) }, ...comps.map((c) => ({ name: c.name, score: c.score, grade: c.grade, category: "Nearby rival", photo: c.photo ?? TRADE_PHOTOS[b.trade] })), ...(referenceBusiness ? [{ name: referenceBusiness.name, score: scoreOf(referenceFindings), grade: cappedGrade(referenceFindings), category: `${reference?.entry?.city} reference`, photo: photoOf(referenceBusiness) }] : [])].map((c) => {
              const g = c.grade;
              return <div key={c.name} className={`w-56 shrink-0 snap-start overflow-hidden rounded-lg border bg-card ${c.category === "You" ? "border-ink" : "border-border"}`}>
                <img src={c.photo} alt="" loading="lazy" width={400} height={200} className="h-32 w-full object-cover" />
                <div className="p-4"><p className="text-xs text-muted-foreground">{c.category}</p><div className="mt-2 flex items-start justify-between gap-3"><p className="break-words font-medium leading-tight">{c.name}</p><p className={`shrink-0 font-display text-4xl font-bold ${gradeColor(g)}`}>{g}</p></div></div>
              </div>;
            })}
          </div>
          {reference?.entry && !referenceBusiness && <article className="mt-4 rounded-lg border border-border bg-card p-5"><p className="text-xs text-muted-foreground">{reference.entry.city} · Real reference business</p><h3 className="mt-2 text-xl font-semibold">{reference.entry.name}</h3><p className="mt-2 text-sm text-muted-foreground">Grade not verified</p><Button asChild variant="link" className="h-auto px-0"><a href={reference.entry.source} target="_blank" rel="noopener noreferrer">View selection source<ArrowUpRight /></a></Button></article>}
          {reference?.entry && <div className="mt-4 border-l-2 border-border pl-4"><p className="font-medium">{reference.entry.name} · {reference.entry.city} reference</p><p className="mt-1 text-sm text-muted-foreground">Selected once as a real {TRADES[b.trade].label.toLowerCase()} example, not an official city ranking. {referenceBusiness ? "Its grade uses the same public evidence as yours." : "Its public-profile grade has not been verified, so no A grade or best-in-class claim is made."}</p><Button asChild variant="link" className="h-auto px-0"><a href={reference.entry.website} target="_blank" rel="noopener noreferrer">Visit this business<ArrowUpRight /></a></Button>{referenceBusiness && <Button asChild variant="link"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(referenceBusiness.name)}&query_place_id=${encodeURIComponent(referenceBusiness.id.split(".").slice(2).join("."))}`} target="_blank" rel="noopener noreferrer">View on Google Maps<ArrowUpRight /></a></Button>}</div>}
          <p className="mt-3 text-xs text-muted-foreground">{b.live ? "Business information from Google Maps. " : "Nearby profiles are demo data. "}{reference?.checkedAt ? `Reference evidence retrieved ${new Date(reference.checkedAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}. ` : ""}{!reference && "No curated reference is available for this location yet; no fictional business is substituted."}</p>
        </section>

        {benchmark && <section className="mt-16 grid items-center gap-10 md:grid-cols-2">
          <Radar you={selected.length ? projectedAreas : areas} them={benchmark} />
          <div>
            <h2 className="text-2xl font-semibold">How you compare with {referenceBusiness?.name}</h2>
            <div className="mt-5 grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-3 text-sm">
              <span /><span className="text-muted-foreground">You</span><span className="text-muted-foreground">Reference</span>
              {(Object.keys(areas) as Area[]).filter((a) => areas[a] !== undefined && benchmark[a] !== undefined).map((a) => { const you = areas[a]; const target = benchmark[a]; return <div key={a} className="contents"><span>{a}</span><span className="font-semibold">{you === undefined ? "Not assessed" : gradeOf(you)}</span><span className="font-semibold">{target === undefined ? "Not assessed" : gradeOf(target)}</span></div>; })}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">These grades compare public profiles, not workmanship or credentials. Unavailable fields are excluded for both businesses.</p>
          </div>
        </section>}

        {!allClear && <section className="mt-16 border-y border-border py-8">
          <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
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
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">{(Object.keys(projectedAreas) as Area[]).map((a) => { const value = projectedAreas[a]; return value === undefined ? null : <span key={a}>{a} <b className={gradeColor(gradeOf(value))}>{gradeOf(value)}</b></span>; })}</div>
            </div>
          </div>
        </section>}

        {!allClear && <section className="mt-16">
          <h2 className="text-3xl font-semibold md:text-4xl">The {problems.length} things costing you the most</h2>
          <div className="mt-8 space-y-6">{problems.map((f, i) => <ProblemCard key={f.id} f={f} n={i + 1} b={b} autoRun={all} />)}</div>
        </section>}

        {!allClear && <section className="mt-16 border-t border-border pt-12" id="diy">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold md:text-4xl">How to fix it yourself, step by step</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">A standard operating procedure for every finding above: exactly where to click, what to type, word-for-word scripts, and the links you need. Written for someone who has never done this before.</p>
            </div>
          </div>
          {diy ? (
            <>
            <div className="sticky top-2 z-30 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-fix bg-card p-4 shadow-lg">
              <p className="text-sm"><span className="font-semibold">Your DIY pack is unlocked.</span> <span className="text-muted-foreground">Download the full report and every guide as one searchable PDF with clickable contents.</span></p>
              <Button onClick={downloadDIY} disabled={pdfBusy}><Download />{pdfBusy ? "Preparing PDF..." : "Download full PDF report"}</Button>
            </div>
            <div className="mt-8 space-y-6">{problems.map((f, i) => <SopCard key={f.id} f={f} n={i + 1} b={b} />)}</div>
            </>
          ) : (
            <div className="relative mt-8">
              <div className="pointer-events-none select-none space-y-6 blur-md" aria-hidden="true">
                {problems.slice(0, 2).map((f, i) => <SopCard key={f.id} f={f} n={i + 1} b={b} />)}
              </div>
              <div className="absolute inset-0 grid place-items-center rounded-lg bg-background/40">
                <div className="mx-4 max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
                  <Lock className="mx-auto h-8 w-8 text-fix" />
                  <p className="mt-4 text-xl font-semibold">Unlock the full DIY pack</p>
                  <p className="mt-2 text-sm text-muted-foreground">{problems.length} detailed SOP{problems.length === 1 ? "" : "s"} for your report, with exact clicks, scripts and links. One-off payment, no subscription.</p>
                  <div className="mt-5"><PayButton b={b} item="diy" label="DIY pack" onSession={setPendingSession}>Unlock DIY pack · £{PRICE_DIY.toFixed(2)} <s className="ml-1 text-xs opacity-70">£{WAS_DIY.toFixed(2)}</s></PayButton></div>
                  <p className="mt-3 text-xs text-muted-foreground">Prefer not to do it yourself? Choose Fix it for me above and our AI agent does the work.</p>
                </div>
              </div>
            </div>
          )}
        </section>}
      </main>
      {!all && !allClear && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3"><p className="text-sm text-muted-foreground">Free scan · DIY <s>£{WAS_DIY.toFixed(2)}</s> £{PRICE_DIY.toFixed(2)} · Agent <s>£{WAS_BUNDLE.toFixed(2)}</s> £{PRICE_BUNDLE.toFixed(2)} launch prices</p><PayButton b={b} item="all" label="Every fix" onSession={setPendingSession}>Fix it for me · £{PRICE_BUNDLE.toFixed(2)}</PayButton></div></div>}
    </div>
  );
}

function PayButton({ b, item, label, children, onSession, variant = "default" }: { b: Business; item: "diy" | "all"; label: string; children: React.ReactNode; onSession: (id: string) => void; variant?: "default" | "outline" }) {
  const go = useServerFn(createCheckout);
  const [err, setErr] = useState<string | null>(null);
  const [session, setSession] = useState<{ url: string; id: string | undefined } | null>(null);
  // Prepare the Stripe session up front so the button is a real link: a direct
  // click on a link opens Stripe in a new tab reliably, including inside the preview.
  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const attempt = () => {
      tries += 1;
      // If a call stalls (for example during an app update), retry instead of spinning forever.
      const stall = setTimeout(() => { if (!cancelled && tries < 3) attempt(); else if (!cancelled) setErr("We could not prepare the payment page. Please refresh and try again."); }, 10000);
      go({ data: { businessId: b.id, businessName: b.name, item, label, origin: window.location.origin } })
        .then((r) => {
          clearTimeout(stall);
          if (cancelled) return;
          if (r.url) { setErr(null); setSession({ url: r.url, id: r.sessionId ?? undefined }); }
          else setErr(r.error ?? "We could not prepare the payment page. Please refresh and try again.");
        })
        .catch(() => { clearTimeout(stall); if (!cancelled) { if (tries < 3) setTimeout(attempt, 1500); else setErr("We could not prepare the payment page. Please refresh and try again."); } });
    };
    attempt();
    return () => { cancelled = true; };
  }, [b.id, item]); // eslint-disable-line react-hooks/exhaustive-deps
  const cls = "h-auto min-h-10 w-full whitespace-normal py-3";
  return <div>
    {session ? (
      <Button asChild variant={variant} className={cls}>
        <a href={session.url} target="_blank" rel="noopener noreferrer" onClick={() => { if (session.id) onSession(session.id); }}>
          {children}<ArrowUpRight />
        </a>
      </Button>
    ) : (
      <Button disabled variant={variant} className={cls}>{err ? children : "Preparing secure payment…"}<ArrowUpRight /></Button>
    )}
    {err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}
  </div>;
}

function ProblemCard({ f, n, b, autoRun }: { f: Finding; n: number; b: Business; autoRun: boolean }) {
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
      <div className="mt-5 rounded-lg border-l-4 border-fix bg-accent/60 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fix">Done for you by our AI agent*</p>
        <p className="mt-1 text-base font-bold leading-snug">{AGENT_ACTION[f.fix]}</p>
        <p className="mt-2 text-sm text-muted-foreground">Choose <span className="font-semibold text-foreground">Fix it for me</span> and our AI agent creates it for you, or choose the <span className="font-semibold text-foreground">DIY pack</span> to do it yourself for less.</p>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3"><dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-fix">Our AI agent creates</dt><dd className="mt-1">{handoff.created}</dd></div>
        <div className="rounded-lg border border-dashed border-border p-3"><dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Your one quick step*</dt><dd className="mt-1">{handoff.you}</dd><dd className="mt-1 text-xs text-muted-foreground">Why: {handoff.why}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">* {HANDOFF_NOTE}</p>
      {state !== "idle" && <ul className="mt-6 space-y-1.5 text-xs">{run.steps.map((s, i) => <li key={s} className={i < step ? "text-fix" : "text-muted-foreground"}>{i < step ? "✓" : "○"} {s}</li>)}</ul>}
    </div>
    <div className="flex flex-col">
      <div className="inline-flex self-start gap-1 text-xs">{(["Before", "After"] as const).map((l) => <Button key={l} size="sm" variant={showAfter === (l === "After") ? "secondary" : "ghost"} onClick={() => setShowAfter(l === "After")}>{l}</Button>)}</div>
      <div className={`mt-3 flex-1 rounded-lg p-5 text-sm ${showAfter ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
        {!showAfter && <p>{f.before}</p>}
        {showAfter && state !== "done" && <p>{f.after}</p>}
        {showAfter && state === "done" && (f.fix === "website"
          ? <div><p className="font-medium">Our AI agent has published your website.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild><Link to="/site/$id" params={{ id: b.id }} target="_blank">Open your website<ArrowUpRight /></Link></Button>
                <Button variant="outline" onClick={() => copyAndOpen(`${window.location.origin}/site/${b.id}`)}>{copied ? "Link copied ✓" : "Copy link and open Google"}<ArrowUpRight /></Button>
              </div></div>
          : <div><pre className="max-h-72 overflow-auto whitespace-pre-wrap font-sans">{run.output}</pre>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => copyAndOpen(run.output)}>{copied ? "Copied ✓ Paste it on Google" : "Copy and open Google"}<ArrowUpRight /></Button>
                {f.fix === "review-request" && link && <Button variant="outline" onClick={() => downloadReviewFlyer({ name: b.name, phone: b.phone, link })}><Download />Download QR review card</Button>}
              </div></div>)}
      </div>
    </div>
  </article>;
}

function SopCard({ f, n, b }: { f: Finding; n: number; b: Business }) {
  const sop = sopFor(f, b.trade, b.name);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (label: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); } catch { setCopied(null); }
  };
  return <article className="rounded-lg border border-border bg-card p-6 md:p-8">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs text-muted-foreground">SOP {n} · {f.area}</p>
        <h3 className="mt-2 text-2xl font-semibold">{f.title}</h3>
        <p className="mt-2 max-w-2xl text-muted-foreground">{sop.goal}</p>
      </div>
      <p className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{sop.time}</p>
    </div>
    {sop.youNeed.length > 0 && <div className="mt-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Before you start</p>
      <ul className="mt-2 space-y-1 text-sm">{sop.youNeed.map((y) => <li key={y} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-grade-a" />{y}</li>)}</ul>
    </div>}
    {sop.rootCauses && <div className="mt-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Fix the cause first</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">{sop.rootCauses.map((c) => <div key={c.theme} className="rounded-lg bg-secondary p-3 text-sm"><p className="font-medium">{c.theme}</p><p className="mt-1 text-muted-foreground">{c.fix}</p></div>)}</div>
    </div>}
    <ol className="mt-6 space-y-3">
      {sop.steps.map((s, i) => <li key={i} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-fix text-xs font-bold text-fix-foreground">{i + 1}</span><span className="pt-0.5">{s}</span></li>)}
    </ol>
    {sop.screens && <div className="mt-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">What you will see</p>
      <div className="mt-2 grid gap-4 md:grid-cols-2">{sop.screens.map((sc) => <ScreenDiagram key={sc.title} s={sc} />)}</div>
      <p className="mt-2 text-xs text-muted-foreground">{SCREEN_NOTE}</p>
    </div>}
    {sop.tools && <div className="mt-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Popular no-code tools</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">{sop.tools.map((t) => <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-2 rounded-lg border border-border p-3 text-sm hover:border-fix"><span><span className="font-medium">{t.name}</span><span className="block text-muted-foreground">{t.bestFor}</span></span><ArrowUpRight className="h-4 w-4 shrink-0" /></a>)}</div>
      <p className="mt-2 text-xs italic text-muted-foreground">{TOOLS_DISCLAIMER}</p>
    </div>}
    {sop.prompts?.map((pr) => <div key={pr.label} className="mt-6 rounded-lg border border-fix/40 bg-secondary p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{pr.label}</p>
        <Button size="sm" variant="ghost" onClick={() => copy(pr.label, pr.text)}><Copy className="h-3.5 w-3.5" />{copied === pr.label ? "Copied ✓" : "Copy prompt"}</Button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-muted-foreground">{pr.text}</pre>
      <p className="mt-3 text-xs text-muted-foreground">Fill in the [square brackets], then paste it into: {pr.openIn.map((t, i) => <span key={t.name}>{i > 0 && ", "}<a href={t.url} target="_blank" rel="noopener noreferrer" className="font-medium text-fix underline">{t.name}</a></span>)}. {sop.tools ? "" : TOOLS_DISCLAIMER}</p>
    </div>)}
    {f.fix === "website" && <p className="mt-6 rounded-lg bg-fix p-4 text-sm font-semibold text-fix-foreground">Rather not do it yourself? Choose Fix it for me and our AI agent builds your one-page website in under a minute.</p>}
    {sop.shotList && <div className="mt-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Your five-shot photo set</p>
      <ul className="mt-2 space-y-2 text-sm">{sop.shotList.map((c) => <li key={c.shot}><span className="font-medium">{c.shot}:</span> <span className="text-muted-foreground">{c.how}</span></li>)}</ul>
    </div>}
    {sop.scripts.length > 0 && <div className="mt-6 space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Word-for-word scripts</p>
      {sop.scripts.map((sc) => <div key={sc.label} className="rounded-lg bg-secondary p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{sc.label}</p>
          <Button size="sm" variant="ghost" onClick={() => copy(sc.label, sc.text)}><Copy className="h-3.5 w-3.5" />{copied === sc.label ? "Copied ✓" : "Copy"}</Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{sc.text}</p>
      </div>)}
    </div>}
    {sop.proTips.length > 0 && <div className="mt-6 border-l-2 border-fix pl-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-fix">Pro tips</p>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">{sop.proTips.map((p) => <li key={p}>{p}</li>)}</ul>
    </div>}
    {sop.guardrails && <div className="mt-6 border-l-2 border-destructive pl-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-destructive">Do not</p>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">{sop.guardrails.map((g) => <li key={g}>{g}</li>)}</ul>
    </div>}
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

function Radar({ you, them }: { you: Partial<Record<Area, number>>; them: Partial<Record<Area, number>> }) {
  const keys = Object.keys(you) as Area[];
  const pt = (i: number, v: number) => { const a = (Math.PI * 2 * i) / keys.length - Math.PI / 2; return [150 + Math.cos(a) * v * 1.1, 150 + Math.sin(a) * v * 1.1]; };
  const poly = (d: Partial<Record<Area, number>>) => keys.map((k, i) => pt(i, d[k] ?? 0).join(",")).join(" ");
  return <div><svg viewBox="-50 -10 400 320" role="img" aria-label="Your profile compared with a real reference business" className="mx-auto w-full max-w-sm">{[25, 50, 75, 100].map((r) => <polygon key={r} points={keys.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="var(--border)" />)}<polygon points={poly(them)} fill="var(--grade-a)" fillOpacity="0.12" stroke="var(--grade-a)" strokeDasharray="4 4" /><polygon points={poly(you)} fill="var(--fix)" fillOpacity="0.25" stroke="var(--fix)" strokeWidth="2" />{keys.map((k, i) => { const [x, y] = pt(i, 125); return <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="var(--foreground)">{k}</text>; })}</svg><p className="text-center text-xs"><span className="text-fix">Your profile / projection</span> · <span className="text-grade-a">Real reference profile</span></p></div>;
}

function extraTips(trade: keyof typeof TRADES) {
  const t = TRADES[trade];
  return [
    { title: "Reply to every review", body: "A short, personal owner reply within a day shows new customers you care, and praise answered is free marketing." },
    { title: "Show your credentials", body: `Mention ${t.credential} on your profile and website if you hold it. ${t.credentialPlain}` },
    { title: "Keep photos current", body: `Add fresh photos of ${t.expectedPhotos} every month or so, so the profile looks active.` },
    { title: "Post regular updates", body: "A weekly Google update about a recent job or an open slot signals you are busy and available." },
  ];
}
