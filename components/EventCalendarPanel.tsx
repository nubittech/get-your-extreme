import React, { useEffect, useMemo, useState } from 'react';
import { useExperience } from '../context/ExperienceContext';
import {
  getDatesWithEventsForCategory,
  getEventsForDateAndCategory
} from '../data/eventSchedule';
import { createReservation } from '../services/reservations';
import { EventScheduleItem } from '../types/event';

const toISODate = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().split('T')[0];
};

const getMonthLabel = (year: number, monthIndex: number) =>
  new Date(year, monthIndex, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatISODateLabel = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

const isValidPhoneNumber = (value: string) => /^[+]?[\d\s()-]{7,20}$/.test(value.trim());

const buildTicketText = (event: EventScheduleItem, form: ReservationFormState, activeDate: string) => {
  const ref = `GYE-${Date.now().toString().slice(-8)}`;
  return [
    'GET YOUR EXTREME - EVENT TICKET',
    `Ticket Ref: ${ref}`,
    `Category: ${event.category}`,
    `Event: ${event.title}`,
    `Date: ${activeDate}`,
    `Time: ${event.time}`,
    `Duration: ${event.durationHours} hours`,
    `Pickup Stop: ${form.pickupStop}`,
    `Participant: ${form.fullName}`,
    `Phone: ${form.phone}`,
    `Seats: ${form.participants}`,
    `Amount: EUR ${event.price * Number(form.participants)}`,
    '',
    'Please present this ticket at check-in.'
  ].join('\n');
};

type EventCalendarPanelProps = {
  embedded?: boolean;
};

type ReservationFormState = {
  pickupStop: string;
  participants: string;
  fullName: string;
  phone: string;
};

const EventCalendarPanel: React.FC<EventCalendarPanelProps> = ({ embedded = false }) => {
  const { activeCategory, activeDate, setActiveDate, theme } = useExperience();
  const [viewYearMonth, setViewYearMonth] = useState(activeDate.slice(0, 7));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketDownloadUrl, setTicketDownloadUrl] = useState<string | null>(null);
  const [ticketFileName, setTicketFileName] = useState('event-ticket.txt');
  const [reservationForm, setReservationForm] = useState<ReservationFormState>({
    pickupStop: '',
    participants: '1',
    fullName: '',
    phone: ''
  });

  const [viewYear, viewMonth] = viewYearMonth.split('-').map(Number);
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1);
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const leadingEmptyCells = firstDayOfMonth.getDay();

  const datesWithEvents = useMemo(
    () => new Set(getDatesWithEventsForCategory(activeCategory)),
    [activeCategory]
  );
  const selectedDayEvents = useMemo(
    () => getEventsForDateAndCategory(activeDate, activeCategory),
    [activeDate, activeCategory]
  );
  const selectedEvent = useMemo(
    () => selectedDayEvents.find((item) => item.id === selectedEventId) ?? selectedDayEvents[0] ?? null,
    [selectedDayEvents, selectedEventId]
  );

  useEffect(() => {
    setViewYearMonth(activeDate.slice(0, 7));
  }, [activeDate]);

  useEffect(() => {
    setSelectedEventId(selectedDayEvents[0]?.id ?? null);
  }, [selectedDayEvents]);

  useEffect(() => {
    if (!selectedEvent) return;
    setReservationForm((current) => ({
      ...current,
      pickupStop: selectedEvent.serviceStops.includes(current.pickupStop)
        ? current.pickupStop
        : selectedEvent.serviceStops[0]
    }));
  }, [selectedEvent]);

  useEffect(() => {
    return () => {
      if (ticketDownloadUrl) {
        URL.revokeObjectURL(ticketDownloadUrl);
      }
    };
  }, [ticketDownloadUrl]);

  const goToPreviousMonth = () => {
    const previous = new Date(viewYear, viewMonth - 2, 1);
    setViewYearMonth(`${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    const next = new Date(viewYear, viewMonth, 1);
    setViewYearMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setReservationForm((current) => ({
      ...current,
      [e.target.name]: e.target.value
    }));
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const seatsRequested = Number(reservationForm.participants);
    const seatsLeft = selectedEvent.capacity - selectedEvent.booked;
    const fullName = reservationForm.fullName.trim();
    const phone = reservationForm.phone.trim();

    if (!reservationForm.pickupStop || !fullName || !phone || !seatsRequested) {
      alert('Please complete pickup, participant count, name and phone.');
      return;
    }

    if (!Number.isInteger(seatsRequested) || seatsRequested < 1) {
      alert('Participant count must be at least 1.');
      return;
    }

    if (seatsRequested > seatsLeft) {
      alert(`Only ${seatsLeft} seats available for this event.`);
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReservation({
        customerName: fullName,
        customerPhone: phone,
        activity: `${theme.label} Event: ${selectedEvent.title}`,
        route: `Pickup ${reservationForm.pickupStop} | Seats ${seatsRequested} | ${selectedEvent.serviceStops.join(' -> ')}`,
        date: activeDate
      });

      const ticketText = buildTicketText(
        selectedEvent,
        { ...reservationForm, fullName, phone, participants: String(seatsRequested) },
        activeDate
      );
      const file = new Blob([ticketText], { type: 'text/plain;charset=utf-8' });

      if (ticketDownloadUrl) {
        URL.revokeObjectURL(ticketDownloadUrl);
      }
      const nextUrl = URL.createObjectURL(file);
      setTicketDownloadUrl(nextUrl);
      setTicketFileName(
        `${selectedEvent.category.toLowerCase()}-${activeDate}-${fullName.replace(/\s+/g, '-').toLowerCase()}-ticket.txt`
      );

      alert('Reservation completed. Ticket is ready to download.');
    } catch {
      alert('Reservation could not be completed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={embedded ? '' : 'py-16 bg-white dark:bg-[#0f171e]'}>
      <div className={embedded ? '' : 'max-w-[1200px] mx-auto px-6'}>
        {!embedded && (
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Event Calendar
            </h2>
            <p className="text-slate-600 dark:text-white/70 mt-2">
              Select a day to see {theme.label} events and available slots.
            </p>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 ${embedded ? 'text-white' : ''}`}>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131d26] p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-md border border-slate-300 dark:border-white/15 px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-white"
              >
                Prev
              </button>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {getMonthLabel(viewYear, viewMonth - 1)}
              </p>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-md border border-slate-300 dark:border-white/15 px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-white"
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {weekDays.map((item) => (
                <div key={item} className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-white/60">
                  {item}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: leadingEmptyCells }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-12 md:h-14 rounded-md bg-transparent"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isoDate = toISODate(new Date(viewYear, viewMonth - 1, day));
                const hasEvent = datesWithEvents.has(isoDate);
                const isActive = isoDate === activeDate;

                return (
                  <button
                    key={isoDate}
                    type="button"
                    onClick={() => setActiveDate(isoDate)}
                    className={`h-12 md:h-14 rounded-md border text-sm font-bold relative ${embedded ? 'text-white' : ''}`}
                    style={
                      isActive
                        ? { borderColor: theme.accent, backgroundColor: theme.accentSoft, color: theme.accent }
                        : {
                            borderColor: 'rgba(148,163,184,0.35)',
                            color: embedded ? 'rgba(226,232,240,0.9)' : '#334155'
                          }
                    }
                  >
                    {day}
                    {hasEvent && (
                      <span
                        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131d26] p-5">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {formatISODateLabel(activeDate)}
            </h3>
            <p className="text-sm mt-1" style={{ color: theme.accent }}>
              {theme.label} schedule
            </p>

            <div className="mt-4 space-y-3">
              {selectedDayEvents.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/20 px-4 py-6 text-center">
                  <p className="text-slate-600 dark:text-white/70 text-sm font-medium">
                    No event published for this day.
                  </p>
                </div>
              )}

              {selectedDayEvents.length > 0 && (
                <>
                  <div className="space-y-2">
                    {selectedDayEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => setSelectedEventId(event.id)}
                        className="w-full rounded-xl border p-3 text-left"
                        style={
                          selectedEvent?.id === event.id
                            ? { borderColor: theme.accent, backgroundColor: `${theme.accent}18` }
                            : { borderColor: 'rgba(148,163,184,0.25)' }
                        }
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-900 dark:text-white">{event.title}</p>
                          <span className="text-xs font-bold" style={{ color: theme.accent }}>
                            {event.time}
                          </span>
                        </div>
                        <p className="text-xs mt-1 text-slate-600 dark:text-white/70">{event.summary}</p>
                      </button>
                    ))}
                  </div>

                  {selectedEvent && (
                    <>
                      <article className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50 dark:bg-[#0f1922]">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-slate-900 dark:text-white">{selectedEvent.title}</h4>
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-bold"
                            style={{ color: theme.accent, backgroundColor: theme.accentSoft }}
                          >
                            {selectedEvent.time}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-white/70">{selectedEvent.summary}</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-white/80">{selectedEvent.details}</p>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                          <span className="text-slate-700 dark:text-white/80">Duration: {selectedEvent.durationHours}h</span>
                          <span className="text-slate-700 dark:text-white/80">
                            Seats: {selectedEvent.capacity - selectedEvent.booked}/{selectedEvent.capacity}
                          </span>
                          <span className="font-bold text-right" style={{ color: theme.accent }}>
                            EUR {selectedEvent.price}
                          </span>
                        </div>
                      </article>

                      <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide mb-2 text-slate-500 dark:text-white/60">
                          Service Route
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {selectedEvent.serviceStops.map((stop, idx) => (
                            <React.Fragment key={stop}>
                              <span className="rounded-md bg-slate-100 dark:bg-[#0f1922] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-white/85">
                                {stop}
                              </span>
                              {idx < selectedEvent.serviceStops.length - 1 && (
                                <span className="text-slate-400 text-xs">---</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <form className="rounded-xl border border-slate-200 dark:border-white/10 p-4 space-y-3" onSubmit={handleReservationSubmit}>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Complete Reservation</p>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Pickup Stop
                            </label>
                            <select
                              name="pickupStop"
                              value={reservationForm.pickupStop}
                              onChange={handleFormChange}
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                            >
                              {selectedEvent.serviceStops.map((stop) => (
                                <option key={stop} value={stop}>{stop}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                                Participants
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={selectedEvent.capacity - selectedEvent.booked}
                                name="participants"
                                value={reservationForm.participants}
                                onChange={handleFormChange}
                                className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                                Total
                              </label>
                              <div className="h-[42px] rounded-lg border border-slate-300 dark:border-white/15 px-3 flex items-center font-bold" style={{ color: theme.accent }}>
                                EUR {selectedEvent.price * (Number(reservationForm.participants) || 0)}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={reservationForm.fullName}
                              onChange={handleFormChange}
                              placeholder="Name Surname"
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={reservationForm.phone}
                              onChange={handleFormChange}
                              placeholder="+90 5xx xxx xx xx"
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full rounded-lg text-white font-bold py-2.5 disabled:opacity-60"
                          style={{ backgroundColor: theme.accent }}
                        >
                          {isSubmitting ? 'Completing...' : 'Complete Reservation'}
                        </button>

                        {ticketDownloadUrl && (
                          <a
                            href={ticketDownloadUrl}
                            download={ticketFileName}
                            className="w-full inline-flex items-center justify-center rounded-lg border font-bold py-2.5"
                            style={{ borderColor: theme.accent, color: theme.accent }}
                          >
                            Download Ticket
                          </a>
                        )}
                      </form>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCalendarPanel;
