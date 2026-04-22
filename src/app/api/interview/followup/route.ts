import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { Turn } from '@/lib/types'

export const maxDuration = 20

const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: 'https://api.moonshot.cn/v1',
})

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

    const completion = await client.chat.completions.create({
      model: 'moonshot-v1-8k',
      max_tokens: 250,
      messages: [
        {
          role: 'system',
          content: `你是一位帮助记录老人意愿的专业访谈助手，用于制作意定监护档案。每次老人回答后，建议1-2个简短的追问，帮助挖掘更深层的价值观或澄清模糊之处。追问应自然流畅，像家人聊天，不要像临床问卷。每个追问不超过20个字，用中文回答。`
        },
        {
          role: 'user',
          content: `领域：${domain}
提问：${question}
老人的回答：${answer}${turnContext}

建议1-2个追问。只返回JSON字符串数组：
["追问1", "追问2"]

不要其他文字，不要markdown，只返回JSON数组。`
        }
      ]
    })

    const text = completion.choices[0]?.message?.content ?? ''
    // Extract JSON array from response — handle markdown fences and reasoning preamble
    const match = text.match(/\[[\s\S]*?\]/)
    const probes = match ? JSON.parse(match[0]) : []

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
