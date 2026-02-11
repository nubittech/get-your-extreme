import { ExperienceCategory } from '../data/experienceThemes';

export interface EventScheduleItem {
  id: string;
  category: ExperienceCategory;
  date: string; // YYYY-MM-DD
  time: string;
  durationHours: number;
  capacity: number;
  booked: number;
  price: number;
  title: string;
  summary: string;
  details: string;
  serviceStops: string[];
}

export interface EventCreateInput {
  category: ExperienceCategory;
  date: string;
  time: string;
  durationHours: number;
  capacity: number;
  price: number;
  title: string;
  summary: string;
  details: string;
  serviceStops: string[];
}
