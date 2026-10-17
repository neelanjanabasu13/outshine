import { createFileRoute } from "@tanstack/react-router";
import { ShellPage } from "@/components/Brand";

export const Route = createFileRoute("/solution")({
  head: () => ({
    meta: [
      { title: "How FixFirst works · FixFirst" },
      { name: "description", content: "FixFirst grades your public Google profile against nearby rivals, shows what is holding you back and fixes it for you." },
      { property: "og:title", content: "How FixFirst works · FixFirst" },
      { property: "og:description", content: "FixFirst grades your public Google profile against nearby rivals, shows what is holding you back and fixes it for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ShellPage title="How FixFirst works" intro="FixFirst grades your public Google profile against nearby rivals, shows what is holding you back and fixes it for you." />,
});
