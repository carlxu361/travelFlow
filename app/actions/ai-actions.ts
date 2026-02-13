'use server';

import type { GeneratedItinerary } from '@/lib/domain/trip';
import { generateItineraryWithOpenAICompatibleApi } from '@/lib/ai/openai-itinerary';

export async function generateItineraryAction(
  prompt: string,
  options?: {
    existingItinerary?: GeneratedItinerary;
    refinementMode?: 'canvas_refine' | 'regenerate';
  },
) {
  if (!prompt.trim()) {
    throw new Error('Prompt is required');
  }

  const { itinerary } = await generateItineraryWithOpenAICompatibleApi({
    prompt,
    existingItinerary: options?.existingItinerary,
    refinementMode: options?.refinementMode,
  });

  return {
    prompt,
    itinerary,
    tripId: `generated-${Date.now()}`,
  };
}
