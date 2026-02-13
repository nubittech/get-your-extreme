import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');

  // Track whether a deliberate sign-out is in progress so the listener
  // does not accidentally restore the session during cleanup.
  const signingOutRef = useRef(false);

  // Track whether the initial session restore has finished so the
  // onAuthStateChange listener can skip the redundant INITIAL_SESSION event.
  const initialRestoreDoneRef = useRef(false);

  // Prevent concurrent loadProfile calls from racing each other.
  const profileLoadIdRef = useRef(0);

  const loadProfile = useCallback(async (authUser: User): Promise<UserProfile | null> => {
    const loadId = ++profileLoadIdRef.current;

    // Immediately apply cached profile so the UI is not blank.
    const cached = readCachedProfile(authUser.id);
    if (cached) {
      setProfile(cached);
    }

    // ensureProfileRow can overwrite existing data with empty values when
    // full_name comes from user_metadata that may be blank.  Only call it
    // when there is no existing profile row yet — readUserProfile will
    // tell us if the row exists.
    let freshProfile: UserProfile | null = null;

    try {
      freshProfile = await readUserProfile(authUser.id);
    } catch (error) {
      console.warn('Profile read warning:', error);
    }

    // If there is no profile row at all, create one.
    if (!freshProfile || (!freshProfile.refCode && !freshProfile.fullName)) {
      try {
        await ensureProfileRow(authUser.id, {
          fullName: String(authUser.user_metadata?.full_name ?? '')
        });
        // Re-read after creation.
        try {
          freshProfile = await readUserProfile(authUser.id);
        } catch {
          // keep whatever we had
        }
      } catch (error) {
        console.warn('Profile ensure warning:', error);
      }
    }

    // Bail out if a newer loadProfile call has started.
    if (loadId !== profileLoadIdRef.current) {
      return cached ?? freshProfile;
    }

    if (freshProfile) {
      const mergedProfile: UserProfile = {
        fullName: freshProfile.fullName ?? cached?.fullName ?? null,
        phone: freshProfile.phone ?? cached?.phone ?? null,
        refCode: freshProfile.refCode ?? cached?.refCode ?? null,
        role: freshProfile.role ?? cached?.role ?? null
      };
      setProfile(mergedProfile);
      writeCachedProfile(authUser.id, mergedProfile);
      return mergedProfile;
    }

    // Fall back to cached data so the UI stays usable.
    if (cached) {
      setProfile(cached);
      return cached;
    }
    return null;
  }, []);

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
        // 1. Attempt to get the current session.
        const sessionResult = await supabase.auth.getSession();
        let sessionUser = sessionResult.data.session?.user ?? null;

        // 2. If no session, try refreshing the token.
        if (!sessionUser) {
          const refreshResult = await supabase.auth.refreshSession();
          if (!refreshResult.error) {
            sessionUser = refreshResult.data.session?.user ?? null;
          }
        }

        if (!isMounted) return;

        if (sessionUser) {
          setUser(sessionUser);

          // Apply cached profile immediately so authLoading can clear
          // even if the network fetch hangs or is slow.
          const cached = readCachedProfile(sessionUser.id);
          if (cached) {
            setProfile(cached);
          }

          // Mark loading done BEFORE the async profile fetch so the UI
          // can render with cached data while the fresh fetch proceeds.
          initialRestoreDoneRef.current = true;
          setAuthLoading(false);

          // Fetch fresh profile in background — do not block loading.
          loadProfile(sessionUser).catch(() => {
            // loadProfile already handles its own errors and sets
            // profile from cache internally, so nothing extra needed.
          });
          return;
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
        initialRestoreDoneRef.current = true;
        setAuthLoading(false);
      }
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // During deliberate sign-out, ignore any events — signOut() handles
      // state cleanup itself.
      if (signingOutRef.current) return;

      const sessionUser = session?.user ?? null;

      // Skip the INITIAL_SESSION event if restoreSession already handled it.
      if (event === 'INITIAL_SESSION' && initialRestoreDoneRef.current) {
        return;
      }

      // If we have a valid session user, apply it.
      if (sessionUser) {
        setUser(sessionUser);
        try {
          await loadProfile(sessionUser);
        } catch {
          const cached = readCachedProfile(sessionUser.id);
          if (cached) setProfile(cached);
        }
        return;
      }

      // --- session is null from here ---

      if (event === 'SIGNED_OUT') {
        // Genuine sign-out: clear everything.
        setUser(null);
        setProfile(null);
        return;
      }

      // For non-SIGNED_OUT events with a null session (e.g. TOKEN_REFRESHED
      // failure, transient network blip), double-check before clearing state.
      try {
        const { data: refreshedSession } = await supabase.auth.getSession();
        const refreshedUser = refreshedSession.session?.user ?? null;
        if (!isMounted) return;

        if (refreshedUser) {
          setUser(refreshedUser);
          try {
            await loadProfile(refreshedUser);
          } catch {
            const cached = readCachedProfile(refreshedUser.id);
            if (cached) setProfile(cached);
          }
        }
        // If refreshedUser is null here, keep current state to avoid
        // flashing — the user might just have a transient network issue.
      } catch {
        // Network error during verification — keep current state.
      }
    });

    const handleWindowFocus = async () => {
      if (signingOutRef.current) return;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const focusedUser = sessionData.session?.user ?? null;
        if (!isMounted || !focusedUser) return;
        setUser(focusedUser);
        try {
          await loadProfile(focusedUser);
        } catch {
          const cached = readCachedProfile(focusedUser.id);
          if (cached) setProfile(cached);
        }
      } catch {
        // Ignore focus-restore failures.
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
  }, [loadProfile]);

  const openAuthModal = useCallback((mode: AuthModalMode = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const signIn = useCallback(async (email: string, password: string) => {
    const authUser = await signInWithEmail(email, password);
    setUser(authUser);
    // Immediately apply cached profile so there's no "No Ref" flash.
    const cached = readCachedProfile(authUser.id);
    if (cached) setProfile(cached);
    // Await full profile load so the UI has the real data (role, refCode)
    // before the modal closes and components re-render.
    await loadProfile(authUser);
    setAuthModalOpen(false);
  }, [loadProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    await signUpWithEmail({ email, password, fullName, phone });
    setAuthModalMode('signin');
    setAuthModalOpen(true);
  }, []);

  const signOut = useCallback(async () => {
    const activeUserId = user?.id;
    signingOutRef.current = true;

    // Clear state first so the UI updates immediately.
    setUser(null);
    setProfile(null);
    setAuthModalOpen(false);

    try {
      await signOutCurrentUser();
    } catch (error) {
      console.warn('Sign out warning:', error);
    }

    // Clean up all local data.
    clearSupabaseLocalCache();
    clearCachedProfile(activeUserId);

    // Small delay to ensure the listener has processed the SIGNED_OUT event
    // before we re-enable it, preventing it from restoring the session.
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
