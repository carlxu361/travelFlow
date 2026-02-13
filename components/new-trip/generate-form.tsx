'use client';

import { useEffect, useMemo, useState } from 'react';
import type { GeneratedItinerary } from '@/lib/domain/trip';

type LocalItineraryItem = {
  id: string;
  createdAt: string;
  sourcePrompt: string;
  itinerary: GeneratedItinerary;
};

const ACTIVE_KEY = 'travelflow_local_itinerary_v1';
const LIST_KEY = 'travelflow_local_itinerary_list_v1';

type BulletListProps = {
  title: string;
  items: string[];
};

function BulletList({ title, items }: BulletListProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function GenerateTripForm() {
  const [prompt, setPrompt] = useState('五一去长沙3天带两娃，节奏轻松，偏爱亲子体验');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamText, setStreamText] = useState('');
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [canvasJson, setCanvasJson] = useState('');
  const [localItems, setLocalItems] = useState<LocalItineraryItem[]>([]);

  useEffect(() => {
    const saved = safeParse<GeneratedItinerary>(localStorage.getItem(ACTIVE_KEY));
    const savedList = safeParse<LocalItineraryItem[]>(localStorage.getItem(LIST_KEY)) ?? [];

    if (saved) {
      setItinerary(saved);
      setCanvasJson(JSON.stringify(saved, null, 2));
    }
    setLocalItems(savedList);
  }, []);

  const canRefine = useMemo(() => Boolean(itinerary && canvasJson.trim()), [itinerary, canvasJson]);

  async function streamGenerate(payload: {
    prompt: string;
    existingItinerary?: GeneratedItinerary;
    refinementMode?: 'canvas_refine' | 'regenerate';
  }) {
    setLoading(true);
    setError(null);
    setStreamText('');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        const failed = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(failed?.error ?? '请求失败，请稍后再试');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';

        for (const chunk of chunks) {
          const eventLine = chunk.split('\n').find((line) => line.startsWith('event:'));
          const dataLine = chunk.split('\n').find((line) => line.startsWith('data:'));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace('event:', '').trim();
          const data = JSON.parse(dataLine.replace('data:', '').trim()) as {
            text?: string;
            message?: string;
            itinerary?: GeneratedItinerary;
          };

          if (event === 'delta' && data.text) {
            setStreamText((prev) => prev + data.text);
          }

          if (event === 'itinerary' && data.itinerary) {
            setItinerary(data.itinerary);
            setCanvasJson(JSON.stringify(data.itinerary, null, 2));
          }

          if (event === 'error') {
            throw new Error(data.message ?? '生成失败，请稍后重试。');
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    await streamGenerate({ prompt, refinementMode: 'regenerate' });
  }

  async function handleRegenerate() {
    await streamGenerate({ prompt, refinementMode: 'regenerate' });
  }

  async function handleCanvasRefine() {
    try {
      const parsed = JSON.parse(canvasJson) as GeneratedItinerary;
      await streamGenerate({ prompt, existingItinerary: parsed, refinementMode: 'canvas_refine' });
    } catch {
      setError('画布 JSON 不是合法格式，请先修正后再二次完善。');
    }
  }

  function persistList(list: LocalItineraryItem[]) {
    setLocalItems(list);
    localStorage.setItem(LIST_KEY, JSON.stringify(list));
  }

  function saveToLocal() {
    if (!itinerary) return;
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(itinerary));

    const item: LocalItineraryItem = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      sourcePrompt: prompt,
      itinerary,
    };

    persistList([item, ...localItems].slice(0, 20));
  }

  function loadItem(item: LocalItineraryItem) {
    setPrompt(item.sourcePrompt);
    setItinerary(item.itinerary);
    setCanvasJson(JSON.stringify(item.itinerary, null, 2));
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(item.itinerary));
  }

  function removeItem(id: string) {
    persistList(localItems.filter((item) => item.id !== id));
  }

  return (
    <div className="mt-6 space-y-4">
      <textarea
        className="h-28 w-full rounded-xl border border-slate-300 bg-white p-4 outline-none ring-emerald-500 transition focus:ring"
        placeholder="例如：五一去长沙3天带两娃，节奏轻松，偏爱亲子体验"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {loading ? '生成中...' : '创建行程'}
        </button>

        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          不满意，重新生成
        </button>

        <button
          onClick={handleCanvasRefine}
          disabled={loading || !canRefine}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          基于画布二次完善
        </button>

        <button
          onClick={saveToLocal}
          disabled={!itinerary}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          保存到本地
        </button>
      </div>

      {streamText ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <h3 className="font-semibold text-emerald-700">AI 流式输出中</h3>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-emerald-900">{streamText}</pre>
        </section>
      ) : null}

      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {itinerary ? (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <header>
            <h2 className="text-lg font-semibold">{itinerary.tripTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">
              目的地：{itinerary.tripHighlights.destination} ｜ 日期：{itinerary.tripHighlights.travelDates} ｜ 旅行者：
              {itinerary.tripHighlights.travelers}
            </p>
            <p className="text-sm text-slate-600">天气信息：{itinerary.tripHighlights.weatherInfo}</p>
          </header>

          <section>
            <h3 className="font-semibold">行程画布（可编辑 JSON）</h3>
            <textarea
              className="mt-2 h-64 w-full rounded-lg border border-slate-300 p-3 font-mono text-xs outline-none ring-blue-500 transition focus:ring"
              value={canvasJson}
              onChange={(e) => setCanvasJson(e.target.value)}
            />
          </section>

          <BulletList title="概览：每日安排" items={itinerary.overview.dailyArrangement} />
          <BulletList title="概览：交通" items={itinerary.overview.transportationSummary} />
          <BulletList title="概览：住宿" items={itinerary.overview.accommodationSummary} />
          <BulletList title="概览：实用信息" items={itinerary.overview.practicalSummary} />

          <section>
            <h3 className="font-semibold">详细行程安排</h3>
            <div className="mt-2 space-y-3">
              {itinerary.detailedItinerary.map((day) => (
                <article key={day.dayIndex} className="rounded-lg border border-slate-200 p-3">
                  <h4 className="font-semibold">
                    Day {day.dayIndex} · {day.date} · {day.theme}
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {day.events.map((event, index) => (
                      <li key={`${day.dayIndex}-${index}`} className="rounded-md bg-slate-50 p-2">
                        <div>
                          <span className="font-medium">{event.time}</span> · {event.title}（{event.category}）
                        </div>
                        <div className="text-slate-600">{event.description}</div>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">本地行程管理</h3>
        <p className="mt-1 text-sm text-slate-600">已保存 {localItems.length} 条，后续可升级为登录后云端同步。</p>
        <div className="mt-3 space-y-2">
          {localItems.length === 0 ? <p className="text-sm text-slate-500">暂无本地行程。</p> : null}
          {localItems.map((item) => (
            <article key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium">{item.itinerary.tripTitle}</p>
                <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded border px-2 py-1 text-xs" onClick={() => loadItem(item)}>
                  加载
                </button>
                <button className="rounded border px-2 py-1 text-xs" onClick={() => removeItem(item.id)}>
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
