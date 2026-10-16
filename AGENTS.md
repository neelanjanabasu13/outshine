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
- Sample businesses in `src/lib/sample.ts` stand in for Google Places until the API key is connected; agent outputs in `src/lib/agent.ts` stand in for live AI generation.
