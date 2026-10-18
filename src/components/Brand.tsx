import type React from "react";
import { Link } from "@tanstack/react-router";
import { Shine } from "./Shine";

export const QUIET_CREW_URL = "https://quietcrew.ai/";
const NAV = [["/", "Home"], ["/solution", "Solution"], ["/pricing", "Pricing"], ["/about", "About"], ["/contact", "Contact us"]] as const;

export function Header() {
  return (
    <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-6 sm:px-6 lg:flex lg:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <Link to="/" aria-label="Outshine home" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-display text-lg font-bold text-paper">O</Link>
        <div className="flex min-w-0 flex-col leading-tight">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl"><Shine>Outshine</Shine></Link>
          <a href={QUIET_CREW_URL} target="_blank" rel="noopener" title="Visit the Quietcrew website" className="-my-1 py-1 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">by <span className="font-quietcrew font-extrabold tracking-[-0.02em] text-quietcrew">Quietcrew</span></a>
        </div>
      </div>
      <nav aria-label="Main" className="flex items-center gap-3 text-sm lg:gap-6">
        {NAV.map(([to, label]) => (
          <Link key={to} to={to} className="hidden text-muted-foreground transition-colors hover:text-foreground lg:inline" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }}>{label}</Link>
        ))}
        <Link to="/scan/$id" params={{ id: "mops-stars-cleaning" }} className="shrink-0 whitespace-nowrap rounded-full bg-fix px-3 py-1.5 font-semibold text-fix-foreground transition hover:-translate-y-0.5">Demo showcase</Link>
        <details className="relative lg:hidden">
          <summary aria-label="Menu" className="cursor-pointer list-none rounded-full border border-border px-3 py-1.5 font-medium">Menu</summary>
          <div className="absolute right-0 z-50 mt-2 flex w-44 flex-col rounded-lg border border-border bg-card p-2 shadow-lg">
            {NAV.map(([to, label]) => <Link key={to} to={to} className="rounded px-3 py-2 hover:bg-muted">{label}</Link>)}
          </div>
        </details>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-20 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-8 text-sm text-muted-foreground">
      <span>
        Outshine by{" "}
        <a href={QUIET_CREW_URL} target="_blank" rel="noopener" className="font-quietcrew font-extrabold tracking-[-0.02em] text-quietcrew underline underline-offset-4">
          Quietcrew
        </a>
      </span>
      <span className="flex gap-4"><Link to="/privacy" className="hover:text-foreground">Privacy</Link><Link to="/terms" className="hover:text-foreground">Terms</Link><span>Free audits for UK trades</span></span>
    </footer>
  );
}

const gradeClass = { A: "text-grade-a", B: "text-grade-b", C: "text-grade-c", D: "text-grade-d", F: "text-grade-f" } as const;
export const gradeColor = (g: keyof typeof gradeClass) => gradeClass[g];

export function ShellPage({ title, intro, children }: { title: string; intro: string; children?: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">← Back to home</Link>
        <h1 className="mt-6 text-4xl font-semibold md:text-6xl">{title}</h1>
        <p className="mt-6 text-lg text-muted-foreground">{intro}</p>
        {children && <div className="mt-10 space-y-8">{children}</div>}
        <Link to="/" className="mt-10 inline-block rounded-full bg-fix px-6 py-3 font-semibold text-fix-foreground">Scan my business free</Link>
      </main>
      <Footer />
    </div>
  );
}

export function Block({ h, children }: { h: string; children: React.ReactNode }) {
  return <section><h2 className="text-2xl font-semibold">{h}</h2><div className="mt-3 space-y-3 text-muted-foreground">{children}</div></section>;
}
