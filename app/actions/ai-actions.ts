'use server';

import { parseItineraryJson } from '@/lib/dify/schema';

const mockDifyResponse = JSON.stringify({
  trip_title: '长沙3日亲子深度游',
  destination: '长沙',
  days: [
    {
      day_index: 1,
      date_offset: 0,
      summary: '抵达长沙，打卡地标',
      events: [
        {
          time: '10:00',
          title: '橘子洲头',
          category: 'spot',
          description: '乘坐小火车游览，适合孩子。',
          location: '橘子洲景区',
          geo: { lat: 28.18, lng: 112.95 },
        },
      ],
    },
  ],
});

/**
 * PRD/SDD 对齐：generateItineraryAction(prompt: string)
 * 当前提供稳定可测的占位实现，后续替换为真实 Dify API 调用。
 */
export async function generateItineraryAction(prompt: string) {
  if (!prompt.trim()) {
    throw new Error('Prompt is required');
  }

  const itinerary = parseItineraryJson(mockDifyResponse);

  return {
    prompt,
    itinerary,
    tripId: `generated-${Date.now()}`,
  };
}
