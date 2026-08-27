import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Spatial3DCanvas } from '@/components/auth/Spatial3DCanvas';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const logoUrl = settings?.LogoURL || '';

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.message?.includes('Invalid credentials')
          ? 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.'
          : err.message || 'تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      id="nmo-login-root"
      className="min-h-screen relative overflow-hidden flex flex-col justify-between bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white"
    >
      {/* Ambient Dark Spatial Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Atmospheric Deep Glow Spheres */}
        <div className="absolute -top-[10%] right-[-5%] w-[50vw] h-[50vw] max-w-[620px] max-h-[620px] rounded-full bg-gradient-to-br from-indigo-700/15 via-purple-700/10 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-[15%] left-[-5%] w-[55vw] h-[55vw] max-w-[680px] max-h-[680px] rounded-full bg-gradient-to-tr from-blue-700/15 via-indigo-600/10 to-transparent blur-[150px] pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ============================================================ */}
          {/* بطاقة تسجيل الدخول (Right/Primary Form in RTL)                */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto order-1 lg:order-1">
            <div
              id="login-card-container"
              className="relative bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-black/60 transition-all duration-300 hover:border-slate-700/90"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px 0 rgba(99, 102, 241, 0.08)'
              }}
            >
              {/* Top Accent Glow Line */}
              <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

              {/* Header inside Login Card: Product Identity ONLY */}
              <div className="text-center mb-7">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="NMO Labs Logo"
                      className="h-10 w-auto max-w-[120px] object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
                      <div className="w-full h-full bg-slate-950/50 rounded-[14px] flex items-center justify-center">
                        <Layers className="w-6 h-6 text-indigo-300" />
                      </div>
                    </div>
                  )}
                </div>

                <h1 className="text-lg sm:text-xl font-black text-white tracking-wide font-mono">
                  NMO LABS ERP — REGINE
                </h1>
              </div>

              {/* Error Message Box */}
              {error && (
                <div
                  id="login-error-alert"
                  role="alert"
                  className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-sm leading-snug animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-300 mr-1"
                  >
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      required
                      dir="ltr"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@erp.com"
                      className="w-full h-13 bg-slate-950/60 border border-slate-700/80 rounded-2xl pr-11 pl-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mr-1">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      كلمة المرور
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-13 bg-slate-950/60 border border-slate-700/80 rounded-2xl pr-11 pl-11 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 transition-all font-sans"
                    />
                    <button
                      type="button"
                      tabIndex={0}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="login-submit-button"
                  disabled={loading}
                  className="w-full h-13 mt-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري التحقق والدخول...</span>
                    </>
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Indicator */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>اتصال مشفر وآمن عبر شبكة NMO Cloud</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* الفضاء البصري ثلاثي الأبعاد + هوية NMO LABS                   */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-2 space-y-6">

            {/* Premium NMO LABS Brand Header */}
            <div className="text-center lg:text-start select-none">
              <div className="inline-block relative">
                {/* Subtle Ambient Glow Behind Typography */}
                <div className="absolute -inset-x-6 -inset-y-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-2xl pointer-events-none" />

                {/* Primary Brand Title */}
                <h2 className="relative text-4xl sm:text-5xl lg:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)] font-mono">
                  NMO LABS
                </h2>

                {/* Secondary Line */}
                <div className="relative flex items-center justify-center lg:justify-start gap-3 mt-1.5">
                  <div className="h-px w-6 bg-indigo-500/40" />
                  <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-indigo-300/90 font-mono">
                    Tech & Marketing
                  </span>
                  <div className="h-px w-6 bg-purple-500/40" />
                </div>
              </div>
            </div>

            {/* Pure 3D Spatial Interactive Composition */}
            <div className="relative w-full">
              <Spatial3DCanvas />
            </div>

          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* أسفل الصفحة: الروابط والحقوق (RTL Footer)                     */}
      {/* ============================================================ */}
      <footer className="relative z-10 border-t border-slate-900/80 bg-slate-950/80 backdrop-blur-md py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              سياسة الخصوصية
            </Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              شروط الاستخدام
            </Link>
            <a href="mailto:support@nmolabs.com" className="hover:text-slate-300 transition-colors">
              الدعم الفني
            </a>
          </div>
          <div className="text-center sm:text-end text-slate-500">
            جميع الحقوق محفوظة © {new Date().getFullYear()} NMO Labs Flow — نظام نمو ERP
          </div>
        </div>
      </footer>
    </div>
  );
}
