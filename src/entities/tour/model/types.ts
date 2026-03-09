export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  date?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  location?: string;
  author?: string;
  authorPhoto?: string;
  fullDescription?: string;
  features?: string[];
  isActive?: boolean;
  translations?: any;
}

export type TourStatus = 'all' | 'upcoming' | 'current' | 'past';

export function getTourStatus(tour: Tour): 'upcoming' | 'current' | 'past' | 'unknown' {
  if (!tour.startDate) return 'unknown';
  const now = new Date();
  const start = new Date(tour.startDate);
  const end = tour.endDate ? new Date(tour.endDate) : start;
  if (start > now) return 'upcoming';
  if (end < now) return 'past';
  return 'current';
}
