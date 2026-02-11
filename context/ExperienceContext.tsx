import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  EXPERIENCE_THEMES,
  ExperienceCategory,
  ExperienceTheme
} from '../data/experienceThemes';

type ExperienceContextValue = {
  activeCategory: ExperienceCategory;
  setActiveCategory: (value: ExperienceCategory) => void;
  activeDate: string;
  setActiveDate: (value: string) => void;
  theme: ExperienceTheme;
};

const getTodayISODate = () => {
  const today = new Date();
  const offsetMs = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offsetMs).toISOString().split('T')[0];
};

const ExperienceContext = createContext<ExperienceContextValue | undefined>(undefined);

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>('SUP');
  const [activeDate, setActiveDate] = useState(getTodayISODate());

  const value = useMemo(
    () => ({
      activeCategory,
      setActiveCategory,
      activeDate,
      setActiveDate,
      theme: EXPERIENCE_THEMES[activeCategory]
    }),
    [activeCategory, activeDate]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
};

export const useExperience = () => {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used inside ExperienceProvider.');
  }
  return context;
};
