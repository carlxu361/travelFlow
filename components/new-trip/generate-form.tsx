'use client';

import { useEffect, useState } from 'react';
import type { GeneratedItinerary } from '@/lib/domain/trip';

type GenerateResponse = {
  itinerary?: GeneratedItinerary;
  error?: string;
};

const LOCAL_KEY = 'travelflow_local_itinerary_v1';

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

export function GenerateTripForm() {
  const [prompt, setPrompt] = useState('五一去长沙3天带两娃，节奏轻松，偏爱亲子体验');
  const [refinementPrompt, setRefinementPrompt] = useState('请增加亲子互动体验，并优化每日交通衔接与晚餐推荐。');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as GeneratedItinerary;
      setItinerary(parsed);
    } catch {
      localStorage.removeItem(LOCAL_KEY);
    }
  }, []);

  async function requestItinerary(mode: 'generate' | 'refine') {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          refinementPrompt: mode === 'refine' ? refinementPrompt : undefined,
          existingItinerary: mode === 'refine' ? itinerary : undefined,
        }),
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

  function saveToLocal() {
    if (!itinerary) return;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(itinerary));
  }

  function clearLocal() {
    localStorage.removeItem(LOCAL_KEY);
  }

  return (
    <div className="mt-6 space-y-4">
      <textarea
        className="h-28 w-full rounded-xl border border-slate-300 bg-white p-4 outline-none ring-emerald-500 transition focus:ring"
        placeholder="例如：五一去长沙3天带两娃，节奏轻松，偏爱亲子体验"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <textarea
        className="h-24 w-full rounded-xl border border-slate-300 bg-white p-4 outline-none ring-blue-500 transition focus:ring"
        placeholder="二次修改要求：例如增加儿童友好景点、降低换乘频率、补充雨天备选方案"
        value={refinementPrompt}
        onChange={(e) => setRefinementPrompt(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => requestItinerary('generate')}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {loading ? '生成中...' : '生成 AI 行程'}
        </button>

        <button
          onClick={() => requestItinerary('refine')}
          disabled={loading || !itinerary}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          二次完善行程
        </button>

        <button
          onClick={saveToLocal}
          disabled={!itinerary}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          保存到本地
        </button>

        <button
          onClick={clearLocal}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          清空本地缓存
        </button>
      </div>

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

          <BulletList title="概览：每日安排" items={itinerary.overview.dailyArrangement} />
          <BulletList title="概览：交通" items={itinerary.overview.transportationSummary} />
          <BulletList title="概览：住宿" items={itinerary.overview.accommodationSummary} />
          <BulletList title="概览：实用信息" items={itinerary.overview.practicalSummary} />

          <section>
            <h3 className="font-semibold">详细行程安排</h3>
            <div className="mt-2 space-y-3">
              {itinerary.detailedItinerary.map((day) => (
                <article key={day.dayIndex} className="rounded-lg border border-slate-200 p-3">
                  <h4 className="font-semibold">Day {day.dayIndex} · {day.date} · {day.theme}</h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {day.events.map((event, index) => (
                      <li key={`${day.dayIndex}-${index}`} className="rounded-md bg-slate-50 p-2">
                        <div>
                          <span className="font-medium">{event.time}</span> · {event.title}（{event.category}）
                        </div>
                        <div className="text-slate-600">{event.description}</div>
                        <div className="text-slate-600">地点：{event.location}（{event.geo.lat}, {event.geo.lng}）</div>
                        <div className="text-slate-600">交通：{event.transport}</div>
                        <div className="text-slate-600">提示：{event.tips}</div>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <BulletList title="交通信息：跨城" items={itinerary.transportation.cityTransfers} />
          <BulletList title="交通信息：市内" items={itinerary.transportation.inCityTransport} />
          <BulletList title="住宿推荐" items={itinerary.accommodationDining.stayRecommendations} />
          <BulletList title="餐饮推荐" items={itinerary.accommodationDining.diningRecommendations} />

          <section>
            <h3 className="font-semibold">地图导航</h3>
            <div className="mt-2 space-y-2 text-sm">
              {itinerary.mapNavigation.map((route, index) => (
                <div key={`route-${index}`} className="rounded-md bg-slate-50 p-2">
                  <div className="font-medium">Day {route.dayIndex} · {route.routeName}</div>
                  <div className="text-slate-600">
                    {route.waypoints.map((p) => `${p.name}(${p.lat}, ${p.lng})`).join(' → ')}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <BulletList title="实用信息：行李清单" items={itinerary.practicalInfo.packingChecklist} />
          <BulletList title="实用信息：预算建议" items={itinerary.practicalInfo.budgetTips} />
          <BulletList title="实用信息：紧急信息" items={itinerary.practicalInfo.emergencyInfo} />
          <BulletList title="实用信息：亲子建议" items={itinerary.practicalInfo.familyFriendlyTips} />
        </section>
      ) : null}
    </div>
  );
}
