import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

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

const OTHER_OPTION = "以上都不太符合，我想说…"

export async function POST(req: NextRequest) {
  try {
    const { domain, person, completedDomains } = await req.json()

    const completedContext = completedDomains.length > 0
      ? `\n\nNote: The interviewer has already covered these domains: ${completedDomains.join(', ')}. You may reference themes from those areas if relevant, but focus on ${domain}.`
      : ''

    const completion = await client.chat.completions.create({
      model: 'moonshot-v1-8k',
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: `你是一位帮助采访者记录老人价值观和意愿的专业访谈助手，用于制作意定监护档案。你的任务是生成温暖的访谈问题，每个问题附带3个常见回答选项，帮助老人更容易表达想法。

选项要求：
- 每个选项是老人的第一人称表述，简洁自然（15-30字）
- 3个选项应覆盖不同倾向（如积极/保守/中立），不要重复
- 选项语气要像老人说话，口语化，不要书面语
- 不需要包含"其他"选项，系统会自动添加`
        },
        {
          role: 'user',
          content: `为"${domain}"领域（${DOMAIN_CONTEXT[domain] ?? domain}）生成4个访谈问题，每个问题带3个选项。

受访者信息：
- 姓名：${person.name}
- 年龄：${person.age}
- 背景：${person.backgroundNotes}${completedContext}

只返回JSON数组，格式如下：
[{"id": "q1", "text": "问题内容", "options": ["选项A", "选项B", "选项C"]}, ...]

不要其他文字，不要markdown，只返回JSON数组。`
        }
      ]
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const text = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '')
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found in response')
    const questions = JSON.parse(match[0])

    const normalized = questions.map((q: { id: string; text: string; options?: string[] }) => ({
      id: q.id,
      text: q.text,
      options: Array.isArray(q.options) && q.options.length > 0
        ? [...q.options, OTHER_OPTION]
        : [OTHER_OPTION],
    }))

    return NextResponse.json({ questions: normalized })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status
    if (status === 429) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment and try again.' }, { status: 429 })
    }
    console.error('[questions route]', err)
    return NextResponse.json({ error: 'Could not load questions. Check your connection and try again.' }, { status: 500 })
  }
}
