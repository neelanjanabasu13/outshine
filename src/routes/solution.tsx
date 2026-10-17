import { createFileRoute } from "@tanstack/react-router";
import { ShellPage } from "@/components/Brand";

export const Route = createFileRoute("/solution")({
  head: () => ({
    meta: [
      { title: "How Outshine works · Outshine" },
      { name: "description", content: "Outshine grades your online presence against nearby rivals, shows what is holding you back and fixes it for you." },
      { property: "og:title", content: "How Outshine works · Outshine" },
      { property: "og:description", content: "Outshine grades your online presence against nearby rivals, shows what is holding you back and fixes it for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ShellPage title="How Outshine works" intro="Outshine grades your online presence against nearby rivals, shows what is holding you back and fixes it for you." />,
});
