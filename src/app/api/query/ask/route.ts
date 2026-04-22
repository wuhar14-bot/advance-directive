import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { Archive } from '@/lib/types'

export const maxDuration = 60

const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: 'https://api.moonshot.cn/v1',
})

function formatArchiveForPrompt(archive: Archive): string {
  const parts: string[] = []

  if (archive.rawSummary) {
    parts.push(`【总体概述】\n${archive.rawSummary}`)
  }

  if (archive.values?.length) {
    parts.push('【核心价值观】')
    for (const v of archive.values) {
      parts.push(`- ${v.label}（${v.weight}）：${v.evidence.join('；')}`)
    }
  }

  if (archive.scenarios?.length) {
    parts.push('【场景偏好】')
    for (const s of archive.scenarios) {
      parts.push(`- [${s.domain}] ${s.situation} → ${s.preference}（${s.confidence}）`)
    }
  }

  if (archive.quotes?.length) {
    parts.push('【关键原话】')
    for (const q of archive.quotes) {
      parts.push(`- [${q.id}] 「${q.text}」（${q.significance}）`)
    }
  }

  if (archive.reasoningPatterns?.length) {
    parts.push('【思维模式】')
    for (const r of archive.reasoningPatterns) {
      parts.push(`- ${r.pattern}：${r.applicability}`)
    }
  }

  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { scenario, archive, person } = await req.json() as {
      scenario: string
      archive: Archive
      person: { name: string; age: number; backgroundNotes: string }
    }

    const archiveText = formatArchiveForPrompt(archive)

    const completion = await client.chat.completions.create({
      model: 'moonshot-v1-8k',
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: `你是一位意定监护决策顾问。你的任务是根据老人的意愿档案，帮助监护人理解如何在具体情境下做出符合老人意愿的决定。
规则：
1. 每个判断必须引用档案中的具体条目（用"她的档案显示…"或"根据档案中的原话…"等措辞）
2. 若档案信息不足以支撑判断，必须明确说明"档案中未涉及此方面"
3. 语气温和、有人情味，像一位有经验的家庭顾问
4. 输出严格为JSON，不含markdown`,
        },
        {
          role: 'user',
          content: `受访者：${person.name}，${person.age}岁。

意愿档案：
${archiveText}

监护人的决策场景：
${scenario}

请返回以下JSON格式的分析（不要其他文字）：
{
  "relevantValues": [
    {
      "valueLabel": "相关价值观名称",
      "relevance": "为何与此场景相关",
      "archiveEvidence": "档案中的具体依据（原话或描述）"
    }
  ],
  "keyQuotes": [
    {
      "quoteId": "q1",
      "quoteText": "原话",
      "applicationToScenario": "如何适用于此场景"
    }
  ],
  "suggestedDirection": "基于档案的建议方向（1-3句，含引用，用第三人称'她'）",
  "hedgedLanguage": "不确定性说明（档案支持程度：strong/moderate/weak）",
  "insufficientInfo": "档案中未涉及的方面（若无则为空字符串）",
  "summary": "给监护人的一段话（3-5句，温和、有人情味，直接称呼'您'）"
}`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')
    const response = JSON.parse(match[0])

    return NextResponse.json({ response })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 429) {
      return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
    }
    console.error('[query ask]', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
