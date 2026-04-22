# Domain Pitfalls

**Domain:** AI-powered interview tool (advance directive / values capture)
**Researched:** 2026-04-22

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or user trust collapse.

---

### Pitfall 1: Archive Hallucination — AI Invents Values the Person Never Expressed

**What goes wrong:** The archive generation prompt receives a long interview transcript and produces a structured profile. Claude fills gaps by inferring or fabricating values that were never stated — presenting them with the same confidence as things the person actually said. The guardian reads the archive and makes a decision based on invented preferences.

**Why it happens:** LLMs are trained to produce coherent, complete-sounding output. When asked to generate a "structured profile of values," the model will complete the structure even when the interview data is sparse. Without explicit grounding instructions, Claude will extrapolate freely.

**Consequences:** A guardian acts on a fabricated preference. In a medical or end-of-life context, this is a serious harm. Even if no harm occurs, discovery of fabrication destroys trust in the entire product permanently.

**Prevention:**
- System prompt must explicitly instruct: "Only include values and preferences that are directly supported by the interview transcript. If a domain was not covered, say so explicitly. Do not infer or extrapolate."
- Archive output format should include a `source_quote` field for every value claim — forces the model to cite evidence.
- Add a "coverage gaps" section to the archive: domains where the interview was thin or silent.
- At query time, instruct Claude to say "the archive does not address this" rather than extrapolate.

**Detection:** Review 5 generated archives against their source transcripts. Any value claim without a traceable quote is a hallucination risk.

**Phase:** Address in Phase 2 (Archive Generation). Prompt design is the core deliverable of that phase — get this right before shipping.

---

### Pitfall 2: localStorage Data Loss — Interview Work Silently Disappears

**What goes wrong:** A family member spends 45 minutes conducting an interview. They close the tab, clear browser history, switch browsers, or use a private/incognito window. All data is gone. There is no recovery path.

**Why it happens:** localStorage is browser-scoped, origin-scoped, and not backed up. It is silently cleared by: "Clear browsing data" (which most users do periodically), browser storage pressure eviction (Chrome/Edge evict under disk pressure), private browsing mode (data never persists), and switching browsers or devices.

**Consequences:** Complete data loss of an irreplaceable interview. The elderly person may not be available for a second session. This is the single highest-severity data risk in the product.

**Prevention:**
- Auto-export: after every AI response, silently serialize the session to a downloadable JSON file and prompt the user to save it. Do not rely on them remembering.
- Show a persistent "Save your session" banner with a one-click download button throughout the interview.
- On session load, offer "Resume from file" as the primary CTA alongside "Start new."
- Never use sessionStorage for interview data — it clears on tab close.
- Consider IndexedDB instead of localStorage for larger payloads (localStorage cap is 5-10MB per origin).

**Detection:** Warning sign: no export/import mechanism exists. Warning sign: session data exceeds 2MB (approaching localStorage limits for some browsers).

**Phase:** Address in Phase 1 (Interview Flow). Build export/import before the first user test. Do not defer.

---

### Pitfall 3: Vercel Serverless Timeout Killing Archive Generation

**What goes wrong:** Archive generation sends a full interview transcript (potentially 10,000+ tokens) to Claude and waits for a structured response. On Vercel Hobby plan, the default function timeout is 300 seconds. A large archive generation request that takes longer than this silently fails — the user sees a spinner that never resolves, or a generic error.

**Why it happens:** Vercel Hobby plan caps at 300 seconds. Pro/Enterprise allow up to 800 seconds. Archive generation is the most token-intensive operation: large input + structured output. Without streaming, the entire response must complete within the timeout window.

**Consequences:** Archive generation fails for longer interviews. Users retry, get charged twice for API tokens, and may still fail. The product appears broken.

**Prevention:**
- Use streaming for all Claude API calls, including archive generation. Stream the structured JSON incrementally rather than waiting for the full response.
- Set `export const maxDuration = 300` in route files explicitly (don't rely on defaults).
- For archive generation specifically, consider chunking: generate each domain section as a separate API call rather than one monolithic request.
- If staying on Hobby plan, keep archive prompts lean — summarize the transcript before sending it to the archive generation step.

**Detection:** Warning sign: archive generation works locally but times out in production. Warning sign: no `maxDuration` export in API route files.

**Phase:** Address in Phase 2 (Archive Generation). Test on Vercel (not just local) before declaring the phase done.

---

### Pitfall 4: Inconsistent AI Behavior Across Sessions — Same Person, Different Archive

**What goes wrong:** The interviewer runs the same interview twice (or re-generates the archive). The two archives describe the person's values differently — different weights, different framings, sometimes contradictory. The guardian loses confidence in the archive's reliability.

**Why it happens:** LLM outputs are non-deterministic by default. Temperature > 0 means the same prompt produces different outputs. For a product where the archive is meant to be a stable, trustworthy record, this is a serious UX problem.

**Consequences:** Users distrust the archive. They re-generate repeatedly trying to get the "right" answer. Or they notice contradictions between the archive and their memory of the interview.

**Prevention:**
- Set `temperature: 0` for archive generation and decision query calls. Consistency matters more than creativity here.
- For follow-up question generation during the interview, temperature can be slightly higher (0.3-0.5) since variety is desirable there.
- Store the generated archive as a fixed artifact — do not re-generate on every view. The archive is a snapshot, not a live query.
- Version the archive: if the user re-generates, show both versions and ask them to confirm which to keep.

**Detection:** Warning sign: archive is re-generated on every page load. Warning sign: no temperature parameter set in API calls.

**Phase:** Address in Phase 2. Temperature and storage strategy are architectural decisions that affect all downstream phases.

---

## Moderate Pitfalls

---

### Pitfall 5: Interview Abandonment from Cognitive Overload

**What goes wrong:** The interviewer is presented with too many questions at once, or questions that feel clinical and impersonal. They lose the thread of the conversation with the elderly person, feel overwhelmed, and abandon the session partway through.

**Why it happens:** AI-generated question lists tend toward completeness. Without explicit constraints, Claude will generate 8-12 questions per domain. The interviewer is trying to hold a natural conversation while also operating software — cognitive load is already high.

**Consequences:** Incomplete archives. Low-quality answers because the interviewer is rushing. Abandonment before archive generation, meaning no value is captured at all.

**Prevention:**
- Show one question at a time, not a list. The interviewer should never see more than the current question and the answer field.
- Limit AI to suggesting 2-3 follow-up probes, not a full list.
- Show a progress indicator (e.g., "Domain 2 of 5") so the interviewer knows where they are.
- Allow skipping a domain entirely — some families will not want to discuss end-of-life topics in the first session.
- Design for 20-30 minute sessions as stated in the project brief. If a domain takes more than 5-6 minutes, the question set is too long.

**Detection:** Warning sign: question list UI shows all questions simultaneously. Warning sign: no skip/pause mechanism exists.

**Phase:** Address in Phase 1 (Interview Flow). This is a core UX constraint, not a polish item.

---

### Pitfall 6: Decision Query Returns Advice That Feels Fabricated or Overconfident

**What goes wrong:** The guardian queries the archive with a real scenario. Claude returns a confident recommendation ("Based on her values, she would want X"). The guardian knows the person well and the recommendation feels wrong — or the archive simply doesn't have enough data to support that conclusion. The guardian loses trust in the tool at the exact moment they need it most.

**Why it happens:** LLMs default to confident, helpful-sounding responses. Without explicit instructions to hedge and cite, Claude will produce authoritative-sounding guidance even when the underlying evidence is thin.

**Consequences:** The guardian either over-relies on a bad recommendation, or dismisses the tool entirely after one bad experience. Either outcome is a product failure.

**Prevention:**
- System prompt for decision query must require: (1) cite the specific archive entry supporting each claim, (2) explicitly state when the archive does not address the scenario, (3) use hedged language ("her archive suggests" not "she would want").
- Show the source quotes inline with the recommendation — not just the conclusion.
- Add a confidence indicator: "This recommendation is based on 3 directly relevant archive entries" vs "This scenario was not covered in the interview."
- Never let Claude extrapolate beyond the archive without flagging it as extrapolation.

**Detection:** Warning sign: decision query output contains no citations. Warning sign: output uses first-person definitive statements ("She would want...").

**Phase:** Address in Phase 3 (Decision Query). The citation and hedging requirements are the core prompt engineering challenge of that phase.

---

### Pitfall 7: Context Rot in Long Interview Sessions

**What goes wrong:** A long interview session accumulates many turns. By the time the interviewer reaches domain 4 or 5, the AI's follow-up suggestions become generic or repeat earlier questions — because the model's attention degrades over long contexts.

**Why it happens:** Anthropic's own documentation explicitly warns: "more context isn't automatically better. As token count grows, accuracy and recall degrade, a phenomenon known as context rot." A 30-minute interview with detailed answers can easily reach 15,000-30,000 tokens.

**Consequences:** Follow-up questions become repetitive or irrelevant. The interviewer notices the AI is "not paying attention." Quality of the interview degrades in the second half.

**Prevention:**
- Pass only the current domain's transcript to the follow-up question generator, not the full session history.
- For archive generation, summarize each domain separately before combining into the final archive.
- Use a sliding window: the follow-up prompt should include the last 3-5 exchanges, not the entire session.
- Keep system prompts concise — every token in the system prompt is a token not available for interview content.

**Detection:** Warning sign: follow-up question prompt includes the full session transcript. Warning sign: no domain-scoping in the prompt design.

**Phase:** Address in Phase 1 (prompt architecture) and Phase 2 (archive generation chunking).

---

## Minor Pitfalls

---

### Pitfall 8: API Key Exposed in Client-Side Code

**What goes wrong:** The Anthropic API key is accidentally included in client-side JavaScript (e.g., in a Next.js page component or a `use client` file). It becomes visible in browser dev tools and gets scraped.

**Prevention:** All Claude API calls must go through Next.js API routes (server-side). Never import the Anthropic SDK in client components. Use `ANTHROPIC_API_KEY` as a server-only environment variable (no `NEXT_PUBLIC_` prefix).

**Phase:** Address in Phase 1. Establish the pattern before writing any AI integration code.

---

### Pitfall 9: No Rate Limit Handling Causes Silent Failures

**What goes wrong:** During a demo or user test, multiple API calls fire in quick succession (follow-up generation + archive generation). Anthropic returns a 429. The app shows a generic error or hangs.

**Prevention:** Implement exponential backoff with retry for all Claude API calls. Show a user-friendly "thinking..." state with a timeout message if the call takes more than 15 seconds.

**Phase:** Address in Phase 1 alongside the first API integration.

---

### Pitfall 10: Vercel Free Tier Function Execution Hours

**What goes wrong:** The Vercel Hobby plan includes 100 hours of serverless function execution per month. An AI-heavy app where every interaction calls Claude can burn through this quickly during user testing.

**Prevention:** Monitor function execution time in Vercel dashboard. Cache AI responses where possible (e.g., the initial question set for a domain can be cached). Consider upgrading to Pro ($20/month) before any real user testing begins.

**Phase:** Monitor from Phase 1 deployment onward.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Interview flow | localStorage data loss | Build export/import before first user test |
| Phase 1: Interview flow | Interview abandonment | One question at a time, skip mechanism, progress indicator |
| Phase 1: API integration | API key exposure | Server-only routes, no NEXT_PUBLIC_ prefix |
| Phase 2: Archive generation | Hallucination / fabricated values | Source-quote requirement in every archive field |
| Phase 2: Archive generation | Vercel timeout | Streaming + chunked generation + explicit maxDuration |
| Phase 2: Archive generation | Inconsistent output | temperature: 0, store as fixed artifact |
| Phase 3: Decision query | Overconfident recommendations | Mandatory citation, hedged language, coverage gaps |
| All phases | Context rot in long sessions | Domain-scoped prompts, sliding window for follow-ups |

---

## Sources

- Anthropic official docs — context windows and context rot: https://platform.claude.com/docs/en/docs/build-with-claude/context-windows
- Vercel AI SDK timeout docs: https://ai-sdk.dev/v5/docs/troubleshooting/timeout-on-vercel
- Vercel Edge Function duration limits: https://vercel.com/changelog/new-execution-duration-limit-for-edge-functions
- MDN — Storage quotas and eviction criteria: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Gartner survey on AI summary distrust (53%): https://www.gartner.com/en/newsroom/press-releases/2025-09-03-gartner-survey-finds-53-percent-of-consumers-distrust-ai-powered-search-results0
- Form abandonment statistics: https://www.zuko.io/blog/25-conversion-rate-statistics-you-need
