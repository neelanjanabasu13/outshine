import { createFileRoute } from "@tanstack/react-router";
import { ShellPage } from "@/components/Brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Outshine · Outshine" },
      { name: "description", content: "Outshine is built by Quietcrew to help UK trades win more local work." },
      { property: "og:title", content: "About Outshine · Outshine" },
      { property: "og:description", content: "Outshine is built by Quietcrew to help UK trades win more local work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ShellPage title="About Outshine" intro="Outshine is built by Quietcrew to help UK trades win more local work." />,
});
