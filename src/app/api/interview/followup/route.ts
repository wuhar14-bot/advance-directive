import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { Turn } from '@/lib/types'

export const maxDuration = 20

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { domain, question, answer, previousTurns } = await req.json()

    // Use only last 3 turns to prevent context rot (per ARCHITECTURE.md)
    const recentTurns: Turn[] = (previousTurns ?? []).slice(-3)
    const turnContext = recentTurns.length > 0
      ? '\n\nRecent conversation context:\n' + recentTurns.map((t: Turn) =>
          `Q: ${t.questionText}\nA: ${t.answer}`
        ).join('\n\n')
      : ''

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 250,
      temperature: 0.4,
      system: `You are a skilled interviewer helping capture an elderly person's values for an advance directive. After each answer, suggest 1-2 brief follow-up probes that would surface deeper values or clarify ambiguity. Probes should feel natural in conversation — not clinical. Keep each probe under 20 words.`,
      messages: [{
        role: 'user',
        content: `Domain: ${domain}
Question asked: ${question}
Answer given: ${answer}${turnContext}

Suggest 1-2 follow-up probes. Return ONLY a JSON array of strings:
["probe 1", "probe 2"]

No other text. No markdown. Just the JSON array.`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ probes: [] })
    }

    const raw = content.text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
    const probes = JSON.parse(raw)

    return NextResponse.json({ probes: Array.isArray(probes) ? probes.slice(0, 2) : [] })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 429) {
      return NextResponse.json({ probes: [], error: 'rate_limit' })
    }
    console.error('[followup route]', err)
    return NextResponse.json({ probes: [], error: 'failed' })
  }
}
