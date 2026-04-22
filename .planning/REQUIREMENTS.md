# Requirements — AI Advance Directive System

## v1 Requirements

### Session Setup

- [ ] **SETUP-01**: Interviewer can create a new session by entering the elderly person's name, age, and brief background
- [ ] **SETUP-02**: Session data persists in localStorage and survives page refresh
- [ ] **SETUP-03**: Interviewer can resume an existing session from a saved JSON file

### Interview Flow

- [ ] **INT-01**: Interview presents one question at a time (never a list)
- [ ] **INT-02**: Questions are organized into 5 domains: Medical, Financial, Daily Life, Relationships, End-of-Life
- [ ] **INT-03**: Domain progress grid shows status of each domain (not-started / in-progress / complete)
- [ ] **INT-04**: AI generates domain-specific questions based on the person's background profile
- [ ] **INT-05**: Interviewer can type the elderly person's answer into a text input per question
- [ ] **INT-06**: Answer is auto-saved to localStorage on every keystroke
- [ ] **INT-07**: AI suggests 1-2 follow-up probes per answer (collapsible panel, optional to use)
- [ ] **INT-08**: Interviewer can skip a domain entirely
- [ ] **INT-09**: Interviewer can navigate back to a previous question within a domain

### Archive Generation

- [ ] **ARCH-01**: Interviewer can trigger archive generation after completing at least one domain
- [ ] **ARCH-02**: AI generates a structured archive from the interview transcript
- [ ] **ARCH-03**: Archive contains: value weights (ranked priorities), scenario preferences, verbatim key quotes
- [ ] **ARCH-04**: Archive explicitly marks domains/topics where no clear preference was expressed
- [ ] **ARCH-05**: Archive is displayed read-only (no editing)
- [ ] **ARCH-06**: Archive can be exported as a JSON file
- [ ] **ARCH-07**: Archive generation uses temperature: 0 and requires source_quote citation for every field

### Decision Query

- [ ] **QUERY-01**: Interviewer can enter a free-text description of a decision scenario
- [ ] **QUERY-02**: AI returns a structured response: relevant values → verbatim quotes → suggested direction
- [ ] **QUERY-03**: AI response cites specific archive entries with hedged language ("her archive suggests...")
- [ ] **QUERY-04**: AI response explicitly states when archive information is insufficient for the scenario
- [ ] **QUERY-05**: Query history is shown in the current session (not persisted across sessions)

---

## v2 Requirements (Deferred)

- Voice input + auto-transcription for interview answers
- Multi-user collaboration (multiple family members on same archive)
- PDF export of archive
- Mobile-optimized UI
- Re-generation of archive after adding more interview answers
- Notification/reminder to complete remaining domains

---

## Out of Scope

- User accounts / authentication — adds friction, not needed for MVP validation
- Elderly-facing UI — core design decision: interviewer operates the product
- Legal document generation (wills, guardianship agreements) — different product category
- Cloud sync / server-side storage — local-first for MVP
- Multi-language support — Chinese/English only, no i18n framework

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 1 | Pending |
| SETUP-02 | Phase 1 | Pending |
| SETUP-03 | Phase 1 | Pending |
| INT-01 | Phase 1 | Pending |
| INT-02 | Phase 1 | Pending |
| INT-03 | Phase 1 | Pending |
| INT-04 | Phase 1 | Pending |
| INT-05 | Phase 1 | Pending |
| INT-06 | Phase 1 | Pending |
| INT-07 | Phase 1 | Pending |
| INT-08 | Phase 1 | Pending |
| INT-09 | Phase 1 | Pending |
| ARCH-01 | Phase 2 | Pending |
| ARCH-02 | Phase 2 | Pending |
| ARCH-03 | Phase 2 | Pending |
| ARCH-04 | Phase 2 | Pending |
| ARCH-05 | Phase 2 | Pending |
| ARCH-06 | Phase 2 | Pending |
| ARCH-07 | Phase 2 | Pending |
| QUERY-01 | Phase 3 | Pending |
| QUERY-02 | Phase 3 | Pending |
| QUERY-03 | Phase 3 | Pending |
| QUERY-04 | Phase 3 | Pending |
| QUERY-05 | Phase 3 | Pending |
