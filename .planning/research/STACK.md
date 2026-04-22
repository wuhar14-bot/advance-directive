# Technology Stack

**Project:** AI Advance Directive System
**Researched:** 2026-04-22
**Confidence:** HIGH (core stack), MEDIUM (library versions)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x | Full-stack React framework | App Router is now stable and default; RSC + Route Handlers replace the need for a separate backend |
| React | 19.x | UI runtime | Ships with Next.js 15; concurrent features needed for streaming |
| TypeScript | 5.x | Type safety | Non-negotiable for Claude API response shapes and archive schema |

**App Router, not Pages Router.** App Router is the current default and the only one that gets new features. Pages Router is in maintenance mode. This project has no legacy migration concern — start with App Router.

### Claude API Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@anthropic-ai/sdk` | ^0.62 | Direct Claude API access | Official SDK; type-safe; supports streaming and structured outputs natively |
| Zod | ^3.x | Schema validation | Required for `zodOutputFormat()` helper in structured output calls |

**Use the direct Anthropic SDK, not Vercel AI SDK.** Reasoning:

- This project uses Claude exclusively — no multi-provider switching needed
- Anthropic's SDK now has native structured output support (`client.messages.parse()` + `zodOutputFormat()`) that is GA as of late 2025
- Vercel AI SDK adds an abstraction layer that obscures Claude-specific features (tool use, extended thinking, output_config)
- The archive generation step requires strict JSON schema enforcement — Anthropic's `output_config.format` with `additionalProperties: false` is the right primitive

**Streaming pattern for interview follow-up probes:**

```typescript
// app/api/interview/route.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages,
  });

  return new Response(stream.toReadableStream());
}
```

**Structured output pattern for archive generation:**

```typescript
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const ArchiveSchema = z.object({
  valueWeights: z.array(z.object({ domain: z.string(), weight: z.number() })),
  scenarioPreferences: z.array(z.object({ scenario: z.string(), preference: z.string() })),
  keyQuotes: z.array(z.string()),
});

const response = await client.messages.parse({
  model: "claude-sonnet-4-5",
  max_tokens: 4096,
  output_config: { format: zodOutputFormat(ArchiveSchema, "archive") },
  messages: [{ role: "user", content: archivePrompt }],
});

const archive = response.parsed_output; // typed as ArchiveSchema
```

### State Management & Persistence

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | ^5.x | In-memory session state | Minimal boilerplate; works cleanly with Next.js App Router client components; no Provider wrapping needed |
| `zustand/middleware` persist | built-in | localStorage sync | Built-in `persist` middleware serializes store to localStorage automatically |

**No database. No server-side session.** All interview state lives in:
1. Zustand store (in-memory, reactive)
2. `localStorage` via Zustand's `persist` middleware (survives page refresh)
3. JSON export (user-downloadable archive file for multi-session continuity)

**localStorage gotcha in Next.js App Router:** `localStorage` is browser-only. Zustand's `persist` middleware handles this correctly with SSR by skipping hydration on the server. Use `useStore` with a `useEffect` guard or the `skipHydration` option to avoid hydration mismatch errors.

```typescript
// store/session.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSessionStore = create(
  persist(
    (set) => ({
      sessions: [],
      currentSession: null,
      addAnswer: (questionId, answer) => set(/* ... */),
    }),
    { name: "advance-directive-session" } // localStorage key
  )
);
```

### UI Components

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ^4.x | Styling | Ships with Next.js 15 scaffolding; zero-runtime CSS |
| shadcn/ui | latest | Component primitives | Copy-owned components (not a package); built on Radix UI; works natively with Next.js 15 App Router and Tailwind 4 |

shadcn/ui is the correct choice for this project because:
- Components are copied into your repo — no version lock-in
- Radix UI primitives handle accessibility (focus traps, ARIA) for free
- The interview UI needs: `Textarea`, `Button`, `Card`, `Progress`, `Badge`, `Accordion` — all available
- Dark mode and theming work out of the box

### Deployment

| Technology | Purpose | Why |
|------------|---------|-----|
| Vercel | Hosting | Zero-config Next.js deployment; automatic preview URLs per branch |

**Environment variable rule:** `ANTHROPIC_API_KEY` must be set as a server-side env var in Vercel dashboard (no `NEXT_PUBLIC_` prefix). It is only accessed in Route Handlers (`app/api/`), never in client components. This keeps the key off the client bundle entirely.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| AI SDK | `@anthropic-ai/sdk` direct | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) | Adds abstraction over Claude-specific features; structured output support is less direct; overkill for single-provider app |
| State | Zustand + persist | React Context + useReducer | Context causes full subtree re-renders; no built-in persistence; gets messy for nested interview state |
| State | Zustand + persist | IndexedDB / Dexie.js | Overkill for MVP; async API adds complexity; localStorage is sufficient for interview JSON blobs |
| UI | shadcn/ui | Chakra UI / MUI | Chakra/MUI are runtime CSS-in-JS; heavier bundle; shadcn/ui is Tailwind-native and copy-owned |
| UI | shadcn/ui | Headless UI | Less component coverage; shadcn/ui is a superset |
| Router | App Router | Pages Router | Pages Router is maintenance-only; no RSC; no streaming support |
| Deployment | Vercel | Netlify / Railway | Vercel is the canonical Next.js host; zero config; built by the same team |

**Do NOT use:**
- `next-auth` — no auth needed for MVP; adds significant complexity
- `prisma` / any ORM — no database
- `langchain` / `llamaindex` — heavyweight orchestration frameworks; direct SDK calls are simpler and more debuggable for this use case
- Redux / Redux Toolkit — dead weight for a single-user, no-server-state app
- `react-query` / `tanstack-query` — designed for server state caching; not relevant without a database

---

## Installation

```bash
# Scaffold
npx create-next-app@latest advance-directive --typescript --tailwind --app --src-dir

# Claude SDK + Zod
npm install @anthropic-ai/sdk zod

# State management
npm install zustand

# shadcn/ui init (interactive)
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add button card textarea badge progress accordion
```

---

## Model Selection

Use `claude-sonnet-4-5` as the default model for all three flows:
- Interview question generation (low latency needed)
- Archive generation (structured output, higher token count)
- Decision query (retrieval + reasoning)

Upgrade to `claude-opus-4-5` only if archive generation quality is insufficient after testing. Sonnet is the right cost/quality tradeoff for MVP validation.

---

## Sources

- [Anthropic Structured Outputs docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) — GA as of late 2025, `output_config.format` + `zodOutputFormat()`
- [Anthropic SDK TypeScript GitHub](https://github.com/anthropics/anthropic-sdk-typescript) — v0.62.x current
- [Next.js App Router Guide 2026](https://webcoderspeed.com/blog/nextjs/nextjs-app-router-guide) — App Router confirmed as default
- [shadcn/ui Next.js install](https://www.shadcn.io/ui/installation/nextjs) — supports Next.js 14 and 15 with App Router
- [State Management in 2026](https://blocks.serp.co/blog/react-state-management-2026) — Zustand confirmed as standard for global app state
- [Vercel AI SDK vs Anthropic SDK comparison](https://bertomill.medium.com/vercel-ai-sdk-vs-claude-agent-sdk-which-one-should-you-build-with-a88d2d6a4311)
- [Next.js env vars on Vercel](https://www.wisp.blog/blog/managing-nextjs-environment-variables-from-development-to-production-vercel)
