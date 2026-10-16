# FixFirst: AI audit and fix agent for UK trades

A free scan that grades a cleaning, plumbing, electrical, landscaping or hair and beauty business from A to F, shows its five most important problems next to its three nearest rivals, and lets the owner pay for an AI agent to fix them.

## The owner's journey

```text
Home -> type name -> pick Google suggestion -> live scan (under 60s)
     -> Report: grade, score /100, photo vs 3 competitors, top 5 problems
     -> "Fix it for me" (GBP 5 each) or "Fix everything" (GBP 29)
     -> Email + pay -> agent works live -> results page with copy-ready text
        and a published one-page website -> re-check email after 30 days
```

## Pages

- **Home** (`/`): the large search box with Google suggestions, a trade picker if the trade can't be detected, a sample report preview and how it works.
- **Scan** (`/scan/$id`): a live agent feed that streams each step as it happens ("Reading 48 Google reviews", "Checking the Gas Safe register", "Comparing photos with 3 nearby plumbers"), with a progress ring, mini evidence cards popping in and the score counting up.
- **Report** (`/report/$id`): a big letter grade and score, the business photo beside three competitor photos, and five colour-coded problem cards. Each card has evidence, a before and after, and a "Fix it for me" button. Reports can be shared by link.
- **Fix** (`/fix/$id`): the live agent workspace that shows drafts being written, followed by results with copy buttons for review replies, the new profile description, Google posts and the review-request text.
- **Site** (`/site/$slug`): the published one-page business website the agent builds, with its own title and preview card.
- **Pricing** and **About** pages, plus a sample report.

## How scoring works

- Each trade has its own rulebook of weighted checks across five areas: Trust and credentials, Reviews, Profile completeness, Photos, and Web presence.
- Trade-specific checks include Gas Safe (plumbing), NICEIC/NAPIT (electricians), the waste carrier licence (cleaning and landscaping), insurance or accreditation mentions, and the photo types customers expect (before and after shots, the van, the team, the salon interior).
- The score is calculated by fixed rules in code rather than by AI, so results are repeatable and can be tested. AI only writes the plain-English explanation of the findings and the fixes.
- Bands run A 85+, B 70+, C 55+, D 40+, E 25+, F below 25. These can be adjusted.
- Credential checks only use public registers. Where a register can't be checked automatically, the report says "Not shown publicly" and does not claim the business is unregistered.

## The agent

- Scan agent: pulls Google place details, reviews, photos and three nearby competitors in the same trade, checks the website if there is one, runs the rulebook, and streams each step to the scan screen.
- Fix agent: uses AI to write each fix, then saves it and streams progress. The website fix generates a clean one-page site (hero, services, reviews, contact and area covered) from the business's real data and publishes it at a FixFirst address.
- Re-check: a scheduled job re-scans paid businesses after 30 days and emails the old score next to the new one.

## Payments and accounts

- Scanning needs no login. An email is collected when the owner saves a report or pays.
- Checkout offers a GBP 5 single fix or a GBP 29 bundle covering all fixes plus the 30-day re-check. I'll run the payment-provider recommendation and set up checkout in GBP.
- The agent cannot post to the owner's Google profile directly, because that needs the owner's Google login, so everything comes copy-ready with one-tap instructions. Posting directly through a "Connect Google" option could come later.

## Look and feel

A very refined, Lovable-style aesthetic: warm off-white canvas, soft depth, a generous display serif paired with a clean grotesk, subtle grain and gradient glows, rounded cards, and calm motion. Grades get their own colour scale from A (green) to F (red). The scan screen uses gentle shimmer, typing text and cards that spring in.

## What you'll need to get

A **Google Maps Platform API key** with these APIs enabled: **Places API (New)** for suggestions, details, photos, reviews and nearby competitors. You create it at console.cloud.google.com, under APIs and Services, then Credentials, then Create API key. Billing must be on, though Google's free monthly allowance covers early use. I'll ask you to paste it securely once the build reaches that step, and until then the app runs on realistic sample businesses.

## Build order

1. Design system, home page, sample data, and the live scan and report on sample data.
2. Lovable Cloud: storing businesses, scans, reports, fixes and sites. Trade rulebooks and the scoring engine, with tests.
3. Google Places connection, with real suggestions, details, photos and competitors.
4. AI fix agent with live streaming and the results page.
5. One-page website generator and publishing.
6. Payments in GBP, email capture and receipts.
7. 30-day re-check job and comparison email.
8. Page titles and share previews, then a full end-to-end test.

## Technical details

- TanStack Start routes as listed. Server functions handle the scan and fix work, a server route under `/api/public/` handles the payment webhook (with its signature verified), and a cron route handles re-checks.
- Tables: `businesses`, `scans` (with step events streamed for the live feed), `findings`, `orders`, `fixes`, `sites`, `rechecks`. Access to reports and fixes is by unguessable share token. Admin writes happen only on the server.
- AI goes through the Lovable AI Gateway (default model), with streamed responses and strict JSON output for fixes.
- `GOOGLE_MAPS_API_KEY` is used only on the server, and photos are proxied so the key is never exposed.
- The scoring engine is pure TypeScript per trade, with vitest tests for weights, bands and trade-specific checks.
- Email (receipts and re-checks) uses Lovable's built-in email.
