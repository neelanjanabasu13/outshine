import { createFileRoute } from "@tanstack/react-router";
import { ShellPage } from "@/components/Brand";
import { pageHead } from "@/lib/seo";
import { PRICE_BUNDLE, PRICE_DIY, WAS_BUNDLE, WAS_DIY } from "@/lib/audit";

export const Route = createFileRoute("/pricing")({
  head: () => pageHead("/pricing", "Pricing · Outshine by Quietcrew", `Free scan, DIY pack £${PRICE_DIY} (usually £${WAS_DIY}) and done for you £${PRICE_BUNDLE} (usually £${WAS_BUNDLE}). One payment, no subscription.`),
  component: Pricing,
});

function Pricing() {
  const tiers = [
    { n: "Free scan", p: <>Free</>, d: "Your grade, nearby rivals and every problem worth sorting, with a free report to download." },
    { n: "DIY pack", p: <><span className="mr-2 text-lg text-muted-foreground line-through">£{WAS_DIY.toFixed(2)}</span>£{PRICE_DIY.toFixed(2)}</>, d: "Everything in the free scan, plus finished wording with one-click copy and open, a QR review card, a one-page website and step-by-step guides with a full PDF." },
    { n: "Done for you", p: <><span className="mr-2 text-lg text-muted-foreground line-through">£{WAS_BUNDLE.toFixed(2)}</span>£{PRICE_BUNDLE.toFixed(2)}</>, d: "Everything in the DIY pack, and our AI agent makes the changes for you. Coming soon." },
  ];
  return (
    <ShellPage title="Pricing" intro="One payment covers your whole report, however many things need doing. No subscription, no card up front, ever.">
      <div className="grid gap-4 sm:grid-cols-3">
        {tiers.map((t) => <div key={t.n} className="rounded-xl border border-border bg-card p-5"><p className="font-medium">{t.n}</p><p className="mt-2 font-display text-3xl font-semibold">{t.p}</p><p className="mt-3 text-sm text-muted-foreground">{t.d}</p></div>)}
      </div>
      <p className="text-sm text-muted-foreground">Payments are taken securely by Stripe. Launch prices are shown against the usual price.</p>
    </ShellPage>
  );
}
