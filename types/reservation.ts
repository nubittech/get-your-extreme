export type ReservationStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  activity: string;
  route: string;
  date: string;
  status: ReservationStatus;
  timestamp: string;
}

export interface ReservationCreateInput {
  customerName: string;
  customerPhone: string;
  activity: string;
  route: string;
  date: string;
}
