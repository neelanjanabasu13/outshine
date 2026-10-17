import { createFileRoute } from "@tanstack/react-router";
import { ShellPage } from "@/components/Brand";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us · FixFirst" },
      { name: "description", content: "Questions about your report or a fix? We would love to hear from you." },
      { property: "og:title", content: "Contact us · FixFirst" },
      { property: "og:description", content: "Questions about your report or a fix? We would love to hear from you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ShellPage title="Contact us" intro="Questions about your report or a fix? We would love to hear from you." />,
});
