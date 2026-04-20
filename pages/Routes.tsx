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
  mapUrl?: string;
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
      image: MEDIA_ASSETS.routeBeachpark,
      mapUrl: 'https://maps.app.goo.gl/z9EKR5zZBz2fuevz5'
    },
    {
      id: 'sup-karacagoren',
      title: 'SupClupAntalyaRoute - Lara Balık',
      tag: 'Beginner Friendly',
      tagColor: '#0284c7',
      description:
        'Experience a unique exploration on our exclusive route, located close to Antalya city center. Witness fresh water flowing from a small waterfall into the sea, and paddle freely alongside historic coastal landmarks. Thanks to SupClubAntalya\'s private access area, the route remains calm and peaceful, making it one of the best spots for photo and video shoots.',
      stats: { distance: 'Free', time: '2 Hours', level: 'Beginner', type: 'Loop' },
      meetingPoint: 'Lara Balık - SupClubAntalya Private Access Area',
      bestFor: 'Photo and video focused calm-water sessions',
      image: MEDIA_ASSETS.routeKaracagoren,
      mapUrl: 'https://maps.app.goo.gl/L5686ity9aJhhcvC7'
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
      image: MEDIA_ASSETS.routeDuden,
      mapUrl: 'https://maps.app.goo.gl/mpQTG2F5HAqMExz66'
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
      image: MEDIA_ASSETS.routeBeachparkLara,
      mapUrl: 'https://maps.app.goo.gl/z9EKR5zZBz2fuevz5'
    }
  ],
  BIKE: [
    {
      id: 'bike-guver-canyon',
      title: 'Cycling - Güver Cliff / Canyon Route',
      tag: 'Beginner',
      tagColor: '#d97706',
      description:
        'The Dover Cliff is an impressive canyon just 15 km from Antalya, formed by water carving rocks over about 1 million years. With a depth of 115 meters, lush vegetation and a waterway extending to the Mediterranean Sea, it is a hidden nature scene that cannot be returned without taking photos, watched from above.',
      stats: { distance: '10 KM', time: '3 Hours', level: 'Beginner', type: 'Loop' },
      meetingPoint: 'Guver Cliff Canyon Entrance',
      bestFor: 'Scenic rides and photo-focused cycling groups',
      image: '/PHOTO-2026-02-26-18-04-17.jpg',
      mapUrl: ''
    }
  ],
  SKI: [
    {
      id: 'ski-advanced',
      title: 'Summit Division Route',
      tag: 'Summit Division',
      tagColor: '#0f766e',
      description:
        'Ranked among the world\'s top three rock climbing destinations, Geyikbayiri awaits you in the Taurus Mountains with over 1,000 routes designed to push your limits. If you want to reach the summit with us in this extreme experience, reserve your spot.',
      stats: {
        distance: 'Free',
        time: '6 Hours',
        level: 'Beginner - Intermediate - Advanced',
        type: 'Loop'
      },
      meetingPoint: 'Upper Lift Exit',
      bestFor: 'Experienced ski groups',
      image: '/PHOTO-2026-02-25-16-16-24.jpg',
      mapUrl: ''
    }
  ]
};

const RoutesPage: React.FC = () => {
  const { activeCategory, activeDate, theme } = useExperience();
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
  const routesData = routesByCategory[activeCategory];

  const getRouteMapLink = (route: RouteItem) => {
    if (route.mapUrl && route.mapUrl.trim()) return route.mapUrl.trim();
    const query = encodeURIComponent(`${route.meetingPoint}, Antalya`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const handleImageLoad = (key: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = naturalWidth / naturalHeight;
    setImageRatios((current) => {
      if (current[key] && Math.abs(current[key] - ratio) < 0.01) return current;
      return { ...current, [key]: ratio };
    });
  };

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
                <img
                  src={route.image}
                  alt={route.title}
                  onLoad={(event) => handleImageLoad(route.id, event)}
                  className="absolute inset-0 h-full w-full object-cover opacity-20 blur-[1px] scale-105 transition-transform duration-700 group-hover:scale-110"
                />
                <img
                  src={route.image}
                  alt={route.title}
                  onLoad={(event) => handleImageLoad(route.id, event)}
                  className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                />
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
              <figure className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#101820] overflow-hidden">
                <div
                  className="w-full"
                  style={{ aspectRatio: imageRatios[selectedRoute.id] ?? 16 / 9 }}
                >
                  <img
                    src={selectedRoute.image}
                    alt={selectedRoute.title}
                    onLoad={(event) => handleImageLoad(selectedRoute.id, event)}
                    className="h-full w-full object-contain"
                  />
                </div>
                <figcaption className="border-t border-slate-200 dark:border-white/10 px-4 py-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  {selectedRoute.title} | {selectedRoute.stats.distance} | {selectedRoute.stats.time}
                </figcaption>
              </figure>
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
                  href={getRouteMapLink(selectedRoute)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white"
                  style={{ backgroundColor: theme.accent }}
                >
                  Open Pickup In Google Maps
                </a>
                <a
                  href="/#booking-form"
                  className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-bold"
                  style={{ borderColor: theme.accent, color: theme.accent }}
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
