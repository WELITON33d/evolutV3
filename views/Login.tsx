import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isStrongPassword } from '../utils/security';
import { PulseBeamsLogo } from '../components/ui/PulseBeamsLogo';

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
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side: Animated Hero (Pulse Beams) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-50">
           {/* Optional: additional background effects if needed */}
        </div>
        <div className="w-full h-full relative z-10">
           <PulseBeamsLogo />
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
        <div className="bg-white p-8 lg:p-12 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md animate-fade-in relative z-20">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 text-white transform rotate-3">
               {isSignUp ? <UserPlus size={28} /> : <LogIn size={28} />}
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
              {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
            </h1>
            <p className="text-slate-500 font-medium">
              {isSignUp ? 'Comece a construir seu império hoje.' : 'Acesse seu painel de controle.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Email Corporativo
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-900 placeholder:text-slate-300"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-semibold text-slate-900 placeholder:text-slate-300 ${
                    isSignUp && password && !passwordStrength.valid 
                      ? 'border-red-200 focus:ring-red-100 focus:border-red-400' 
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  placeholder="••••••••"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {isSignUp && (
                <div className="mt-3 text-xs text-slate-500 space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <p className="font-bold mb-2 text-slate-700">Segurança da Senha:</p>
                  <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                     {password.length >= 8 ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />}
                     Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                     {/[A-Z]/.test(password) ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />}
                     Letra maiúscula
                  </div>
                  <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                     {/[0-9]/.test(password) ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />}
                     Número
                  </div>
                  <div className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                     {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />}
                     Caractere especial
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isSignUp ? 'CRIAR CONTA GRATUITAMENTE' : 'ACESSAR MINHA CONTA'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-wider transition-colors hover:underline underline-offset-4"
            >
              {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Crie agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
