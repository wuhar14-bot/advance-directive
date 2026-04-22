import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: 'https://api.moonshot.cn/v1',
})

const DOMAIN_CONTEXT: Record<string, string> = {
  "medical": "medical preferences, healthcare decisions, treatment wishes, and attitudes toward medical intervention",
  "financial": "financial wishes, asset distribution preferences, and attitudes toward financial support and independence",
  "daily": "daily life preferences, comfort, routines, living arrangements, and quality of life priorities",
  "relationships": "family relationships, social connections, important people, and how they want to be remembered",
  "end-of-life": "end-of-life values, attitudes toward death and dying, legacy, and final wishes",
}

export async function POST(req: NextRequest) {
  try {
    const { domain, person, completedDomains } = await req.json()

    const completedContext = completedDomains.length > 0
      ? `\n\nNote: The interviewer has already covered these domains: ${completedDomains.join(', ')}. You may reference themes from those areas if relevant, but focus on ${domain}.`
      : ''

    const completion = await client.chat.completions.create({
      model: 'moonshot-v1-8k',
      max_tokens: 600,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You are helping an interviewer capture the values and preferences of an elderly person for an advance directive. Your role is to generate thoughtful, open-ended interview questions that invite storytelling and reflection — not yes/no answers. Questions should feel like a caring conversation, not a medical form. Generate exactly 4 questions for the specified domain.`
        },
        {
          role: 'user',
          content: `Generate 4 interview questions for the "${domain}" domain (${DOMAIN_CONTEXT[domain] ?? domain}).

Person's profile:
- Name: ${person.name}
- Age: ${person.age}
- Background: ${person.backgroundNotes}${completedContext}

Return ONLY a JSON array of objects with this exact shape:
[{"id": "q1", "text": "..."}, {"id": "q2", "text": "..."}, {"id": "q3", "text": "..."}, {"id": "q4", "text": "..."}]

No other text. No markdown. Just the JSON array.`
        }
      ]
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const raw = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
    const questions = JSON.parse(raw)

    return NextResponse.json({ questions })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 429) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment and try again.' }, { status: 429 })
    }
    console.error('[questions route]', err)
    return NextResponse.json({ error: 'Could not load questions. Check your connection and try again.' }, { status: 500 })
  }
}
