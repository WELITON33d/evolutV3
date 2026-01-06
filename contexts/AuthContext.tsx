import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { 
  isValidEmail, 
  isStrongPassword, 
  hashPassword, 
  checkRateLimit, 
  recordFailedAttempt, 
  clearAttempts,
  logSecurityEvent
} from '../utils/security';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error('Error getting session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // 1. Rate Limiting (Global)
    const { allowed, waitTime } = checkRateLimit(email);
    if (!allowed) {
      logSecurityEvent('SUSPICIOUS', `Rate limit exceeded for ${email}`);
      return { error: { message: `Muitas tentativas. Tente novamente em ${waitTime} segundos.` } };
    }

    // 2. Validation (Global)
    if (!isValidEmail(email)) {
      return { error: { message: 'Formato de email inválido.' } };
    }

    // Real Supabase Auth
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        recordFailedAttempt(email);
        logSecurityEvent('LOGIN_FAIL', `Supabase login failed for: ${email}`);
        return { error };
      }
      clearAttempts(email);
      logSecurityEvent('LOGIN_SUCCESS', `User logged in (Supabase): ${email}`);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    // 1. Validation (Global)
    if (!isValidEmail(email)) {
      return { error: { message: 'Email inválido.' } };
    }
    
    const strength = isStrongPassword(password);
    if (!strength.valid) {
      return { error: { message: strength.message } };
    }

    // Real Supabase Auth
    return await supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
