# Project: AI Advance Directive System

## What This Is

A web-based interview tool that helps families capture an elderly person's values and preferences while they are cognitively healthy — so that when they lose the ability to speak for themselves, a guardian (family member or social worker) can make decisions that truly reflect who they are.

**Core insight:** The problem is not "who has legal authority to decide" — it's "what would this person actually want." Existing solutions (wills, guardianship agreements) solve authorization, not information. This product solves the information gap.

## Core Value

A guardian facing a hard decision can query the archive and receive: the person's relevant values, their own words, and a reasoned direction — giving the guardian both information and psychological permission to act.

## Who It's For

**Primary user (Interviewer):** Adult child or social worker who conducts the interview session with the elderly person. They operate the product; the elderly person only needs to speak.

**Secondary user (Decision-maker):** Usually the same person as the interviewer. Queries the archive when a proxy decision is needed.

**The elderly person** is not a product user — they are the information source.

## The Three-Stage Flow

1. **Interview** — Interviewer follows AI-generated questions across 5 domains (medical, financial, daily life, relationships, end-of-life). Records the elderly person's answers in real time. AI suggests follow-up probes.

2. **Archive Generation** — AI distills the conversation into a structured profile: value weights, scenario preferences, key quotes. Stores reasoning patterns, not just answers — enabling extrapolation to novel situations.

3. **Decision Query** — When a proxy decision is needed, the interviewer describes the situation. AI retrieves relevant archive content and outputs: applicable values + original quotes + suggested direction.

## Key Constraints

- **No user accounts** — No login, no registration. Data stored in browser session or local file. Removes friction for MVP validation.
- **No elderly-facing UI** — The elderly person never touches the product. Eliminates the biggest adoption barrier.
- **No legal document generation** — Not a will, not a guardianship agreement. Purely informational.

## Tech Stack (Decided)

- Next.js (React) — frontend + API routes
- Anthropic Claude API — interview guidance, archive generation, decision query
- Local storage / JSON file — data persistence (no database for MVP)
- Vercel — deployment

## What "Done" Looks Like

A social worker or adult child can:
1. Start an interview session for a parent
2. Complete a 20-30 minute guided interview across at least 3 domains
3. View a generated archive summarizing the parent's values and preferences
4. Query the archive with a real scenario and receive a useful, grounded response

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Interviewer can start a new session and enter basic info about the elderly person
- [ ] AI generates domain-specific interview questions based on person's background
- [ ] Interviewer can record answers (text input) per question
- [ ] AI suggests real-time follow-up probes based on answers given
- [ ] AI generates structured archive from completed interview
- [ ] Archive displays: value weights, scenario preferences, key quotes
- [ ] Interviewer can describe a decision scenario and receive AI-generated guidance
- [ ] AI guidance cites specific archive content (values + original quotes)
- [ ] Session data persists across page refreshes (local storage)
- [ ] Interview can be completed across multiple sessions

### Out of Scope

- User accounts / authentication — adds friction, not needed for MVP validation
- Elderly-facing UI — core design decision: interviewer operates the product
- Legal document generation — different product category, different liability
- Voice input / transcription — v2 feature after text flow is validated
- Multi-user collaboration — v2 after single-user flow is validated
- Mobile-optimized UI — desktop-first for MVP

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No elderly-facing UI | Removes biggest adoption barrier; interviewer operates product | Confirmed |
| No user accounts | Reduces friction for MVP; validate core flow first | Confirmed |
| Interviewer = child or social worker | Same product serves both B2C and B2B paths | Confirmed |
| Store reasoning patterns, not just answers | Enables extrapolation to novel scenarios not covered in interview | Confirmed |
| Text input first, voice later | Validate core AI quality before adding transcription complexity | Confirmed |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 after initialization*
