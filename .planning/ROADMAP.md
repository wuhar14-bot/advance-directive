# Roadmap — AI Advance Directive System

## Phases

- [ ] **Phase 1: Foundation + Interview Flow** - Working Next.js app with session setup and full guided interview UI
- [ ] **Phase 2: Archive Generation** - AI distills interview into structured, citable archive
- [ ] **Phase 3: Decision Query** - Guardian queries archive and receives grounded, cited guidance
- [ ] **Phase 4: Polish + Deploy** - Vercel deployment, UX hardening, end-to-end validation

---

## Phase Details

### Phase 1: Foundation + Interview Flow
**Goal**: Interviewer can start a session and conduct a complete guided interview across all 5 domains
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, INT-01, INT-02, INT-03, INT-04, INT-05, INT-06, INT-07, INT-08, INT-09
**Success Criteria** (what must be TRUE):
  1. Interviewer can enter a person's name, age, and background and begin an interview session
  2. Interview presents exactly one question at a time with a text input for the answer, and auto-saves on every keystroke
  3. Domain progress grid shows which of the 5 domains are not-started, in-progress, or complete
  4. After submitting an answer, AI suggests 1-2 follow-up probes in a collapsible panel
  5. Interviewer can skip a domain or navigate back to a previous question without losing saved answers
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 01-01-PLAN.md — Project scaffold, SessionData schema, Zustand persist store
- [ ] 01-02-PLAN.md — Session setup screen (setup form + resume-from-file + ResumeBanner)
- [ ] 01-03-PLAN.md — Interview screen (two-panel layout, question flow, domain navigation)
- [ ] 01-04-PLAN.md — AI integration (question generation + follow-up probes API routes)

### Phase 2: Archive Generation
**Goal**: Interviewer can generate a structured, read-only archive from the interview transcript
**Depends on**: Phase 1
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-06, ARCH-07
**Success Criteria** (what must be TRUE):
  1. Interviewer can trigger archive generation after completing at least one domain
  2. Generated archive displays value weights, scenario preferences, and verbatim key quotes
  3. Archive explicitly marks any domain or topic where no clear preference was expressed
  4. Archive is displayed read-only and can be exported as a JSON file
**Plans**: TBD
**UI hint**: yes

### Phase 3: Decision Query
**Goal**: Guardian can describe a real decision scenario and receive archive-grounded guidance
**Depends on**: Phase 2
**Requirements**: QUERY-01, QUERY-02, QUERY-03, QUERY-04, QUERY-05
**Success Criteria** (what must be TRUE):
  1. Interviewer can type a free-text decision scenario and receive a structured AI response
  2. Response cites specific archive entries with hedged language and includes verbatim quotes
  3. Response explicitly states when the archive lacks sufficient information for the scenario
  4. All queries from the current session are visible in a history panel
**Plans**: TBD
**UI hint**: yes

### Phase 4: Polish + Deploy
**Goal**: The app is deployed to Vercel and handles real-world usage without failure
**Depends on**: Phase 3
**Requirements**: (no new v1 requirements — this phase hardens and ships the prior three)
**Success Criteria** (what must be TRUE):
  1. App is live on a Vercel URL with environment variables configured and API routes responding
  2. Long AI calls (archive generation, query) handle timeouts gracefully with user feedback
  3. Sensitive end-of-life domain questions are paced with appropriate UI cues
  4. A complete end-to-end run (session → interview → archive → query) completes without errors
**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Interview Flow | 0/4 | Not started | - |
| 2. Archive Generation | 0/2 | Not started | - |
| 3. Decision Query | 0/2 | Not started | - |
| 4. Polish + Deploy | 0/1 | Not started | - |
