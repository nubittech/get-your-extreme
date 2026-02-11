import React from 'react';
import { useExperience } from '../context/ExperienceContext';
import { ExperienceCategory } from '../data/experienceThemes';

type Product = {
  id: string;
  name: string;
  category: string;
  summary: string;
  tag: string;
  image: string;
};

const productsByCategory: Record<ExperienceCategory, Product[]> = {
  SUP: [
    {
      id: 'sup-board',
      name: 'Pro Carbon SUP Board',
      category: 'SUP Boards',
      summary: 'Stable race-friendly board for tours and all-day rentals.',
      tag: 'Rental / Sale',
      image: 'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?q=80&w=1965&auto=format&fit=crop'
    },
    {
      id: 'sup-paddle',
      name: 'Adjustable Carbon Paddle',
      category: 'Paddles',
      summary: 'Lightweight paddle with ergonomic grip and fast response.',
      tag: 'Inquiry',
      image: 'https://images.unsplash.com/photo-1596484552882-628d7d3d1a49?q=80&w=1887&auto=format&fit=crop'
    },
    {
      id: 'sup-vest',
      name: 'Elite Professional Vest',
      category: 'Safety',
      summary: 'Certified vest set in multiple sizes for group reservations.',
      tag: 'Rental / Sale',
      image: 'https://images.unsplash.com/photo-1528532729063-42e131d21f8a?q=80&w=1887&auto=format&fit=crop'
    }
  ],
  BIKE: [
    {
      id: 'bike-mtb',
      name: 'Trail MTB 29"',
      category: 'Bikes',
      summary: 'All-terrain MTB setup with responsive hydraulic brakes.',
      tag: 'Rental / Sale',
      image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1974&auto=format&fit=crop'
    },
    {
      id: 'bike-helmet',
      name: 'Vent Pro Helmet',
      category: 'Safety',
      summary: 'Light shell helmet for road and city tours.',
      tag: 'Rental',
      image: 'https://images.unsplash.com/photo-1517654443271-21cb44f5a9b3?q=80&w=1974&auto=format&fit=crop'
    },
    {
      id: 'bike-kit',
      name: 'Road Performance Kit',
      category: 'Accessories',
      summary: 'Gloves, lights, and hydration bundle for group rides.',
      tag: 'Inquiry',
      image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=2070&auto=format&fit=crop'
    }
  ],
  SKI: [
    {
      id: 'ski-set',
      name: 'All-Mountain Ski Set',
      category: 'Ski',
      summary: 'Balanced ski setup for beginner and intermediate tracks.',
      tag: 'Rental / Sale',
      image: 'https://images.unsplash.com/photo-1455156218388-5e61b526818b?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 'ski-helmet',
      name: 'Snow Shield Helmet',
      category: 'Safety',
      summary: 'Impact-ready winter helmet with anti-fog visor.',
      tag: 'Rental',
      image: 'https://images.unsplash.com/photo-1522199873711-fc3c85f00191?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 'ski-boots',
      name: 'Performance Ski Boots',
      category: 'Boots',
      summary: 'Comfort-fit boots for day programs and slope lessons.',
      tag: 'Inquiry',
      image: 'https://images.unsplash.com/photo-1488441770602-aed21fc49bd5?q=80&w=1974&auto=format&fit=crop'
    }
  ]
};

const Shop: React.FC = () => {
  const { activeCategory, theme } = useExperience();
  const products = productsByCategory[activeCategory];

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col max-w-[1200px] w-full flex-1">
        <div className="@container w-full">
          <div className="px-4 py-6">
            <div
              className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[320px] shadow-2xl"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(15, 20, 28, 0.9) 0%, rgba(15, 20, 28, 0.2) 60%, rgba(0, 0, 0, 0) 100%), url("${theme.heroImage}")`
              }}
            >
              <div className="flex flex-col p-8 gap-2">
                <h1 className="text-white tracking-tight text-[42px] font-black leading-tight">
                  {theme.label} Gear Catalog
                </h1>
                <p className="text-white/90 text-lg max-w-2xl font-medium">
                  {theme.shopHeadline}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="@container w-full">
          <div
            className="flex flex-col justify-center gap-4 border-x px-10 py-12 my-6 rounded-xl"
            style={{ backgroundColor: theme.accentSoft, borderColor: `${theme.accent}44` }}
          >
            <div className="flex flex-col gap-3 text-center items-center">
              <div className="flex items-center gap-2" style={{ color: theme.accent }}>
                <span className="material-symbols-outlined font-bold">info</span>
                <span className="uppercase tracking-widest text-xs font-bold">
                  Catalog Info
                </span>
              </div>
              <h2 className="text-slate-900 dark:text-white tracking-tight text-3xl font-black max-w-[800px]">
                Rentals, Group Packages and Sales Support
              </h2>
              <p className="text-slate-600 dark:text-white/70 text-base font-normal leading-relaxed max-w-[760px]">
                This catalog follows selected category: {theme.label}. Contact our
                team for live stock and group pricing.
              </p>
            </div>
            <div className="flex flex-wrap justify-center mt-4 gap-4">
              <a
                href="https://wa.me/905425550000?text=Hello%2C%20I%20need%20gear%20availability."
                target="_blank"
                rel="noreferrer"
                className="flex min-w-[220px] items-center justify-center rounded-lg h-12 px-6 text-white text-base font-bold tracking-[0.015em] hover:scale-105 transition-transform"
                style={{ backgroundColor: theme.accent }}
              >
                WhatsApp Inquiry
              </a>
              <a
                href="tel:+902425550000"
                className="flex min-w-[220px] items-center justify-center rounded-lg h-12 px-6 border text-base font-bold tracking-[0.015em] transition-colors"
                style={{ borderColor: theme.accent, color: theme.accent }}
              >
                Call for Details
              </a>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {products.map((item) => (
              <span
                key={item.id}
                className="rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ borderColor: `${theme.accent}66`, color: theme.accent, backgroundColor: `${theme.accent}10` }}
              >
                {item.category}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 mb-20">
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
                <p className="text-sm font-bold mt-2" style={{ color: theme.accent }}>{product.tag}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
