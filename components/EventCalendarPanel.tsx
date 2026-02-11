import React, { useMemo, useState } from 'react';
import { useExperience } from '../context/ExperienceContext';
import {
  getDatesWithEventsForCategory,
  getEventsForDateAndCategory
} from '../data/eventSchedule';

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

const EventCalendarPanel: React.FC = () => {
  const { activeCategory, activeDate, setActiveDate, theme } = useExperience();
  const [viewYearMonth, setViewYearMonth] = useState(activeDate.slice(0, 7));

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

  const goToPreviousMonth = () => {
    const previous = new Date(viewYear, viewMonth - 2, 1);
    setViewYearMonth(`${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    const next = new Date(viewYear, viewMonth, 1);
    setViewYearMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <section className="py-16 bg-white dark:bg-[#0f171e]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            Event Calendar
          </h2>
          <p className="text-slate-600 dark:text-white/70 mt-2">
            Select a day to see {theme.label} events and available slots.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
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
                    className="h-12 md:h-14 rounded-md border text-sm font-bold relative"
                    style={
                      isActive
                        ? { borderColor: theme.accent, backgroundColor: theme.accentSoft, color: theme.accent }
                        : { borderColor: 'rgba(148,163,184,0.35)', color: '#334155' }
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

              {selectedDayEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-slate-50 dark:bg-[#0f1922]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-slate-900 dark:text-white">{event.title}</h4>
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{ color: theme.accent, backgroundColor: theme.accentSoft }}
                    >
                      {event.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-white/70">{event.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-white/80">
                      Capacity: {event.booked}/{event.capacity}
                    </span>
                    <span className="font-bold" style={{ color: theme.accent }}>
                      EUR {event.price}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCalendarPanel;
