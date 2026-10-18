import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Brand";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Outshine showcase links (private)" },
      { name: "description", content: "Private showcase links for the Outshine free scan, DIY pack and AI agent tiers." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Outshine showcase links" },
      { property: "og:description", content: "Private showcase of the three Outshine tiers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Demo,
});

const LINKS = [
  { id: "sparkle-and-co", demo: "free", t: "1. Free scan", d: "We show you the problems: grade, nearby rivals and a free report download." },
  { id: "the-hair-lab", demo: "diy", t: "2. DIY pack", d: "We tell you how to fix them: every step-by-step guide and the full PDF, unlocked." },
  { id: "riverside-plumbing", demo: "agent", t: "3. Done for you", d: "Our AI agent fixes them for you, live on screen, with the playbook included." },
];

function Demo() {
  return <div className="min-h-screen"><Header />
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl font-extrabold">Showcase links</h1>
      <p className="mt-3 text-muted-foreground">Private links for recording the video or sharing with judges. Each uses a made-up business and takes no payment.</p>
      <a href="/report/mops-stars-cleaning" className="mt-8 block rounded-xl border-2 border-fix bg-card p-5 transition hover:-translate-y-0.5"><p className="font-semibold">Judges' walkthrough: Mops Stars Cleaning, London</p><p className="mt-1 text-sm text-muted-foreground">Type "Mops Stars Cleaning" in the homepage search. It grades D, has no website and unanswered reviews. Buy either paid option with a 100% off code, then watch our AI agent connect to Google and Gmail, build the website and fix everything.</p></a>
      <ul className="mt-8 space-y-3">{LINKS.map((x) => <li key={x.demo}><a href={`/report/${x.id}?demo=${x.demo}`} className="block rounded-xl border border-border bg-card p-5 transition hover:border-fix"><p className="font-semibold">{x.t}</p><p className="mt-1 text-sm text-muted-foreground">{x.d}</p></a></li>)}</ul>
      <section className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold">What is real today, and what the demo simulates</h2>
        <p className="mt-3 text-muted-foreground">The free scan, the grading, the rival comparison, the DIY pack, the PDF, the QR review card and the one-page website all run for real on live businesses. The done-for-you demo shows our AI agent publishing changes itself, and those Google updates are simulated, because full autonomy needs handshakes with other companies that a new product does not have yet:</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li><span className="font-semibold">Google Business Profile access.</span> Editing a listing, replying to reviews or posting updates needs Google to approve our app for its Business Profile APIs, verify our sign-in screen, and have each owner grant us access to their listing.</li>
          <li><span className="font-semibold">Sign-in to website builders and domains.</span> Publishing on the owner's own domain or tools such as Lovable needs the owner to sign in and connect their account, or a partner integration with the provider.</li>
          <li><span className="font-semibold">Sending messages to customers.</span> Texting customers for reviews needs a registered sender and the owner's consent records, so it cannot happen silently on their behalf.</li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">Until those are in place, real reports offer the DIY pack, where the finished work is handed over with one-click copy and open, and done for you is marked coming soon.</p>
      </section>
    </main>
  </div>;
}
