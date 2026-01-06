
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) return { valid: false, message: 'Senha deve ter no mínimo 8 caracteres' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Senha deve conter pelo menos um número' };
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { valid: false, message: 'Senha deve conter pelo menos um caractere especial' };
  
  return { valid: true };
};

export const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

interface LoginAttempt {
  count: number;
  lastAttempt: number;
}

const ATTEMPT_LIMIT = 3;
const LOCKOUT_TIME = 60 * 1000; // 1 minute

export const checkRateLimit = (email: string): { allowed: boolean; waitTime?: number } => {
  const attemptsStr = localStorage.getItem(`auth_attempts_${email}`);
  if (!attemptsStr) return { allowed: true };

  const attempts: LoginAttempt = JSON.parse(attemptsStr);
  const now = Date.now();

  if (attempts.count >= ATTEMPT_LIMIT) {
    const timePassed = now - attempts.lastAttempt;
    if (timePassed < LOCKOUT_TIME) {
      return { 
        allowed: false, 
        waitTime: Math.ceil((LOCKOUT_TIME - timePassed) / 1000) 
      };
    }
    // Reset after lockout
    localStorage.removeItem(`auth_attempts_${email}`);
    return { allowed: true };
  }

  return { allowed: true };
};

export const recordFailedAttempt = (email: string) => {
  const key = `auth_attempts_${email}`;
  const attemptsStr = localStorage.getItem(key);
  const now = Date.now();
  
  let attempts: LoginAttempt = attemptsStr 
    ? JSON.parse(attemptsStr) 
    : { count: 0, lastAttempt: now };

  attempts.count += 1;
  attempts.lastAttempt = now;
  
  localStorage.setItem(key, JSON.stringify(attempts));
};

export const clearAttempts = (email: string) => {
  localStorage.removeItem(`auth_attempts_${email}`);
};

export const logSecurityEvent = (type: 'LOGIN_SUCCESS' | 'LOGIN_FAIL' | 'SIGNUP' | 'SUSPICIOUS', details: string) => {
  const log = {
    timestamp: new Date().toISOString(),
    type,
    details,
    userAgent: navigator.userAgent
  };
  
  // In a real app, send to backend. Here we store locally for audit.
  const logs = JSON.parse(localStorage.getItem('security_audit_logs') || '[]');
  logs.push(log);
  localStorage.setItem('security_audit_logs', JSON.stringify(logs));
  
  console.warn(`[SECURITY AUDIT] ${type}: ${details}`);
};
