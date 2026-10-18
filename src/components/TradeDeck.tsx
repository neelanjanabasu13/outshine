import { useEffect, useRef, useState } from "react";
import type { Trade } from "@/lib/audit";
import plumbing from "@/assets/tile-plumbing.jpg";
import salon from "@/assets/tile-salon.jpg";
import cleaning from "@/assets/tile-cleaning.jpg";
import electrician from "@/assets/tile-electrician.jpg";
import landscaping from "@/assets/tile-landscaping.jpg";

const TILES: { trade: Trade; name: string; pun: string; img: string }[] = [
  { trade: "plumbing", name: "Plumbers", pun: "Keep the jobs flowing.", img: plumbing },
  { trade: "salon", name: "Hair & Beauty", pun: "A cut above the rest.", img: salon },
  { trade: "cleaning", name: "Cleaners", pun: "Spotless first impressions.", img: cleaning },
  { trade: "electrician", name: "Electricians", pun: "Switch on more bookings.", img: electrician },
  { trade: "landscaping", name: "Gardeners", pun: "Grow your customer base.", img: landscaping },
];

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Icon({ trade }: { trade: Trade }) {
  const box = { viewBox: "0 0 24 24", className: "trade-ico h-5 w-5 shrink-0 overflow-visible text-fix", "aria-hidden": true } as const;
  if (trade === "salon") return <svg {...box}><g className="snip-top"><circle cx="5" cy="7" r="2.6" {...S} /><path d="M7.3 8.2 20 14" {...S} /></g><g className="snip-bot"><circle cx="5" cy="17" r="2.6" {...S} /><path d="M7.3 15.8 20 10" {...S} /></g></svg>;
  if (trade === "cleaning") return <svg {...box}><g className="spray-bottle"><path d="M6 10h6v11H6z M7 10V7h4v3 M11 7h4l-1 2" {...S} /></g><g className="mist" fill="currentColor"><circle cx="18" cy="6" r="1" /><circle cx="21" cy="8" r=".9" /><circle cx="19" cy="10" r=".8" /></g></svg>;
  if (trade === "electrician") return <svg {...box}><rect x="7" y="4" width="10" height="16" rx="2" {...S} /><rect className="switch-knob" x="10" y="12" width="4" height="5" rx="1" fill="currentColor" /><circle className="bulb" cx="20.5" cy="4" r="2" fill="var(--grade-c)" opacity=".15" /></svg>;
  if (trade === "landscaping") return <svg {...box}><g className="shovel"><path d="M18 3 10 13 M7 12l4 4-3 3c-1.5 1-4 .5-4-1.5z" {...S} /></g><path className="sprout" d="M18 21v-5 M18 17c-2 0-3-1-3-3 2 0 3 1 3 3zm0-1c1.5 0 2.5-1 2.5-2.5-1.5 0-2.5 1-2.5 2.5z" {...S} stroke="var(--grade-a)" /><path d="M14 21h8" {...S} /></svg>;
  return <svg {...box}><path d="M3 8h9v4H3 M12 9h3v9" {...S} /><path className="wrench" d="M20 3a3 3 0 0 0-3.5 4L9 14.5l1.5 1.5L18 8.5A3 3 0 0 0 22 5l-2 .5-.5-2z" {...S} /><circle className="drip" cx="15" cy="20" r="1" fill="currentColor" opacity="0" /></svg>;
}

function Tile({ t, i, on, onPick }: { t: (typeof TILES)[number]; i: number; on: boolean; onPick: (t: Trade) => void }) {
  const [play, setPlay] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const run = () => { if (play) return; setPlay(true); clearTimeout(timer.current); timer.current = setTimeout(() => setPlay(false), 1900); };
  useEffect(() => { const s = setTimeout(run, 900 + i * 450); return () => { clearTimeout(s); clearTimeout(timer.current); }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <li className="animate-rise w-52 shrink-0" style={{ animationDelay: `${300 + i * 70}ms` }}>
      <button type="button" aria-pressed={on} onMouseEnter={run} onFocus={run} onClick={() => { run(); onPick(t.trade); }}
        className={`group flex w-full items-center gap-3 rounded-2xl border bg-card p-2.5 text-left transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${play ? "trade-play" : ""} ${on ? "border-ink shadow-[0_14px_30px_-18px_var(--ink)]" : "border-border"}`}>
        <img src={t.img} alt="" width={768} height={960} loading="lazy"
          className={`h-14 w-14 shrink-0 rounded-xl object-cover transition duration-500 ${on ? "rotate-6 scale-105" : "saturate-[.55] group-hover:saturate-100"}`} />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 font-display font-bold leading-tight">
            <span className={t.trade === "cleaning" ? "wipe-word" : undefined}>{t.name}</span><Icon trade={t.trade} />
          </span>
          <span className="block text-xs text-muted-foreground">{t.pun}</span>
        </span>
      </button>
    </li>
  );
}

export function TradeDeck({ selected, onPick }: { selected: Trade | null; onPick: (t: Trade) => void }) {
  return (
    <ul aria-label="Choose your trade" className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:thin]">
      {TILES.map((t, i) => <Tile key={t.trade} t={t} i={i} on={selected === t.trade} onPick={onPick} />)}
    </ul>
  );
}
