import React, { useState } from 'react';
import { useExperience } from '../context/ExperienceContext';
import { ExperienceCategory } from '../data/experienceThemes';
import { MEDIA_ASSETS } from '../data/mediaAssets';

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

const routesByCategory: Record<ExperienceCategory, RouteItem[]> = {
  SUP: [
    {
      id: 'sup-beachpark',
      title: 'Beach Park Social Loop',
      tag: 'Beginner Friendly',
      tagColor: '#16a34a',
      description:
        'A relaxed cycle route is ideal for first-time paddlers and mixed groups with smooth coastal waters. It is a busy route as the most preferred population.',
      stats: { distance: '2.5 KM', time: '2 Hours', level: 'Easy', type: 'Loop' },
      meetingPoint: 'Beach Park Main Gate',
      bestFor: 'Families and social sessions',
      image: MEDIA_ASSETS.routeBeachpark
    },
    {
      id: 'sup-beachpark-lara',
      title: 'Beach Park to Lara Coast',
      tag: 'Most Popular',
      tagColor: '#1183d4',
      description:
        "It's a long one-way conditioning route. A little more of a sports and professional oriented route. A unique sports experience with great views.",
      stats: { distance: '4.5 KM', time: '3-4 Hours', level: 'Moderate', type: 'One Way' },
      meetingPoint: 'Beach Park Start Zone',
      bestFor: 'Active groups with prior paddling',
      image: MEDIA_ASSETS.routeBeachparkLara
    },
    {
      id: 'sup-duden',
      title: 'Duden Waterline Route',
      tag: 'Scenic',
      tagColor: '#0ea5e9',
      description:
        'Reaching Duden Waterfall requires paddling through open sea, which makes this route suitable for advanced-level participants. Currents and wind may be present in open water; therefore, as long as participants have sufficient paddling experience and strictly follow all instructions given by the instructor, the route does not pose any issues. Along this route, you will witness the breathtaking moment when the world-famous Duden Waterfall meets the Mediterranean Sea and enjoy a truly unique experience, feeling the flow of the water up close.',
      stats: { distance: '3 KM', time: '2 - 2.5 Hours', level: 'Advanced', type: 'Loop' },
      meetingPoint: 'Duden Pickup Point',
      bestFor: 'Advanced paddlers with open-sea experience',
      image: MEDIA_ASSETS.routeDuden
    },
    {
      id: 'sup-karacagoren',
      title: 'Karacagoren Expedition',
      tag: 'Long Tour',
      tagColor: '#0284c7',
      description:
        'Long-form SUP tour with transfer support, rest point briefing and return coordination.',
      stats: { distance: '9 KM', time: '4 Hours', level: 'Advanced', type: 'Expedition' },
      meetingPoint: 'Karacagoren Transfer Hub',
      bestFor: 'Full-day adventure programs',
      image: MEDIA_ASSETS.routeKaracagoren
    }
  ],
  BIKE: [
    {
      id: 'bike-old-town',
      title: 'Old Town Loop',
      tag: 'City Ride',
      tagColor: '#d97706',
      description:
        'Historical city loop with controlled speed and frequent photo stops.',
      stats: { distance: '12 KM', time: '2 Hours', level: 'Easy', type: 'City Loop' },
      meetingPoint: 'Kaleici Start Hub',
      bestFor: 'Visitors and mixed fitness groups',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 'bike-forest',
      title: 'Forest Trail Session',
      tag: 'MTB Route',
      tagColor: '#b45309',
      description:
        'Forest terrain for MTB-oriented programs with guide checkpoints.',
      stats: { distance: '18 KM', time: '3 Hours', level: 'Moderate', type: 'Trail' },
      meetingPoint: 'Forest Access Gate',
      bestFor: 'Nature-focused active teams',
      image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1974&auto=format&fit=crop'
    }
  ],
  SKI: [
    {
      id: 'ski-easy-line',
      title: 'Saklikent Easy Line',
      tag: 'Starter Program',
      tagColor: '#0ea5a4',
      description:
        'Low-slope area designed for first lessons and family sessions.',
      stats: { distance: '5 KM', time: '2 Hours', level: 'Easy', type: 'Slope Line' },
      meetingPoint: 'Saklikent Base Point',
      bestFor: 'First-time ski participants',
      image: 'https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?q=80&w=1974&auto=format&fit=crop'
    },
    {
      id: 'ski-advanced',
      title: 'Alpine Advanced Zone',
      tag: 'Advanced',
      tagColor: '#0f766e',
      description:
        'Steeper profile with instructor-led pace and safety staging.',
      stats: { distance: '9 KM', time: '3 Hours', level: 'Hard', type: 'Mountain Run' },
      meetingPoint: 'Upper Lift Exit',
      bestFor: 'Experienced ski groups',
      image: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?q=80&w=1974&auto=format&fit=crop'
    }
  ]
};

const RoutesPage: React.FC = () => {
  const { activeCategory, activeDate, theme } = useExperience();
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const routesData = routesByCategory[activeCategory];

  return (
    <div className="mx-auto max-w-[1200px] w-full px-6 py-10">
      <div className="mb-12">
        <div className="flex flex-col gap-4">
          <h1 className="text-slate-900 dark:text-white text-5xl font-black leading-tight tracking-tight">
            {theme.label} Routes and Maps
          </h1>
          <p className="text-slate-500 dark:text-[#9dadb9] text-lg max-w-2xl leading-relaxed">
            Active day: {activeDate}. Review route details and open expanded briefing
            in-page before sending a reservation request.
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
                  className="absolute top-6 left-6 px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest shadow-lg"
                  style={{ backgroundColor: route.tagColor }}
                >
                  {route.tag}
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-sm">open_in_full</span>
                  Open Route Details
                </div>
              </button>

              <div className="w-full lg:w-[45%] p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4" style={{ color: theme.accent }}>
                  <span className="material-symbols-outlined">explore</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Route {index + 1}</span>
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
                      <span className="material-symbols-outlined text-base" style={{ color: theme.accent }}>straighten</span>
                      {route.stats.distance}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold uppercase">Duration</span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                      <span className="material-symbols-outlined text-base" style={{ color: theme.accent }}>schedule</span>
                      {route.stats.time}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold uppercase">Level</span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                      <span className="material-symbols-outlined text-base" style={{ color: theme.accent }}>signal_cellular_alt</span>
                      {route.stats.level}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs font-bold uppercase">Type</span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                      <span className="material-symbols-outlined text-base" style={{ color: theme.accent }}>alt_route</span>
                      {route.stats.type}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRoute(route)}
                  className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.accent }}
                >
                  View Detailed Brief
                </button>
              </div>
            </div>
          </article>
        ))}
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
                  <p className="text-xs uppercase font-bold" style={{ color: theme.accent }}>Meeting Point</p>
                  <p className="mt-2 text-slate-700 dark:text-slate-200">{selectedRoute.meetingPoint}</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-[#11181e] p-4 border border-slate-200 dark:border-white/10">
                  <p className="text-xs uppercase font-bold" style={{ color: theme.accent }}>Best For</p>
                  <p className="mt-2 text-slate-700 dark:text-slate-200">{selectedRoute.bestFor}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/#booking-form"
                  className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white"
                  style={{ backgroundColor: theme.accent }}
                >
                  Request This Route
                </a>
                <a
                  href="https://wa.me/905425550000?text=Hello%2C%20we%20want%20details%20about%20this%20route."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-bold"
                  style={{ borderColor: theme.accent, color: theme.accent }}
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
