import React, { useState } from 'react';
import { createReservation } from '../services/reservations';

const getTodayISODate = () => {
  const today = new Date();
  const offsetMs = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offsetMs).toISOString().split('T')[0];
};

const isValidPhoneNumber = (value: string) => /^[+]?[\d\s()-]{7,20}$/.test(value.trim());

const Home: React.FC = () => {
  const minDate = getTodayISODate();

  // Form State
  const [formData, setFormData] = useState({
    activity: '',
    route: '',
    date: '',
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();

    if(!formData.activity || !formData.route || !formData.date || !trimmedName || !trimmedPhone) {
      alert("Please fill in all fields to check availability.");
      return;
    }

    if (formData.date < minDate) {
      alert("Please choose today or a future date.");
      return;
    }

    if (!isValidPhoneNumber(trimmedPhone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReservation({
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        activity: formData.activity,
        route: formData.route,
        date: formData.date
      });

      alert("Request Sent! Check the Admin Panel to see your reservation.");

      setFormData({
        activity: '',
        route: '',
        date: '',
        name: '',
        phone: ''
      });
    } catch {
      alert('Something went wrong while sending your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Hero Section with Integrated Booking Form */}
      <div className="relative min-h-[850px] w-full flex flex-col items-center justify-center bg-[#101a22] overflow-hidden">
        {/* Background Image - Using img tag for reliability */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=2010&auto=format&fit=crop" 
            alt="Crystal clear turquoise waters of Antalya" 
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#101a22]/40 via-[#101a22]/20 to-[#101a22]/70"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[1200px] px-6 py-12 flex flex-col items-center text-center">
          <h1 className="text-white text-5xl md:text-7xl font-black leading-tight tracking-[-0.033em] mb-6 drop-shadow-2xl">
            Experience the Thrill of <br/><span className="text-[#1183d4] drop-shadow-md">Antalya's Waters</span>
          </h1>
          <p className="text-white text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-12 drop-shadow-lg text-shadow-sm">
            Premium SUP, Scuba Diving, and sea adventures tailored for the ultimate water sports enthusiast.
          </p>
          
          {/* Booking Widget */}
          <div id="booking-form" className="bg-[#101a22]/80 backdrop-blur-md border border-white/10 w-full max-w-5xl rounded-2xl p-6 md:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              
              {/* Row 1: Activity */}
              <div className="flex flex-col text-left">
                <label className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2 px-1">Activity Type</label>
                <div className="relative">
                  <select 
                    name="activity"
                    value={formData.activity}
                    onChange={handleChange}
                    className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#1183d4] focus:ring-0 h-14 px-4 text-base appearance-none"
                  >
                    <option disabled value="">Select Activity</option>
                    <option value="Stand Up Paddle (SUP)">Stand Up Paddle (SUP)</option>
                    <option value="Scuba Diving">Scuba Diving</option>
                    <option value="Sea Kayaking">Sea Kayaking</option>
                    <option value="Boat Safari">Boat Safari</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-4 pointer-events-none text-white/50">keyboard_arrow_down</span>
                </div>
              </div>

              {/* Row 1: Route */}
              <div className="flex flex-col text-left">
                <label className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2 px-1">Route Selection</label>
                <div className="relative">
                  <select 
                    name="route"
                    value={formData.route}
                    onChange={handleChange}
                    className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#1183d4] focus:ring-0 h-14 px-4 text-base appearance-none"
                  >
                    <option disabled value="">Choose Route</option>
                    <option value="Antalya Cliffs">Antalya Cliffs</option>
                    <option value="Blue Caves Tour">Blue Caves Tour</option>
                    <option value="Suluada Island">Suluada Island</option>
                    <option value="Wreck Site Exploration">Wreck Site Exploration</option>
                    <option value="River Expedition">River Expedition</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-4 pointer-events-none text-white/50">location_on</span>
                </div>
              </div>

              {/* Row 1: Date */}
              <div className="flex flex-col text-left">
                <label className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2 px-1">Pick a Date</label>
                <div className="relative">
                  <input 
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={minDate}
                    className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#1183d4] focus:ring-0 h-14 px-4 text-base placeholder-gray-400" 
                    type="date" 
                  />
                </div>
              </div>

              {/* Row 2: Name */}
              <div className="flex flex-col text-left">
                <label className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2 px-1">Full Name</label>
                <div className="relative">
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#1183d4] focus:ring-0 h-14 px-4 text-base" 
                    type="text" 
                  />
                  <span className="material-symbols-outlined absolute right-3 top-4 pointer-events-none text-white/50">person</span>
                </div>
              </div>

              {/* Row 2: Phone */}
              <div className="flex flex-col text-left">
                <label className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2 px-1">Phone Number</label>
                <div className="relative">
                  <input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+90 555 000 0000"
                    className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#1183d4] focus:ring-0 h-14 px-4 text-base" 
                    type="tel" 
                  />
                  <span className="material-symbols-outlined absolute right-3 top-4 pointer-events-none text-white/50">call</span>
                </div>
              </div>

              {/* Row 2: Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1183d4] hover:bg-[#1183d4]/90 h-14 rounded-lg font-bold text-lg shadow-lg shadow-[#1183d4]/20 transition-all flex items-center justify-center gap-2 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">bolt</span>
                {isSubmitting ? 'Sending...' : 'Check Availability'}
              </button>

            </form>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/60 justify-center md:justify-start">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[#1183d4] text-sm">verified</span> Equipment Included</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[#1183d4] text-sm">verified</span> Certified Instructors</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[#1183d4] text-sm">verified</span> Insurance Coverage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-[#f6f7f8] dark:bg-[#101a22]">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="text-center mb-16">
            <h2 className="text-[#1183d4] font-bold tracking-widest text-sm uppercase mb-3">Premium Excellence</h2>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">Why Choose Our Adventures</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
          </div>
        </div>
      </section>

      {/* Experience Showcase - Updated with Lifestyle/Social images */}
      <section className="py-24 bg-white/5 dark:bg-white/5">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">Master the Mediterranean <br/><span className="text-[#1183d4]">With Professionals</span></h2>
              <p className="text-slate-600 dark:text-white/70 text-lg leading-relaxed">
                Founded by extreme sports enthusiasts, GET YOUR EXTREME isn't just a booking service; it's a gateway to the most exhilarating moments in Antalya. Whether you're gliding over the crystal waters on a SUP or exploring the depths of the Blue Caves, we ensure every second is pure adrenaline.
              </p>
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
