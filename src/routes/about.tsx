import { createFileRoute } from "@tanstack/react-router";
import { ShellPage } from "@/components/Brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About FixFirst · FixFirst" },
      { name: "description", content: "FixFirst is built by Quietcrew to help UK trades win more local work." },
      { property: "og:title", content: "About FixFirst · FixFirst" },
      { property: "og:description", content: "FixFirst is built by Quietcrew to help UK trades win more local work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ShellPage title="About FixFirst" intro="FixFirst is built by Quietcrew to help UK trades win more local work." />,
});
