# Phase 1: Foundation + Interview Flow - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete interviewer-facing session flow: session setup form → guided one-question-at-a-time interview across 5 domains → AI follow-up probe suggestions → localStorage autosave + JSON export/resume.

The elderly person never touches the product. The interviewer (adult child or social worker) operates everything.

</domain>

<decisions>
## Implementation Decisions

### Session Setup
- **D-01:** Setup form collects: person's name, age, brief background (2-3 sentences). These three fields are sufficient to personalize AI question generation. No other fields needed.
- **D-02:** Setup screen is minimal — single centered card, clean form, "Begin Interview" CTA. No onboarding wizard.
- **D-03:** After setup, interviewer lands directly on the interview screen with Domain 1 (Medical) pre-selected.

### Interview Screen Layout
- **D-04:** Two-panel layout: left sidebar shows domain progress grid (5 domains with status chips), right main area shows current question + answer input.
- **D-05:** Domain progress grid shows: domain name + status (not-started / in-progress / complete). Clicking a domain navigates to it.
- **D-06:** One question displayed at a time — large, readable text. No question list visible.
- **D-07:** Answer input is a textarea (not single-line input) — elderly people's answers tend to be multi-sentence.
- **D-08:** "Next Question" button advances to next question in domain. "Previous" button goes back within domain.
- **D-09:** "Skip Domain" button visible at domain level (not per-question). Skipped domains show as "skipped" in progress grid.

### AI Follow-up Probes
- **D-10:** After interviewer submits an answer (clicks "Next Question"), AI probe suggestions appear in a collapsible panel below the answer — labeled "Suggested follow-ups".
- **D-11:** Panel shows 1-2 probe suggestions as clickable chips. Clicking a chip copies the probe text into a "follow-up note" field the interviewer can use to prompt the elderly person.
- **D-12:** Probes are optional — interviewer can ignore them and proceed. Panel is collapsed by default on first load, expanded after first answer submission.
- **D-13:** Probe generation is async — fires after answer is saved, does not block navigation.

### Data Persistence
- **D-14:** Auto-save on every keystroke to localStorage. No explicit "save" button needed.
- **D-15:** Auto-save indicator: small "Saved" text with timestamp in top-right corner, updates on each save.
- **D-16:** "Export session" button in header saves full SessionData as JSON file to disk.
- **D-17:** On setup screen, secondary CTA: "Resume from file" — opens file picker, loads JSON, skips setup form, lands on interview screen at last position.
- **D-18:** If localStorage has an existing session on page load, show a banner: "Resume previous session?" with Resume / Start New options.

### Visual Style
- **D-19:** Clean, calm aesthetic — white background, generous whitespace, muted colors. This is a sensitive context (discussing end-of-life topics). No bright colors, no gamification.
- **D-20:** shadcn/ui components throughout. Tailwind for spacing/layout.
- **D-21:** Typography: large question text (24px+), comfortable reading size for answer textarea.

### Claude's Discretion
- Exact color palette within "calm/muted" direction
- Specific shadcn/ui component variants (Card, Button, Textarea, Badge)
- Error states and edge cases (empty answer, network error on probe generation)
- Exact question count per domain (AI generates these dynamically)
- Loading skeleton patterns

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core product decisions, tech stack, constraints
- `.planning/REQUIREMENTS.md` — SETUP-01 through INT-09 acceptance criteria
- `.planning/research/SUMMARY.md` — Stack recommendations, pitfalls, architecture decisions
- `.planning/research/STACK.md` — Next.js 15, Anthropic SDK, Zustand, shadcn/ui specifics
- `.planning/research/ARCHITECTURE.md` — SessionData schema, API route design, data flow
- `.planning/research/PITFALLS.md` — localStorage data loss prevention, API key exposure, interview abandonment

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project. Phase 1 establishes all base patterns.

### Established Patterns
- Stack: Next.js 15 App Router, TypeScript, Zustand with persist middleware, shadcn/ui + Tailwind 4
- Data: SessionData schema in localStorage via Zustand persist (defined in Phase 1, used by all phases)
- API: Server-only Route Handlers for all Claude API calls (never import SDK in client components)

### Integration Points
- Phase 2 (Archive Generation) reads SessionData.transcript from localStorage
- Phase 3 (Decision Query) reads SessionData.archive from localStorage
- All phases share the same SessionData type — schema must be stable after Phase 1

</code_context>

<specifics>
## Specific Ideas

- The interview should feel like a thoughtful conversation, not a form. Large question text, spacious layout, no progress bars that make it feel like a test.
- The "Suggested follow-ups" panel should feel like a coaching whisper to the interviewer — subtle, optional, helpful.
- Export/resume is a safety net, not a primary feature. It should be accessible but not prominent.

</specifics>

<deferred>
## Deferred Ideas

- Voice input for answers — v2 after text flow validated
- Mobile layout — desktop-first for MVP
- Multi-domain simultaneous view — keep one-domain-at-a-time for MVP
- Progress percentage / estimated time remaining — not needed for MVP

</deferred>

---

*Phase: 01-foundation-interview-flow*
*Context gathered: 2026-04-22*
