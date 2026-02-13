import { Sparkles } from 'lucide-react';
import type { TripEvent } from '@/lib/domain/trip';

type NextActionCardProps = {
  event: TripEvent;
};

export function NextActionCard({ event }: NextActionCardProps) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5">
      <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
        <Sparkles className="h-4 w-4" />
        Next Action
      </p>
      <h2 className="mt-2 text-xl font-semibold">{event.title}</h2>
      <p className="mt-1 text-sm text-slate-600">建议时间：{event.startTime ?? '待定'}，地点：{event.locationName ?? '待定'}</p>
    </section>
  );
}
