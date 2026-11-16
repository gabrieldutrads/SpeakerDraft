import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

/* ==========================================================================
   Auth Types
   ========================================================================== */

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
  isAuthenticated: boolean;
}

/* ==========================================================================
   Auth Context
   ========================================================================== */

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/* ==========================================================================
   Auth Provider
   ========================================================================== */

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        if (initialSession?.user) {
          const { data: { user: userData } } = await supabase.auth.getUser();
          if (userData) {
            setUser(mapSupabaseUser(userData));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const { data: { user: userData } } = await supabase.auth.getUser();
        if (userData) {
          setUser(mapSupabaseUser(userData));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const mapSupabaseUser = (supabaseUser: User): AuthUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at || supabaseUser.created_at,
    };
  };

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; avatar_url?: string }) => {
    const { error } = await supabase.auth.updateUser({
      data,
    });
    if (!error && user) {
      setUser({ ...user, ...data });
    }
    return { error: error ? new Error(error.message) : null };
  }, [user]);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ==========================================================================
   Demo Auth Provider (for local development without Supabase)
   ========================================================================== */

const DEMO_USER: AuthUser = {
  id: 'demo-user-1',
  email: 'demo@speakerdraft.com',
  name: 'Demo User',
  avatar_url: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_SESSION: Session = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: DEMO_USER.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: DEMO_USER.email,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { name: DEMO_USER.name },
    identities: [],
    created_at: DEMO_USER.created_at,
    updated_at: DEMO_USER.updated_at,
  },
};

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-login demo user on mount
  useEffect(() => {
    const stored = localStorage.getItem('demo_auth');
    if (stored) {
      try {
        const { user: storedUser, session: storedSession } = JSON.parse(stored);
        setUser(storedUser);
        setSession(storedSession);
      } catch {
        // Invalid stored data
      }
    }
    setLoading(false);
  }, []);

  const persistAuth = (newUser: AuthUser | null, newSession: Session | null) => {
    if (newUser && newSession) {
      localStorage.setItem('demo_auth', JSON.stringify({ user: newUser, session: newSession }));
    } else {
      localStorage.removeItem('demo_auth');
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    // Demo: accept any email/password
    if (email && password.length >= 6) {
      const newUser = { ...DEMO_USER, email, name: email.split('@')[0] };
      const newSession = { ...DEMO_SESSION, user: { ...DEMO_SESSION.user, email } };
      setUser(newUser);
      setSession(newSession);
      persistAuth(newUser, newSession);
      setLoading(false);
      return { error: null };
    }
    setLoading(false);
    return { error: new Error('Invalid credentials') };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    if (email && password.length >= 6) {
      const newUser = { ...DEMO_USER, id: `user-${Date.now()}`, email, name: name || email.split('@')[0] };
      const newSession = { ...DEMO_SESSION, user: { ...DEMO_SESSION.user, id: newUser.id, email, user_metadata: { name: newUser.name } } };
      setUser(newUser);
      setSession(newSession);
      persistAuth(newUser, newSession);
      setLoading(false);
      return { error: null };
    }
    setLoading(false);
    return { error: new Error('Invalid data') };
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setSession(null);
    persistAuth(null, null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // Demo: always succeed
    return { error: null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    return { error: null };
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; avatar_url?: string }) => {
    if (user) {
      const newUser = { ...user, ...data };
      setUser(newUser);
      if (session) {
        const newSession = { ...session, user: { ...session.user, user_metadata: { ...session.user.user_metadata, ...data } } };
        setSession(newSession);
        persistAuth(newUser, newSession);
      }
    }
    return { error: null };
  }, [user, session]);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ==========================================================================
   Protected Route Wrapper
   ========================================================================== */

import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner-lg" aria-hidden="true" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner-lg" aria-hidden="true" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}