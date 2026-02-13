type SharePageProps = {
  params: {
    id: string;
  };
};

export default function ShareTripPage({ params }: SharePageProps) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">只读分享页 #{params.id}</h1>
      <p className="mt-3 text-slate-600">该页面仅展示行程信息，不提供编辑操作。</p>
    </main>
  );
}
