import type { EventCategory, GeneratedItinerary } from '@/lib/domain/trip';

function isCategory(value: string): value is EventCategory {
  return ['spot', 'food', 'hotel', 'transport', 'custom'].includes(value);
}

export function parseItineraryJson(payload: string): GeneratedItinerary {
  const raw = JSON.parse(payload) as Record<string, unknown>;

  if (!raw.trip_title || !Array.isArray(raw.days)) {
    throw new Error('Invalid itinerary format from AI response.');
  }

  const destination = typeof raw.destination === 'string' ? raw.destination : '待定目的地';

  return {
    tripTitle: String(raw.trip_title),
    destination,
    days: raw.days.map((day, index) => {
      const dayObject = day as Record<string, unknown>;
      const events = Array.isArray(dayObject.events) ? dayObject.events : [];

      return {
        dayIndex: Number(dayObject.day_index ?? index + 1),
        dateOffset: Number(dayObject.date_offset ?? index),
        summary: typeof dayObject.summary === 'string' ? dayObject.summary : undefined,
        events: events.map((event) => {
          const eventObject = event as Record<string, unknown>;
          const geo = (eventObject.geo ?? {}) as Record<string, unknown>;
          const category = typeof eventObject.category === 'string' ? eventObject.category : 'custom';

          return {
            time: String(eventObject.time ?? '09:00'),
            title: String(eventObject.title ?? '待安排活动'),
            category: isCategory(category) ? category : 'custom',
            description: typeof eventObject.description === 'string' ? eventObject.description : undefined,
            location: String(eventObject.location ?? '待定位置'),
            geo: {
              lat: Number(geo.lat ?? 0),
              lng: Number(geo.lng ?? 0),
            },
          };
        }),
      };
    }),
  };
}
