import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-900 font-sans">
      {/* Background Animated Gradient & Blur Shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-600/30 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[70%] rounded-full bg-blue-600/20 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Branding */}
        <div className="flex-1 text-center lg:text-start lg:pe-8">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Layers className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              NmoLabs <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Flow</span>
            </h1>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-medium text-slate-300 mb-4 tracking-wide">
            Enterprise Resource Planning
          </h2>
          <p className="text-lg text-slate-400 font-light max-w-xl mx-auto lg:mx-0">
            Everything Your Business Needs
          </p>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 sm:p-10 rounded-3xl shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
              <p className="text-slate-400 text-sm">Please sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full h-12 bg-slate-900/50 border border-slate-700 rounded-xl px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="admin@erp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  className="w-full h-12 bg-slate-900/50 border border-slate-700 rounded-xl px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                />
              </div>
              
              <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-base mt-4">
                Sign In
              </Button>
            </form>
          </div>
        </div>

      </div>

      {/* Footer Links */}
      <div className="absolute bottom-0 inset-x-0 pb-6 pt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 z-10 bg-gradient-to-t from-slate-950/80 to-transparent">
        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        <a href="mailto:support@nmolabs.com" className="hover:text-white transition-colors">Support</a>
      </div>
    </div>
  );
}
