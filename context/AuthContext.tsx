import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
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

const PROFILE_CACHE_KEY = 'gye_profile_cache_v1';

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

/** Fetch profile from Supabase, merge with cache, update state. */
const fetchAndApplyProfile = async (
  userId: string,
  cached: UserProfile | null,
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>
): Promise<UserProfile | null> => {
  try {
    const fresh = await readUserProfile(userId);
    const merged: UserProfile = {
      fullName: fresh.fullName ?? cached?.fullName ?? null,
      phone: fresh.phone ?? cached?.phone ?? null,
      refCode: fresh.refCode ?? cached?.refCode ?? null,
      role: fresh.role ?? cached?.role ?? null
    };
    setProfile(merged);
    writeCachedProfile(userId, merged);
    return merged;
  } catch (error) {
    console.warn('Profile fetch warning:', error);
    if (cached) {
      setProfile(cached);
      return cached;
    }
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');

  const signingOutRef = useRef(false);

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

      try {
        const sessionResult = await supabase.auth.getSession();
        let sessionUser = sessionResult.data.session?.user ?? null;

        if (!sessionUser) {
          const refreshResult = await supabase.auth.refreshSession();
          if (!refreshResult.error) {
            sessionUser = refreshResult.data.session?.user ?? null;
          }
        }

        if (!isMounted) return;

        if (sessionUser) {
          setUser(sessionUser);

          // Apply cache immediately.
          const cached = readCachedProfile(sessionUser.id);
          if (cached) setProfile(cached);

          // Fetch fresh profile with a timeout so we never hang forever.
          const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
          const profilePromise = fetchAndApplyProfile(sessionUser.id, cached, setProfile);
          await Promise.race([profilePromise, timeout]);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.warn('Session restore error:', error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      }

      if (isMounted) {
        setAuthLoading(false);
      }
    };

    restoreSession();

    // The listener only needs to handle two cases:
    // 1. Token refresh that provides a new user object → update user ref.
    // 2. SIGNED_OUT → clear state (only when not already signing out).
    // Profile loading is handled by signIn/restoreSession directly.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (signingOutRef.current) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        return;
      }

      // For TOKEN_REFRESHED and similar events, just update the user object.
      const sessionUser = session?.user ?? null;
      if (sessionUser) {
        setUser(sessionUser);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback((mode: AuthModalMode = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const signIn = useCallback(async (email: string, password: string) => {
    const authUser = await signInWithEmail(email, password);
    setUser(authUser);

    // Apply cache first for instant UI.
    const cached = readCachedProfile(authUser.id);
    if (cached) setProfile(cached);

    // Fetch fresh profile — await so role/refCode are ready before modal closes.
    await fetchAndApplyProfile(authUser.id, cached, setProfile);
    setAuthModalOpen(false);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    await signUpWithEmail({ email, password, fullName, phone });
    setAuthModalMode('signin');
    setAuthModalOpen(true);
  }, []);

  const signOut = useCallback(async () => {
    const activeUserId = user?.id;
    signingOutRef.current = true;

    setUser(null);
    setProfile(null);
    setAuthModalOpen(false);

    try {
      await signOutCurrentUser();
    } catch (error) {
      console.warn('Sign out warning:', error);
    }

    clearSupabaseLocalCache();
    clearCachedProfile(activeUserId);

    await new Promise((resolve) => setTimeout(resolve, 100));
    signingOutRef.current = false;

    window.location.replace('/');
  }, [user?.id]);

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
    [user, profile, authLoading, authModalOpen, authModalMode, openAuthModal, closeAuthModal, signIn, signUp, signOut]
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
