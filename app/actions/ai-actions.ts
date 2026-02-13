'use server';

import type { GeneratedItinerary } from '@/lib/domain/trip';
import { generateItineraryWithOpenAICompatibleApi } from '@/lib/ai/openai-itinerary';

/**
 * PRD/SDD 对齐：generateItineraryAction(prompt: string)
 * 使用 OpenAI 兼容接口生成/完善结构化行程。
 */
export async function generateItineraryAction(
  prompt: string,
  options?: {
    existingItinerary?: GeneratedItinerary;
    refinementPrompt?: string;
  },
) {
  if (!prompt.trim()) {
    throw new Error('Prompt is required');
  }

  const { itinerary } = await generateItineraryWithOpenAICompatibleApi({
    prompt,
    existingItinerary: options?.existingItinerary,
    refinementPrompt: options?.refinementPrompt,
  });

  return {
    prompt,
    itinerary,
    tripId: `generated-${Date.now()}`,
  };
}
