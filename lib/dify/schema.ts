import type { EventCategory, GeneratedItinerary } from '@/lib/domain/trip';

function isCategory(value: string): value is EventCategory {
  return ['spot', 'food', 'hotel', 'transport', 'custom'].includes(value);
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

export function parseItineraryJson(payload: string): GeneratedItinerary {
  const raw = JSON.parse(payload) as Record<string, unknown>;

  if (!raw.trip_title || !raw.trip_highlights || !Array.isArray(raw.detailed_itinerary)) {
    throw new Error('Invalid itinerary format from AI response.');
  }

  const highlights = raw.trip_highlights as Record<string, unknown>;
  const overview = (raw.overview ?? {}) as Record<string, unknown>;
  const transportation = (raw.transportation ?? {}) as Record<string, unknown>;
  const accommodationDining = (raw.accommodation_dining ?? {}) as Record<string, unknown>;
  const practicalInfo = (raw.practical_info ?? {}) as Record<string, unknown>;

  return {
    tripTitle: String(raw.trip_title),
    tripHighlights: {
      destination: String(highlights.destination ?? '待定目的地'),
      travelDates: String(highlights.travel_dates ?? '待定日期'),
      travelers: String(highlights.travelers ?? '待定旅行者'),
      weatherInfo: String(highlights.weather_info ?? '天气信息待补充'),
    },
    overview: {
      dailyArrangement: toStringArray(overview.daily_arrangement),
      transportationSummary: toStringArray(overview.transportation),
      accommodationSummary: toStringArray(overview.accommodation),
      practicalSummary: toStringArray(overview.practical_info),
    },
    detailedItinerary: (raw.detailed_itinerary as Array<Record<string, unknown>>).map((day, index) => {
      const events = Array.isArray(day.events) ? day.events : [];
      return {
        dayIndex: Number(day.day_index ?? index + 1),
        date: String(day.date ?? '待定日期'),
        theme: String(day.theme ?? '行程主题'),
        events: events.map((event) => {
          const eventObject = event as Record<string, unknown>;
          const geo = (eventObject.geo ?? {}) as Record<string, unknown>;
          const category = typeof eventObject.category === 'string' ? eventObject.category : 'custom';

          return {
            time: String(eventObject.time ?? '09:00'),
            title: String(eventObject.title ?? '待安排活动'),
            category: isCategory(category) ? category : 'custom',
            description: String(eventObject.description ?? '暂无描述'),
            location: String(eventObject.location ?? '待定位置'),
            geo: {
              lat: Number(geo.lat ?? 0),
              lng: Number(geo.lng ?? 0),
            },
            transport: String(eventObject.transport ?? '待定交通方式'),
            tips: String(eventObject.tips ?? '暂无提示'),
          };
        }),
      };
    }),
    transportation: {
      cityTransfers: toStringArray(transportation.city_transfers),
      inCityTransport: toStringArray(transportation.in_city_transport),
    },
    accommodationDining: {
      stayRecommendations: toStringArray(accommodationDining.stay_recommendations),
      diningRecommendations: toStringArray(accommodationDining.dining_recommendations),
    },
    mapNavigation: Array.isArray(raw.map_navigation)
      ? raw.map_navigation.map((route, index) => {
          const routeObject = route as Record<string, unknown>;
          const waypoints = Array.isArray(routeObject.waypoints) ? routeObject.waypoints : [];
          return {
            dayIndex: Number(routeObject.day_index ?? index + 1),
            routeName: String(routeObject.route_name ?? `Day ${index + 1} 路线`),
            waypoints: waypoints.map((point) => {
              const pointObject = point as Record<string, unknown>;
              return {
                name: String(pointObject.name ?? '打卡点'),
                lat: Number(pointObject.lat ?? 0),
                lng: Number(pointObject.lng ?? 0),
              };
            }),
          };
        })
      : [],
    practicalInfo: {
      packingChecklist: toStringArray(practicalInfo.packing_checklist),
      budgetTips: toStringArray(practicalInfo.budget_tips),
      emergencyInfo: toStringArray(practicalInfo.emergency_info),
      familyFriendlyTips: toStringArray(practicalInfo.family_friendly_tips),
    },
  };
}
