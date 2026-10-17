import { createFileRoute } from "@tanstack/react-router";
import { Block, QUIET_CREW_URL, ShellPage } from "@/components/Brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => pageHead("/contact", "Contact us · Outshine by Quietcrew", "Questions about your Outshine report or the DIY pack? Get in touch with the Quietcrew team."),
  component: () => (
    <ShellPage title="Contact us" intro="Questions about your report, a payment or the DIY pack? We would love to hear from you.">
      <Block h="Get in touch">
        <p>Our support inbox is being set up right now. Until then, you can reach the team through the <a href={QUIET_CREW_URL} target="_blank" rel="noopener" className="font-semibold text-foreground underline underline-offset-4">Quietcrew website</a>.</p>
        <p>If your question is about a payment, include the business name from your report so we can find it quickly.</p>
      </Block>
    </ShellPage>
  ),
});
