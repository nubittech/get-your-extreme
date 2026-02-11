import React from 'react';

// Route Data Configuration
const routesData = [
  {
    id: 'konyaalti',
    title: 'Konyaaltı Loop & Social',
    tag: 'Beginner Friendly',
    tagColor: 'bg-emerald-500',
    description: 'A relaxing circular route starting and finishing at Beach Park. Perfect for sunrise breakfast tours, groups, and beginners. Enjoy views of the Kaleiçi Marina.',
    stats: {
      distance: '3 KM',
      time: '2 Hours',
      level: 'Easy',
      type: 'Loop'
    },
    // UPDATED: Using 'lh3.googleusercontent.com' format for better reliability
    image: 'https://lh3.googleusercontent.com/d/1-k_VFt1TA_lg1Nku979YKOldNObLOz_R',
  },
  {
    id: 'cliffs',
    title: 'Antalya Cliffs (Falez)',
    tag: 'Most Popular',
    tagColor: 'bg-[#1183d4]',
    description: 'A stunning one-way journey from Beach Park to Lara Balık. Glide beneath the massive limestone cliffs, spot dolphins and seals, and stop at the exclusive Rest Location.',
    stats: {
      distance: '7 KM',
      time: '3-4 Hours',
      level: 'Moderate',
      type: 'One Way'
    },
    // UPDATED: Using your specific Google Drive image ID for Cliffs
    image: 'https://lh3.googleusercontent.com/d/1RELZVyCj6EeQBjyMn7l_Mq1NsmRRpSQu',
  },
  {
    id: 'lara',
    title: 'Lara Beach – Düden Falls',
    tag: 'Expert Choice',
    tagColor: 'bg-amber-500',
    description: 'The iconic waterfall route. Paddle from Lara Beach to the magnificent Lower Düden Waterfall. Navigate past the Military Restricted Zone to reach the spray.',
    stats: {
      distance: '3 KM',
      time: '2:30 Hours',
      level: 'Challenging',
      type: 'Coastal'
    },
    // UPDATED: Using your specific Google Drive image ID for Lara
    image: 'https://lh3.googleusercontent.com/d/1wBEPK2pXm5J9v47Tb91lnFWbvWCzEWoo',
  },
  {
    id: 'river',
    title: 'Sığla Forest (Kargı Köyü)',
    tag: 'Nature Escape',
    tagColor: 'bg-purple-500',
    description: 'Explore the "Amazon of Antalya". A 9km journey through the lush Sığla Forests and river streams. A completely different flat-water experience surrounded by nature.',
    stats: {
      distance: '9 KM',
      time: '1 Hour (River)',
      level: 'All Levels',
      type: 'River Flow'
    },
    // UPDATED: Using your specific Google Drive image ID for Sığla Forest
    image: 'https://lh3.googleusercontent.com/d/1hDCVzLvRIy3PIj02MM3CLgy7FK5iwDp8',
  }
];

const RoutesPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] w-full px-6 py-10">
      {/* PageHeading Component */}
      <div className="mb-12">
        <div className="flex flex-col gap-4">
          <h1 className="text-slate-900 dark:text-white text-5xl font-black leading-tight tracking-tight">Routes & Maps</h1>
          <p className="text-slate-500 dark:text-[#9dadb9] text-lg max-w-2xl leading-relaxed">
            Detailed route maps for your adventure. Review the waypoints, distances, and restricted zones before booking your guide.
          </p>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="flex flex-col gap-16">
        {routesData.map((route, index) => (
          <div key={route.id} className="group relative bg-white dark:bg-[#1c2227] rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-white/5">
            <div className="flex flex-col lg:flex-row h-full">
              
              {/* Left: Map/Cover Image (55%) */}
              <div className="w-full lg:w-[55%] relative min-h-[300px] lg:min-h-[450px] bg-slate-100 dark:bg-[#151e24] overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{backgroundImage: `url("${route.image}")`}}
                ></div>
                
                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden"></div>
                
                <div className={`absolute top-6 left-6 ${route.tagColor} px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest shadow-lg`}>
                  {route.tag}
                </div>
                
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-sm">zoom_in</span> View Full Map
                </div>
              </div>

              {/* Right: Info (45%) */}
              <div className="w-full lg:w-[45%] p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4 text-[#1183d4]">
                  <span className="material-symbols-outlined">explore</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Route {index + 1}</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{route.title}</h2>
                <p className="text-slate-600 dark:text-[#9dadb9] mb-8 leading-relaxed">
                  {route.description}
                </p>
                
                {/* Stats Grid */}
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

                <button className="w-full bg-[#1183d4] hover:bg-[#0d6db3] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#1183d4]/20 flex items-center justify-center gap-2">
                  Book This Route
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Safety & Info Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#1183d4] rounded-2xl p-10 text-white relative overflow-hidden">
           <div className="absolute -right-10 -bottom-10 opacity-10">
              <span className="material-symbols-outlined text-[200px]">medical_services</span>
           </div>
           <h3 className="text-2xl font-bold mb-4">Safety First</h3>
           <p className="opacity-90 leading-relaxed mb-6">
             All our routes are monitored by our support boat. We provide life vests, waterproof communication devices, and comprehensive briefings before every departure.
           </p>
           <button className="bg-white text-[#1183d4] px-6 py-3 rounded-lg font-bold text-sm">Read Safety Guide</button>
        </div>
        <div className="bg-slate-100 dark:bg-[#1c2227] rounded-2xl p-10 border border-slate-200 dark:border-white/5 relative overflow-hidden">
           <div className="absolute -right-10 -bottom-10 opacity-5">
              <span className="material-symbols-outlined text-[200px] text-slate-900 dark:text-white">groups</span>
           </div>
           <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Group & Corporate</h3>
           <p className="text-slate-600 dark:text-[#9dadb9] leading-relaxed mb-6">
             Planning a team event? Our "Konyaaltı Loop" and "River" routes are perfect for large groups, featuring social breaks and catering options on the water.
           </p>
           <button className="border-2 border-[#1183d4] text-[#1183d4] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#1183d4] hover:text-white transition-all">Request Group Quote</button>
        </div>
      </div>
    </div>
  );
};

export default RoutesPage;