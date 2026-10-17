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

export function TradeDeck({ selected, onPick }: { selected: Trade | null; onPick: (t: Trade) => void }) {
  return (
    <ul aria-label="Choose your trade" className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:thin]">
      {TILES.map((t, i) => {
        const on = selected === t.trade;
        return (
          <li key={t.trade} className="animate-rise w-52 shrink-0" style={{ animationDelay: `${300 + i * 70}ms` }}>
            <button type="button" aria-pressed={on} onClick={() => onPick(t.trade)}
              className={`group flex w-full items-center gap-3 rounded-2xl border bg-card p-2.5 text-left transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? "border-ink shadow-[0_14px_30px_-18px_var(--ink)]" : "border-border"}`}>
              <img src={t.img} alt="" width={768} height={960} loading="lazy"
                className={`h-14 w-14 shrink-0 rounded-xl object-cover transition duration-500 ${on ? "rotate-6 scale-105" : "saturate-[.55] group-hover:saturate-100"}`} />
              <span className="min-w-0">
                <span className="block font-display font-bold leading-tight">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.pun}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
