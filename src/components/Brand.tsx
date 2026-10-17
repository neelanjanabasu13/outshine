import { Link } from "@tanstack/react-router";

export const QUIET_CREW_URL = "https://quietcrew.ai/";

export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2">
        <Link to="/" aria-label="FixFirst home" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-paper">F</Link>
        <div className="flex flex-col leading-tight">
          <Link to="/" className="font-display text-xl font-semibold">FixFirst</Link>
          <a href={QUIET_CREW_URL} target="_blank" rel="noopener" className="text-xs text-muted-foreground transition-colors hover:text-foreground">by <span className="font-semibold text-brand-gradient">Quiet Crew</span></a>
        </div>
      </div>
      <nav aria-label="Main" className="flex items-center gap-4 text-sm sm:gap-6">
        {([["/solution", "Solution"], ["/pricing", "Pricing"], ["/about", "About"], ["/contact", "Contact us"]] as const).map(([to, label]) => (
          <Link key={to} to={to} className="text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-20 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-8 text-sm text-muted-foreground">
      <span>
        FixFirst by{" "}
        <a href={QUIET_CREW_URL} target="_blank" rel="noopener" className="font-semibold text-foreground underline underline-offset-4">
          Quiet Crew
        </a>
      </span>
      <span>Free audits for UK trades</span>
    </footer>
  );
}

const gradeClass = { A: "text-grade-a", B: "text-grade-b", C: "text-grade-c", D: "text-grade-d", F: "text-grade-f" } as const;
export const gradeColor = (g: keyof typeof gradeClass) => gradeClass[g];

export function ShellPage({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-semibold md:text-6xl">{title}</h1>
        <p className="mt-6 text-lg text-muted-foreground">{intro}</p>
        <p className="mt-10 border-l-2 border-border pl-4 text-sm text-muted-foreground">More on this page is coming soon.</p>
      </main>
      <Footer />
    </div>
  );
}
