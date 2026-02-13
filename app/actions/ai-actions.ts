'use server';

import { generateItineraryWithOpenAICompatibleApi } from '@/lib/ai/openai-itinerary';

/**
 * PRD/SDD 对齐：generateItineraryAction(prompt: string)
 * 使用 OpenAI 兼容接口生成结构化行程。
 */
export async function generateItineraryAction(prompt: string) {
  if (!prompt.trim()) {
    throw new Error('Prompt is required');
  }

  const { itinerary } = await generateItineraryWithOpenAICompatibleApi(prompt);

  return {
    prompt,
    itinerary,
    tripId: `generated-${Date.now()}`,
  };
}
