export type ExperienceCategory = 'SUP' | 'BIKE' | 'SKI';

export type ExperienceTheme = {
  key: ExperienceCategory;
  label: string;
  accent: string;
  accentSoft: string;
  headerGradient: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  activities: string[];
  routes: string[];
  galleryHeadline: string;
  shopHeadline: string;
};

export const EXPERIENCE_THEMES: Record<ExperienceCategory, ExperienceTheme> = {
  SUP: {
    key: 'SUP',
    label: 'SUP',
    accent: '#1183d4',
    accentSoft: '#d7ecfb',
    headerGradient: 'linear-gradient(90deg, #0f2230 0%, #0c1b27 100%)',
    heroImage:
      'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=2010&auto=format&fit=crop',
    heroTitle: "Experience the Thrill of Antalya's Waters",
    heroSubtitle:
      'Premium stand up paddle sessions for groups, private classes, and coastal route explorers.',
    activities: ['Stand Up Paddle (SUP)', 'SUP Yoga', 'Sunrise Paddle', 'Group SUP Session'],
    routes: ['Antalya Cliffs', 'Blue Caves Tour', 'Suluada Island', 'River Expedition'],
    galleryHeadline: 'SUP moments from groups, sunrise sessions and coast routes.',
    shopHeadline: 'SUP gear catalog for rental and sales inquiries.'
  },
  BIKE: {
    key: 'BIKE',
    label: 'Bisiklet',
    accent: '#d97706',
    accentSoft: '#fff0d9',
    headerGradient: 'linear-gradient(90deg, #2c1c06 0%, #1f1404 100%)',
    heroImage:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop',
    heroTitle: 'Ride Antalya with Guided Bike Programs',
    heroSubtitle:
      'City, forest and coastal bike experiences designed for visitors, companies and active groups.',
    activities: ['City Bike Tour', 'Forest MTB Session', 'Road Bike Group Ride', 'Sunset Bike Route'],
    routes: ['Old Town Loop', 'Lara Coastal Ride', 'Forest Trail', 'Mountain View Route'],
    galleryHeadline: 'Bike tours, city rides and forest route highlights.',
    shopHeadline: 'Bike equipment and accessories for guided tours.'
  },
  SKI: {
    key: 'SKI',
    label: 'Kayak',
    accent: '#0ea5a4',
    accentSoft: '#daf6f4',
    headerGradient: 'linear-gradient(90deg, #052628 0%, #041d1f 100%)',
    heroImage:
      'https://images.unsplash.com/photo-1488441770602-aed21fc49bd5?q=80&w=1974&auto=format&fit=crop',
    heroTitle: 'Ski Programs and Winter Group Planning',
    heroSubtitle:
      'From beginner sessions to advanced runs, plan your next ski day with transport and guide support.',
    activities: ['Beginner Ski Session', 'Family Ski Day', 'Advanced Slope Program', 'Snowboard Starter'],
    routes: ['Saklikent Easy Line', 'Summit Mid Route', 'Alpine Advanced Zone', 'Private Ski Track'],
    galleryHeadline: 'Ski days, slope coaching and winter team events.',
    shopHeadline: 'Ski and winter gear catalog for seasonal planning.'
  }
};

export const EXPERIENCE_ORDER: ExperienceCategory[] = ['SUP', 'BIKE', 'SKI'];
