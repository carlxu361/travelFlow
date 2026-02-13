import { NextResponse } from 'next/server';
import { generateItineraryWithOpenAICompatibleApi } from '@/lib/ai/openai-itinerary';

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string };
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  try {
    const result = await generateItineraryWithOpenAICompatibleApi(prompt);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
