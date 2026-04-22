# Phase 1: Foundation + Interview Flow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 01-foundation-interview-flow
**Areas discussed:** All areas auto-resolved (user: "don't ask me just run with what you have now")

---

## Session Setup
**Decision:** Minimal centered card form — name, age, background. "Begin Interview" CTA. Secondary "Resume from file" CTA.
**Notes:** User delegated all setup decisions to Claude.

## Interview Screen Layout
**Decision:** Two-panel layout — left domain progress grid, right question + answer area. One question at a time, textarea input, Previous/Next navigation, Skip Domain at domain level.
**Notes:** Based on research findings: one-question-at-a-time is table stakes for sensitive interview contexts.

## AI Follow-up Probes
**Decision:** Collapsible panel below answer, 1-2 chip suggestions, async generation, optional.
**Notes:** Research finding: probes as optional suggestions to interviewer (not automatic AI follow-ups) keeps interviewer in control.

## Data Persistence
**Decision:** Auto-save on keystroke, "Saved" indicator, Export button in header, Resume-from-file on setup screen, session resume banner on page load.
**Notes:** Research critical finding: localStorage data loss is highest-severity risk — export must be in Phase 1.

## Visual Style
**Decision:** Clean/calm aesthetic, white background, generous whitespace, shadcn/ui + Tailwind. Large question text. No bright colors.
**Notes:** Sensitive context (end-of-life topics) requires calm, non-gamified UI.

## Claude's Discretion
- Exact color palette
- shadcn/ui component variants
- Error states and edge cases
- Loading skeleton patterns
