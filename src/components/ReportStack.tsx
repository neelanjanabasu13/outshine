import { useEffect, useState } from "react";

// Fictitious example reports used only to illustrate the product on the homepage.
const CARDS = [
  { name: "Pipe Dreams Plumbing", town: "Leeds", grade: "C", tone: "bg-grade-c", line: "Solid reviews, but no website to send callers to.",
    rows: [["Reputation", "B"], ["Photos", "D"], ["Website", "F"]], fix: "Our AI agent builds your site in a minute*" },
  { name: "Shear Genius", town: "Brighton", grade: "D", tone: "bg-grade-d", line: "Great stylists, hidden behind six photos.",
    rows: [["Reputation", "B"], ["Photos", "F"], ["Profile", "D"]], fix: "Our AI agent writes your description*" },
  { name: "Bright Sparks Electrical", town: "Bristol", grade: "B", tone: "bg-grade-b", line: "Nearly there. Two rivals still outshine you.",
    rows: [["Reputation", "A"], ["Photos", "C"], ["Credentials", "B"]], fix: "Our AI agent drafts your review replies*" },
];

// Resting positions, front to back.
const SLOTS = [
  "translate-x-0 translate-y-0 rotate-[-3deg] z-30",
  "translate-x-[18%] -translate-y-[6%] rotate-[4deg] z-20 opacity-95",
  "translate-x-[34%] -translate-y-[10%] rotate-[9deg] z-10 opacity-90",
];

export function ReportStack() {
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setFront((f) => (f + 1) % CARDS.length), 3800);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <p className="absolute -top-7 left-0 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Example reports</p>
      {CARDS.map((c, i) => {
        const slot = (i - front + CARDS.length) % CARDS.length;
        return (
          <button key={c.name} type="button" onClick={() => setFront(i)} aria-label={`Show example report for ${c.name}`}
            className="animate-deal absolute inset-0 text-left" style={{ ["--dx" as string]: "0%", ["--r1" as string]: `${(i - 1) * 8}deg`, ["--r2" as string]: `${(1 - i) * 6}deg`, ["--wob" as string]: `${(i - 1) * 30}px`, animationDelay: `${i * 120}ms` }}>
            <div className={`h-full w-full rounded-3xl border border-border bg-card p-6 shadow-[0_30px_60px_-30px_var(--ink)] transition-all duration-700 ease-[cubic-bezier(.3,.8,.25,1)] ${SLOTS[slot]}`}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-display text-xl font-bold leading-tight">{c.name}</p><p className="text-sm text-muted-foreground">{c.town}</p></div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Example</span>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <span className={`grid h-24 w-24 shrink-0 place-items-center rounded-full font-display text-5xl font-extrabold text-ink ${c.tone}`}>{c.grade}</span>
                <p className="font-display text-lg font-semibold leading-snug">{c.line}</p>
              </div>
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {c.rows.map(([k, g]) => <li key={k} className="flex items-center justify-between py-2.5 text-sm"><span>{k}</span><span className="font-display font-bold">{g}</span></li>)}
              </ul>
              <p className="mt-5 inline-block rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground">{c.fix}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
