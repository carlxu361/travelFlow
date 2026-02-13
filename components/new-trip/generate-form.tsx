'use client';

import { useState } from 'react';
import type { GeneratedItinerary } from '@/lib/domain/trip';

type GenerateResponse = {
  itinerary?: GeneratedItinerary;
  error?: string;
};

export function GenerateTripForm() {
  const [prompt, setPrompt] = useState('五一去长沙3天带两娃，节奏轻松，偏爱亲子体验');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        throw new Error(data.error ?? '生成失败');
      }

      if (!data.itinerary) {
        throw new Error('未返回有效行程');
      }

      setItinerary(data.itinerary);
    } catch (e) {
      setError(e instanceof Error ? e.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <textarea
        className="h-32 w-full rounded-xl border border-slate-300 bg-white p-4 outline-none ring-emerald-500 transition focus:ring"
        placeholder="例如：五一去长沙3天带两娃，节奏轻松，偏爱亲子体验"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={onGenerate}
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {loading ? '生成中...' : '生成 AI 行程'}
      </button>

      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {itinerary ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">{itinerary.tripTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">目的地：{itinerary.destination}</p>

          <div className="mt-4 space-y-4">
            {itinerary.days.map((day) => (
              <article key={day.dayIndex} className="rounded-lg border border-slate-200 p-3">
                <h3 className="font-semibold">Day {day.dayIndex}</h3>
                <p className="mt-1 text-sm text-slate-600">{day.summary ?? '无摘要'}</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {day.events.map((event, index) => (
                    <li key={`${event.title}-${index}`} className="rounded-md bg-slate-50 p-2">
                      <span className="font-medium">{event.time}</span> · {event.title}（{event.category}）
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
