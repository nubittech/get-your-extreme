import React from 'react';

type Product = {
  id: string;
  name: string;
  category: string;
  summary: string;
  tag: string;
  image: string;
};

const products: Product[] = [
  {
    id: 'pro-carbon-board',
    name: 'Pro Carbon SUP Board',
    category: 'SUP Boards',
    summary: 'Stable race-friendly board for tours and all-day rentals.',
    tag: 'Rental / Sale',
    image: 'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?q=80&w=1965&auto=format&fit=crop'
  },
  {
    id: 'carbon-paddle',
    name: 'Adjustable Carbon Paddle',
    category: 'Paddles',
    summary: 'Lightweight paddle with ergonomic grip and fast response.',
    tag: 'Inquiry',
    image: 'https://images.unsplash.com/photo-1596484552882-628d7d3d1a49?q=80&w=1887&auto=format&fit=crop'
  },
  {
    id: 'elite-vest',
    name: 'Elite Professional Vest',
    category: 'Safety',
    summary: 'Certified vest set in multiple sizes for group reservations.',
    tag: 'Rental / Sale',
    image: 'https://images.unsplash.com/photo-1528532729063-42e131d21f8a?q=80&w=1887&auto=format&fit=crop'
  },
  {
    id: 'dry-bag-20l',
    name: '20L Extreme Dry Bag',
    category: 'Accessories',
    summary: 'Heavy-duty waterproof dry bag for phones and valuables.',
    tag: 'Inquiry',
    image: 'https://images.unsplash.com/photo-1627844621588-444490ae5c43?q=80&w=1887&auto=format&fit=crop'
  }
];

const Shop: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col max-w-[1200px] w-full flex-1">
        <div className="@container w-full">
          <div className="px-4 py-6">
            <div
              className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-[#111518] rounded-xl min-h-[320px] shadow-2xl"
              style={{
                backgroundImage:
                  'linear-gradient(to top, rgba(16, 26, 34, 0.9) 0%, rgba(16, 26, 34, 0.2) 60%, rgba(0, 0, 0, 0) 100%), url("https://images.unsplash.com/photo-1472851294608-41531268ce71?q=80&w=2070&auto=format&fit=crop")'
              }}
            >
              <div className="flex flex-col p-8 gap-2">
                <h1 className="text-white tracking-tight text-[42px] font-black leading-tight">
                  SUP Gear and Equipment Catalog
                </h1>
                <p className="text-white/90 text-lg max-w-2xl font-medium">
                  Catalog view for incoming groups. Stock and pricing are shared
                  by our team after inquiry.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="@container w-full">
          <div className="flex flex-col justify-center gap-4 bg-[#1183d4]/10 border-x border-[#1183d4]/20 px-10 py-12 my-6 rounded-xl">
            <div className="flex flex-col gap-3 text-center items-center">
              <div className="flex items-center gap-2 text-[#1183d4]">
                <span className="material-symbols-outlined font-bold">info</span>
                <span className="uppercase tracking-widest text-xs font-bold">Catalog Info</span>
              </div>
              <h2 className="text-slate-900 dark:text-white tracking-tight text-3xl font-black max-w-[800px]">
                Rentals, Group Packages and Sales Support
              </h2>
              <p className="text-slate-600 dark:text-white/70 text-base font-normal leading-relaxed max-w-[760px]">
                We prepare custom gear lists for each group request. Contact us with
                route and participant count, and we return availability details.
              </p>
            </div>
            <div className="flex flex-wrap justify-center mt-4 gap-4">
              <a
                href="https://wa.me/905425550000?text=Hello%2C%20I%20need%20gear%20availability."
                target="_blank"
                rel="noreferrer"
                className="flex min-w-[220px] items-center justify-center rounded-lg h-12 px-6 bg-[#1183d4] text-white text-base font-bold tracking-[0.015em] hover:scale-105 transition-transform"
              >
                WhatsApp Inquiry
              </a>
              <a
                href="tel:+902425550000"
                className="flex min-w-[220px] items-center justify-center rounded-lg h-12 px-6 border border-[#1183d4] text-[#1183d4] text-base font-bold tracking-[0.015em] hover:bg-[#1183d4]/5 transition-colors"
              >
                Call for Details
              </a>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {['SUP Boards', 'Paddles', 'Safety', 'Accessories'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-300 dark:border-white/10 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 mb-20">
          {products.map((product) => (
            <article key={product.id} className="flex flex-col gap-4 group">
              <div
                className="w-full bg-center bg-no-repeat aspect-[4/5] bg-cover rounded-xl shadow-lg border border-white/5 overflow-hidden relative"
                style={{ backgroundImage: `url("${product.image}")` }}
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="bg-white text-slate-900 px-3 py-1 rounded-full font-bold text-xs">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                  {product.name}
                </p>
                <p className="text-[#9dadb9] text-sm font-medium">{product.summary}</p>
                <p className="text-[#1183d4] text-sm font-bold mt-2">{product.tag}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
