<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Grading logic lives in `src/lib/audit.ts` as pure functions with tests in `audit.test.ts`; keep it I/O-free so real Google data can be swapped in for sample data.
- Live businesses come from Google Places via `src/lib/places.server.ts` (ids `live.<trade>.<placeId>`), mapped into the sample `Business` shape; `src/lib/sample.ts` remains as fallback demo data; agent outputs in `src/lib/agent.ts` stand in for live AI generation.
- Benchmark and improvement projections are pure audit functions; projections never mutate the original audit or claim to update a live profile.
- Checkout accepts only whole-report DIY and done-for-you tiers, with prices validated centrally in the audit module; Stripe opens in a separate tab to avoid embedded-preview restrictions, and purchases unlock only after server-side payment verification.
- DIY packs use trade-specific guidance in `src/lib/diy.ts` and unlock a download separately from agent output.
- Homepage trade browsing reuses live Places search with pure query and review-count ordering helpers in `src/lib/discovery.ts`, keeping discovery distinct from audit grades.
- Homepage discovery shows the punny TradeDeck cards (horizontal scroll) plus the shared Embla carousel of photo business cards (fixed height) directly under the search box, shown once, so browsing never pushes the page down or repeats trade choices.
- Curated city/trade references live in the browser-safe reference catalogue with source links; public grades use only exposed fields and unknown areas remain unassessed to avoid fabricated evidence.
- Live grading uses only verifiable evidence: Google Places fields (rating, review count, photo count, website, hours) plus a server-side read of the business's own website for trade credentials; review dates and photo uploaders from the five-review, ten-photo samples are never graded; an overall A requires Credentials to be assessed and no area graded D or F.
- Trade-specific DIY depth (root causes, shot lists, scripts, guardrails) lives in browser-safe `src/lib/playbook.ts` and is merged into SOPs by `sopFor`, so research updates never touch page code.
- The paid pack downloads as a text-based PDF built in the browser by `src/lib/report-pdf.ts` from the same SOP data the page shows, keeping page and PDF in sync and searchable.
- The public MCP server lives in `src/lib/mcp/` (one tool per file, read-only, public business data only) and reuses the Places and audit modules so assistant answers match the website's grades.
