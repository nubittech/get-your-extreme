import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { useExperience } from '../context/ExperienceContext';
import { listEvents } from '../services/events';
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
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const parseEventDetailsLines = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return [];

  let normalized = trimmed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // If admin entered a single-line payload, split by common bullet markers.
  if (!normalized.includes('\n')) {
    normalized = normalized
      .replace(/\s+(?=(✅|✔|❌|⚠️|⚠|🧳|🥤|\+|•))/g, '\n')
      .replace(
        /\s+(?=(Included|Not Included|Important Information|What Should You Bring\?|Additional Info))/gi,
        '\n'
      );
  }

  return normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

type EventCalendarPanelProps = {
  embedded?: boolean;
};

type ReservationFormState = {
  pickupStop: string;
  participants: string;
  fullName: string;
  email: string;
  hotelName: string;
  phone: string;
  referralCode: string;
};

type GeneratedTicket = {
  reference: string;
  category: string;
  eventTitle: string;
  date: string;
  time: string;
  durationHours: number;
  pickupStop: string;
  fullName: string;
  email: string;
  hotelName: string;
  phone: string;
  participants: number;
  amount: number;
  serviceStops: string[];
};

const buildTicketPayload = (
  event: EventScheduleItem,
  form: ReservationFormState,
  activeDate: string
): GeneratedTicket => ({
  reference: `GYE-${Date.now().toString().slice(-8)}`,
  category: event.category,
  eventTitle: event.title,
  date: activeDate,
  time: event.time,
  durationHours: event.durationHours,
  pickupStop: form.pickupStop,
  fullName: form.fullName,
  email: form.email,
  hotelName: form.hotelName,
  phone: form.phone,
  participants: Number(form.participants),
  amount: event.price * Number(form.participants),
  serviceStops: event.serviceStops
});

const toTicketQrText = (ticket: GeneratedTicket) =>
  [
    `Ref:${ticket.reference}`,
    `Category:${ticket.category}`,
    `Event:${ticket.eventTitle}`,
    `Date:${ticket.date} ${ticket.time}`,
    `Pickup:${ticket.pickupStop}`,
    `Name:${ticket.fullName}`,
    `Email:${ticket.email}`,
    `Hotel:${ticket.hotelName || '-'}`,
    `Phone:${ticket.phone}`,
    `Seats:${ticket.participants}`,
    `Amount:EUR ${ticket.amount}`
  ].join('|');

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const createTicketCanvas = async (ticket: GeneratedTicket, accent: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1800;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#091320');
  gradient.addColorStop(1, '#0f2336');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, canvas.width, 22);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '700 52px sans-serif';
  ctx.fillText('GET YOUR EXTREME', 72, 120);
  ctx.font = '600 34px sans-serif';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('EVENT ACCESS TICKET', 72, 176);

  ctx.fillStyle = '#0b1726';
  ctx.strokeStyle = '#24364a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(56, 230, 1088, 1500, 28);
  ctx.fill();
  ctx.stroke();

  const qrDataUrl = await QRCode.toDataURL(toTicketQrText(ticket), {
    width: 360,
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });
  const qrImage = await loadImage(qrDataUrl);
  ctx.drawImage(qrImage, 760, 300, 320, 320);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 36px sans-serif';
  ctx.fillText(ticket.eventTitle, 96, 320);
  ctx.font = '600 22px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Reference: ${ticket.reference}`, 96, 365);
  ctx.fillText(`${ticket.date}  ${ticket.time}`, 96, 402);
  ctx.fillText(`Category: ${ticket.category}`, 96, 439);

  const rows = [
    ['Passenger', ticket.fullName],
    ['Email', ticket.email],
    ...(ticket.hotelName ? [['Hotel', ticket.hotelName]] : []),
    ['Phone', ticket.phone],
    ['Participants', String(ticket.participants)],
    ['Pickup Stop', ticket.pickupStop],
    ['Duration', `${ticket.durationHours} hours`],
    ['Amount', `EUR ${ticket.amount}`]
  ];

  let y = 535;
  rows.forEach(([label, value]) => {
    ctx.fillStyle = '#60a5fa';
    ctx.font = '700 20px sans-serif';
    ctx.fillText(label, 96, y);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 24px sans-serif';
    ctx.fillText(value, 320, y);
    y += 74;
  });

  ctx.fillStyle = '#60a5fa';
  ctx.font = '700 20px sans-serif';
  ctx.fillText('Service Route', 96, y + 8);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 21px sans-serif';
  ctx.fillText(ticket.serviceStops.join('  ->  '), 96, y + 52);

  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(96, 1300);
  ctx.lineTo(1104, 1300);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 20px sans-serif';
  ctx.fillText('Please present this QR ticket at check-in. This ticket is generated for demo flow.', 96, 1360);
  ctx.fillText('For changes, contact operations before event start time.', 96, 1400);

  return canvas;
};

const EventCalendarPanel: React.FC<EventCalendarPanelProps> = ({ embedded = false }) => {
  const { activeCategory, activeDate, setActiveDate, theme } = useExperience();
  const [viewYearMonth, setViewYearMonth] = useState(activeDate.slice(0, 7));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [eventsLoadError, setEventsLoadError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventScheduleItem[]>([]);
  const [generatedTicket, setGeneratedTicket] = useState<GeneratedTicket | null>(null);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>({
    pickupStop: '',
    participants: '1',
    fullName: '',
    email: '',
    hotelName: '',
    phone: '',
    referralCode: ''
  });

  const [viewYear, viewMonth] = viewYearMonth.split('-').map(Number);
  const todayIsoDate = toISODate(new Date());
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1);
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const leadingEmptyCells = firstDayOfMonth.getDay();

  const datesWithEvents = useMemo(() => {
    return new Set(
      events.filter((item) => item.category === activeCategory).map((item) => item.date)
    );
  }, [events, activeCategory]);
  const selectedDayEvents = useMemo(
    () =>
      events.filter((item) => item.date === activeDate && item.category === activeCategory),
    [events, activeDate, activeCategory]
  );
  const selectedEvent = useMemo(
    () => selectedDayEvents.find((item) => item.id === selectedEventId) ?? selectedDayEvents[0] ?? null,
    [selectedDayEvents, selectedEventId]
  );

  useEffect(() => {
    setViewYearMonth(activeDate.slice(0, 7));
  }, [activeDate]);

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setIsEventsLoading(true);
      setEventsLoadError(null);
      try {
        const loaded = await listEvents();
        if (isMounted) {
          setEvents(loaded);
        }
      } catch {
        if (isMounted) {
          setEventsLoadError('Events could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsEventsLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

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
    const email = reservationForm.email.trim();
    const phone = reservationForm.phone.trim();
    const referralCode = reservationForm.referralCode.trim().toUpperCase();

    if (!reservationForm.pickupStop || !fullName || !email || !phone || !seatsRequested) {
      alert('Please complete pickup, participant count, name, email and phone.');
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

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
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
        route: `Pickup ${reservationForm.pickupStop}${reservationForm.hotelName.trim() ? ` | Hotel ${reservationForm.hotelName.trim()}` : ''} | Seats ${seatsRequested} | ${selectedEvent.serviceStops.join(' -> ')}`,
        date: activeDate,
        source: 'event',
        amount: selectedEvent.price * seatsRequested,
        eventId: selectedEvent.id,
        referredByCode: referralCode || undefined
      });

      const ticket = buildTicketPayload(
        selectedEvent,
        { ...reservationForm, fullName, email, phone, participants: String(seatsRequested) },
        activeDate
      );
      setGeneratedTicket(ticket);

      alert('Reservation completed. QR ticket is ready to download.');
    } catch {
      alert('Reservation could not be completed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTicketImage = async () => {
    if (!generatedTicket) return;
    try {
      const canvas = await createTicketCanvas(generatedTicket, theme.accent);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${generatedTicket.category.toLowerCase()}-${generatedTicket.date}-${generatedTicket.fullName
        .replace(/\s+/g, '-')
        .toLowerCase()}-ticket.png`;
      link.click();
    } catch {
      alert('Ticket image could not be generated. Please try again.');
    }
  };

  const downloadTicketPdf = async () => {
    if (!generatedTicket) return;
    try {
      const canvas = await createTicketCanvas(generatedTicket, theme.accent);
      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const imageRatio = canvas.height / canvas.width;
      let imageWidth = availableWidth;
      let imageHeight = imageWidth * imageRatio;

      if (imageHeight > availableHeight) {
        imageHeight = availableHeight;
        imageWidth = imageHeight / imageRatio;
      }

      const x = (pageWidth - imageWidth) / 2;
      const y = (pageHeight - imageHeight) / 2;
      pdf.addImage(imageData, 'PNG', x, y, imageWidth, imageHeight);
      pdf.save(
        `${generatedTicket.category.toLowerCase()}-${generatedTicket.date}-${generatedTicket.fullName
          .replace(/\s+/g, '-')
          .toLowerCase()}-ticket.pdf`
      );
    } catch {
      alert('Ticket PDF could not be generated. Please try again.');
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

        <div
          className={`grid grid-cols-1 gap-6 ${embedded ? 'lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch text-white' : 'lg:grid-cols-[1.2fr_1fr] items-start'}`}
        >
          <div
            className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131d26] p-4 md:p-5 ${
              embedded ? 'lg:h-[520px]' : ''
            }`}
          >
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
                <div key={`empty-${idx}`} className={`${embedded ? 'h-10 md:h-11' : 'h-12 md:h-14'} rounded-md bg-transparent`}></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isoDate = toISODate(new Date(viewYear, viewMonth - 1, day));
                const hasEvent = datesWithEvents.has(isoDate);
                const isActive = isoDate === activeDate;
                const isPastDate = isoDate < todayIsoDate;

                return (
                  <button
                    key={isoDate}
                    type="button"
                    onClick={() => {
                      if (!isPastDate) {
                        setActiveDate(isoDate);
                      }
                    }}
                    disabled={isPastDate}
                    className={`${embedded ? 'h-10 md:h-11' : 'h-12 md:h-14'} rounded-md border text-sm font-bold relative ${
                      embedded ? 'text-white' : ''
                    } ${isPastDate ? 'opacity-45 cursor-not-allowed' : ''}`}
                    style={
                      isPastDate
                        ? {
                            borderColor: 'rgba(148,163,184,0.22)',
                            color: embedded ? 'rgba(226,232,240,0.5)' : 'rgba(51,65,85,0.55)'
                          }
                        : isActive
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
                        style={{ backgroundColor: '#facc15' }}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131d26] p-5 ${
              embedded ? 'lg:h-[520px] lg:overflow-y-auto lg:pr-3' : ''
            }`}
          >
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {formatISODateLabel(activeDate)}
            </h3>
            <p className="text-sm mt-1" style={{ color: theme.accent }}>
              {theme.label} schedule
            </p>

            <div className="mt-4 space-y-3">
              {eventsLoadError && (
                <div className="rounded-xl border border-red-300/30 px-4 py-3 text-sm text-red-300 bg-red-500/10">
                  {eventsLoadError}
                </div>
              )}

              {isEventsLoading && (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/20 px-4 py-6 text-center">
                  <p className="text-slate-600 dark:text-white/70 text-sm font-medium">
                    Loading events...
                  </p>
                </div>
              )}

              {!isEventsLoading && selectedDayEvents.length === 0 && (
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
                      {(() => {
                        const detailLines = parseEventDetailsLines(selectedEvent.details);
                        return (
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
                        {detailLines.length > 0 && (
                          <div className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-white/80">
                            {detailLines.map((line) => (
                              <p key={`${selectedEvent.id}-${line}`} className="leading-relaxed">
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
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
                        );
                      })()}

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
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={reservationForm.email}
                              onChange={handleFormChange}
                              placeholder="name@example.com"
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Hotel Name (Optional)
                            </label>
                            <input
                              type="text"
                              name="hotelName"
                              value={reservationForm.hotelName}
                              onChange={handleFormChange}
                              placeholder="e.g. Rixos Sungate"
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

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                              Referral Code (Optional)
                            </label>
                            <input
                              type="text"
                              name="referralCode"
                              value={reservationForm.referralCode}
                              onChange={handleFormChange}
                              placeholder="GYE-XXXXXX"
                              className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-slate-900 dark:text-white uppercase"
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

                        {generatedTicket && (
                          <div className="space-y-2">
                            <p className="rounded-lg border border-sky-300/35 bg-sky-400/10 px-3 py-2 text-xs font-medium text-sky-200">
                              Odeme bilgileri mail olarak tarafiniza iletilecektir ve rezervasyon isleminiz tamamlanacaktir.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={downloadTicketImage}
                                className="w-full inline-flex items-center justify-center rounded-lg border font-bold py-2.5"
                                style={{ borderColor: theme.accent, color: theme.accent }}
                              >
                                Download QR Image
                              </button>
                              <button
                                type="button"
                                onClick={downloadTicketPdf}
                                className="w-full inline-flex items-center justify-center rounded-lg border font-bold py-2.5"
                                style={{ borderColor: theme.accent, color: theme.accent }}
                              >
                                Download PDF
                              </button>
                            </div>
                          </div>
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
