import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type UserRole = 'customer' | 'walker' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  profileMissing: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'customer' | 'walker') => Promise<{ needsEmailConfirm: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  repairProfile: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);

  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); // maybeSingle returns null instead of error when no row found

      if (error) {
        console.error('[Auth] fetchUserRole error:', error.message);
        setProfileMissing(true);
        setUserRole(null);
        return null;
      }

      if (!data) {
        // Row genuinely missing — trigger may not have fired yet or was skipped
        setProfileMissing(true);
        setUserRole(null);
        return null;
      }

      const role = data.role as UserRole;
      setUserRole(role);
      setProfileMissing(false);
      return role;
    } catch (err) {
      console.error('[Auth] fetchUserRole exception:', err);
      setUserRole(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Small delay on SIGNED_IN to allow trigger to complete
        const delay = event === 'SIGNED_IN' ? 500 : 0;
        setTimeout(async () => {
          if (mounted) {
            await fetchUserRole(session.user.id);
            setLoading(false);
          }
        }, delay);
      } else {
        setUserRole(null);
        setProfileMissing(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserRole]);

  /**
   * Sign up a new user.
   * - Only calls supabase.auth.signUp with metadata.
   * - The database trigger handle_new_auth_user() creates the public.users row automatically.
   * - Returns { needsEmailConfirm: true } if the project requires email confirmation.
   */
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'customer' | 'walker'
  ): Promise<{ needsEmailConfirm: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) throw error;

    // If session is null but user exists, email confirmation is required
    const needsEmailConfirm = !!data.user && !data.session;

    // If we have an immediate session (email confirm disabled), create walker profile
    if (data.user && data.session && role === 'walker') {
      // Wait a moment for the trigger to create the public.users row
      await new Promise(r => setTimeout(r, 600));
      const { error: walkerError } = await supabase.from('walker_profiles').insert([
        { user_id: data.user.id, bio: '', skills: [], certifications: [] },
      ]);
      if (walkerError) {
        console.warn('[Auth] Walker profile creation failed (non-fatal):', walkerError.message);
      }
    }

    return { needsEmailConfirm };
  };

  /**
   * Sign in with email and password.
   * Role is fetched automatically by onAuthStateChange.
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUserRole(null);
    setProfileMissing(false);
  };

  /**
   * Repair a missing public.users profile row.
   * Only called when the user is authenticated but profileMissing is true.
   */
  const repairProfile = async (): Promise<void> => {
    if (!user) throw new Error('No authenticated user');

    const fullName = user.user_metadata?.full_name || '';
    const role = (user.user_metadata?.role as UserRole) || 'customer';

    // Upsert to avoid duplicate key errors
    const { error } = await supabase.from('users').upsert(
      [{ id: user.id, email: user.email, full_name: fullName, role }],
      { onConflict: 'id' }
    );

    if (error) throw error;

    if (role === 'walker') {
      await supabase.from('walker_profiles').upsert(
        [{ user_id: user.id, bio: '', skills: [], certifications: [] }],
        { onConflict: 'user_id' }
      );
    }

    await fetchUserRole(user.id);
  };

  const refreshRole = async (): Promise<void> => {
    if (user) await fetchUserRole(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, userRole, profileMissing, signUp, signIn, signOut, repairProfile, refreshRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  return context;
}
