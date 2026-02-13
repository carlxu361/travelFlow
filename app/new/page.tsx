import { SiteHeader } from '@/components/site-header';
import { GenerateTripForm } from '@/components/new-trip/generate-form';

export default function NewTripPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold">创建新行程</h1>
        <p className="mt-3 text-slate-600">
          输入自然语言需求，调用 OpenAI 兼容 API 生成结构化行程；支持二次修改完善，并可保存到本地。
        </p>

        <GenerateTripForm />
      </section>
    </main>
  );
}
