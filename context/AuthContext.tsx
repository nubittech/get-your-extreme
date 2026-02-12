import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  ensureProfileRow,
  readUserProfile,
  signInWithEmail,
  signOutCurrentUser,
  signUpWithEmail,
  UserProfile
} from '../services/auth';
import { isSupabaseConfigured, requireSupabase } from '../services/supabase';

export type AuthModalMode = 'signin' | 'signup';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');
  const PROFILE_CACHE_KEY = 'gye_profile_cache_v1';

  const clearSupabaseLocalCache = () => {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => localStorage.removeItem(key));
  };

  const readCachedProfile = (userId: string): UserProfile | null => {
    try {
      const raw = localStorage.getItem(PROFILE_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Record<string, UserProfile>;
      return parsed[userId] ?? null;
    } catch {
      return null;
    }
  };

  const writeCachedProfile = (userId: string, value: UserProfile) => {
    try {
      const raw = localStorage.getItem(PROFILE_CACHE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, UserProfile>) : {};
      parsed[userId] = value;
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(parsed));
    } catch {
      // Ignore cache write failures.
    }
  };

  const clearCachedProfile = (userId?: string) => {
    try {
      if (!userId) {
        localStorage.removeItem(PROFILE_CACHE_KEY);
        return;
      }
      const raw = localStorage.getItem(PROFILE_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, UserProfile>;
      delete parsed[userId];
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(parsed));
    } catch {
      // Ignore cache clear failures.
    }
  };

  const loadProfile = async (authUser: User) => {
    const cached = readCachedProfile(authUser.id);
    if (cached) {
      setProfile(cached);
    }

    try {
      await ensureProfileRow(authUser.id, {
        fullName: String(authUser.user_metadata?.full_name ?? '')
      });
    } catch (error) {
      console.warn('Profile ensure warning:', error);
    }
    const nextProfile = await readUserProfile(authUser.id);
    let finalProfile: UserProfile | null = null;
    setProfile((current) => {
      const mergedProfile = {
        fullName: nextProfile.fullName ?? current?.fullName ?? null,
        phone: nextProfile.phone ?? current?.phone ?? null,
        refCode: nextProfile.refCode ?? current?.refCode ?? null,
        role: nextProfile.role ?? current?.role ?? null
      };
      finalProfile = mergedProfile;
      return mergedProfile;
    });
    if (finalProfile) {
      writeCachedProfile(authUser.id, finalProfile);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      setAuthLoading(false);
      return;
    }

    const supabase = requireSupabase();
    let isMounted = true;

    const restoreSession = async () => {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        if (isMounted) {
          clearSupabaseLocalCache();
          setUser(null);
          setProfile(null);
          setAuthLoading(false);
        }
        return;
      }

      if (!isMounted) return;

      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        try {
          await loadProfile(sessionUser);
        } catch {
          const cached = readCachedProfile(sessionUser.id);
          if (cached) {
            setProfile(cached);
          }
        }
      } else {
        setProfile(null);
      }
      setAuthLoading(false);
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        try {
          await loadProfile(sessionUser);
        } catch {
          const cached = readCachedProfile(sessionUser.id);
          if (cached) {
            setProfile(cached);
          }
        }
      } else {
        setProfile(null);
      }
    });

    const handleWindowFocus = async () => {
      const { data } = await supabase.auth.getSession();
      const focusedUser = data.session?.user ?? null;
      if (!focusedUser) {
        setUser(null);
        setProfile(null);
        return;
      }
      setUser(focusedUser);
      try {
        await loadProfile(focusedUser);
      } catch {
        const cached = readCachedProfile(focusedUser.id);
        if (cached) {
          setProfile(cached);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void handleWindowFocus();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const openAuthModal = (mode: AuthModalMode = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);

  const signIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
    setAuthModalOpen(false);
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    await signUpWithEmail({ email, password, fullName, phone });
    setAuthModalMode('signin');
    setAuthModalOpen(true);
  };

  const signOut = async () => {
    const activeUserId = user?.id;
    try {
      await signOutCurrentUser();
    } catch (error) {
      console.warn('Sign out warning:', error);
    } finally {
      clearSupabaseLocalCache();
      clearCachedProfile(activeUserId);
      setUser(null);
      setProfile(null);
      setAuthModalOpen(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      authLoading,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      signIn,
      signUp,
      signOut
    }),
    [user, profile, authLoading, authModalOpen, authModalMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
};
