import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FixKind } from "@/lib/audit";
import type { Business } from "@/lib/sample";

// Showcase-only: what the fully agentic product looks like once owner authorisation
// (e.g. Google Business Profile access) is in place. Used for demo businesses only.
export const SHOWCASE_LOG: Record<FixKind, string[]> = {
  website: ["Read your listing, services and best reviews", "Wrote your page copy and picked your photos", "Published your one-page website", "Added the website link to your Google listing", "Checked the link works from Google Maps"],
  description: ["Read your services, area and credentials", "Wrote a keyword-rich business description", "Updated your description on Google", "Added your opening hours to Google", "Confirmed Google accepted the changes"],
  "review-replies": ["Fetched every unanswered review through your Google connection", "Wrote a personal reply to each one", "Posted the replies on Google", "Emailed you a summary from your Gmail, flagging one complaint"],
  "review-request": ["Created your direct review link", "Designed your QR review card", "Found your last 20 customers in your Gmail", "Sent each one a personal review request from your Gmail", "Scheduled a friendly reminder for day 3"],
  photos: ["Picked your strongest job photos", "Cropped, brightened and captioned them", "Uploaded 8 photos to your Google listing", "Set a new cover photo"],
  posts: ["Wrote four seasonal offers for your trade", "Designed a matching graphic for each", "Published the first post on Google", "Scheduled the next three, one a week"],
};

const RESULT: Record<FixKind, (b: Business) => string> = {
  website: () => "Website button now live on your listing",
  description: (b) => `Trusted ${b.area} specialists. Fully insured, fixed quotes, and same-week appointments. Call ${b.phone ?? "us"} today.`,
  "review-replies": (b) => { const r = b.reviews[0]; return r ? `"Thank you so much, ${r.author.split(" ")[0]}. It was a pleasure working with you, and we look forward to seeing you again."` : "Every review now has a personal owner reply"; },
  "review-request": () => "20 review requests sent from your Gmail · 3 new 5 star reviews so far",
  photos: () => "8 new photos live · new cover photo set",
  posts: () => "\"Winter boiler check, £20 off this month\" is live, three more are scheduled",
};

export function ShowcaseResult({ fix, b }: { fix: FixKind; b: Business }) {
  return <div className="space-y-3">
    <p className="inline-flex items-center gap-1.5 rounded-full bg-grade-a/15 px-3 py-1 text-xs font-bold text-grade-a"><Check className="h-3.5 w-3.5" />Live online</p>
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <p className="font-semibold">{b.name}</p>
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-current" />{b.signals.rating.toFixed(1)} · {b.area}</p>
      <p className="mt-3 rounded-md border-l-4 border-fix bg-accent/60 p-3 text-sm">{RESULT[fix](b)}</p>
    </div>
    {fix === "website" && <Button asChild><Link to="/site/$id" params={{ id: b.id }} target="_blank">Open your live website<ArrowUpRight /></Link></Button>}
    <p className="text-xs text-muted-foreground">Nothing for you to do. Our AI agent made this change for you.</p>
  </div>;
}
