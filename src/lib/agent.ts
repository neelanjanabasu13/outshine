// Agent output templates. These stand in for live AI generation until the AI agent is wired up.
import { TRADES, type FixKind } from "./audit";
import type { Business } from "./sample";

export interface AgentRun { steps: string[]; output: string; }

/** One active sentence per fix saying what FixFirst does for the owner. */
export const AGENT_ACTION: Record<FixKind, string> = {
  website: "Our AI agent builds your website for you in one click, in under a minute.",
  "review-request": "Our AI agent creates your review link and writes the messages that ask happy customers for reviews.",
  "review-replies": "Our AI agent writes a personal reply to every unanswered review for you.",
  description: "Our AI agent writes your Google business description for you, with your services and credentials.",
  photos: "Our AI agent builds your photo shot list and writes captions with local keywords for you.",
  posts: "Our AI agent writes a month of Google updates for you, ready to post.",
};

export function runAgent(kind: FixKind, b: Business): AgentRun {
  const t = TRADES[b.trade];
  const first = b.name.split(" ")[0];
  switch (kind) {
    case "review-replies": {
      const unreplied = b.reviews.filter((r) => !r.replied);
      return {
        steps: [`Reading ${unreplied.length} unanswered reviews`, "Checking tone against your best replies", "Drafting personal replies", "Softening the reply to the negative review"],
        output: unreplied.map((r) => `${r.author} (${r.stars}★): “${r.text}”\n→ ${r.stars >= 4
          ? `Thank you so much, ${r.author.split(" ")[0]}. It was a pleasure, and we really appreciate you taking the time to say so. ${b.name}`
          : `Hi ${r.author.split(" ")[0]}, thank you for the honest feedback, and I'm sorry we let you down on that. It's not the standard we hold ourselves to, and I'd like to put it right, so please call me directly on ${b.phone}. The team at ${b.name}`}`).join("\n\n"),
      };
    }
    case "description":
      return {
        steps: ["Pulling your services and service area", `Adding ${t.credential}`, "Matching the words local customers search for", "Fitting it to Google's 750-character limit"],
        output: `${b.name} is a trusted ${t.label.toLowerCase()} business serving ${b.area} and the surrounding area. We offer ${b.services.slice(0, 5).join(", ").toLowerCase()} and more, with clear upfront quotes and no surprises on the bill. We're proud of our ${b.signals.rating.toFixed(1)}-star rating from ${b.signals.reviewCount} local customers, who tell us they value turning up on time, tidy work and honest advice. ${t.credential} is in place for your peace of mind. Call ${b.phone} for a free quote, or message us and we'll get back to you the same day.`,
      };
    case "posts":
      return {
        steps: ["Looking at the season and local demand", "Picking four topics for the month", "Writing short posts with a call to action"],
        output: [
          `Week 1. ${b.services[0]} slots open this month in ${b.area}. Book early and we'll fit around you. Call ${b.phone}.`,
          `Week 2. A recent job we're proud of: ${b.services[1]?.toLowerCase()} done in a day, spotless finish. Thanks to our lovely customer for the kind words!`,
          `Week 3. Quick tip from the team: small problems get expensive when they're left. If something feels off, give us a call and we'll take a look.`,
          `Week 4. Rated ${b.signals.rating.toFixed(1)}★ by ${b.signals.reviewCount} neighbours. Thank you, ${b.area}! Free quotes on ${b.phone}.`,
        ].join("\n\n"),
      };
    case "review-request":
      return {
        steps: ["Creating your short review link", "Writing a friendly text to send after each job", "Writing a follow-up for people who don't reply"],
        output: (() => { const link = reviewLink(b) ?? "[your Google review link]"; return `After the job:\nHi {name}, thanks for choosing ${b.name} today! If you were happy with the work, a quick Google review would mean the world to a small local business like ours: ${link}  Thanks, ${first}\n\nThree days later, if no review:\nHi {name}, just a gentle nudge in case you missed it. It only takes 30 seconds: ${link}  Thank you!`; })(),
      };
    case "photos":
      return {
        steps: [`Checking what top ${t.label.toLowerCase()} profiles show`, "Building your shot list", "Writing captions with local keywords"],
        output: `Your shot list (aim for ${t.minPhotos}+ photos, then add 2 a month):\n\n1. Your logo, clear and square\n2. A cover photo of ${t.expectedPhotos.split(",")[0]}\n3. Five recent jobs, ideally before and after\n4. You and your team, smiling, in uniform\n5. Your van or premises from the street\n\nCaption example: “${b.services[0]} in ${b.area}, finished this week.”`,
      };
    case "website":
      return {
        steps: ["Pulling your photos, reviews and services", "Writing your page", "Adding click-to-call and a quote form", "Publishing to a live address"],
        output: `Your website is live at fixfirst.app/site/${b.id}`,
      };
  }
}

/** Google's own "write a review" page for a live Places id; null for demo businesses. */
export function reviewLink(b: Pick<Business, "id">): string | null {
  const m = /^live\.[^.]+\.(.+)$/.exec(b.id);
  return m ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(m[1] ?? "")}` : null;
}

/** Where Google manages the owner's listing; owners must be signed in, so we cannot act there for them. */
export const GOOGLE_PROFILE_URL = "https://www.google.com/search?q=my+business";

export interface Handoff { created: string; you: string; why: string; }

/** Honest split between what the agent finishes and the one step only the owner can take. */
export const AGENT_HANDOFF: Record<FixKind, Handoff> = {
  website: { created: "A live one-page website with your services, reviews and click-to-call, published at its own link.", you: "Paste the link into the Website field of your Google profile.", why: "Google only lets the signed-in owner edit the listing." },
  "review-request": { created: "Your real Google review link, a printable QR counter card and two ready-to-send customer messages.", you: "Print the card and send the message to customers after each job.", why: "Texts must come from your own phone, and printing needs a printer." },
  "review-replies": { created: "A personal reply for every unanswered review, written in your voice.", you: "Paste each reply under its review on Google.", why: "Google only lets the listing owner reply to reviews." },
  description: { created: "A finished business description within Google's 750-character limit.", you: "Paste it into the Description box on your Google profile and save.", why: "Google only lets the signed-in owner edit the listing." },
  photos: { created: "A shot list and keyword-rich captions for every photo.", you: "Take the photos and upload them to your profile.", why: "An AI cannot take real photos of your work, and fake ones would break Google's rules." },
  posts: { created: "A month of Google updates, ready to post.", you: "Paste one update a week into Add update on your Google profile.", why: "Google only lets the signed-in owner publish updates." },
};

export const HANDOFF_NOTE = "Our AI agent does everything it can digitally. Where Google or your own phone needs your personal sign-in, it hands you the finished work with a one-click step, so you never write or design from scratch.";
