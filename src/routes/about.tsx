import { createFileRoute } from "@tanstack/react-router";
import { Block, ShellPage } from "@/components/Brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => pageHead("/about", "About Outshine · Outshine by Quietcrew", "Outshine is built by Quietcrew to help UK trades win more local work without paying agency retainers."),
  component: () => (
    <ShellPage title="About Outshine" intro="Outshine is built by Quietcrew for the plumbers, electricians, cleaners, landscapers and salons who do brilliant work but rarely have time to show it off online.">
      <Block h="Why we built it">
        <p>Most local customers pick a trade from a phone screen in a few seconds, so a thin listing or a missing website quietly sends good jobs down the road. Agencies charge monthly retainers that most small businesses cannot justify, so we made something honest, quick and affordable instead.</p>
      </Block>
      <Block h="What we stand for">
        <p>We only grade what we can prove from public evidence, we never invent reviews or ratings, and we keep pricing to a single one-off payment so you are never locked in.</p>
      </Block>
    </ShellPage>
  ),
});
