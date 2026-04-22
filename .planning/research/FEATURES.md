# Feature Landscape

**Domain:** AI-guided interview tool for capturing personal values (advance directive / proxy decision support)
**Researched:** 2026-04-22

---

## Table Stakes

Features users expect. Missing = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One-question-at-a-time flow | Conversational AI tools universally use this; showing all questions at once creates cognitive overload and lower completion rates | Low | Chatbot-style turn-taking is the established norm for AI interview tools |
| Domain progress indicator | Users need to know where they are in a 20-30 min session; without it, abandonment spikes | Low | "Medical (1/5)" style section label beats a raw percentage bar for sensitive multi-domain flows |
| Per-question answer input with save | Answers must persist per question; losing work is catastrophic for trust in a sensitive context | Low | Local storage autosave on every keystroke, not just on "next" |
| AI follow-up probe suggestions | The core differentiator of AI over a static form; users expect the AI to react to what was said | Medium | Probes should be optional/dismissible — interviewer decides whether to ask them |
| Session resume across page refreshes | A 30-min interview cannot be lost to a browser refresh | Low | LocalStorage with session ID; warn before closing tab |
| Archive view after interview | Users expect to see what was captured; a black box archive destroys trust | Medium | Structured display: value weights, key quotes, scenario preferences |
| Decision query input | The core use case for the archive; must be discoverable and clearly labeled | Low | Free-text scenario description → AI response |
| AI response cites archive content | Without citations back to the archive, the response feels fabricated | Medium | Every AI guidance response must reference specific values + original quotes |
| Basic person profile (name, age, background) | Needed to personalize questions; users expect the AI to know who it's interviewing | Low | Collected at session start; feeds question generation |

---

## Differentiators

Features that set this product apart. Not universally expected, but high value when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Contextual probe generation (not canned probes) | AI generates follow-ups based on the specific answer given, not a fixed probe list — produces richer data and feels more like a real conversation | High | Requires per-answer LLM call; latency must be managed (show "thinking..." state) |
| Domain completion status dashboard | Visual overview of which of the 5 domains are complete, partial, or untouched — lets interviewer plan across multiple sessions | Low | Simple status grid; reduces anxiety about "did I cover everything?" |
| Quote extraction with attribution | Archive explicitly surfaces verbatim quotes from the interview, labeled as the person's own words — not paraphrased | Medium | Critical for psychological permission: guardian sees "she said X in her own words" |
| Reasoning transparency in archive | Archive shows not just preferences but the inferred value weights behind them — enables extrapolation to novel scenarios | High | This is the core architectural bet of the product; differentiates from a simple Q&A log |
| Scenario-grounded query response | Decision query response explicitly maps the scenario to relevant archive values, not just generic guidance | High | Response structure: [scenario] → [applicable values] → [original quotes] → [suggested direction] |
| Graceful "I don't know" in query responses | When the archive lacks relevant data for a scenario, AI says so explicitly rather than hallucinating a direction | Medium | Trust-critical: a confident wrong answer is worse than an honest gap |
| Domain skip and return | Interviewer can skip a domain and return later — supports multi-session use and respects emotional pacing | Low | Especially important for end-of-life domain, which may need a separate session |
| Sensitive topic pacing cues | UI signals when entering emotionally heavy domains (end-of-life, relationships) — gives interviewer a moment to prepare | Low | A brief "this section covers..." framing before the first question in each domain |
| Export to JSON/PDF | Allows the archive to be shared with other family members or stored outside the browser | Medium | PDF for human reading; JSON for potential future import |

---

## Anti-Features

Features to explicitly NOT build in MVP.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| All questions displayed at once | Increases cognitive load, reduces completion rate, removes the conversational feel that makes AI valuable here | One question at a time, always |
| Confidence scores as raw numbers | "73% confidence" means nothing to a family member making a care decision; creates false precision anxiety | Use human-readable framing: "Based on multiple answers across the interview..." |
| Editable archive fields | Letting the interviewer manually edit the AI-generated archive breaks the chain of provenance — guardian can no longer trust it reflects the person's actual words | Archive is read-only; corrections happen by re-interviewing or adding a note |
| Mandatory question completion | Forcing answers to every question before proceeding causes abandonment on sensitive topics | Mark questions as optional; allow "skip for now" |
| Real-time AI response streaming for probes | Streaming probe suggestions while the interviewer is still reading the answer creates distraction | Generate probes after answer is submitted, not during typing |
| Elaborate onboarding wizard | This product is used in a specific, high-stakes moment; a long onboarding adds friction before the user has validated the tool | Minimal setup: name, age, relationship. Start interviewing immediately. |
| Social sharing or export to cloud | Advance directive data is deeply personal; any cloud sync or sharing feature raises privacy concerns that will block adoption | Local-only for MVP; export to local file only |
| Scoring or "completeness percentage" for the person | Framing the elderly person's values as a score is dehumanizing and will alienate interviewers | Use domain coverage status (complete/partial/not started), never a score |

---

## Feature Dependencies

```
Person profile → Question generation (AI needs background to personalize questions)
Question generation → Per-question answer input
Per-question answer input → AI probe suggestions (probes react to specific answers)
Completed interview (≥1 domain) → Archive generation
Archive generation → Archive view
Archive view → Decision query
Decision query → Cited AI response
```

---

## Interview Flow UX: Key Patterns

### Question-by-question vs all-at-once

Research on AI-moderated interviews consistently shows one-question-at-a-time produces higher engagement and richer responses than showing all questions upfront. The conversational turn-taking pattern is now the established norm for AI interview tools (Outset, GreatQuestion, Qualz all use it). For a sensitive domain like advance directives, showing 20+ questions at once would be especially harmful — it signals "this is a form" rather than "this is a conversation."

**Recommendation:** Strict one-question-at-a-time. No question list visible. Domain label + question number within domain ("Medical — Question 3") is sufficient orientation.

### Progress indicators

For multi-domain flows, a domain-level progress indicator (5 domains, each with a status) outperforms a single linear progress bar. Reasons:
- A linear bar that barely moves for the first 10 questions creates "slog anxiety"
- Domain-level status lets the interviewer plan ("we've done medical and financial, let's do relationships next session")
- Matches the mental model: the interviewer thinks in domains, not question numbers

**Recommendation:** Domain status grid (not started / in progress / complete) as the primary progress signal. Question number within domain as secondary.

### Sensitive topic pacing

UX research on forms with sensitive content (medical, financial, end-of-life) consistently shows that a brief framing sentence before entering a new domain reduces abandonment. The pattern: "We're now moving to [domain]. These questions cover [brief description]. Take your time." This is especially important for the end-of-life domain.

---

## AI Follow-up Probe Patterns

### What works

Based on research on AI-moderated interviews (Outset, CleverX, GreatQuestion patterns) and the ACM paper on conversational agents for information elicitation:

- **Concept-deepening probes** ("You mentioned X — can you say more about what that means to you?") have the lowest drop rate and highest relevance
- **Scenario-grounding probes** ("If you were in situation Y, how would that apply?") are effective for values elicitation specifically
- **Clarification probes** ("When you say X, do you mean A or B?") are useful but should be used sparingly — too many feel interrogative

### What to avoid

- Probes that introduce new topics (scope creep — the interviewer loses the thread)
- More than 2 probes per question (fatigue)
- Probes that feel like the AI is challenging or correcting the person

### Display pattern

Show probes as optional suggestions to the interviewer, not as automatic follow-up questions. The interviewer reads the probe, decides whether it's relevant, and asks it verbally. This keeps the interviewer in control and prevents the AI from derailing the conversation.

**Recommended UI:** After answer is submitted, show 1-2 probe suggestions in a collapsible panel labeled "Suggested follow-ups." Interviewer can dismiss or use them.

---

## Archive Display Patterns

### What builds trust in AI-generated summaries of personal information

From the Smashing Magazine trust research and RAG UI citation patterns:

1. **Verbatim quotes are the highest-trust signal.** When the archive shows the person's own words, the guardian can verify the AI didn't fabricate. Every value claim in the archive should be anchored to at least one direct quote.

2. **Provenance over confidence scores.** "Based on her answers in the Medical and End-of-Life sections" is more trustworthy than "confidence: 87%." Users understand provenance; they don't understand probability.

3. **Explicit gaps are trust-building.** An archive that says "No clear preference expressed for financial decisions" is more trustworthy than one that fills every field. Honest gaps signal the AI isn't making things up.

4. **Editable = untrustworthy.** If the guardian can edit the archive, they can no longer be sure it reflects the person's actual words. Archive must be read-only.

5. **Structure over prose.** A structured archive (value weights as labeled items, scenario preferences as named scenarios, quotes as a separate section) is easier to scan and verify than a narrative paragraph.

### Recommended archive structure

```
[Person name]'s Values Archive

CORE VALUES (inferred from interview)
  - [Value label]: [1-sentence description] | Source: [domain, question number]

KEY QUOTES (verbatim)
  - "[exact quote]" — [domain], [date]

SCENARIO PREFERENCES (explicit)
  - [Scenario type]: [preference] | Confidence: [high/medium/low based on directness of answer]

GAPS
  - [Domain or topic]: No clear preference expressed
```

---

## Decision Query UX Patterns

### Query input

Free-text scenario description is the right pattern. Structured query forms (dropdowns, checkboxes) are too rigid for the variety of real proxy decisions. The guardian needs to describe the situation in their own words.

**Recommended UI:** Large text area with placeholder: "Describe the situation you're facing. What decision needs to be made?" Submit button. No required fields.

### Response display

The response must follow a consistent structure that the guardian can scan quickly under stress:

```
RELEVANT VALUES
  [Value 1] — [why it applies to this scenario]
  [Value 2] — [why it applies]

HER OWN WORDS
  "[Quote 1]" (Medical section)
  "[Quote 2]" (End-of-life section)

SUGGESTED DIRECTION
  [1-2 sentence direction, framed as "based on her expressed values..."]

GAPS
  [If archive lacks relevant data: "The archive doesn't contain clear guidance on X."]
```

The "suggested direction" must be framed as inference from the archive, not as a command. The guardian makes the decision; the AI provides grounding.

---

## MVP Recommendation

Prioritize:
1. One-question-at-a-time interview flow with domain progress grid
2. AI probe suggestions (collapsible, optional) after each answer
3. Archive generation with verbatim quotes + value weights + explicit gaps
4. Decision query with structured response (values + quotes + direction + gaps)
5. LocalStorage autosave + session resume

Defer:
- Export to PDF/JSON: useful but not needed to validate core flow
- Domain skip/return UI: can be simulated by "skip" button on each question for MVP
- Sensitive topic pacing cues: low effort, but can be added in phase 2 after testing the base flow

---

## Sources

- Outset AI probing instructions best practices: https://help.outset.ai/en/articles/10697756-best-practices-for-writing-probing-instructions
- AI-moderated interview patterns (CleverX): https://cleverx.com/guides/how-to-run-ai-moderated-interviews-a-complete-guide-for-research-teams
- AI-moderated interview guide (GreatQuestion): https://greatquestion.co/blog/ai-moderated-interviews-guide
- Conversational agent follow-up question design (ACM): https://dl.acm.org/doi/10.1145/3637320
- RAG citation display patterns: https://synthmetric.com/citations-that-users-trust-design-patterns-for-rag-uis/
- Trust in AI outputs — UX design guide (Smashing Magazine): https://www.smashingmagazine.com/2025/09/psychology-trust-ai-guide-measuring-designing-user-confidence
- LLMs as adaptive interviewers (arxiv): https://arxiv.org/abs/2410.01824
- RAG trustworthiness user study (arxiv): https://arxiv.org/html/2601.14460v1
- Multi-step form UX best practices: https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/
- Progress indicator impact on task completion (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC2910434/
