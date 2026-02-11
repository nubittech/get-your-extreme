import React from 'react';

const Gallery: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:py-20">
      {/* PageHeading Component */}
      <div className="flex flex-col gap-4 mb-12">
        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Gallery & Lifestyle</h1>
        <p className="text-slate-500 dark:text-[#9dadb9] text-lg max-w-2xl leading-relaxed">
          Moments from group sessions, route tours, and equipment demos. These visuals help incoming guests choose the right experience before sending a reservation request.
        </p>
      </div>

      <div className="mb-10 rounded-xl border border-slate-200 dark:border-[#3b4954] bg-white/60 dark:bg-[#1b232a]/40 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#1183d4]/10 text-[#1183d4] px-3 py-1 text-xs font-bold">Social Events</span>
          <span className="rounded-full bg-[#1183d4]/10 text-[#1183d4] px-3 py-1 text-xs font-bold">River & Forest</span>
          <span className="rounded-full bg-[#1183d4]/10 text-[#1183d4] px-3 py-1 text-xs font-bold">Client Moments</span>
          <span className="rounded-full bg-[#1183d4]/10 text-[#1183d4] px-3 py-1 text-xs font-bold">Gear Sessions</span>
        </div>
      </div>

      {/* ImageGrid / Gallery (Masonry Style) */}
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        <div className="break-inside-avoid">
          <div className="group relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
            {/* UPDATED: Google Drive Image 1 */}
            <img className="w-full object-cover" src="https://lh3.googleusercontent.com/d/1COxd_ojMEjpyNVJNqyqUzzLebzO2i4Lr" alt="Breakfast on SUP" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-white text-sm font-semibold">SUP Breakfast Club</span>
            </div>
          </div>
        </div>
        <div className="break-inside-avoid">
          <div className="group relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
            {/* UPDATED: Google Drive Image 2 */}
            <img className="w-full object-cover" src="https://lh3.googleusercontent.com/d/1JKLnxGLuMQ09TzBA4NAcC2d3ymo7ny4l" alt="River SUP" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-white text-sm font-semibold">Sığla Forest Expedition</span>
            </div>
          </div>
        </div>
        <div className="break-inside-avoid">
          <div className="group relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
            {/* UPDATED: Google Drive Image 3 */}
            <img className="w-full object-cover" src="https://lh3.googleusercontent.com/d/197AkaC7nRTjFXay5NKuW4LfamS7Yno_1" alt="Group of friends paddleboarding" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-white text-sm font-semibold">Team Building</span>
            </div>
          </div>
        </div>
        <div className="break-inside-avoid">
          <div className="group relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
             {/* UPDATED: Google Drive Image 4 */}
            <img className="w-full object-cover" src="https://lh3.googleusercontent.com/d/1or3oVMFBX2BCPtjDpVc3BlLFySt7yWJV" alt="Skatinger Board" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-white text-sm font-semibold">Skatinger Equipment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <a href="/#booking-form" className="inline-flex items-center justify-center rounded-lg bg-[#1183d4] px-6 py-3 text-sm font-bold text-white">
          Send Reservation Request
        </a>
      </div>
    </div>
  );
};

export default Gallery;
