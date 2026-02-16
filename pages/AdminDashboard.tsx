import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteReservation, listReservations } from '../services/reservations';
import { Reservation } from '../types/reservation';
import { createEvent, deleteEvent, listEvents, updateEvent } from '../services/events';
import { EventScheduleItem } from '../types/event';
import { ExperienceCategory, EXPERIENCE_CATEGORY_LABELS } from '../data/experienceThemes';
import { useAuth } from '../context/AuthContext';
import { listRegisteredUsers, RegisteredUser } from '../services/users';

const AdminDashboard: React.FC = () => {
  const { user, profile, openAuthModal, signOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<EventScheduleItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsLoadError, setEventsLoadError] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    category: 'SUP' as ExperienceCategory,
    date: '',
    time: '08:00',
    durationHours: '2',
    capacity: '12',
    price: '55',
    title: '',
    summary: '',
    details: '',
    serviceStops: 'Kemer Saat Kulesi, Goynuk, Liman'
  });

  useEffect(() => {
    let isMounted = true;

    const fetchReservations = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const loadedReservations = await listReservations();
        if (isMounted) {
          setReservations(loadedReservations);
        }
      } catch {
        if (isMounted) {
          setLoadError('Reservations could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReservations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersLoadError(null);
      try {
        const loadedUsers = await listRegisteredUsers();
        if (isMounted) {
          setRegisteredUsers(loadedUsers);
        }
      } catch {
        if (isMounted) {
          setUsersLoadError('Registered users could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setUsersLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      setEventsLoading(true);
      setEventsLoadError(null);
      try {
        const loadedEvents = await listEvents();
        if (isMounted) {
          setEvents(loadedEvents);
        }
      } catch {
        if (isMounted) {
          setEventsLoadError('Events could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setEventsLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reservation?')) {
      return;
    }

    try {
      await deleteReservation(id);
      setReservations((current) => current.filter((item) => item.id !== id));
    } catch {
      alert('Reservation could not be deleted. Please try again.');
    }
  };

  const handleEventFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setEventForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = eventForm.title.trim();
    const summary = eventForm.summary.trim();
    const details = eventForm.details.trim();
    const serviceStops = eventForm.serviceStops
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!eventForm.date || !eventForm.time || !title || !summary || !details || serviceStops.length === 0) {
      alert('Please fill all event fields including service stops.');
      return;
    }

    const durationHours = Number(eventForm.durationHours);
    const capacity = Number(eventForm.capacity);
    const price = Number(eventForm.price);

    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      alert('Duration must be greater than 0.');
      return;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      alert('Capacity must be a positive integer.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      alert('Price must be greater than 0.');
      return;
    }

    setIsCreatingEvent(true);
    try {
      const payload = {
        category: eventForm.category,
        date: eventForm.date,
        time: eventForm.time,
        durationHours,
        capacity,
        price,
        title,
        summary,
        details,
        serviceStops
      };

      if (editingEventId) {
        const updated = await updateEvent(editingEventId, payload);
        setEvents((current) =>
          current
            .map((item) => (item.id === editingEventId ? updated : item))
            .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
        );
        setEditingEventId(null);
      } else {
        const created = await createEvent(payload);
        setEvents((current) =>
          [...current, created].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
        );
      }

      setEventForm({
        category: 'SUP',
        date: '',
        time: '08:00',
        durationHours: '2',
        capacity: '12',
        price: '55',
        title: '',
        summary: '',
        details: '',
        serviceStops: 'Kemer Saat Kulesi, Goynuk, Liman'
      });
    } catch {
      alert(editingEventId ? 'Event could not be updated.' : 'Event could not be created. Please check backend settings.');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleEditEvent = (eventItem: EventScheduleItem) => {
    setEditingEventId(eventItem.id);
    setEventForm({
      category: eventItem.category,
      date: eventItem.date,
      time: eventItem.time,
      durationHours: String(eventItem.durationHours),
      capacity: String(eventItem.capacity),
      price: String(eventItem.price),
      title: eventItem.title,
      summary: eventItem.summary,
      details: eventItem.details,
      serviceStops: eventItem.serviceStops.join(', ')
    });
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEventForm({
      category: 'SUP',
      date: '',
      time: '08:00',
      durationHours: '2',
      capacity: '12',
      price: '55',
      title: '',
      summary: '',
      details: '',
      serviceStops: 'Kemer Saat Kulesi, Goynuk, Liman'
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event from schedule?')) return;
    try {
      await deleteEvent(eventId);
      setEvents((current) => current.filter((item) => item.id !== eventId));
      if (editingEventId === eventId) {
        cancelEditEvent();
      }
    } catch {
      alert('Event could not be deleted.');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'bg-[#1183d4]/10 text-[#1183d4] border-[#1183d4]/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20'; // Pending
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredReservations = reservations.filter((item) => {
    if (!normalizedSearch) return true;
    return (
      item.customerName.toLowerCase().includes(normalizedSearch) ||
      item.customerPhone.toLowerCase().includes(normalizedSearch) ||
      item.activity.toLowerCase().includes(normalizedSearch) ||
      item.route.toLowerCase().includes(normalizedSearch) ||
      item.status.toLowerCase().includes(normalizedSearch) ||
      (item.referredByCode ?? '').toLowerCase().includes(normalizedSearch)
    );
  });

  const refOwnerMap = new Map<string, RegisteredUser>();
  registeredUsers.forEach((item) => {
    if (item.refCode) {
      refOwnerMap.set(item.refCode.toUpperCase(), item);
    }
  });

  const estimatedRevenue = filteredReservations.reduce(
    (sum, item) => sum + (typeof item.amount === 'number' ? item.amount : 0),
    0
  );

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f6f7f8] dark:bg-[#101a22]">
      {/* Admin Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#283239] bg-[#f6f7f8] dark:bg-[#101a22] px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-4 text-[#1183d4]">
            <div className="size-6">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">GET YOUR EXTREME</h2>
          </Link>
          <label className="flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#9dadb9] flex border-none bg-slate-200 dark:bg-[#283239] items-center justify-center pl-4 rounded-l-lg">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-slate-200 dark:bg-[#283239] focus:border-none h-full placeholder:text-[#9dadb9] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal"
                placeholder="Search reservations..."
              />
            </div>
          </label>
        </div>
        <div className="flex flex-1 justify-end gap-6">
          {!user ? (
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="rounded-lg border border-[#283239] px-3 py-2 text-sm font-semibold text-slate-700 dark:text-white"
            >
              Giris Yap
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-[#283239] px-2 py-1 text-xs text-slate-700 dark:text-white/90">
                {profile?.refCode ?? 'No Ref'}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg border border-[#283239] px-3 py-2 text-sm font-semibold text-slate-700 dark:text-white"
              >
                Cikis
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Side Panel — Registered Users */}
        <aside className="w-72 flex flex-col border-r border-[#283239] bg-[#f6f7f8] dark:bg-[#101a22] hidden lg:flex">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#283239]">
            <div>
              <h1 className="text-slate-900 dark:text-white text-sm font-bold">Kayitli Uyeler</h1>
              <p className="text-[#9dadb9] text-[10px]">Sistemde kayitli hesaplar</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-[#1183d4]/10 px-2 py-1">
              <span className="material-symbols-outlined text-[#1183d4] text-[16px]">group</span>
              <span className="text-sm font-bold text-[#1183d4]">{registeredUsers.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {usersLoadError && (
              <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 mx-1 mb-2">
                <p className="text-[10px] font-semibold text-red-400">{usersLoadError}</p>
              </div>
            )}
            {usersLoading && <p className="text-xs text-[#9dadb9] px-2 py-4">Yukleniyor...</p>}
            {!usersLoading && registeredUsers.length === 0 && !usersLoadError && (
              <p className="text-xs text-[#9dadb9] px-2 py-4">Kayitli kullanici yok.</p>
            )}
            {!usersLoading && registeredUsers.map((item) => {
              const isSelected = selectedUserId === item.id;
              const userReservations = reservations.filter(
                (r) => r.referredByCode && item.refCode && r.referredByCode.toUpperCase() === item.refCode.toUpperCase()
              );
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(isSelected ? null : item.id)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#1183d4]/10 ring-1 ring-[#1183d4]/30'
                        : 'hover:bg-slate-100 dark:hover:bg-[#283239]/40'
                    }`}
                  >
                    <div className="size-7 shrink-0 rounded-full bg-[#1183d4]/20 flex items-center justify-center text-[#1183d4] font-bold text-[10px]">
                      {(item.fullName ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.fullName || 'Isimsiz'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-[#9dadb9]">{item.refCode || '-'}</span>
                        <span className={`inline-flex rounded px-1 py-px text-[9px] font-bold ${
                          item.role === 'admin'
                            ? 'bg-purple-500/15 text-purple-400'
                            : item.role === 'customer'
                              ? 'bg-[#1183d4]/15 text-[#1183d4]'
                              : 'bg-slate-500/15 text-slate-400'
                        }`}>
                          {item.role || '?'}
                        </span>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-[14px] text-[#9dadb9] transition-transform ${isSelected ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Expanded Detail Panel */}
                  {isSelected && (
                    <div className="mx-2 mt-1 mb-2 rounded-lg border border-[#283239] bg-[#16202a] p-3 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-[#9dadb9]">Telefon</p>
                          <p className="text-xs text-white font-medium">{item.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-[#9dadb9]">Kayit</p>
                          <p className="text-xs text-white font-medium">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : '-'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-[#9dadb9]">Ref Kodu</p>
                        <p className="text-xs text-white font-mono font-bold">{item.refCode || '-'}</p>
                      </div>
                      <div className="border-t border-[#283239] pt-2">
                        <p className="text-[9px] uppercase tracking-wider text-[#9dadb9] mb-1">
                          Referans Rezervasyonlari ({userReservations.length})
                        </p>
                        {userReservations.length === 0 && (
                          <p className="text-[10px] text-[#9dadb9]">Bu kullaniciya ait rezervasyon yok.</p>
                        )}
                        {userReservations.slice(0, 5).map((r) => (
                          <div key={r.id} className="flex items-center justify-between py-1">
                            <div>
                              <p className="text-[10px] text-white font-medium">{r.customerName}</p>
                              <p className="text-[9px] text-[#9dadb9]">{r.activity} — {r.date}</p>
                            </div>
                            <span className={`rounded px-1.5 py-px text-[8px] font-bold ${
                              r.status === 'Confirmed' ? 'bg-[#1183d4]/15 text-[#1183d4]'
                                : r.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400'
                                : r.status === 'Cancelled' ? 'bg-red-500/15 text-red-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                        ))}
                        {userReservations.length > 5 && (
                          <p className="text-[9px] text-[#1183d4] mt-1">+{userReservations.length - 5} daha...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#283239] p-3">
            <div className="flex flex-col gap-2 p-2.5 bg-[#1183d4]/10 rounded-lg">
              <p className="text-[10px] text-[#1183d4] font-bold uppercase tracking-wider">System Status</p>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500"></div>
                <p className="text-slate-900 dark:text-white text-[10px]">All systems operational</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Heading Section */}
          <div className="flex flex-wrap justify-between items-end gap-3 p-8">
            <div className="flex min-w-72 flex-col gap-2">
              <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Reservations Management</p>
              <p className="text-[#9dadb9] text-base font-normal leading-normal">Manage and track all water sports booking requests in Antalya.</p>
            </div>
          </div>
          {loadError && (
            <div className="px-8 pb-2">
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loadError}
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-4 px-8 pb-4">
            <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-slate-600 dark:text-white text-base font-medium">Total Requests</p>
                <span className="material-symbols-outlined text-[#1183d4]">analytics</span>
              </div>
              <p className="text-slate-900 dark:text-white tracking-light text-3xl font-bold leading-tight">{reservations.length}</p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#0bda5b] text-sm">trending_up</span>
                <p className="text-[#0bda5b] text-sm font-medium">Updated just now</p>
              </div>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-slate-600 dark:text-white text-base font-medium">Pending</p>
                <span className="material-symbols-outlined text-amber-500">pending_actions</span>
              </div>
              <p className="text-slate-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                {filteredReservations.filter(r => r.status === 'Pending').length}
              </p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-500 text-sm">notifications</span>
                <p className="text-amber-500 text-sm font-medium">Action required</p>
              </div>
            </div>
            <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50 shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-slate-600 dark:text-white text-base font-medium">Est. Revenue</p>
                <span className="material-symbols-outlined text-emerald-500">payments</span>
              </div>
              <p className="text-slate-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                €{estimatedRevenue.toFixed(0)}
              </p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#0bda5b] text-sm">info</span>
                <p className="text-[#0bda5b] text-sm font-medium">From reservation totals</p>
              </div>
            </div>
          </div>

          {/* Event Management */}
          <div className="px-8 pb-4">
            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
              <form
                onSubmit={handleCreateEvent}
                className="rounded-xl p-5 border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50 shadow-sm space-y-3"
              >
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingEventId ? 'Edit Event' : 'Create Event'}
                  </p>
                  <p className="text-xs text-[#9dadb9]">
                    {EXPERIENCE_CATEGORY_LABELS.SUP} / {EXPERIENCE_CATEGORY_LABELS.BIKE} / {EXPERIENCE_CATEGORY_LABELS.SKI} etkinligini tarih tablosuna ekler.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-bold text-slate-600 dark:text-white/70">
                    Category
                    <select
                      name="category"
                      value={eventForm.category}
                      onChange={handleEventFormChange}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="SUP">{EXPERIENCE_CATEGORY_LABELS.SUP}</option>
                      <option value="BIKE">{EXPERIENCE_CATEGORY_LABELS.BIKE}</option>
                      <option value="SKI">{EXPERIENCE_CATEGORY_LABELS.SKI}</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold text-slate-600 dark:text-white/70">
                    Date
                    <input
                      type="date"
                      name="date"
                      value={eventForm.date}
                      onChange={handleEventFormChange}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <label className="text-xs font-bold text-slate-600 dark:text-white/70">
                    Time
                    <input
                      type="time"
                      name="time"
                      value={eventForm.time}
                      onChange={handleEventFormChange}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600 dark:text-white/70">
                    Duration(h)
                    <input
                      type="number"
                      name="durationHours"
                      min="0.5"
                      step="0.5"
                      value={eventForm.durationHours}
                      onChange={handleEventFormChange}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600 dark:text-white/70">
                    Capacity
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      value={eventForm.capacity}
                      onChange={handleEventFormChange}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600 dark:text-white/70">
                    Price (EUR)
                    <input
                      type="number"
                      name="price"
                      min="1"
                      value={eventForm.price}
                      onChange={handleEventFormChange}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </label>
                </div>
                <label className="block text-xs font-bold text-slate-600 dark:text-white/70">
                  Title
                  <input
                    type="text"
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventFormChange}
                    placeholder="Sunrise SUP Session"
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-600 dark:text-white/70">
                  Summary
                  <input
                    type="text"
                    name="summary"
                    value={eventForm.summary}
                    onChange={handleEventFormChange}
                    placeholder="Calm-water morning group paddle with instructor briefing."
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-600 dark:text-white/70">
                  Details
                  <textarea
                    name="details"
                    value={eventForm.details}
                    onChange={handleEventFormChange}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-600 dark:text-white/70">
                  Service Stops (comma separated)
                  <input
                    type="text"
                    name="serviceStops"
                    value={eventForm.serviceStops}
                    onChange={handleEventFormChange}
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-[#16202a] px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isCreatingEvent}
                    className="rounded-lg px-4 py-2 bg-[#1183d4] text-white text-sm font-bold disabled:opacity-60"
                  >
                    {isCreatingEvent ? (editingEventId ? 'Updating...' : 'Creating...') : editingEventId ? 'Update Event' : 'Create Event'}
                  </button>
                  {editingEventId && (
                    <button
                      type="button"
                      onClick={cancelEditEvent}
                      className="rounded-lg px-4 py-2 border border-slate-300 dark:border-[#3b4954] text-sm font-semibold text-slate-700 dark:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="rounded-xl p-5 border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50 shadow-sm">
                <div className="mb-3">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Published Events</p>
                </div>
                {eventsLoadError && (
                  <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {eventsLoadError}
                  </p>
                )}
                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {eventsLoading && (
                    <p className="text-sm text-[#9dadb9]">Loading events...</p>
                  )}
                  {!eventsLoading && events.length === 0 && (
                    <p className="text-sm text-[#9dadb9]">No events published.</p>
                  )}
                  {!eventsLoading &&
                    events.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-slate-200 dark:border-[#33414d] px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              [{item.category}] {item.title}
                            </p>
                            <p className="text-xs text-[#9dadb9]">
                              {item.date} {item.time} | EUR {item.price} | Seats {item.booked}/{item.capacity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditEvent(item)}
                              className="text-xs rounded-md border border-[#1183d4]/40 px-2 py-1 text-[#1183d4]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(item.id)}
                              className="text-xs rounded-md border border-red-300 px-2 py-1 text-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="p-8">
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-[#1a262f] text-slate-600 dark:text-[#9dadb9] text-sm uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Referral</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#283239] text-slate-900 dark:text-white text-sm">
                  {!isLoading && filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-[#283239]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-[#1183d4]/20 flex items-center justify-center text-[#1183d4] font-bold">
                            {res.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{res.customerName}</p>
                            <p className="text-xs text-[#9dadb9]">{res.customerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full border border-slate-300 dark:border-[#3b4954] px-2 py-0.5 text-xs">
                          {res.source === 'special' ? 'Special' : 'Event'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{res.activity}</td>
                      <td className="px-6 py-4">{res.route}</td>
                      <td className="px-6 py-4">{res.date}</td>
                      <td className="px-6 py-4">
                        {res.referredByCode ? (
                          <div>
                            <p className="font-semibold">{res.referredByCode}</p>
                            <p className="text-xs text-[#9dadb9]">
                              {refOwnerMap.get(res.referredByCode.toUpperCase())?.fullName || 'Unknown owner'}
                            </p>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {typeof res.amount === 'number' ? `EUR ${res.amount}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(res.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {isLoading && (
                     <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-slate-500">Loading reservations...</td>
                     </tr>
                  )}
                  {!isLoading && filteredReservations.length === 0 && (
                     <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-slate-500">No reservations found for this filter.</td>
                     </tr>
                  )}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-slate-200 dark:border-[#283239] flex items-center justify-between">
                <p className="text-xs text-[#9dadb9]">
                  Showing {filteredReservations.length} of {reservations.length} reservations
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
