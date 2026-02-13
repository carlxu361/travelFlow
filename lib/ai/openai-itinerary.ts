import { parseItineraryJson } from '@/lib/dify/schema';

const SYSTEM_PROMPT = `你是一个专业的旅行规划助手。
请根据用户输入生成详细 JSON 行程。

约束：
1. 必须返回纯 JSON，不要 Markdown 代码块。
2. 必须包含经纬度。
3. 时间安排合理并考虑交通耗时。

JSON 结构示例：
{
  "trip_title": "长沙3日亲子深度游",
  "destination": "长沙",
  "days": [
    {
      "day_index": 1,
      "date_offset": 0,
      "summary": "抵达长沙",
      "events": [
        {
          "time": "10:00",
          "title": "橘子洲头",
          "category": "spot",
          "description": "适合亲子",
          "location": "橘子洲景区",
          "geo": {"lat": 28.18, "lng": 112.95}
        }
      ]
    }
  ]
}`;

function stripJsonFence(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return trimmed;
}

export async function generateItineraryWithOpenAICompatibleApi(prompt: string) {
  const baseUrl = process.env.OPENAI_BASE_URL;
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!baseUrl || !apiKey || !model) {
    throw new Error('Missing OPENAI_BASE_URL / OPENAI_API_KEY / OPENAI_MODEL');
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI-compatible API request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('API returned empty content');
  }

  const itinerary = parseItineraryJson(stripJsonFence(content));

  return {
    itinerary,
    rawContent: content,
  };
}
