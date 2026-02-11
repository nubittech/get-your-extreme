import React from 'react';

const Shop: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col max-w-[1200px] w-full flex-1">
        
        {/* Hero Header - Shop Interior */}
        <div className="@container w-full">
          <div className="px-4 py-6">
            <div 
              className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-[#111518] rounded-xl min-h-[320px] shadow-2xl" 
              style={{backgroundImage: 'linear-gradient(to top, rgba(16, 26, 34, 0.9) 0%, rgba(16, 26, 34, 0.2) 60%, rgba(0, 0, 0, 0) 100%), url("https://images.unsplash.com/photo-1472851294608-41531268ce71?q=80&w=2070&auto=format&fit=crop")'}}
            >
              <div className="flex flex-col p-8 gap-2">
                <h1 className="text-white tracking-tight text-[42px] font-black leading-tight">SUP Gear & Equipment Catalog</h1>
                <p className="text-white/90 text-lg max-w-2xl font-medium">Explore professional grade equipment tested in the Mediterranean waters of Antalya.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Notice / CTA */}
        <div className="@container w-full">
          <div className="flex flex-col justify-center gap-4 px-4 py-8 bg-[#1183d4]/10 border-x border-[#1183d4]/20 px-10 py-12 my-6 rounded-xl">
            <div className="flex flex-col gap-3 text-center items-center">
              <div className="flex items-center gap-2 text-[#1183d4]">
                <span className="material-symbols-outlined font-bold">info</span>
                <span className="uppercase tracking-widest text-xs font-bold">Digital Catalog Only</span>
              </div>
              <h2 className="text-slate-900 dark:text-white tracking-tight text-3xl font-black max-w-[800px]">
                Browse Our Premium Gear Collection
              </h2>
              <p className="text-slate-600 dark:text-white/70 text-base font-normal leading-relaxed max-w-[700px]">
                This selection is for viewing purposes. For current rental availability, purchase pricing, or specialized requests, please contact our logistics team directly.
              </p>
            </div>
            <div className="flex justify-center mt-4 gap-4">
              <button className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#1183d4] text-white text-base font-bold leading-normal tracking-[0.015em] hover:scale-105 transition-transform">
                <span className="truncate">WhatsApp Inquiry</span>
              </button>
              <button className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 border border-[#1183d4] text-[#1183d4] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#1183d4]/5 transition-colors">
                <span className="truncate">Call for Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="pb-6 px-4">
          <div className="flex border-b border-[#3b4954] gap-4 md:gap-8 overflow-x-auto no-scrollbar">
            <a className="flex flex-col items-center justify-center border-b-[3px] border-[#1183d4] text-slate-900 dark:text-white pb-[13px] pt-4 whitespace-nowrap" href="#">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">All Gear</p>
            </a>
            <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-[#9dadb9] hover:text-slate-900 dark:hover:text-white pb-[13px] pt-4 whitespace-nowrap" href="#">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">SUP Boards</p>
            </a>
            <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-[#9dadb9] hover:text-slate-900 dark:hover:text-white pb-[13px] pt-4 whitespace-nowrap" href="#">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Paddles</p>
            </a>
            <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-[#9dadb9] hover:text-slate-900 dark:hover:text-white pb-[13px] pt-4 whitespace-nowrap" href="#">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Life Vests</p>
            </a>
            <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-[#9dadb9] hover:text-slate-900 dark:hover:text-white pb-[13px] pt-4 whitespace-nowrap" href="#">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Waterproof Bags</p>
            </a>
            <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-[#9dadb9] hover:text-slate-900 dark:hover:text-white pb-[13px] pt-4 whitespace-nowrap" href="#">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Accessories</p>
            </a>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 mb-20">
          {/* Item 1 - Board */}
          <div className="flex flex-col gap-4 group">
            <div 
              className="w-full bg-center bg-no-repeat aspect-[4/5] bg-cover rounded-xl shadow-lg border border-white/5 overflow-hidden relative" 
              style={{backgroundImage: 'url("https://images.unsplash.com/photo-1551334787-21e6bd3ab135?q=80&w=1965&auto=format&fit=crop")'}}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-[#1183d4] text-white px-4 py-2 rounded-full font-bold text-sm">View Details</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Pro Carbon SUP Board</p>
                <span className="text-[#1183d4] text-xs font-black uppercase bg-[#1183d4]/10 px-2 py-1 rounded">Pro</span>
              </div>
              <p className="text-[#9dadb9] text-sm font-medium">Full-day rental or full ownership</p>
              <p className="text-[#1183d4] text-sm font-bold mt-2">Inquire for Rental/Sale</p>
              <button className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-[#283239] hover:bg-[#1183d4] text-white rounded-lg font-bold text-sm transition-all">
                <span className="material-symbols-outlined text-base">chat</span> Inquire Now
              </button>
            </div>
          </div>
          
          {/* Item 2 - Paddle */}
          <div className="flex flex-col gap-4 group">
            <div 
              className="w-full bg-center bg-no-repeat aspect-[4/5] bg-cover rounded-xl shadow-lg border border-white/5 overflow-hidden relative" 
              style={{backgroundImage: 'url("https://images.unsplash.com/photo-1596484552882-628d7d3d1a49?q=80&w=1887&auto=format&fit=crop")'}}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-[#1183d4] text-white px-4 py-2 rounded-full font-bold text-sm">View Details</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Adjustable Carbon Paddle</p>
              <p className="text-[#9dadb9] text-sm font-medium">Ultra-light ergonomic handle</p>
              <p className="text-[#1183d4] text-sm font-bold mt-2">Inquire for Price</p>
              <button className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-[#283239] hover:bg-[#1183d4] text-white rounded-lg font-bold text-sm transition-all">
                <span className="material-symbols-outlined text-base">chat</span> Inquire Now
              </button>
            </div>
          </div>

          {/* Item 3 - Vest */}
          <div className="flex flex-col gap-4 group">
            <div 
              className="w-full bg-center bg-no-repeat aspect-[4/5] bg-cover rounded-xl shadow-lg border border-white/5 overflow-hidden relative" 
              style={{backgroundImage: 'url("https://images.unsplash.com/photo-1528532729063-42e131d21f8a?q=80&w=1887&auto=format&fit=crop")'}}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-[#1183d4] text-white px-4 py-2 rounded-full font-bold text-sm">View Details</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">Elite Professional Vest</p>
              <p className="text-[#9dadb9] text-sm font-medium">USCG Approved - Multiple Sizes</p>
              <p className="text-[#1183d4] text-sm font-bold mt-2">Inquire for Rental/Sale</p>
              <button className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-[#283239] hover:bg-[#1183d4] text-white rounded-lg font-bold text-sm transition-all">
                <span className="material-symbols-outlined text-base">chat</span> Inquire Now
              </button>
            </div>
          </div>

           {/* Item 4 - Dry Bag */}
           <div className="flex flex-col gap-4 group">
            <div 
              className="w-full bg-center bg-no-repeat aspect-[4/5] bg-cover rounded-xl shadow-lg border border-white/5 overflow-hidden relative" 
              style={{backgroundImage: 'url("https://images.unsplash.com/photo-1627844621588-444490ae5c43?q=80&w=1887&auto=format&fit=crop")'}}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-[#1183d4] text-white px-4 py-2 rounded-full font-bold text-sm">View Details</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">20L Extreme Dry Bag</p>
              <p className="text-[#9dadb9] text-sm font-medium">100% Waterproof Heavy-duty PVC</p>
              <p className="text-[#1183d4] text-sm font-bold mt-2">Inquire for Price</p>
              <button className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-[#283239] hover:bg-[#1183d4] text-white rounded-lg font-bold text-sm transition-all">
                <span className="material-symbols-outlined text-base">chat</span> Inquire Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;