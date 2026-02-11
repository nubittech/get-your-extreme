import React, { useEffect, useState } from 'react';
import { createReservation } from '../services/reservations';
import { useExperience } from '../context/ExperienceContext';

const getTodayISODate = () => {
  const today = new Date();
  const offsetMs = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offsetMs).toISOString().split('T')[0];
};

const isValidPhoneNumber = (value: string) => /^[+]?[\d\s()-]{7,20}$/.test(value.trim());

const SpecialRequestDrawer: React.FC = () => {
  const { activeCategory, activeDate, setActiveDate } = useExperience();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: 'SUP',
    preferredDate: activeDate,
    name: '',
    phone: '',
    participants: '1',
    note: ''
  });

  const minDate = getTodayISODate();

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      category: activeCategory === 'BIKE' ? 'Bisiklet' : activeCategory === 'SKI' ? 'Kayak' : 'SUP',
      preferredDate: activeDate
    }));
  }, [activeCategory, activeDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value
    }));
    if (e.target.name === 'preferredDate') {
      setActiveDate(e.target.value);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'SUP',
      preferredDate: '',
      name: '',
      phone: '',
      participants: '1',
      note: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedNote = formData.note.trim();

    if (!formData.preferredDate || !trimmedName || !trimmedPhone) {
      alert('Please fill in date, name and phone.');
      return;
    }

    if (formData.preferredDate < minDate) {
      alert('Please select today or a future date.');
      return;
    }

    if (!isValidPhoneNumber(trimmedPhone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const participants = Number(formData.participants) || 1;
      const requestSummary = [
        `Special Request`,
        `Category: ${formData.category}`,
        `Participants: ${participants}`,
        trimmedNote ? `Note: ${trimmedNote}` : null
      ]
        .filter(Boolean)
        .join(' | ');

      await createReservation({
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        activity: `Special Request (${formData.category})`,
        route: requestSummary,
        date: formData.preferredDate
      });

      alert('Special reservation request sent.');
      resetForm();
      setIsOpen(false);
    } catch {
      alert('Request could not be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-[70] rounded-l-xl rounded-r-md bg-[#1183d4] text-white shadow-xl px-3 py-4 md:px-4 md:py-5 font-bold text-xs md:text-sm tracking-wide"
      >
        OZEL
        <br />
        REZERVASYON
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          ></div>
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#101a22] border-l border-slate-200 dark:border-white/10 shadow-2xl overflow-y-auto">
            <div className="p-5 md:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-[#1183d4]">
                  Special Request
                </p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Ozel Rezervasyon
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-300 dark:border-white/20 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-white"
              >
                Close
              </button>
            </div>

            <form className="p-5 md:p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-3 text-slate-900 dark:text-white"
                >
                  <option value="SUP">SUP</option>
                  <option value="Bisiklet">Bisiklet</option>
                  <option value="Kayak">Kayak</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  min={minDate}
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name Surname"
                  className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+90 5xx xxx xx xx"
                  className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                  Participants
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  name="participants"
                  value={formData.participants}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-white/60">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Pickup location, skill level, preferred hour..."
                  className="w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-3 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#1183d4] text-white font-bold py-3 disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : 'Send Special Request'}
              </button>
            </form>
          </aside>
        </div>
      )}
    </>
  );
};

export default SpecialRequestDrawer;
