import Link from 'next/link';
import { Clock3, MapPinned, Route } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

const quickCards = [
  {
    title: 'AI 极简规划',
    desc: '一句话生成结构化行程，覆盖每天景点、餐食和节奏安排。',
    icon: Route,
  },
  {
    title: '行中智能流',
    desc: '根据当前时间高亮下一站，3 秒内知道下一步去哪。',
    icon: Clock3,
  },
  {
    title: '轨迹资产化',
    desc: '自动沉淀旅途足迹，方便回顾与只读分享。',
    icon: MapPinned,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8">
          <p className="text-sm font-medium text-emerald-700">MVP Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">TravelFlow 智能旅行伴侣</h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            当前项目已基于 PRD / SDD 完成 Next.js + Tailwind + Supabase 基础脚手架，后续可直接接入
            Server Actions 与 Dify 工作流。
          </p>
          <div className="mt-6">
            <Link href="/new" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              前往创建行程 →
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickCards.map(({ title, desc, icon: Icon }) => (
            <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-emerald-600" />
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
