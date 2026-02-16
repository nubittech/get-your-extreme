import React, { useState } from 'react';
import { useExperience } from '../context/ExperienceContext';
import EventCalendarPanel from '../components/EventCalendarPanel';
import { ExperienceCategory, EXPERIENCE_CATEGORY_LABELS } from '../data/experienceThemes';

const heroCategoryItems: Array<{
  key: ExperienceCategory;
  label: string;
  icon: string;
}> = [
  { key: 'SUP', label: EXPERIENCE_CATEGORY_LABELS.SUP, icon: 'surfing' },
  { key: 'BIKE', label: EXPERIENCE_CATEGORY_LABELS.BIKE, icon: 'directions_bike' },
  { key: 'SKI', label: EXPERIENCE_CATEGORY_LABELS.SKI, icon: 'downhill_skiing' }
];

const Home: React.FC = () => {
  const { activeCategory, setActiveCategory, theme } = useExperience();
  const activeCategoryIndex = heroCategoryItems.findIndex((item) => item.key === activeCategory);

  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      alert('Please enter your email address.');
      return;
    }
    alert('Thanks. We saved your email for route updates.');
    setNewsletterEmail('');
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative -mt-24 md:-mt-44 min-h-[850px] w-full flex flex-col items-center justify-center bg-[#101a22] overflow-hidden">
        {/* Background Image - Using img tag for reliability */}
        <div className="absolute inset-0 z-0">
          <img 
            src={theme.heroImage}
            alt={`${theme.label} hero cover`}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#101a22]/40 via-[#101a22]/20 to-[#101a22]/70"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[1200px] px-6 pt-28 md:pt-48 pb-12 flex flex-col items-center text-center">
          <div className="w-full max-w-[980px] mb-8">
            <div
              className="relative grid grid-cols-3 p-1 rounded-xl border border-white/15 bg-black/25 backdrop-blur-md"
              aria-label="Category selector"
            >
              <span
                className="absolute top-1 bottom-1 left-1 rounded-lg shadow-lg transition-transform duration-300 ease-out"
                style={{
                  width: 'calc((100% - 0.5rem) / 3)',
                  transform: `translateX(${activeCategoryIndex * 100}%)`,
                  backgroundColor: theme.accent
                }}
              ></span>
              {heroCategoryItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveCategory(item.key)}
                  className={`relative z-10 min-h-11 md:min-h-12 px-2 py-1 rounded-lg flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold tracking-wide leading-tight text-center transition-colors ${
                    activeCategory === item.key ? 'text-white' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <h1 className="text-white text-5xl md:text-7xl font-black leading-tight tracking-[-0.033em] mb-6 drop-shadow-2xl">
            {theme.heroTitle.split(' ').slice(0, 4).join(' ')} <br/>
            <span className="drop-shadow-md" style={{ color: theme.accent }}>
              {theme.heroTitle.split(' ').slice(4).join(' ')}
            </span>
          </h1>
          <p className="text-white text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-12 drop-shadow-lg text-shadow-sm">
            {theme.heroSubtitle}
          </p>
          <div id="booking-form" className="w-full max-w-6xl mt-2">
            <EventCalendarPanel embedded />
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-[#f6f7f8] dark:bg-[#101a22]">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="text-center mb-16">
            <h2 className="font-bold tracking-widest text-sm uppercase mb-3" style={{ color: theme.accent }}>{theme.label} Program</h2>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">Why Choose Our Adventures</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
            <div className="flex flex-col items-center text-center group">
              <div className="size-16 rounded-2xl bg-[#1183d4]/10 flex items-center justify-center text-[#1183d4] mb-6 group-hover:bg-[#1183d4] group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">surfing</span>
              </div>
              <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Elite Equipment</h4>
              <p className="text-slate-600 dark:text-white/60 leading-relaxed">We provide only top-of-the-line gear from industry-leading brands to ensure your safety and maximum performance.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="size-16 rounded-2xl bg-[#1183d4]/10 flex items-center justify-center text-[#1183d4] mb-6 group-hover:bg-[#1183d4] group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">map</span>
              </div>
              <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Secret Routes</h4>
              <p className="text-slate-600 dark:text-white/60 leading-relaxed">Our guides know the hidden gems of the Antalya coast that aren't on any standard tourist map.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="size-16 rounded-2xl bg-[#1183d4]/10 flex items-center justify-center text-[#1183d4] mb-6 group-hover:bg-[#1183d4] group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">security</span>
              </div>
              <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Safety First</h4>
              <p className="text-slate-600 dark:text-white/60 leading-relaxed">Certified professional instructors and rescue-ready protocols for a worry-free extreme experience.</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="size-16 rounded-2xl bg-[#1183d4]/10 flex items-center justify-center text-[#1183d4] mb-6 group-hover:bg-[#1183d4] group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-3xl">airport_shuttle</span>
              </div>
              <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Transfer Support</h4>
              <p className="text-slate-600 dark:text-white/60 leading-relaxed">We offer transportation support for our international guests. All of our transfers are carried out with well-maintained vehicles that prioritize our guests&apos; comfort.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Showcase - Updated with Lifestyle/Social images */}
      <section className="py-24 bg-white/5 dark:bg-white/5">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">
                Explore the Mediterranean Coast
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-white/70 text-lg leading-relaxed">
                <p>
                  We plan every detail to turn outdoor sports into a smooth and enjoyable experience. Our goal is to make you feel safe, comfortable, and completely free on the water.
                </p>
                <p>
                  With Antalya&apos;s widest range of SUP equipment, we offer boards suitable for every level. With our carefully designed sea routes, you head into nature and discover the hidden beauties of the Mediterranean.
                </p>
                <p>
                  Throughout the activity, you can enjoy free photo or video shoots and get useful tips from our team. As you glide over calm waters, you enjoy being in the moment and build a real connection with nature.
                </p>
                <p>
                  Do yoga on your SUP, grab your coffee and read your book in the middle of the sea, or explore the Antalya coastline on longer routes while having fun and improving your fitness.
                </p>
                <p>
                  Swim in quiet and crystal-clear bays, dance with music, or meet new people along the way.
                </p>
                <p className="font-semibold text-slate-800 dark:text-white">
                  This is not a tour.
                  <br />
                  Because wherever you are, freedom is always on your SUP.
                </p>
              </div>
              <div className="pt-4">
                <a href="#booking-form" className="px-8 py-4 border-2 border-[#1183d4] text-[#1183d4] font-bold rounded-lg hover:bg-[#1183d4] hover:text-white transition-all flex items-center gap-2 w-fit">
                  Our Story <span className="material-symbols-outlined">trending_flat</span>
                </a>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="rounded-2xl overflow-hidden h-64 shadow-xl">
                  {/* Social Breakfast/Picnic Vibe */}
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1626075678304-629272368560?q=80&w=2070&auto=format&fit=crop" alt="Group paddling" />
                </div>
                <div className="rounded-2xl overflow-hidden h-48 shadow-xl">
                  {/* Diver */}
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1682687982185-531d09ec56fc?q=80&w=2070&auto=format&fit=crop" alt="Diver underwater" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-48 shadow-xl">
                  {/* Couple by Car Vibe */}
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?q=80&w=1887&auto=format&fit=crop" alt="Relaxing on SUP" />
                </div>
                <div className="rounded-2xl overflow-hidden h-64 shadow-xl">
                  {/* Cliffs */}
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1622639145656-749e79294902?q=80&w=1974&auto=format&fit=crop" alt="Antalya Cliffs" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Contact CTA */}
      <section className="py-20 bg-[#f6f7f8] dark:bg-[#101a22]">
        <div className="max-w-[1000px] mx-auto px-10">
          <div className="bg-[#1183d4] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-symbols-outlined text-[200px] rotate-12">sailing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">Ready for your next adventure?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">Join our community and get exclusive early access to new routes and seasonal discounts.</p>
            <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto" onSubmit={handleNewsletterSubmit}>
              <input
                className="flex-1 px-6 py-4 rounded-xl bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-0 focus:border-white"
                placeholder="Enter your email"
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button className="bg-white text-[#1183d4] font-bold px-8 py-4 rounded-xl hover:bg-[#f6f7f8] transition-colors">Join Now</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
