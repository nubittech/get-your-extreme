import { ExperienceCategory } from '../data/experienceThemes';

export interface EventScheduleItem {
  id: string;
  category: ExperienceCategory;
  date: string; // YYYY-MM-DD
  time: string;
  capacity: number;
  booked: number;
  price: number;
  title: string;
  summary: string;
}
