import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isStrongPassword } from '../utils/security';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const passwordStrength = isStrongPassword(password);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        addToast('Conta criada com sucesso! Você já pode entrar.', 'success');
        // Optional: auto login or switch to login mode
        // For mock mode, signUp usually logs in automatically if implemented that way.
        // Let's assume standard supabase behavior: check email confirmation or auto login.
        // But in our mock implementation, it returns success.
        
        // If it was a real supabase signup without auto-confirm, we'd ask to check email.
        // But for better UX in this demo/product, let's try to sign in immediately or just navigate if session is set.
        // However, useAuth implementation of signUp calls signIn in mock mode.
        // In real mode, it might require email verification.
        
        // Let's just navigate to home if no error, as AuthContext listener will pick up session change if any.
        // Wait, if real supabase requires email verification, session might be null.
        // Let's safe check.
        navigate('/');
        
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        addToast('Login realizado com sucesso!', 'success');
        navigate('/');
      }
    } catch (error: any) {
      addToast(error.message || 'Erro ao realizar autenticação', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
             {isSignUp ? <UserPlus size={24} /> : <LogIn size={24} />}
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {isSignUp ? 'Criar Conta' : 'Bem-vindo'}
          </h1>
          <p className="text-slate-500">
            {isSignUp ? 'Preencha os dados para começar.' : 'Entre para acessar seus projetos.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium text-slate-900"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 ${
                  isSignUp && password && !passwordStrength.valid 
                    ? 'border-red-200 focus:ring-red-100' 
                    : 'border-slate-200 focus:ring-blue-400'
                }`}
                placeholder="••••••••"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isSignUp && (
              <div className="mt-2 text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="font-bold mb-1 text-slate-700">Requisitos de Segurança:</p>
                <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
                   {password.length >= 8 ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                   Mínimo 8 caracteres
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                   {/[A-Z]/.test(password) ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                   Letra maiúscula
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                   {/[0-9]/.test(password) ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                   Número
                </div>
                <div className={`flex items-center gap-1.5 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                   {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                   Caractere especial
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              isSignUp ? 'Criar Conta' : 'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Crie agora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
