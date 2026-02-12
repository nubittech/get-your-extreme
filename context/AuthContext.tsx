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

  const loadProfile = async (authUser: User) => {
    try {
      await ensureProfileRow(authUser.id, {
        fullName: String(authUser.user_metadata?.full_name ?? '')
      });
    } catch (error) {
      console.warn('Profile ensure warning:', error);
    }
    const nextProfile = await readUserProfile(authUser.id);
    setProfile((current) => ({
      fullName: nextProfile.fullName ?? current?.fullName ?? null,
      phone: nextProfile.phone ?? current?.phone ?? null,
      refCode: nextProfile.refCode ?? current?.refCode ?? null,
      role: nextProfile.role ?? current?.role ?? null
    }));
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
          // Keep previous profile state for transient auth/profile fetch glitches.
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
          // Keep previous profile state for transient auth/profile fetch glitches.
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
        // Keep previous profile state
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
    try {
      await signOutCurrentUser();
    } catch (error) {
      console.warn('Sign out warning:', error);
    } finally {
      clearSupabaseLocalCache();
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
