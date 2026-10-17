import { createFileRoute } from "@tanstack/react-router";
import { Block, ShellPage } from "@/components/Brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("/privacy", "Privacy policy · Outshine by Quietcrew", "How Outshine uses public business data and handles payments and contact details."),
  component: () => (
    <ShellPage title="Privacy policy" intro="We keep this short and plain. Outshine is run by Quietcrew in the United Kingdom and follows UK GDPR.">
      <Block h="Public business information">
        <p>When you scan a business we read publicly available details from Google Places and the business's own website, such as rating, review count, photos, opening hours and listed credentials. We use them only to produce your report.</p>
      </Block>
      <Block h="Payments">
        <p>Payments are handled by Stripe. We never see or store your card details, and we keep only the payment confirmation and the email address Stripe collects, so we can deliver your pack and help with any questions.</p>
      </Block>
      <Block h="Your rights">
        <p>We never sell your data. You can ask us to see, correct or delete anything we hold about you by contacting us through the Contact page.</p>
      </Block>
    </ShellPage>
  ),
});
