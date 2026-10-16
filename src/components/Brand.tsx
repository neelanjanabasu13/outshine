import { Link } from "@tanstack/react-router";

export const QUIET_CREW_URL = "https://quietcrew.ai/";

export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link to="/" className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-sm font-bold text-paper">F</span>
        <span className="font-display text-xl font-semibold">FixFirst</span>
      </Link>
      <a
        href={QUIET_CREW_URL}
        target="_blank"
        rel="noopener"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        by <span className="font-semibold text-brand-gradient">Quiet Crew</span>
      </a>
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
