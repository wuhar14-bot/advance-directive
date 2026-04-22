import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { DomainKey, Turn } from '@/lib/types'

export const maxDuration = 60

const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: 'https://api.moonshot.cn/v1',
})

const DOMAIN_LABELS: Record<DomainKey, string> = {
  medical: '医疗意愿',
  financial: '财务安排',
  daily: '日常生活',
  relationships: '家庭与关系',
  'end-of-life': '临终价值观',
}

function formatTranscript(transcript: Partial<Record<DomainKey, Turn[]>>): string {
  const parts: string[] = []
  for (const [domain, turns] of Object.entries(transcript)) {
    if (!turns || turns.length === 0) continue
    const label = DOMAIN_LABELS[domain as DomainKey] ?? domain
    parts.push(`【${label}】`)
    for (const turn of turns) {
      if (!turn.answer.trim()) continue
      parts.push(`问：${turn.questionText}`)
      parts.push(`答：${turn.answer}`)
    }
  }
  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, person } = await req.json()
    const transcriptText = formatTranscript(transcript)

    if (!transcriptText.trim()) {
      return NextResponse.json({ error: 'no_content' }, { status: 400 })
    }

    const completion = await client.chat.completions.create({
      model: 'moonshot-v1-8k',
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `你是一位专业的意定监护档案分析师。根据访谈记录，提炼出老人的核心价值观、具体场景偏好、关键原话引用和思维模式。输出必须是严格的JSON，不含任何markdown或额外文字。每个字段都必须有原文依据。`,
        },
        {
          role: 'user',
          content: `受访者：${person.name}，${person.age}岁。背景：${person.backgroundNotes}

访谈记录：
${transcriptText}

请生成意定监护档案，严格按以下JSON格式输出，不要其他文字：

{
  "values": [
    {
      "label": "价值观名称（简短）",
      "weight": "core|strong|moderate",
      "evidence": ["支持此价值观的原话或行为描述"],
      "domain": "medical|financial|daily|relationships|end-of-life"
    }
  ],
  "scenarios": [
    {
      "domain": "medical|financial|daily|relationships|end-of-life",
      "situation": "具体情境描述",
      "preference": "老人的明确偏好",
      "confidence": "explicit|inferred",
      "sourceQuoteId": "q1"
    }
  ],
  "quotes": [
    {
      "id": "q1",
      "domain": "medical|financial|daily|relationships|end-of-life",
      "text": "老人的原话（逐字引用）",
      "significance": "这句话为何重要"
    }
  ],
  "reasoningPatterns": [
    {
      "pattern": "思维模式名称",
      "applicability": "适用于哪类决策",
      "evidence": ["支持此模式的原话"]
    }
  ],
  "rawSummary": "200字以内的整体总结，描述这位老人的核心价值取向和决策风格",
  "uncoveredDomains": ["未获得足够信息的领域列表，如有"]
}

只返回JSON，不要markdown，不要解释。`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON object in response')
    const archive = JSON.parse(match[0])

    return NextResponse.json({ archive })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 429) {
      return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
    }
    console.error('[archive generate]', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
