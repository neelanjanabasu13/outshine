import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Business } from "@/lib/sample";

/**
 * Showcase-only Google sign-in and consent step. Real autonomy needs Google to approve our app;
 * here it plays out as if that partnership were already in place. Nothing is sent to Google.
 */
export function ConnectGate({ b, onDone }: { b: Business; onDone: () => void }) {
  const [stage, setStage] = useState<"start" | "account" | "consent" | "linking">("start");
  useEffect(() => {
    if (stage !== "linking") return;
    const to = setTimeout(onDone, 1800);
    return () => clearTimeout(to);
  }, [stage, onDone]);
  const email = `hello@${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.co.uk`;
  const scopes = [
    { t: "Manage your Google Business Profile", d: "Edit your description, hours, photos and website link, and reply to reviews." },
    { t: "Send email from your Gmail", d: "Send review requests to your recent customers, in your name." },
    { t: "Read customer contacts in Gmail", d: "Find customers you have emailed in the last 90 days." },
  ];
  return <section className="mt-16 rounded-2xl border-2 border-fix bg-card p-6 md:p-10">
    <p className="inline-block rounded-full bg-fix px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-fix-foreground">Our AI agent does it for you</p>
    <h2 className="mt-4 text-3xl font-semibold">Connect Google once, and our AI agent takes it from there</h2>
    <p className="mt-2 max-w-2xl text-muted-foreground">One secure sign-in gives our AI agent access to your Google Business Profile and Gmail, and from then on it works through every problem on this report by itself.</p>
    <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-lg">
      <div className="flex items-center gap-2 border-b border-border bg-secondary px-3 py-2"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" /><span className="h-2 w-2 rounded-full bg-muted-foreground/40" /><span className="ml-2 truncate rounded bg-background px-2 py-0.5 text-[11px] text-muted-foreground">accounts.google.com/o/oauth2/consent</span></div>
      <div className="p-6">
        <p className="text-center text-lg font-semibold">Google</p>
        {stage === "start" && <div className="mt-4 text-center"><p className="text-sm">Sign in to continue to <b>Outshine</b></p><Button className="mt-5 w-full" onClick={() => setStage("account")}>Continue with Google</Button></div>}
        {stage === "account" && <div className="mt-4"><p className="text-center text-sm">Choose an account</p><button onClick={() => setStage("consent")} className="mt-4 flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left text-sm hover:border-fix"><span className="grid h-8 w-8 place-items-center rounded-full bg-fix font-bold text-fix-foreground">{b.name[0]}</span><span><span className="block font-medium">{b.name}</span><span className="text-muted-foreground">{email}</span></span></button></div>}
        {stage === "consent" && <div className="mt-4"><p className="text-center text-sm"><b>Outshine</b> wants access to your Google account</p><p className="text-center text-xs text-muted-foreground">{email}</p>
          <ul className="mt-4 space-y-3">{scopes.map((s) => <li key={s.t} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-grade-a" /><span><span className="font-medium">{s.t}</span><span className="block text-xs text-muted-foreground">{s.d}</span></span></li>)}</ul>
          <div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setStage("start")}>Cancel</Button><Button onClick={() => setStage("linking")}>Allow</Button></div></div>}
        {stage === "linking" && <div className="mt-6 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-fix" /><p className="mt-3 text-sm">Connected. Handing over to our AI agent…</p></div>}
      </div>
    </div>
    <p className="mt-6 text-center text-xs text-muted-foreground">Showcase: this sign-in is simulated as if our Google partnership were approved, so nothing is sent to Google and no real listing changes.</p>
  </section>;
}
