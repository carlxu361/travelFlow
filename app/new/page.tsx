import { SiteHeader } from '@/components/site-header';

export default function NewTripPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">创建新行程</h1>
        <p className="mt-3 text-slate-600">
          MVP 阶段可在这里接入“自然语言创建 + generateItineraryAction”流程。
        </p>
        <textarea
          className="mt-6 h-32 w-full rounded-xl border border-slate-300 bg-white p-4 outline-none ring-emerald-500 transition focus:ring"
          placeholder="例如：五一去长沙3天带两娃，节奏轻松，偏爱亲子体验"
        />
        <button className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          生成 AI 行程（占位）
        </button>
      </section>
    </main>
  );
}
