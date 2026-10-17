import { createFileRoute } from "@tanstack/react-router";
import { Block, ShellPage } from "@/components/Brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/solution")({
  head: () => pageHead("/solution", "How Outshine works · Outshine by Quietcrew", "Outshine scans your Google listing and website against nearby rivals, then helps you stand out with a DIY pack or our AI agent."),
  component: () => (
    <ShellPage title="How Outshine works" intro="Outshine checks how your business looks to local customers online, compares you with nearby rivals and shows you exactly how to stand out.">
      <Block h="1. A free scan in under a minute">
        <p>Search for your business and we read what customers actually see: your Google rating, how many reviews you have, your photos, opening hours, your website and the trade credentials named on it. We then compare you with similar businesses nearby so you know where you stand in your own postcode.</p>
      </Block>
      <Block h="2. Honest grades, never guesswork">
        <p>You get a letter grade overall and for each area we can genuinely check. If Google or your website does not show something, we leave it out rather than guess, so every grade is backed by evidence you can see for yourself.</p>
      </Block>
      <Block h="3. Stand out your way">
        <p>Choose the DIY pack and you get ready-to-use wording with one-click copy and open, a printable QR review card, a one-page website and step-by-step guides with a full PDF. When you would rather not lift a finger, <span className="font-semibold text-foreground">our AI agent does the work for you</span>, which we are opening up soon.</p>
      </Block>
    </ShellPage>
  ),
});
