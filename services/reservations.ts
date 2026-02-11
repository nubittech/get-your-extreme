import { Reservation, ReservationCreateInput } from '../types/reservation';
import { requireSupabase, SUPABASE_RESERVATIONS_TABLE } from './supabase';

const STORAGE_KEY = 'reservations';
const API_MODE = import.meta.env.VITE_RESERVATIONS_API_MODE ?? 'local';
const API_BASE_URL = (import.meta.env.VITE_RESERVATIONS_API_URL ?? '').trim();

const defaultReservations: Reservation[] = [
  {
    id: 101,
    customerName: 'John Doe',
    customerPhone: '+90 532 123 4567',
    activity: 'Stand Up Paddle (SUP)',
    route: 'Konyaaltı Loop',
    date: '2026-03-24',
    status: 'Pending',
    timestamp: '2026-02-10T08:30:00Z'
  },
  {
    id: 102,
    customerName: 'Alice Schmidt',
    customerPhone: '+49 170 987 6543',
    activity: 'Sea Kayaking',
    route: 'Blue Caves Tour',
    date: '2026-03-25',
    status: 'Confirmed',
    timestamp: '2026-02-10T10:00:00Z'
  },
  {
    id: 103,
    customerName: 'Marco Rossi',
    customerPhone: '+39 333 444 5566',
    activity: 'Scuba Diving',
    route: 'Wreck Site Exploration',
    date: '2026-03-26',
    status: 'Completed',
    timestamp: '2026-02-10T20:00:00Z'
  }
];

const isReservation = (value: unknown): value is Reservation => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'number' &&
    typeof item.customerName === 'string' &&
    typeof item.customerPhone === 'string' &&
    typeof item.activity === 'string' &&
    typeof item.route === 'string' &&
    typeof item.date === 'string' &&
    typeof item.status === 'string' &&
    typeof item.timestamp === 'string' &&
    (item.amount === undefined || typeof item.amount === 'number') &&
    (item.source === undefined || item.source === 'event' || item.source === 'special') &&
    (item.eventId === undefined || typeof item.eventId === 'string')
  );
};

const readLocalReservations = (): Reservation[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultReservations));
    return defaultReservations;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isReservation)) {
      return parsed;
    }
  } catch {
    // Fall back to defaults when local storage is corrupted.
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultReservations));
  return defaultReservations;
};

const writeLocalReservations = (reservations: Reservation[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
};

const buildApiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error('VITE_RESERVATIONS_API_URL is missing.');
  }
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Reservations API failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const isRemoteMode = () => API_MODE === 'remote';
const isSupabaseMode = () => API_MODE === 'supabase';

const parseReservationId = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
};

const mapSupabaseRowToReservation = (row: Record<string, unknown>): Reservation => ({
  id: parseReservationId(row.id),
  customerName: String(row.customer_name ?? row.customerName ?? ''),
  customerPhone: String(row.customer_phone ?? row.customerPhone ?? ''),
  activity: String(row.activity ?? ''),
  route: String(row.route ?? ''),
  date: String(row.date ?? ''),
  status: String(row.status ?? 'Pending') as Reservation['status'],
  timestamp: String(row.timestamp ?? row.created_at ?? new Date().toISOString()),
  source:
    String(row.source ?? '').toLowerCase() === 'special'
      ? 'special'
      : String(row.source ?? '').toLowerCase() === 'event'
        ? 'event'
        : undefined,
  amount:
    row.amount === null || row.amount === undefined ? undefined : Number(row.amount),
  eventId:
    row.event_id === null || row.event_id === undefined
      ? undefined
      : String(row.event_id)
});

const listSupabaseReservations = async (): Promise<Reservation[]> => {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from(SUPABASE_RESERVATIONS_TABLE)
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    throw new Error(`Supabase list failed: ${error.message}`);
  }

  return (data ?? []).map((row) => mapSupabaseRowToReservation(row as Record<string, unknown>));
};

const createSupabaseReservation = async (
  input: ReservationCreateInput
): Promise<Reservation> => {
  const supabase = requireSupabase();

  const snakePayload = {
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    activity: input.activity,
    route: input.route,
    date: input.date,
    status: 'Pending',
    timestamp: new Date().toISOString(),
    source: input.source ?? 'event',
    amount: input.amount ?? null,
    event_id: input.eventId ?? null
  };

  let insertResult = await supabase
    .from(SUPABASE_RESERVATIONS_TABLE)
    .insert(snakePayload)
    .select('*')
    .single();

  // Compatibility fallback for camelCase column names.
  if (insertResult.error) {
    insertResult = await supabase
      .from(SUPABASE_RESERVATIONS_TABLE)
      .insert({
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        activity: input.activity,
        route: input.route,
        date: input.date,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        source: input.source ?? 'event',
        amount: input.amount ?? null,
        eventId: input.eventId ?? null
      })
      .select('*')
      .single();
  }

  if (insertResult.error || !insertResult.data) {
    throw new Error(`Supabase create failed: ${insertResult.error?.message ?? 'Unknown error'}`);
  }

  return mapSupabaseRowToReservation(insertResult.data as Record<string, unknown>);
};

const deleteSupabaseReservation = async (reservationId: number): Promise<void> => {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from(SUPABASE_RESERVATIONS_TABLE)
    .delete()
    .eq('id', reservationId);

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
};

export const listReservations = async (): Promise<Reservation[]> => {
  if (isSupabaseMode()) {
    return listSupabaseReservations();
  }

  if (isRemoteMode()) {
    return requestJson<Reservation[]>('/reservations');
  }

  return readLocalReservations();
};

export const createReservation = async (
  input: ReservationCreateInput
): Promise<Reservation> => {
  if (isSupabaseMode()) {
    return createSupabaseReservation(input);
  }

  if (isRemoteMode()) {
    return requestJson<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  const nextReservation: Reservation = {
    id: Date.now(),
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    activity: input.activity,
    route: input.route,
    date: input.date,
    status: 'Pending',
    timestamp: new Date().toISOString(),
    source: input.source,
    amount: input.amount,
    eventId: input.eventId
  };

  const currentReservations = readLocalReservations();
  writeLocalReservations([nextReservation, ...currentReservations]);
  return nextReservation;
};

export const deleteReservation = async (reservationId: number): Promise<void> => {
  if (isSupabaseMode()) {
    await deleteSupabaseReservation(reservationId);
    return;
  }

  if (isRemoteMode()) {
    await requestJson<void>(`/reservations/${reservationId}`, {
      method: 'DELETE'
    });
    return;
  }

  const currentReservations = readLocalReservations();
  const nextReservations = currentReservations.filter((item) => item.id !== reservationId);
  writeLocalReservations(nextReservations);
};
