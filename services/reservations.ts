import { Reservation, ReservationCreateInput } from '../types/reservation';

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
    typeof item.timestamp === 'string'
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

export const listReservations = async (): Promise<Reservation[]> => {
  if (isRemoteMode()) {
    return requestJson<Reservation[]>('/reservations');
  }

  return readLocalReservations();
};

export const createReservation = async (
  input: ReservationCreateInput
): Promise<Reservation> => {
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
    timestamp: new Date().toISOString()
  };

  const currentReservations = readLocalReservations();
  writeLocalReservations([nextReservation, ...currentReservations]);
  return nextReservation;
};

export const deleteReservation = async (reservationId: number): Promise<void> => {
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
