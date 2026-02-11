import React from 'react';

const Gallery: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:py-20">
      {/* PageHeading Component */}
      <div className="flex flex-col gap-4 mb-12">
        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Gallery & Lifestyle</h1>
        <p className="text-slate-500 dark:text-[#9dadb9] text-lg max-w-2xl leading-relaxed">
          More than just a sport, it's a lifestyle. From our legendary SUP breakfasts to deep river explorations in the Amazon of Antalya.
        </p>
      </div>

      {/* Tabs Component */}
      <div className="mb-10 overflow-x-auto no-scrollbar">
        <div className="flex border-b border-slate-200 dark:border-[#3b4954] gap-10 whitespace-nowrap">
          <a className="flex flex-col items-center justify-center border-b-[3px] border-[#1183d4] text-[#1183d4] pb-3 font-bold text-sm tracking-wide" href="#">
            All Moments
          </a>
          <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500 dark:text-[#9dadb9] pb-3 hover:text-[#1183d4] transition-colors font-bold text-sm tracking-wide" href="#">
            Social Events
          </a>
          <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500 dark:text-[#9dadb9] pb-3 hover:text-[#1183d4] transition-colors font-bold text-sm tracking-wide" href="#">
            River & Forest
          </a>
          <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500 dark:text-[#9dadb9] pb-3 hover:text-[#1183d4] transition-colors font-bold text-sm tracking-wide" href="#">
            Client Cams
          </a>
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
    </div>
  );
};

export default Gallery;