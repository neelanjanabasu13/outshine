import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link to="/" className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-sm font-bold text-paper">F</span>
        <span className="font-display text-xl font-semibold">FixFirst</span>
      </Link>
      <span className="hidden text-sm text-muted-foreground sm:block">Free audits for UK trades</span>
    </header>
  );
}

const gradeClass = { A: "text-grade-a", B: "text-grade-b", C: "text-grade-c", D: "text-grade-d", F: "text-grade-f" } as const;
export const gradeColor = (g: keyof typeof gradeClass) => gradeClass[g];
