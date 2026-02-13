export type EventCategory = 'spot' | 'food' | 'hotel' | 'transport' | 'custom';

export interface TripInput {
  title: string;
  destination: string;
  startDate?: string;
  endDate?: string;
}

export interface TripEvent {
  id: string;
  dayId: string;
  tripId: string;
  startTime?: string;
  endTime?: string;
  isTimeFlexible?: boolean;
  title: string;
  description?: string;
  category: EventCategory;
  locationName?: string;
  address?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  externalLink?: string;
  isCompleted?: boolean;
}

export interface TripDay {
  id: string;
  tripId: string;
  dayIndex: number;
  date?: string;
  summary?: string;
  events: TripEvent[];
}

export interface TripWithDaysAndEvents {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  status: 'planning' | 'active' | 'completed';
  days: TripDay[];
}

export interface GeneratedItinerary {
  tripTitle: string;
  destination: string;
  days: Array<{
    dayIndex: number;
    dateOffset: number;
    summary?: string;
    events: Array<{
      time: string;
      title: string;
      category: EventCategory;
      description?: string;
      location: string;
      geo: {
        lat: number;
        lng: number;
      };
    }>;
  }>;
}
