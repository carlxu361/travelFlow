import type { GeneratedItinerary } from '@/lib/domain/trip';
import { parseItineraryJson } from '@/lib/dify/schema';

const OUTPUT_SCHEMA = `{
  "trip_title": "string",
  "trip_highlights": {
    "destination": "string",
    "travel_dates": "string",
    "travelers": "string",
    "weather_info": "string"
  },
  "overview": {
    "daily_arrangement": ["string"],
    "transportation": ["string"],
    "accommodation": ["string"],
    "practical_info": ["string"]
  },
  "detailed_itinerary": [
    {
      "day_index": 1,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "events": [
        {
          "time": "HH:mm",
          "title": "string",
          "category": "spot|food|hotel|transport|custom",
          "description": "string",
          "location": "string",
          "geo": { "lat": 0, "lng": 0 },
          "transport": "string",
          "tips": "string"
        }
      ]
    }
  ],
  "transportation": {
    "city_transfers": ["string"],
    "in_city_transport": ["string"]
  },
  "accommodation_dining": {
    "stay_recommendations": ["string"],
    "dining_recommendations": ["string"]
  },
  "map_navigation": [
    {
      "day_index": 1,
      "route_name": "string",
      "waypoints": [{ "name": "string", "lat": 0, "lng": 0 }]
    }
  ],
  "practical_info": {
    "packing_checklist": ["string"],
    "budget_tips": ["string"],
    "emergency_info": ["string"],
    "family_friendly_tips": ["string"]
  }
}`;

const SYSTEM_PROMPT = `你是资深旅行规划师和行程优化师。
请严格输出“纯 JSON”，并且必须遵循固定结构。

要求：
1. 输出内容必须完整覆盖：行程要点、概览、详细行程、交通、住宿与餐饮、地图导航、实用信息。
2. 详细行程必须细化到每天多个时段，说明交通衔接与注意事项。
3. 若用户提供了家庭/亲子信息，优先给出亲子友好建议。
4. 天气信息给出概览和穿衣/出行提醒。
5. 地图导航必须给出每天路线和 waypoint 经纬度。
6. 只能输出 JSON，不要 markdown，不要解释。

固定输出 JSON Schema:
${OUTPUT_SCHEMA}`;

function stripJsonFence(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return trimmed;
}

type GenerateArgs = {
  prompt: string;
  existingItinerary?: GeneratedItinerary;
  refinementPrompt?: string;
};

export async function generateItineraryWithOpenAICompatibleApi({
  prompt,
  existingItinerary,
  refinementPrompt,
}: GenerateArgs) {
  const baseUrl = process.env.OPENAI_BASE_URL;
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!baseUrl || !apiKey || !model) {
    throw new Error('Missing OPENAI_BASE_URL / OPENAI_API_KEY / OPENAI_MODEL');
  }

  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const userPrompt = existingItinerary
    ? `用户初始需求：${prompt}\n\n当前已生成行程（JSON）：\n${JSON.stringify(existingItinerary)}\n\n请根据以下修改意见进行二次完善，并输出完整新 JSON：\n${refinementPrompt ?? '请补充细节并优化安排'}`
    : prompt;

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
        { role: 'user', content: userPrompt },
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
