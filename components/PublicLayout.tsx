import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import SpecialRequestDrawer from './SpecialRequestDrawer';
import { useExperience } from '../context/ExperienceContext';
import { EXPERIENCE_ORDER } from '../data/experienceThemes';

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { activeCategory, setActiveCategory, activeDate, setActiveDate, theme } = useExperience();

  // Helper to highlight active link
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-solid border-slate-200 dark:border-[#283239] bg-white/80 dark:bg-[#101a22]/80 backdrop-blur-md px-6 md:px-10 py-3">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-8 group-hover:scale-110 transition-transform" style={{ color: theme.accent }}>
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">GET YOUR EXTREME</h2>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
            <nav className="flex items-center gap-8">
              <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/') ? '' : 'text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'}`} style={isActive('/') ? { color: theme.accent } : undefined}>Home</Link>
              <Link to="/routes" className={`text-sm font-medium transition-colors ${isActive('/routes') ? '' : 'text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'}`} style={isActive('/routes') ? { color: theme.accent } : undefined}>Routes</Link>
              <Link to="/gallery" className={`text-sm font-medium transition-colors ${isActive('/gallery') ? '' : 'text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'}`} style={isActive('/gallery') ? { color: theme.accent } : undefined}>Gallery</Link>
              <Link to="/shop" className={`text-sm font-medium transition-colors ${isActive('/shop') ? '' : 'text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'}`} style={isActive('/shop') ? { color: theme.accent } : undefined}>Shop</Link>
              <Link to="/admin" className={`text-sm font-medium transition-colors ${isActive('/admin') ? '' : 'text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white'}`} style={isActive('/admin') ? { color: theme.accent } : undefined}>Admin</Link>
            </nav>
            <a
              href="/#booking-form"
              className="flex min-w-[140px] items-center justify-center rounded-lg h-10 px-5 text-white text-sm font-bold shadow-lg hover:brightness-110 transition-all"
              style={{ backgroundColor: theme.accent }}
            >
              Reservation Form
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="material-symbols-outlined cursor-pointer">menu</span>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
           <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#101a22] border-b border-slate-200 dark:border-[#283239] p-4 flex flex-col gap-4 shadow-xl">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/') ? '' : 'text-slate-600 dark:text-white'}`} style={isActive('/') ? { color: theme.accent } : undefined}>Home</Link>
              <Link to="/routes" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/routes') ? '' : 'text-slate-600 dark:text-white'}`} style={isActive('/routes') ? { color: theme.accent } : undefined}>Routes</Link>
              <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/gallery') ? '' : 'text-slate-600 dark:text-white'}`} style={isActive('/gallery') ? { color: theme.accent } : undefined}>Gallery</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/shop') ? '' : 'text-slate-600 dark:text-white'}`} style={isActive('/shop') ? { color: theme.accent } : undefined}>Shop</Link>
               <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/admin') ? '' : 'text-slate-600 dark:text-white'}`} style={isActive('/admin') ? { color: theme.accent } : undefined}>Admin</Link>
           </div>
        )}
        <div className="mx-auto mt-3 w-full max-w-[1200px]">
          <div
            className="rounded-xl border border-white/10 px-3 py-3 md:px-4 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            style={{ background: theme.headerGradient }}
          >
            <div className="flex items-center gap-2 md:gap-3">
              {EXPERIENCE_ORDER.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveCategory(item)}
                  className="rounded-md px-3 py-1.5 text-xs md:text-sm font-bold transition"
                  style={
                    activeCategory === item
                      ? { backgroundColor: theme.accent, color: '#fff' }
                      : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.82)' }
                  }
                >
                  {item === 'BIKE' ? 'BISIKLET' : item === 'SKI' ? 'KAYAK' : 'SUP'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-white/70">
                Active Day
              </span>
              <input
                type="date"
                value={activeDate}
                onChange={(e) => setActiveDate(e.target.value)}
                className="rounded-md border border-white/20 bg-white/10 text-white text-sm px-3 py-1.5"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-[#f6f7f8] dark:bg-[#101a22]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#101a22] border-t border-white/5 py-12 text-white w-full">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="space-y-6 max-w-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1183d4]">scuba_diving</span>
                <span className="text-xl font-extrabold tracking-tight">GET YOUR EXTREME</span>
              </div>
              <p className="text-white/40 text-sm">Providing premium water sports experiences along the stunning Antalya coastline since 2018.</p>
              <div className="flex gap-4">
                <a
                  className="text-white/60 hover:text-[#1183d4] transition-colors"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <span className="material-symbols-outlined">photo_camera</span>
                </a>
                <a
                  className="text-white/60 hover:text-[#1183d4] transition-colors"
                  href="https://wa.me/905425550000"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <span className="material-symbols-outlined">chat</span>
                </a>
                <a
                  className="text-white/60 hover:text-[#1183d4] transition-colors"
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <h5 className="font-bold text-white">Explore</h5>
                <ul className="space-y-2 text-white/40 text-sm">
                  <li><Link className="hover:text-[#1183d4] transition-colors" to="/routes">All Activities</Link></li>
                  <li><Link className="hover:text-[#1183d4] transition-colors" to="/routes">Popular Routes</Link></li>
                  <li><a className="hover:text-[#1183d4] transition-colors" href="/#booking-form">Reservation Form</a></li>
                  <li><Link className="hover:text-[#1183d4] transition-colors" to="/gallery">Gallery</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-white">Support</h5>
                <ul className="space-y-2 text-white/40 text-sm">
                  <li><a className="hover:text-[#1183d4] transition-colors" href="tel:+902425550000">Call Us</a></li>
                  <li><a className="hover:text-[#1183d4] transition-colors" href="mailto:booking@getyourextreme.com">Email Support</a></li>
                  <li><a className="hover:text-[#1183d4] transition-colors" href="https://wa.me/905425550000" target="_blank" rel="noreferrer">WhatsApp</a></li>
                  <li><Link className="hover:text-[#1183d4] transition-colors" to="/admin">Admin Panel</Link></li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-white">Visit Us</h5>
              <p className="text-white/40 text-sm flex items-start gap-2 max-w-[200px]">
                <span className="material-symbols-outlined text-[#1183d4] text-lg">location_on</span>
                Lara Plajı, Antalya, Turkey
              </p>
              <p className="text-white/40 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1183d4] text-lg">call</span>
                +90 (242) 555-EXTRM
              </p>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
            © 2024 GET YOUR EXTREME. All rights reserved. Professional Watersports Association Member.
          </div>
        </div>
      </footer>
      <SpecialRequestDrawer />
    </div>
  );
};

export default PublicLayout;
