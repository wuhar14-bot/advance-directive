import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: 'https://api.moonshot.cn/v1',
})

const DOMAIN_CONTEXT: Record<string, string> = {
  "medical": "医疗偏好、医疗决策、治疗意愿、对医疗干预的态度",
  "financial": "财务意愿、资产分配偏好、对经济支持和独立性的态度",
  "daily": "日常生活偏好、舒适度、生活习惯、居住安排、生活质量优先级",
  "relationships": "家庭关系、社会联系、重要的人、希望被如何记住",
  "end-of-life": "临终价值观、对死亡和临终的态度、遗产、最后的心愿",
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
      messages: [
        {
          role: 'system',
          content: `你是一位帮助采访者记录老人价值观和意愿的专业访谈助手，用于制作意定监护档案。你的任务是生成温暖、开放式的访谈问题，引导老人讲述故事和表达想法——不要是非题。问题应像关心的家人在聊天，而不是医疗表格。请为指定领域生成恰好4个问题，用中文回答。`
        },
        {
          role: 'user',
          content: `为"${domain}"领域（${DOMAIN_CONTEXT[domain] ?? domain}）生成4个访谈问题。

受访者信息：
- 姓名：${person.name}
- 年龄：${person.age}
- 背景：${person.backgroundNotes}${completedContext}

只返回JSON数组，格式如下：
[{"id": "q1", "text": "..."}, {"id": "q2", "text": "..."}, {"id": "q3", "text": "..."}, {"id": "q4", "text": "..."}]

不要其他文字，不要markdown，只返回JSON数组。`
        }
      ]
    })

    const text = completion.choices[0]?.message?.content ?? ''
    // Extract JSON array from response — handle markdown fences and reasoning preamble
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found in response')
    const questions = JSON.parse(match[0])

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
