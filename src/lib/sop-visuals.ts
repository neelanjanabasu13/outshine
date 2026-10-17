/**
 * Browser-safe visual walkthroughs, tool links and AI prompts for the DIY SOPs.
 * Screens are simplified diagrams of real interfaces (not live screenshots), so
 * both the web page and the PDF can draw them from the same data.
 */
import type { Trade } from "./audit";

export interface UiScreen {
  title: string;
  /** Address bar text shown at the top of the diagram. */
  url: string;
  /** Rows of the screen; `mark` is the callout number for the element to click. */
  rows: { text: string; mark?: number; kind?: "button" | "field" | "text" }[];
  caption: string;
}
export interface ToolLink { name: string; url: string; bestFor: string }
export interface AiPrompt { label: string; text: string; openIn: ToolLink[] }

export const SCREEN_NOTE = "Simplified diagram of the real screen. Google moves buttons around from time to time, so look for the same label if yours looks slightly different.";

export const TOOLS_DISCLAIMER = "These are indicative starting points, not endorsements. We are not paid to mention any of them and there are plenty of other good options. If none fits, ask any AI assistant to suggest tools for your budget and trade.";

export const AI_ASSISTANTS: ToolLink[] = [
  { name: "ChatGPT", url: "https://chatgpt.com", bestFor: "General writing and ideas" },
  { name: "Claude", url: "https://claude.ai", bestFor: "Longer, natural-sounding copy" },
  { name: "Gemini", url: "https://gemini.google.com", bestFor: "Works well with Google accounts" },
  { name: "Perplexity", url: "https://www.perplexity.ai", bestFor: "Answers with sources, good for research" },
];

export const NO_CODE_TOOLS: ToolLink[] = [
  { name: "Lovable", url: "https://lovable.dev", bestFor: "Describe your site in plain English and AI builds it" },
  { name: "Carrd", url: "https://carrd.co", bestFor: "Very simple, cheap one-page sites" },
  { name: "Canva Websites", url: "https://www.canva.com/websites/", bestFor: "Drag-and-drop if you already use Canva" },
  { name: "Google Sites", url: "https://sites.google.com", bestFor: "Free and basic, uses your Google account" },
];

const gbp = "google.com/business";

export const SCREENS = {
  askReviews: {
    title: "Your Business Profile dashboard",
    url: "google.com/search?q=your+business+name",
    rows: [
      { text: "[Your business name]  ·  You manage this Business Profile", kind: "text" },
      { text: "Edit profile", kind: "button" }, { text: "Read reviews", kind: "button" },
      { text: "Ask for reviews", kind: "button", mark: 1 }, { text: "Add update", kind: "button" },
    ],
    caption: "Search your business name on Google while signed in. Your dashboard appears above the results. Click 'Ask for reviews'.",
  },
  reviewLink: {
    title: "Get more reviews (pop-up)",
    url: gbp,
    rows: [
      { text: "Share review form", kind: "text" },
      { text: "https://g.page/r/XXXXXXXX/review", kind: "field" },
      { text: "Copy link", kind: "button", mark: 2 },
    ],
    caption: "Click 'Copy link'. This is your personal review link. Paste it into your phone notes and a QR code generator.",
  },
  replyReviews: {
    title: "Reviews",
    url: gbp,
    rows: [
      { text: "Filter: Haven't replied", kind: "field", mark: 1 },
      { text: "★★★★★  Sarah K.  'Brilliant job, really tidy'", kind: "text" },
      { text: "Reply", kind: "button", mark: 2 },
    ],
    caption: "Switch the filter to 'Haven't replied', then click 'Reply' under each review and paste your adapted reply.",
  },
  description: {
    title: "Edit profile  >  About",
    url: gbp,
    rows: [
      { text: "Edit profile", kind: "button", mark: 1 },
      { text: "Description  (up to 750 characters)", kind: "field", mark: 2 },
      { text: "Save", kind: "button", mark: 3 },
    ],
    caption: "Click 'Edit profile', paste your description into the Description box, then click 'Save'.",
  },
  photos: {
    title: "Photos",
    url: gbp,
    rows: [
      { text: "Add photo", kind: "button", mark: 1 },
      { text: "Select from computer / phone  ·  drag photos here", kind: "field", mark: 2 },
      { text: "...  >  Set as cover photo", kind: "button", mark: 3 },
    ],
    caption: "Click 'Add photo', choose your shots, then use the three dots on your best one to set it as the cover.",
  },
  posts: {
    title: "Add update",
    url: gbp,
    rows: [
      { text: "Add update", kind: "button", mark: 1 },
      { text: "Add photo  +  Description (2 to 4 sentences)", kind: "field", mark: 2 },
      { text: "Add a button: Call now", kind: "field", mark: 3 },
      { text: "Post", kind: "button", mark: 4 },
    ],
    caption: "Add a real job photo, write a few sentences, choose 'Call now' as the button and click 'Post'.",
  },
  website: {
    title: "Edit profile  >  Contact",
    url: gbp,
    rows: [
      { text: "Edit profile  >  Contact", kind: "button", mark: 1 },
      { text: "Website:  https://yourbusiness.co.uk", kind: "field", mark: 2 },
      { text: "Save", kind: "button", mark: 3 },
    ],
    caption: "Paste your new website address into the Website field and click 'Save'.",
  },
} satisfies Record<string, UiScreen>;

export function websitePrompt(businessName: string, tradeLabel: string): AiPrompt {
  return {
    label: "Paste this into Lovable (or any AI assistant) to start your one-page site",
    text: `Build a one-page website for my local ${tradeLabel.toLowerCase()} business in the UK. Keep it simple, fast and mobile-first.

My details:
- Business name: ${businessName}
- Main services: [service 1], [service 2], [service 3]
- Areas I cover: [town 1], [town 2], [town 3]
- Phone number: [your number]
- WhatsApp: [your number, or delete this line]
- Why customers trust me: [e.g. 12 years' experience, fully insured, qualification you genuinely hold]
- Two real customer reviews: "[paste review 1]" and "[paste review 2]"

The page needs, in this order: a headline saying what I do and where, a large tap-to-call button, my services as a short list, the reviews, a space for my real job photos, and a simple contact form. Use plain British English. Do not invent qualifications, prices or reviews.`,
    openIn: [NO_CODE_TOOLS[0]!, ...AI_ASSISTANTS],
  };
}

export function reviewPrompt(businessName: string, tradeLabel: string): AiPrompt {
  return {
    label: "Paste this into any AI assistant to personalise your review messages",
    text: `I run ${businessName}, a ${tradeLabel.toLowerCase()} business in [your town], UK. Write three short, friendly WhatsApp messages (under 50 words each) asking a happy customer for a Google review after a [type of job]. Include the placeholder [review link]. Sound like a real local tradesperson, not a company. No incentives, no pressure.`,
    openIn: AI_ASSISTANTS,
  };
}

export function descriptionPrompt(businessName: string, tradeLabel: string): AiPrompt {
  return {
    label: "Paste this into any AI assistant to draft your description",
    text: `Write a Google Business Profile description (maximum 750 characters) for ${businessName}, a ${tradeLabel.toLowerCase()} business. Services: [list your real services]. Areas covered: [your towns]. Trust points: [insurance, years trading, qualifications you genuinely hold]. Plain British English, no phone numbers, no links, no capital-letter slogans.`,
    openIn: AI_ASSISTANTS,
  };
}

export type { Trade };
