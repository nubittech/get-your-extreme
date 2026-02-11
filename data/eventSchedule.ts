import { ExperienceCategory } from './experienceThemes';
import { EventScheduleItem } from '../types/event';

const getDateAtOffset = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().split('T')[0];
};

export const EVENT_SCHEDULE: EventScheduleItem[] = [
  {
    id: 'sup-sunrise',
    category: 'SUP',
    date: getDateAtOffset(1),
    time: '08:00',
    capacity: 12,
    booked: 7,
    price: 55,
    title: 'Sunrise SUP Session',
    summary: 'Calm-water morning group paddle with instructor briefing.'
  },
  {
    id: 'sup-cliffs',
    category: 'SUP',
    date: getDateAtOffset(3),
    time: '11:30',
    capacity: 10,
    booked: 4,
    price: 70,
    title: 'Cliffs Route Guided Tour',
    summary: 'Half-day premium SUP route under Antalya cliffs.'
  },
  {
    id: 'bike-city',
    category: 'BIKE',
    date: getDateAtOffset(2),
    time: '09:30',
    capacity: 14,
    booked: 9,
    price: 40,
    title: 'Old Town Bike Loop',
    summary: 'City-focused ride with historical checkpoints and short breaks.'
  },
  {
    id: 'bike-forest',
    category: 'BIKE',
    date: getDateAtOffset(5),
    time: '15:00',
    capacity: 12,
    booked: 5,
    price: 48,
    title: 'Forest Trail Group Ride',
    summary: 'Moderate MTB ride through forest route with support team.'
  },
  {
    id: 'ski-beginner',
    category: 'SKI',
    date: getDateAtOffset(4),
    time: '10:00',
    capacity: 16,
    booked: 6,
    price: 85,
    title: 'Beginner Ski Program',
    summary: 'Starter ski class with equipment setup and slope safety.'
  },
  {
    id: 'ski-advanced',
    category: 'SKI',
    date: getDateAtOffset(7),
    time: '13:30',
    capacity: 10,
    booked: 3,
    price: 110,
    title: 'Advanced Slope Session',
    summary: 'Technical run session for experienced participants.'
  }
];

export const getEventsForDateAndCategory = (
  date: string,
  category: ExperienceCategory
) =>
  EVENT_SCHEDULE.filter((item) => item.date === date && item.category === category);

export const getDatesWithEventsForCategory = (category: ExperienceCategory) =>
  EVENT_SCHEDULE.filter((item) => item.category === category).map((item) => item.date);
