import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import SpecialRequestDrawer from './SpecialRequestDrawer';
import { useExperience } from '../context/ExperienceContext';
import { MEDIA_ASSETS } from '../data/mediaAssets';

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useExperience();

  // Helper to highlight active link
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full px-4 md:px-8 py-3">
        <div className="flex w-full items-start justify-between">
          {/* Logo */}
          <Link to="/" className="-ml-2 md:-ml-4 flex items-center group">
            <img src={MEDIA_ASSETS.logo} alt="Get Your Extreme logo" className="h-24 w-24 md:h-40 md:w-40 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 justify-end gap-8 items-center pr-4 lg:pr-8 xl:pr-12">
            <nav className="flex items-center gap-8">
              <Link to="/" className={`text-sm font-semibold drop-shadow transition-colors ${isActive('/') ? '' : 'text-white/85 hover:text-white'}`} style={isActive('/') ? { color: theme.accent } : undefined}>Home</Link>
              <Link to="/routes" className={`text-sm font-semibold drop-shadow transition-colors ${isActive('/routes') ? '' : 'text-white/85 hover:text-white'}`} style={isActive('/routes') ? { color: theme.accent } : undefined}>Routes</Link>
              <Link to="/gallery" className={`text-sm font-semibold drop-shadow transition-colors ${isActive('/gallery') ? '' : 'text-white/85 hover:text-white'}`} style={isActive('/gallery') ? { color: theme.accent } : undefined}>Gallery</Link>
              <Link to="/shop" className={`text-sm font-semibold drop-shadow transition-colors ${isActive('/shop') ? '' : 'text-white/85 hover:text-white'}`} style={isActive('/shop') ? { color: theme.accent } : undefined}>Shop</Link>
              <Link to="/admin" className={`text-sm font-semibold drop-shadow transition-colors ${isActive('/admin') ? '' : 'text-white/85 hover:text-white'}`} style={isActive('/admin') ? { color: theme.accent } : undefined}>Admin</Link>
            </nav>
            <a
              href="/#booking-form"
              className="flex min-w-[160px] items-center justify-center rounded-lg h-10 px-5 text-white text-sm font-bold shadow-lg hover:brightness-110 transition-all"
              style={{ backgroundColor: theme.accent }}
            >
              Reservation Form
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden mt-1 ml-auto text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="material-symbols-outlined cursor-pointer">menu</span>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
           <div className="md:hidden absolute top-full left-0 w-full bg-[#101a22]/90 backdrop-blur-sm p-4 flex flex-col gap-4 shadow-xl">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/') ? '' : 'text-white/85'}`} style={isActive('/') ? { color: theme.accent } : undefined}>Home</Link>
              <Link to="/routes" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/routes') ? '' : 'text-white/85'}`} style={isActive('/routes') ? { color: theme.accent } : undefined}>Routes</Link>
              <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/gallery') ? '' : 'text-white/85'}`} style={isActive('/gallery') ? { color: theme.accent } : undefined}>Gallery</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/shop') ? '' : 'text-white/85'}`} style={isActive('/shop') ? { color: theme.accent } : undefined}>Shop</Link>
               <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={`text-sm font-medium ${isActive('/admin') ? '' : 'text-white/85'}`} style={isActive('/admin') ? { color: theme.accent } : undefined}>Admin</Link>
           </div>
        )}
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
                <img src={MEDIA_ASSETS.logo} alt="Get Your Extreme logo" className="size-7 rounded object-cover ring-1 ring-white/15" />
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
