import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, shouldMock } from '../lib/supabase';
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
    if (shouldMock) {
      // Mock User initialization is handled in signIn for consistency, 
      // but if we want auto-login for demo, we can keep it here or just check localStorage
      // For now, let's allow "not logged in" state even in mock mode, 
      // but maybe pre-fill or allow easy login.
      // Actually, previous implementation forced login in mock mode immediately.
      // Let's check if we want that. 
      // The user wants a login page. So in mock mode, we should start unauthenticated 
      // and allow "login" with any credentials.
      
      // However, the previous code I saw setSession immediately in useEffect.
      // If I want a login page, I should NOT setSession immediately in mock mode 
      // UNLESS I want to bypass login.
      // User asked for "create login page". So they want to see it.
      // I will remove the auto-login in mock mode from useEffect, 
      // and instead let signIn handle it.
      
      // But wait, if I remove auto-login, the user might be confused if they were already "using" it.
      // The previous context showed the user was using "white screen" fix which enabled demo mode.
      // If I change it now, they will be logged out. That's fine.
      
      // Let's check localStorage for "mock-session" to persist login in mock mode?
      const stored = localStorage.getItem('mock-session');
      if (stored) {
         const mockSession = JSON.parse(stored);
         setSession(mockSession);
         setUser(mockSession.user);
      }
      setLoading(false);
      return;
    }

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

    if (shouldMock) {
      // 3. Find User (Mock)
      const storedUsers = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
      const userRecord = storedUsers[email];

      if (!userRecord) {
        // Delay to prevent timing attacks (simulated)
        await new Promise(r => setTimeout(r, 500)); 
        recordFailedAttempt(email);
        logSecurityEvent('LOGIN_FAIL', `User not found: ${email}`);
        return { error: { message: 'Credenciais inválidas.' } };
      }

      // 4. Verify Password (Mock)
      const inputHash = await hashPassword(password);
      if (inputHash !== userRecord.passwordHash) {
        await new Promise(r => setTimeout(r, 500));
        recordFailedAttempt(email);
        logSecurityEvent('LOGIN_FAIL', `Invalid password for: ${email}`);
        return { error: { message: 'Credenciais inválidas.' } };
      }

      // 5. Success (Mock)
      clearAttempts(email);
      logSecurityEvent('LOGIN_SUCCESS', `User logged in: ${email}`);

      const mockUser: User = {
        id: userRecord.id,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: userRecord.createdAt,
        email: email,
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString()
      };
      
      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      };

      setSession(mockSession);
      setUser(mockUser);
      localStorage.setItem('mock-session', JSON.stringify(mockSession));
      return { error: null };
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

    if (shouldMock) {
      // 2. Check Exists (Mock)
      const storedUsers = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
      if (storedUsers[email]) {
        return { error: { message: 'Este email já está cadastrado.' } };
      }

      // 3. Create User (Mock)
      const passwordHash = await hashPassword(password);
      const newUser = {
        id: crypto.randomUUID(),
        email,
        passwordHash,
        createdAt: new Date().toISOString()
      };

      storedUsers[email] = newUser;
      localStorage.setItem('mock_users_db', JSON.stringify(storedUsers));
      
      logSecurityEvent('SIGNUP', `New user registered: ${email}`);

      // Auto login
      return signIn(email, password);
    }

    // Real Supabase Auth
    return await supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    if (shouldMock) {
      setSession(null);
      setUser(null);
      localStorage.removeItem('mock-session');
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
