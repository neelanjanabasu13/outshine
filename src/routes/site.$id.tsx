import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { TRADES } from "@/lib/audit";
import { findBusiness, TRADE_PHOTOS } from "@/lib/sample";

export const Route = createFileRoute("/site/$id")({
  loader: ({ params }) => {
    const b = findBusiness(params.id);
    if (!b) throw notFound();
    return { b };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.b.name} · ${loaderData.b.area}` : "Local business" },
      { name: "description", content: loaderData ? `${loaderData.b.name}, trusted ${TRADES[loaderData.b.trade].label.toLowerCase()} in ${loaderData.b.area}. Call for a free quote.` : "Local business website." },
      { property: "og:title", content: loaderData?.b.name ?? "Local business" },
      { property: "og:description", content: loaderData ? `Trusted ${TRADES[loaderData.b.trade].label.toLowerCase()} in ${loaderData.b.area}.` : "Local business website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Site,
});

function Site() {
  const { b } = Route.useLoaderData();
  const t = TRADES[b.trade];
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-card">
      <section className="relative">
        <img src={TRADE_PHOTOS[b.trade]} alt={b.name} className="h-[70vh] w-full object-cover" width={1024} height={768} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-6 pb-12 text-paper">
          <p className="text-sm uppercase tracking-[0.2em] opacity-80">{t.label} · {b.area}</p>
          <h1 className="mt-2 text-5xl font-semibold md:text-7xl">{b.name}</h1>
          <p className="mt-3 text-lg opacity-90">{b.signals.rating.toFixed(1)} ★ from {b.signals.reviewCount} local customers</p>
          <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="mt-6 inline-block rounded-full bg-fix px-8 py-4 font-medium text-fix-foreground">Call {b.phone}</a>
        </div>
      </section>
      <main className="mx-auto max-w-5xl space-y-20 px-6 py-20">
        <section>
          <h2 className="text-3xl font-semibold">What we do</h2>
          <ul className="mt-6 flex flex-wrap gap-3">{b.services.map((s) => <li key={s} className="rounded-full border border-border px-5 py-2">{s}</li>)}</ul>
          <p className="mt-6 text-muted-foreground">{t.credential} in place for your peace of mind.</p>
        </section>
        <section>
          <h2 className="text-3xl font-semibold">What customers say</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {b.reviews.filter((r) => r.stars >= 4).map((r) => (
              <blockquote key={r.author} className="border-l-2 border-fix pl-5"><p className="text-lg">“{r.text}”</p><footer className="mt-2 text-sm text-muted-foreground">{r.author}</footer></blockquote>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] bg-secondary p-8 md:p-12">
          <h2 className="text-3xl font-semibold">Get a free quote</h2>
          {sent ? <p className="mt-4 text-lg">Thanks! We'll be in touch today.</p> : (
            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <input required placeholder="Your name" className="rounded-xl border border-border bg-card px-4 py-3" />
              <input required placeholder="Phone or email" className="rounded-xl border border-border bg-card px-4 py-3" />
              <textarea required placeholder="What do you need?" className="rounded-xl border border-border bg-card px-4 py-3 md:col-span-2" rows={3} />
              <button className="rounded-full bg-ink px-8 py-3 text-paper md:justify-self-start">Send request</button>
            </form>
          )}
        </section>
        <footer className="text-sm text-muted-foreground">{b.address} · {b.phone} · Site made with FixFirst</footer>
      </main>
    </div>
  );
}
