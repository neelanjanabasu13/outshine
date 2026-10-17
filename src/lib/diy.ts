import { TRADES, type Finding, type Trade } from "./audit";

export function diyInstructions(f: Finding, trade: Trade): string[] {
  const t = TRADES[trade];
  if (f.id === "hours") return [
    "Open Edit profile in your Google Business Profile and choose Hours.",
    "Enter your actual regular opening hours, or choose the appropriate option if your business does not use regular hours.",
    "Add holiday exceptions, save and check your public profile.",
  ];
  switch (f.fix) {
    case "description": return [
      "Open your Google Business Profile, choose Edit profile, then Business information.",
      `Describe your real services and service area in up to 750 characters, listing at least ${t.minServices} relevant services.`,
      `Mention ${t.credential} only if you hold it, and explain it simply: ${t.credentialPlain}`,
      "Save your changes and check that the description appears on your public profile.",
    ];
    case "review-request": return [
      "In your Google Business Profile, choose Ask for reviews and copy your actual review link.",
      "Send it to customers after a completed job, asking for an honest review without rewards or pressure.",
      "Use one polite follow-up and keep a weekly record of new reviews. Never buy or fabricate reviews.",
    ];
    case "review-replies": return [
      "Open Read reviews in your Google Business Profile and find reviews without an owner reply.",
      "Thank each customer personally, addressing what they actually wrote.",
      "For complaints, acknowledge the issue and offer a private way to resolve it, without sharing customer details.",
    ];
    case "photos": return [
      `Collect clear, genuine images of ${t.expectedPhotos}, aiming for at least ${t.minPhotos} useful photos.`,
      "Get permission before showing customers or their homes, then upload through Photos in your Google Business Profile.",
      "Keep images representative of your current work, replacing obsolete images rather than chasing an arbitrary upload schedule.",
    ];
    case "posts": return [
      "Check Edit profile for accurate opening hours, including holiday changes.",
      "Choose Add update and write a short, factual post about a real service, recent job or available appointment.",
      "Include a relevant photo and a booking or contact link, then check the published update.",
    ];
    case "website": return [
      "Create a page with your actual services, service area, phone number and a working contact method.",
      "Use genuine reviews and photos with permission, and show only qualifications you really hold.",
      "Add its address under Edit profile, Contact, Website, then test the link and enquiry form yourself.",
    ];
  }
}