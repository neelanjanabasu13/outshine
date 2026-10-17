import { createFileRoute } from "@tanstack/react-router";
import { Block, ShellPage } from "@/components/Brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("/terms", "Terms of service · Outshine by Quietcrew", "The terms for using Outshine scans, the DIY pack and done-for-you services."),
  component: () => (
    <ShellPage title="Terms of service" intro="By using Outshine you agree to these terms, which are governed by the laws of England and Wales.">
      <Block h="What Outshine provides">
        <p>Outshine grades the public online presence of a business and offers recommendations, ready-to-use wording, guides and generated assets. Grades describe public signals, not the quality of anyone's work, and they are not a Google ranking.</p>
      </Block>
      <Block h="Payments and refunds">
        <p>Paid packs are one-off payments with no subscription. If a pack does not unlock or download properly, contact us and we will sort it or refund you.</p>
      </Block>
      <Block h="Independence">
        <p>Outshine is independent and is not affiliated with, endorsed by or sponsored by Google. You remain responsible for anything you publish on your own listing or website.</p>
      </Block>
    </ShellPage>
  ),
});
