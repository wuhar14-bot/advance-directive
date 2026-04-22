---
phase: 01-foundation-interview-flow
plan: 04
subsystem: api-routes
tags: [claude-api, server-routes, interview, security]
dependency_graph:
  requires: [01-02-PLAN.md, 01-03-PLAN.md]
  provides: [AI question generation, AI probe generation, server-only API key pattern]
  affects: [src/app/interview/page.tsx]
tech_stack:
  added: ["@anthropic-ai/sdk server-side usage", "Next.js Route Handlers"]
  patterns: ["server-only env vars", "async non-blocking probe fetch", "last-3-turns context window"]
key_files:
  created:
    - src/app/api/interview/questions/route.ts
    - src/app/api/interview/followup/route.ts
  modified:
    - src/app/interview/page.tsx
decisions:
  - "claude-haiku-4-5 chosen for both routes: fast and cost-effective for interview guidance"
  - "slice(-3) on previousTurns prevents context rot per ARCHITECTURE.md"
  - "fetchProbes not awaited in handleNext — probe generation never blocks navigation"
  - "ANTHROPIC_API_KEY accessed only in server route handlers, never in client"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-22"
  tasks_completed: 2
  files_changed: 3
---

# Phase 01 Plan 04: AI API Routes and Interview Wiring Summary

Server-side Claude API routes wired to the interview UI: question generation (4 per domain from person context) and follow-up probe generation (1-2 per answer, last 3 turns only, non-blocking).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | questions and followup API route handlers | f8e586f | src/app/api/interview/questions/route.ts, src/app/api/interview/followup/route.ts |
| 2 | Wire API routes into interview page | 2451f04 | src/app/interview/page.tsx |

## Deviations from Plan

None - plan executed exactly as written.

## Security Verification

- T-04-01 (API key exposure): `ANTHROPIC_API_KEY` accessed only via `process.env` in server route handlers. No `NEXT_PUBLIC_` prefix. Not logged. Confirmed no Anthropic SDK import in `page.tsx`.
- T-04-02 (JSON tampering): Both routes wrap `JSON.parse` in try/catch. Malformed responses return empty arrays, not crashes. Markdown code fences stripped before parse.
- T-04-03 (Rate limit DoS): 429 status caught in both routes and returned as user-friendly messages. No retry loops.

## Self-Check: PASSED

All files present. Both commits verified in git log.
