import { ExperienceCategory } from '../data/experienceThemes';

export interface EventScheduleItem {
  id: string;
  category: ExperienceCategory;
  date: string; // YYYY-MM-DD
  time: string | null;
  durationHours: number;
  routeDistanceKm?: number;
  capacity: number;
  booked: number;
  price: number | null;
  whatsappContactRequired?: boolean;
  title: string;
  summary: string;
  details: string;
  serviceStops: string[];
}

export interface EventCreateInput {
  category: ExperienceCategory;
  date: string;
  time: string | null;
  durationHours: number;
  routeDistanceKm?: number;
  capacity: number;
  price: number | null;
  whatsappContactRequired: boolean;
  title: string;
  summary: string;
  details: string;
  serviceStops: string[];
}
