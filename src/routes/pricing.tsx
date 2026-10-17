import { createFileRoute } from "@tanstack/react-router";
import { ShellPage } from "@/components/Brand";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing · Outshine" },
      { name: "description", content: "The scan is free. The DIY pack is £7.99 (usually £14.99) and done for you is £29.99 (usually £49.99), with one payment and no subscription." },
      { property: "og:title", content: "Pricing · Outshine" },
      { property: "og:description", content: "The scan is free. The DIY pack is £7.99 (usually £14.99) and done for you is £29.99 (usually £49.99), with one payment and no subscription." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ShellPage title="Pricing" intro="The scan is free. The DIY pack is £7.99 (usually £14.99) and done for you is £29.99 (usually £49.99), with one payment and no subscription." />,
});
