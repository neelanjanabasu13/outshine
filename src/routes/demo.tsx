import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Brand";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "FixFirst showcase links (private)" },
      { name: "description", content: "Private showcase links for the FixFirst free scan, DIY pack and AI agent tiers." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "FixFirst showcase links" },
      { property: "og:description", content: "Private showcase of the three FixFirst tiers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Demo,
});

const LINKS = [
  { id: "sparkle-and-co", demo: "free", t: "1. Free scan", d: "We show you the problems: grade, nearby rivals and a free report download." },
  { id: "the-hair-lab", demo: "diy", t: "2. DIY pack", d: "We tell you how to fix them: every step-by-step guide and the full PDF, unlocked." },
  { id: "riverside-plumbing", demo: "agent", t: "3. Fix it for me", d: "Our AI agent fixes them for you, live on screen, with the playbook included." },
];

function Demo() {
  return <div className="min-h-screen"><Header />
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl font-extrabold">Showcase links</h1>
      <p className="mt-3 text-muted-foreground">Private links for recording the video or sharing with judges. Each uses a made-up business and takes no payment.</p>
      <ul className="mt-8 space-y-3">{LINKS.map((x) => <li key={x.demo}><a href={`/report/${x.id}?demo=${x.demo}`} className="block rounded-xl border border-border bg-card p-5 transition hover:border-fix"><p className="font-semibold">{x.t}</p><p className="mt-1 text-sm text-muted-foreground">{x.d}</p></a></li>)}</ul>
    </main>
  </div>;
}
