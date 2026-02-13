import { getTripDetails } from '@/app/actions/trip-actions';
import { NextActionCard } from '@/components/trip/next-action-card';
import { TimelineCard } from '@/components/trip/timeline-card';
import type { TripEvent } from '@/lib/domain/trip';

type TripPageProps = {
  params: {
    id: string;
  };
};

function getEventState(event: TripEvent): 'active' | 'past' | 'future' {
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (event.startTime && event.endTime && current >= event.startTime && current <= event.endTime) {
    return 'active';
  }

  if (event.endTime && current > event.endTime) {
    return 'past';
  }

  return 'future';
}

export default async function TripDetailPage({ params }: TripPageProps) {
  const trip = await getTripDetails(params.id);
  const today = trip.days[0];
  const nextEvent = today.events[0];

  return (
    <main className="mx-auto min-h-screen max-w-4xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold">{trip.title}</h1>
        <p className="mt-2 text-slate-600">
          {trip.destination} · {trip.startDate} ~ {trip.endDate}
        </p>
      </header>

      <NextActionCard event={nextEvent} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Day {today.dayIndex} · 时间线</h2>
        <p className="text-sm text-slate-600">{today.summary}</p>
        <div className="space-y-3">
          {today.events.map((event) => (
            <TimelineCard key={event.id} event={event} state={getEventState(event)} />
          ))}
        </div>
      </section>
    </main>
  );
}
