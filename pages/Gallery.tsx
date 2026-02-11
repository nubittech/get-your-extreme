import React from 'react';
import { useExperience } from '../context/ExperienceContext';
import { ExperienceCategory } from '../data/experienceThemes';
import { MEDIA_ASSETS } from '../data/mediaAssets';

type GalleryItem = {
  image: string;
  caption: string;
};

const galleryByCategory: Record<ExperienceCategory, GalleryItem[]> = {
  SUP: [
    { image: MEDIA_ASSETS.supGalleryB, caption: 'SUP Breakfast Club' },
    { image: MEDIA_ASSETS.supGalleryA, caption: 'River SUP Session' },
    { image: MEDIA_ASSETS.routeBeachparkLara, caption: 'Group Coast Paddle' },
    { image: MEDIA_ASSETS.routeDuden, caption: 'Duden Scenic Session' }
  ],
  BIKE: [
    { image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop', caption: 'City Ride Briefing' },
    { image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1974&auto=format&fit=crop', caption: 'Coastal Group Ride' },
    { image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1974&auto=format&fit=crop', caption: 'Forest Training Loop' },
    { image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=2070&auto=format&fit=crop', caption: 'Team Ride Session' }
  ],
  SKI: [
    { image: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?q=80&w=1974&auto=format&fit=crop', caption: 'Ski Group Warmup' },
    { image: 'https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?q=80&w=1974&auto=format&fit=crop', caption: 'Slope Coaching' },
    { image: 'https://images.unsplash.com/photo-1488441770602-aed21fc49bd5?q=80&w=1974&auto=format&fit=crop', caption: 'Winter Program Day' },
    { image: 'https://images.unsplash.com/photo-1455156218388-5e61b526818b?q=80&w=2070&auto=format&fit=crop', caption: 'Mountain Team Event' }
  ]
};

const Gallery: React.FC = () => {
  const { activeCategory, activeDate, theme } = useExperience();
  const items = galleryByCategory[activeCategory];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:py-20">
      <div className="flex flex-col gap-4 mb-12">
        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
          {theme.label} Gallery
        </h1>
        <p className="text-slate-500 dark:text-[#9dadb9] text-lg max-w-2xl leading-relaxed">
          {theme.galleryHeadline} Active date filter: {activeDate}.
        </p>
      </div>

      <div className="mb-10 rounded-xl border border-slate-200 dark:border-[#3b4954] bg-white/60 dark:bg-[#1b232a]/40 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>
            {theme.label} Program
          </span>
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>
            Group Sessions
          </span>
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>
            Equipment Moments
          </span>
        </div>
      </div>

      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {items.map((item) => (
          <div key={item.image} className="break-inside-avoid">
            <div className="group relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
              <img className="w-full object-cover" src={item.image} alt={item.caption} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-sm font-semibold">{item.caption}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href="/#booking-form"
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-bold text-white"
          style={{ backgroundColor: theme.accent }}
        >
          Send Reservation Request
        </a>
      </div>
    </div>
  );
};

export default Gallery;
