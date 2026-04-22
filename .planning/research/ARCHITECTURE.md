# Architecture Patterns

**Domain:** AI-powered interview + archive + decision query system
**Researched:** 2026-04-22
**Confidence:** HIGH (Next.js patterns well-established; Claude API prompt design from official docs + known patterns)

---

## Recommended Architecture

### System Overview

Three sequential stages, each a distinct UI view, sharing a single persisted data structure (`SessionData`). No database — all state lives in `localStorage` keyed by session ID, with optional JSON export.

```
[Interview UI]
     │  writes Q&A turns to SessionData
     ▼
[Archive Generation API Route]
     │  reads SessionData.transcript → calls Claude → writes SessionData.archive
     ▼
[Archive View UI]
     │  reads SessionData.archive (display only)
     ▼
[Decision Query UI]
     │  reads SessionData.archive → calls Claude with scenario → returns guidance
```

---

## Component Boundaries

### Stage 1: Interview

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `SessionSetup` | Collect person's name, age, background notes | Writes to `SessionData.person` |
| `DomainNav` | Show 5 domains, track completion status | Reads `SessionData.transcript` |
| `QuestionCard` | Display current AI question + answer textarea | Reads/writes `SessionData.transcript[domain]` |
| `FollowUpPanel` | Show AI-suggested probes after answer submitted | Calls `/api/interview/followup` |
| `InterviewProgress` | Visual progress across domains | Reads `SessionData.transcript` |

**Key boundary:** `QuestionCard` never calls Claude directly. It calls `/api/interview/followup` which returns probe suggestions. The initial questions per domain are either pre-seeded or fetched once via `/api/interview/questions` when a domain is opened.

### Stage 2: Archive Generation

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `ArchiveGenerateButton` | Trigger generation, show loading state | Calls `/api/archive/generate` |
| `ArchiveView` | Display structured archive sections | Reads `SessionData.archive` |
| `ValueWeightDisplay` | Render value priorities as ranked list | Reads `SessionData.archive.values` |
| `ScenarioPreferenceList` | Show domain-specific preferences | Reads `SessionData.archive.scenarios` |
| `QuoteHighlights` | Display key verbatim quotes | Reads `SessionData.archive.quotes` |

**Key boundary:** Archive generation is a one-shot async operation. The UI shows a loading state while `/api/archive/generate` runs (can take 10-20s for a full transcript). Result is written back to `SessionData.archive` and the component re-renders.

### Stage 3: Decision Query

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `ScenarioInput` | Textarea for describing the decision situation | Local state only |
| `QueryButton` | Submit scenario, show loading | Calls `/api/query/decision` |
| `GuidanceDisplay` | Render AI response with citations | Reads query response |
| `CitedValueCard` | Show each cited value + supporting quote | Reads `guidance.citations[]` |
| `DirectionSummary` | Show the suggested direction | Reads `guidance.direction` |

**Key boundary:** The query stage never re-reads the raw transcript. It only operates on `SessionData.archive`. This is intentional — the archive is the distilled, queryable representation.

---

## Data Flow

### SessionData Schema (localStorage)

```typescript
interface SessionData {
  id: string;                    // uuid, used as localStorage key
  createdAt: string;             // ISO timestamp
  person: {
    name: string;
    age: number;
    backgroundNotes: string;     // free text: health status, family context
  };
  transcript: {
    [domain: string]: Turn[];    // domain = "medical" | "financial" | "daily" | "relationships" | "end-of-life"
  };
  archiveGeneratedAt?: string;
  archive?: Archive;
}

interface Turn {
  questionId: string;
  questionText: string;
  answer: string;
  followUpProbes?: string[];     // AI-suggested probes shown to interviewer
  followUpAnswers?: string[];    // answers to probes, if pursued
  timestamp: string;
}

interface Archive {
  values: ValueEntry[];
  scenarios: ScenarioEntry[];
  quotes: QuoteEntry[];
  reasoningPatterns: ReasoningPattern[];
  rawSummary: string;            // full narrative summary, used as context in query stage
}

interface ValueEntry {
  label: string;                 // e.g. "Independence over comfort"
  weight: "core" | "strong" | "moderate";
  evidence: string[];            // quote IDs supporting this value
  domain: string;
}

interface ScenarioEntry {
  domain: string;
  situation: string;             // e.g. "If unable to eat independently"
  preference: string;            // what they said they'd want
  confidence: "explicit" | "inferred";
  sourceQuoteId?: string;
}

interface QuoteEntry {
  id: string;
  domain: string;
  text: string;                  // verbatim from answer
  significance: string;          // why this quote matters
}

interface ReasoningPattern {
  pattern: string;               // e.g. "Prioritizes family harmony over personal comfort"
  applicability: string;         // when this pattern applies
  evidence: string[];            // quote IDs
}
```

### What Gets Stored Where

| Data | Format | Location | Lifecycle |
|------|--------|----------|-----------|
| Session metadata + transcript | `SessionData` JSON | `localStorage["session:{id}"]` | Created at setup, grows during interview |
| Archive | Nested in `SessionData.archive` | Same localStorage key | Written once after generation, read-only after |
| Active session ID | String | `localStorage["activeSessionId"]` | Points to current session |
| Query responses | NOT persisted | Component state only | Ephemeral — re-query as needed |

Query responses are intentionally not stored. They are cheap to regenerate and storing them would create stale-data problems if the archive is ever regenerated.

---

## API Route Design

### `/api/interview/questions` — POST

Called once when a domain is opened for the first time.

**Input:**
```json
{
  "domain": "medical",
  "person": { "name": "...", "age": 75, "backgroundNotes": "..." },
  "completedDomains": ["financial"]
}
```

**Prompt strategy:** System prompt establishes the interviewer role and the goal (capture values, not just facts). User message provides person context and requests 3-5 opening questions for the domain. Questions should be open-ended and invite storytelling, not yes/no answers.

**Output:** `{ "questions": [{ "id": "...", "text": "..." }] }`

**Claude call:** Non-streaming, ~500 token response. Cache with `prompt_caching` beta if available.

---

### `/api/interview/followup` — POST

Called after each answer is submitted.

**Input:**
```json
{
  "domain": "medical",
  "question": "...",
  "answer": "...",
  "previousTurns": [...]   // last 3 turns for context, not full transcript
}
```

**Prompt strategy:** Short system prompt. User message: "Given this answer, suggest 2 follow-up probes that would surface deeper values or clarify ambiguity. Return as JSON array of strings." Keep context window small — only the current Q&A pair plus recent turns.

**Output:** `{ "probes": ["...", "..."] }`

**Claude call:** Non-streaming, ~200 token response. Latency-sensitive — use `claude-haiku` or equivalent fast model.

---

### `/api/archive/generate` — POST

Called once after interview is complete (or sufficiently complete).

**Input:**
```json
{
  "person": { ... },
  "transcript": { "medical": [...], "financial": [...], ... }
}
```

**Prompt strategy:** This is the most complex prompt. System prompt establishes the archivist role: "You are distilling a person's values and preferences from an interview. Your output will be used by a proxy decision-maker facing real medical and life decisions. Accuracy and fidelity to what was actually said matters more than completeness."

User message provides the full transcript formatted as readable dialogue, then requests the structured `Archive` JSON. Key instructions:
- Distinguish `"explicit"` preferences (person stated directly) from `"inferred"` (extrapolated from values)
- Extract verbatim quotes — do not paraphrase
- Identify reasoning patterns that enable extrapolation to novel situations
- Weight values by how frequently and strongly they appeared across domains

**Output:** Full `Archive` JSON object.

**Claude call:** Non-streaming (or streaming with accumulation). Use `claude-sonnet` or better — quality matters here. Response can be 2000-4000 tokens. Set `max_tokens` to 4096.

**Error handling:** Validate the returned JSON against the `Archive` schema. If malformed, retry once with a stricter prompt. If still malformed, return partial archive with error flag.

---

### `/api/query/decision` — POST

Called each time the guardian describes a scenario.

**Input:**
```json
{
  "scenario": "My father needs to decide whether to have a feeding tube inserted...",
  "archive": { ... }   // full Archive object
}
```

**Prompt strategy:** Two-part context injection:

1. **Archive context block:** Serialize the archive as structured text (not raw JSON). Format: values list → scenario preferences → key quotes → reasoning patterns. This is more token-efficient than raw JSON and easier for the model to reason over.

2. **Query instruction:** "A proxy decision-maker is facing this situation: [scenario]. Using only the archive above, identify: (a) which values are most relevant, (b) which scenario preferences apply directly or by analogy, (c) what the person's own words suggest, (d) a suggested direction with reasoning. Cite specific quotes by ID. If the archive does not contain sufficient information to answer confidently, say so explicitly."

**Output:**
```json
{
  "citations": [
    { "quoteId": "...", "relevance": "..." }
  ],
  "applicableValues": [
    { "label": "...", "weight": "...", "relevance": "..." }
  ],
  "direction": "...",
  "confidence": "high | medium | low",
  "gaps": "..."   // what the archive doesn't cover, if anything
}
```

**Claude call:** Non-streaming preferred for structured JSON output. Use `claude-sonnet`. The archive serialized as text will be ~1500-3000 tokens; total prompt ~2500-4500 tokens.

---

## Archive Serialization for Query Stage

The archive is stored as JSON but serialized to structured text before being injected into the query prompt. This improves retrieval quality because Claude reasons better over prose than raw JSON.

```
=== VALUES ===
[CORE] Independence over comfort
  Evidence: "I'd rather struggle a bit than have someone do everything for me" (Q-med-3)

[STRONG] Family harmony
  Evidence: "I don't want my children fighting over me" (Q-rel-2)

=== SCENARIO PREFERENCES ===
[Medical - Explicit] If unable to eat independently:
  "I would not want a feeding tube. I've seen what that looks like."

[End-of-life - Inferred] Regarding life extension measures:
  Preference for comfort over prolongation, based on stated values around dignity.

=== KEY QUOTES ===
Q-med-3: "I'd rather struggle a bit than have someone do everything for me."
Q-rel-2: "I don't want my children fighting over me."
...

=== REASONING PATTERNS ===
Pattern: Prioritizes dignity and autonomy over medical intervention
Applies when: Any decision involving loss of independence or bodily autonomy
```

This serialization is done client-side before the API call, keeping the API route simple.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Passing Raw Transcript to Query Stage
**What:** Sending the full interview transcript to `/api/query/decision` instead of the archive.
**Why bad:** 8000+ token context, slow, expensive, and the model has to re-do the distillation work on every query. The archive exists precisely to avoid this.
**Instead:** Always query against the archive. Regenerate the archive if the transcript changes.

### Anti-Pattern 2: Storing Query Responses
**What:** Persisting AI query responses to localStorage alongside the archive.
**Why bad:** Responses become stale if archive is regenerated. Creates confusion about what's "official." Adds complexity with no benefit since queries are cheap.
**Instead:** Keep query responses in component state only. Re-query as needed.

### Anti-Pattern 3: Streaming Follow-up Probes
**What:** Using streaming for the follow-up probe API to show tokens appearing.
**Why bad:** Probes are short (2 sentences each). Streaming adds complexity for no UX benefit. The interviewer is mid-conversation — they need the probes to appear complete, not token-by-token.
**Instead:** Non-streaming for all short responses. Streaming only if archive generation UX requires it (optional).

### Anti-Pattern 4: One Giant API Route
**What:** A single `/api/claude` route that handles all three stages with a `type` parameter.
**Why bad:** Prompt logic for each stage is fundamentally different. Mixing them creates a maintenance nightmare and makes it hard to tune each stage independently.
**Instead:** Three separate routes with clear single responsibilities.

### Anti-Pattern 5: Generating Questions for All Domains Upfront
**What:** Calling `/api/interview/questions` for all 5 domains when the session starts.
**Why bad:** Wastes API calls for domains the interviewer may not reach. Questions for later domains should be informed by earlier answers.
**Instead:** Generate questions lazily when each domain is opened. Pass `completedDomains` context so later questions can reference earlier themes.

---

## Suggested Build Order

Build in dependency order — each stage depends on the previous stage's data contract being stable.

### Phase 1: Data Layer + Session Management
Establish `SessionData` schema and localStorage read/write utilities. Build `SessionSetup` component. This is the foundation everything else reads from.

**Why first:** Every component in every stage reads from `SessionData`. Getting the schema right before building UI prevents painful refactors.

### Phase 2: Interview Stage (Stage 1)
Build `DomainNav`, `QuestionCard`, answer recording. Wire `/api/interview/questions`. Add `/api/interview/followup` after basic flow works.

**Why second:** Produces the transcript that archive generation consumes. Can be tested end-to-end with mock archive data.

### Phase 3: Archive Generation (Stage 2)
Build `/api/archive/generate` with full prompt. Build `ArchiveView` to display result. This is the highest-stakes Claude call — invest time in prompt quality here.

**Why third:** Depends on a real transcript to test against. The archive schema may need adjustment after seeing real Claude output — better to discover this before building the query stage.

### Phase 4: Decision Query (Stage 3)
Build archive serialization utility. Build `/api/query/decision`. Build `GuidanceDisplay` with citation rendering.

**Why last:** Depends on a stable archive schema. The query prompt quality depends on the archive being well-structured — which you can only verify after Phase 3.

---

## Scalability Considerations

| Concern | MVP (no accounts) | V2 (with accounts) | V3 (multi-user) |
|---------|-------------------|-------------------|-----------------|
| Data storage | localStorage + JSON export | Postgres per user | Postgres + row-level security |
| Archive retrieval | Full archive in prompt context | Full archive in prompt context | Vector embeddings if archive > 10K tokens |
| Session sharing | Manual JSON file transfer | Share link with token | Role-based access |
| API cost | ~$0.10-0.30 per full session | Same | Batch archive generation |

For MVP, the archive will be well under the context window limit. Vector retrieval is not needed and would add significant complexity for no benefit at this scale.

---

## Sources

- Next.js App Router API routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers (HIGH confidence)
- Anthropic Claude API prompt caching + structured output: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching (HIGH confidence)
- localStorage size limits (~5-10MB per origin): MDN Web Docs (HIGH confidence — well within range for JSON session data)
- Prompt design for structured JSON extraction: Anthropic cookbook patterns (MEDIUM confidence — verified against official docs)
