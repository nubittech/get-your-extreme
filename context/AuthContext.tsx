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
    const mergedProfile: UserProfile = {
      fullName: nextProfile.fullName ?? cached?.fullName ?? null,
      phone: nextProfile.phone ?? cached?.phone ?? null,
      refCode: nextProfile.refCode ?? cached?.refCode ?? null,
      role: nextProfile.role ?? cached?.role ?? null
    };
    setProfile(mergedProfile);
    writeCachedProfile(authUser.id, mergedProfile);
  };

  const resolveSessionUser = async () => {
    const supabase = requireSupabase();

    let sessionResult = await supabase.auth.getSession();
    if (sessionResult.error) {
      console.warn('getSession warning:', sessionResult.error.message);
      await new Promise((resolve) => setTimeout(resolve, 150));
      sessionResult = await supabase.auth.getSession();
    }

    let sessionUser = sessionResult.data.session?.user ?? null;

    if (!sessionUser) {
      const refreshResult = await supabase.auth.refreshSession();
      if (!refreshResult.error) {
        sessionUser = refreshResult.data.session?.user ?? null;
      }
    }

    return sessionUser;
  };

  const readStoredAuthUser = (): User | null => {
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('sb-') || !key.endsWith('-auth-token')) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const possibleUser =
          (parsed.user as User | undefined) ??
          ((parsed.currentSession as Record<string, unknown> | undefined)?.user as User | undefined);
        if (possibleUser?.id) {
          return possibleUser;
        }
      }
      return null;
    } catch {
      return null;
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
      if (!isMounted) return;

      const storedUser = readStoredAuthUser();
      if (storedUser) {
        setUser((current) => current ?? storedUser);
      }

      const sessionUser = await resolveSessionUser();
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

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sessionUser = session?.user ?? null;
      if (sessionUser) {
        setUser(sessionUser);
        try {
          await loadProfile(sessionUser);
        } catch {
          const cached = readCachedProfile(sessionUser.id);
          if (cached) {
            setProfile(cached);
          }
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        const confirmedUser = await resolveSessionUser();
        if (confirmedUser) {
          setUser(confirmedUser);
          try {
            await loadProfile(confirmedUser);
          } catch {
            const cached = readCachedProfile(confirmedUser.id);
            if (cached) {
              setProfile(cached);
            }
          }
          return;
        }
        clearSupabaseLocalCache();
        setUser(null);
        setProfile(null);
        return;
      }

      // Guard against transient null-session events during token refresh.
      const { data: refreshedSession } = await supabase.auth.getSession();
      const refreshedUser = refreshedSession.session?.user ?? null;
      if (refreshedUser) {
        setUser(refreshedUser);
        try {
          await loadProfile(refreshedUser);
        } catch {
          const cached = readCachedProfile(refreshedUser.id);
          if (cached) {
            setProfile(cached);
          }
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    const handleWindowFocus = async () => {
      const focusedUser = await resolveSessionUser();
      if (!focusedUser) {
        // Keep current state unless sign-out is explicit.
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
      window.location.replace('/');
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
