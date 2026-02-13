import type { TripWithDaysAndEvents } from '@/lib/domain/trip';

export const mockTrip: TripWithDaysAndEvents = {
  id: 'demo-trip-001',
  userId: 'demo-user',
  title: '长沙亲子 3 日轻松游',
  destination: '长沙',
  status: 'active',
  startDate: '2026-05-01',
  endDate: '2026-05-03',
  days: [
    {
      id: 'day-1',
      tripId: 'demo-trip-001',
      dayIndex: 1,
      date: '2026-05-01',
      summary: '抵达长沙，轻松打卡地标景点。',
      events: [
        {
          id: 'event-1',
          dayId: 'day-1',
          tripId: 'demo-trip-001',
          startTime: '10:00',
          endTime: '12:00',
          title: '橘子洲头',
          description: '小火车游览，孩子不易疲惫。',
          category: 'spot',
          locationName: '橘子洲景区',
          geo: { lat: 28.183, lng: 112.947 },
        },
        {
          id: 'event-2',
          dayId: 'day-1',
          tripId: 'demo-trip-001',
          startTime: '12:30',
          endTime: '13:30',
          title: '午餐：湘菜亲子餐厅',
          category: 'food',
          locationName: '坡子街',
          geo: { lat: 28.194, lng: 112.974 },
        },
      ],
    },
  ],
};
