import { EVENT_SCHEDULE } from '../data/eventSchedule';
import { EventCreateInput, EventScheduleItem } from '../types/event';
import { requireSupabase, requireSupabasePublic, SUPABASE_EVENTS_TABLE } from './supabase';

const STORAGE_KEY = 'events_schedule';
const API_MODE = import.meta.env.VITE_RESERVATIONS_API_MODE ?? 'local';

const isSupabaseMode = () => API_MODE === 'supabase';

const isEventScheduleItem = (value: unknown): value is EventScheduleItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.category === 'string' &&
    typeof item.date === 'string' &&
    typeof item.time === 'string' &&
    typeof item.durationHours === 'number' &&
    typeof item.capacity === 'number' &&
    typeof item.booked === 'number' &&
    typeof item.price === 'number' &&
    typeof item.title === 'string' &&
    typeof item.summary === 'string' &&
    typeof item.details === 'string' &&
    Array.isArray(item.serviceStops)
  );
};

const readLocalEvents = (): EventScheduleItem[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(EVENT_SCHEDULE));
    return EVENT_SCHEDULE;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isEventScheduleItem)) {
      return parsed;
    }
  } catch {
    // Fall back to defaults when local storage is corrupted.
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(EVENT_SCHEDULE));
  return EVENT_SCHEDULE;
};

const writeLocalEvents = (events: EventScheduleItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

const toEventId = (value: unknown) => String(value ?? `evt-${Date.now()}`);

const mapSupabaseRow = (row: Record<string, unknown>): EventScheduleItem => ({
  id: toEventId(row.id),
  category: String(row.category ?? 'SUP') as EventScheduleItem['category'],
  date: String(row.date ?? ''),
  time: String(row.time ?? ''),
  durationHours: Number(row.duration_hours ?? row.durationHours ?? 0),
  capacity: Number(row.capacity ?? 0),
  booked: Number(row.booked ?? 0),
  price: Number(row.price ?? 0),
  title: String(row.title ?? ''),
  summary: String(row.summary ?? ''),
  details: String(row.details ?? ''),
  serviceStops: Array.isArray(row.service_stops)
    ? (row.service_stops as string[])
    : typeof row.serviceStops === 'string'
      ? String(row.serviceStops)
          .split('|')
          .map((item) => item.trim())
          .filter(Boolean)
      : []
});

export const listEvents = async (): Promise<EventScheduleItem[]> => {
  if (isSupabaseMode()) {
    // Use the session-free public client so that reads always go through
    // the anon role. This prevents RLS policies tied to a specific user
    // from hiding events that were inserted by another user (e.g. admin).
    const client = requireSupabasePublic();
    const { data, error } = await client
      .from(SUPABASE_EVENTS_TABLE)
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      throw new Error(`Supabase events list failed: ${error.message}`);
    }

    return (data ?? []).map((row) => mapSupabaseRow(row as Record<string, unknown>));
  }

  return readLocalEvents();
};

export const createEvent = async (input: EventCreateInput): Promise<EventScheduleItem> => {
  if (isSupabaseMode()) {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from(SUPABASE_EVENTS_TABLE)
      .insert({
        category: input.category,
        date: input.date,
        time: input.time,
        duration_hours: input.durationHours,
        capacity: input.capacity,
        booked: 0,
        price: input.price,
        title: input.title,
        summary: input.summary,
        details: input.details,
        service_stops: input.serviceStops
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Supabase event create failed: ${error?.message ?? 'Unknown error'}`);
    }

    return mapSupabaseRow(data as Record<string, unknown>);
  }

  const nextEvent: EventScheduleItem = {
    id: `evt-${Date.now()}`,
    category: input.category,
    date: input.date,
    time: input.time,
    durationHours: input.durationHours,
    capacity: input.capacity,
    booked: 0,
    price: input.price,
    title: input.title,
    summary: input.summary,
    details: input.details,
    serviceStops: input.serviceStops
  };

  const current = readLocalEvents();
  writeLocalEvents([nextEvent, ...current]);
  return nextEvent;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  if (isSupabaseMode()) {
    const supabase = requireSupabase();
    const numericId = Number(eventId);
    const isNumeric = Number.isFinite(numericId);
    const matcher = isNumeric ? { key: 'id', value: numericId } : { key: 'id', value: eventId };

    const { error } = await supabase
      .from(SUPABASE_EVENTS_TABLE)
      .delete()
      .eq(matcher.key, matcher.value);

    if (error) {
      throw new Error(`Supabase event delete failed: ${error.message}`);
    }
    return;
  }

  const current = readLocalEvents();
  writeLocalEvents(current.filter((item) => item.id !== eventId));
};
