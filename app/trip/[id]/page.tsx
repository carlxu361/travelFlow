type TripPageProps = {
  params: {
    id: string;
  };
};

export default function TripDetailPage({ params }: TripPageProps) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">行程详情 #{params.id}</h1>
      <p className="mt-3 text-slate-600">后续在该页面实现 Timeline / Map 视图切换。</p>
    </main>
  );
}
