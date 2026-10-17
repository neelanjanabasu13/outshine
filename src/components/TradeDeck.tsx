import type { Trade } from "@/lib/audit";
import plumbing from "@/assets/tile-plumbing.jpg";
import salon from "@/assets/tile-salon.jpg";
import cleaning from "@/assets/tile-cleaning.jpg";
import electrician from "@/assets/tile-electrician.jpg";
import landscaping from "@/assets/tile-landscaping.jpg";

type Tile = { trade: Trade; name: string; pun: string; img: string; bg: string; fg: string };

export const TILES: Tile[] = [
  { trade: "plumbing", name: "Plumbers", pun: "Keep the jobs flowing.", img: plumbing, bg: "bg-pop-blue", fg: "text-pop-cream" },
  { trade: "salon", name: "Hair & Beauty", pun: "A cut above the rest.", img: salon, bg: "bg-pop-lilac", fg: "text-pop-ink" },
  { trade: "cleaning", name: "Cleaners", pun: "Make a spotless first impression.", img: cleaning, bg: "bg-pop-yellow", fg: "text-pop-ink" },
  { trade: "electrician", name: "Electricians", pun: "Switch on more bookings.", img: electrician, bg: "bg-pop-red", fg: "text-pop-cream" },
  { trade: "landscaping", name: "Gardeners", pun: "Grow your customer base.", img: landscaping, bg: "bg-pop-mint", fg: "text-pop-ink" },
];

// Each card starts piled in the middle of the row, riffles, then deals to its own slot.
const DECK = [
  { dx: "200%", r1: "-9deg", r2: "6deg", wob: "-18px" },
  { dx: "100%", r1: "7deg", r2: "-5deg", wob: "16px" },
  { dx: "0%", r1: "-4deg", r2: "8deg", wob: "-10px" },
  { dx: "-100%", r1: "10deg", r2: "-7deg", wob: "14px" },
  { dx: "-200%", r1: "-6deg", r2: "5deg", wob: "-16px" },
];

export function TradeDeck({ selected, onPick }: { selected: Trade | null; onPick: (t: Trade) => void }) {
  return (
    <ul aria-label="Choose your trade" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {TILES.map((t, i) => {
        const on = selected === t.trade;
        const d = DECK[i];
        return (
          <li key={t.trade} className="lg:animate-deal" style={{ ["--dx" as string]: d.dx, ["--r1" as string]: d.r1, ["--r2" as string]: d.r2, ["--wob" as string]: d.wob, animationDelay: `${(4 - i) * 70}ms`, zIndex: on ? 10 : 5 - Math.abs(2 - i) }}>
            <button type="button" aria-pressed={on} onClick={() => onPick(t.trade)}
              className={`group relative block w-full overflow-hidden rounded-2xl border-2 border-pop-ink text-left transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pop-yellow ${t.bg} ${on ? "-translate-y-2 -rotate-1 shadow-block" : "shadow-block-sm hover:-translate-y-1 hover:rotate-1 hover:shadow-block"}`}>
              <img src={t.img} alt="" width={768} height={960} loading={i < 3 ? "eager" : "lazy"}
                className={`aspect-[4/5] w-full object-cover transition duration-500 ${on ? "scale-110 rotate-3" : "group-hover:scale-105"}`} />
              <span className={`absolute inset-x-0 bottom-0 p-4 ${t.fg}`}>
                <span className="block font-display text-xl font-extrabold leading-tight">{t.name}</span>
                <span className="block text-sm font-medium opacity-90">{t.pun}</span>
              </span>
              {on && <span className="absolute right-3 top-3 rounded-full border-2 border-pop-ink bg-pop-cream px-2 py-0.5 text-xs font-bold text-pop-ink animate-pop">Picked</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
