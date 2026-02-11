import React, { useState } from 'react';

type RouteItem = {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  description: string;
  stats: {
    distance: string;
    time: string;
    level: string;
    type: string;
  };
  meetingPoint: string;
  bestFor: string;
  image: string;
};

const routesData: RouteItem[] = [
  {
    id: 'konyaalti',
    title: 'Konyaalti Loop & Social',
    tag: 'Beginner Friendly',
    tagColor: 'bg-emerald-500',
    description:
      'A relaxing circular route starting and finishing at Beach Park. Great for first-time groups, social paddles and calm-day sessions.',
    stats: {
      distance: '3 KM',
      time: '2 Hours',
      level: 'Easy',
      type: 'Loop'
    },
    meetingPoint: 'Beach Park Main Gate',
    bestFor: 'Families, teams, and first-time paddlers',
    image: 'https://lh3.googleusercontent.com/d/1-k_VFt1TA_lg1Nku979YKOldNObLOz_R'
  },
  {
    id: 'cliffs',
    title: 'Antalya Cliffs (Falez)',
    tag: 'Most Popular',
    tagColor: 'bg-[#1183d4]',
    description:
      'A one-way coastal route with cliff views and open-water sections. This is our most requested premium trip.',
    stats: {
      distance: '7 KM',
      time: '3-4 Hours',
      level: 'Moderate',
      type: 'One Way'
    },
    meetingPoint: 'Beach Park Start Zone',
    bestFor: 'Active groups with prior paddling experience',
    image: 'https://lh3.googleusercontent.com/d/1RELZVyCj6EeQBjyMn7l_Mq1NsmRRpSQu'
  },
  {
    id: 'lara',
    title: 'Lara Beach - Duden Falls',
    tag: 'Expert Choice',
    tagColor: 'bg-amber-500',
    description:
      'A route focused on scenery and rhythm, ending near the waterfall line. Best with stable weather and guided support.',
    stats: {
      distance: '3 KM',
      time: '2:30 Hours',
      level: 'Challenging',
      type: 'Coastal'
    },
    meetingPoint: 'Lara Beach Operations Point',
    bestFor: 'Experienced paddlers and adventure groups',
    image: 'https://lh3.googleusercontent.com/d/1wBEPK2pXm5J9v47Tb91lnFWbvWCzEWoo'
  },
  {
    id: 'river',
    title: 'Sigla Forest (Kargi Koyu)',
    tag: 'Nature Escape',
    tagColor: 'bg-cyan-600',
    description:
      'A peaceful river-flow route inside forest scenery. Flat-water profile with long, smooth paddling segments.',
    stats: {
      distance: '9 KM',
      time: '1 Hour (River)',
      level: 'All Levels',
      type: 'River Flow'
    },
    meetingPoint: 'Kargi Village Riverside',
    bestFor: 'Nature-focused groups and company outings',
    image: 'https://lh3.googleusercontent.com/d/1hDCVzLvRIy3PIj02MM3CLgy7FK5iwDp8'
  }
];

const RoutesPage: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  return (
    <div className="mx-auto max-w-[1200px] w-full px-6 py-10">
      <div className="mb-12">
        <div className="flex flex-col gap-4">
          <h1 className="text-slate-900 dark:text-white text-5xl font-black leading-tight tracking-tight">
            Routes and Maps
          </h1>
          <p className="text-slate-500 dark:text-[#9dadb9] text-lg max-w-2xl leading-relaxed">
            Groups can review every route before submitting a reservation request.
            Click a route card to open full details without leaving this page.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-16">
        {routesData.map((route, index) => (
          <article
            key={route.id}
            className="group relative bg-white dark:bg-[#1c2227] rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-white/5"
          >
            <div className="flex flex-col lg:flex-row h-full">
              <button
                type="button"
                onClick={() => setSelectedRoute(route)}
                className="w-full lg:w-[55%] relative min-h-[300px] lg:min-h-[450px] bg-slate-100 dark:bg-[#151e24] overflow-hidden text-left"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url("${route.image}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden"></div>
                <div
                  className={`absolute top-6 left-6 ${route.tagColor} px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest shadow-lg`}
                >
                  {route.tag}
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-sm">open_in_full</span>
                  Open Route Details
                </div>
              </button>

              <div className="w-full lg:w-[45%] p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4 text-[#1183d4]">
                  <span className="material-symbols-outlined">explore</span>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Route {index + 1}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                  {route.title}
                </h2>
                <p className="text-slate-600 dark:text-[#9dadb9] mb-8 leading-relaxed">
                  {route.description}
                </p>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold uppercase">Distance</span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                      <span className="material-symbols-outlined text-[#1183d4] text-base">straighten</span>
                      {route.stats.distance}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold uppercase">Duration</span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                      <span className="material-symbols-outlined text-[#1183d4] text-base">schedule</span>
                      {route.stats.time}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold uppercase">Level</span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                      <span className="material-symbols-outlined text-[#1183d4] text-base">signal_cellular_alt</span>
                      {route.stats.level}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold uppercase">Type</span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                      <span className="material-symbols-outlined text-[#1183d4] text-base">alt_route</span>
                      {route.stats.type}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRoute(route)}
                  className="w-full bg-[#1183d4] hover:bg-[#0d6db3] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#1183d4]/20 flex items-center justify-center gap-2"
                >
                  View Detailed Brief
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#1183d4] rounded-2xl p-10 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <span className="material-symbols-outlined text-[200px]">medical_services</span>
          </div>
          <h3 className="text-2xl font-bold mb-4">Safety First</h3>
          <p className="opacity-90 leading-relaxed mb-6">
            All routes include briefing, life vest check, and weather confirmation.
            For high wind days, our team proposes route changes before check-in.
          </p>
          <a href="/#booking-form" className="bg-white text-[#1183d4] px-6 py-3 rounded-lg font-bold text-sm inline-block">
            Open Reservation Form
          </a>
        </div>
        <div className="bg-slate-100 dark:bg-[#1c2227] rounded-2xl p-10 border border-slate-200 dark:border-white/5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <span className="material-symbols-outlined text-[200px] text-slate-900 dark:text-white">groups</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Group and Corporate</h3>
          <p className="text-slate-600 dark:text-[#9dadb9] leading-relaxed mb-6">
            For groups above 8 participants, we prepare custom timing, safety ratio,
            and equipment planning.
          </p>
          <a
            href="https://wa.me/905425550000?text=Hello%2C%20we%20want%20a%20group%20route%20quotation."
            target="_blank"
            rel="noreferrer"
            className="border-2 border-[#1183d4] text-[#1183d4] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#1183d4] hover:text-white transition-all inline-block"
          >
            Request Group Quote
          </a>
        </div>
      </div>

      {selectedRoute && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1b232a] shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 bg-white/90 dark:bg-[#1b232a]/90 backdrop-blur border-b border-slate-200 dark:border-white/10">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                {selectedRoute.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRoute(null)}
                className="rounded-lg border border-slate-300 dark:border-white/20 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-white"
              >
                Close
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              <img
                src={selectedRoute.image}
                alt={selectedRoute.title}
                className="w-full h-[240px] md:h-[360px] object-cover rounded-xl"
              />

              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedRoute.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3">
                  <p className="text-xs text-slate-500 uppercase font-bold">Distance</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedRoute.stats.distance}</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3">
                  <p className="text-xs text-slate-500 uppercase font-bold">Duration</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedRoute.stats.time}</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3">
                  <p className="text-xs text-slate-500 uppercase font-bold">Level</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedRoute.stats.level}</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3">
                  <p className="text-xs text-slate-500 uppercase font-bold">Type</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedRoute.stats.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 dark:bg-[#11181e] p-4 border border-slate-200 dark:border-white/10">
                  <p className="text-xs uppercase font-bold text-[#1183d4]">Meeting Point</p>
                  <p className="mt-2 text-slate-700 dark:text-slate-200">{selectedRoute.meetingPoint}</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-[#11181e] p-4 border border-slate-200 dark:border-white/10">
                  <p className="text-xs uppercase font-bold text-[#1183d4]">Best For</p>
                  <p className="mt-2 text-slate-700 dark:text-slate-200">{selectedRoute.bestFor}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/#booking-form"
                  className="inline-flex items-center justify-center rounded-lg bg-[#1183d4] px-5 py-3 text-sm font-bold text-white"
                >
                  Request This Route
                </a>
                <a
                  href="https://wa.me/905425550000?text=Hello%2C%20we%20want%20details%20about%20this%20route."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-[#1183d4] px-5 py-3 text-sm font-bold text-[#1183d4]"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
