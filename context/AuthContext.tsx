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

  const loadProfile = async (authUser: User) => {
    await ensureProfileRow(authUser.id, {
      fullName: String(authUser.user_metadata?.full_name ?? '')
    });
    const nextProfile = await readUserProfile(authUser.id);
    setProfile(nextProfile);
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
          setProfile(null);
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
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
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
    await signOutCurrentUser();
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
