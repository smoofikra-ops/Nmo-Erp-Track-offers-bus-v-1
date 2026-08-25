import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Truck,
  TrendingUp,
  Package,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react';
import { settingsService } from '@/services/settingsService';

// Operational capability modules matching exact NMO ERP features
const SYSTEM_CAPABILITIES = [
  {
    id: 'commissions',
    title: 'العمولات والتحصيل المالي',
    shortDesc: 'متابعة المستحقات، شرائح العمولات، ومطابقة مبالغ التسليم والدفع الإلكتروني.',
    icon: TrendingUp,
    badge: 'تتبع العمليات المالية',
    color: 'from-emerald-500 to-teal-600',
    lightColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    metric: 'دقة حسابات 100%'
  },
  {
    id: 'fleet',
    title: 'إدارة الأسطول والمركبات',
    shortDesc: 'مراقبة جاهزية الشاحنات، تواريخ انتهاء رخص السير والفحص الدوري والتأمين.',
    icon: Truck,
    badge: 'جاهزية الأسطول',
    color: 'from-blue-500 to-indigo-600',
    lightColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    metric: 'تنبيهات استباقية للوثائق'
  },
  {
    id: 'inventory_quotes',
    title: 'المخزون وعروض الأسعار',
    shortDesc: 'إدارة كتالوج المنتجات، الكميات المتوفرة، وتوليد عروض أسعار تجارية فورية.',
    icon: Package,
    badge: 'المخزون والمنتجات',
    color: 'from-amber-500 to-orange-600',
    lightColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    metric: 'تحديث فوري للكميات'
  },
  {
    id: 'regin_ai',
    title: 'مساعد ريجين والتقارير الذكية',
    shortDesc: 'الاستعلام باللغة الطبيعية عن أداء العمليات واستخراج مؤشرات قياسية موحدة.',
    icon: Bot,
    badge: 'مساعد ذكي مدعوم بـ AI',
    color: 'from-purple-500 to-indigo-600',
    lightColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    metric: 'استعلام مباشر وسريع'
  }
];

// Typewriter practical operational phrases
const TYPEWRITER_PHRASES = [
  'تابع العمليات اليومية واتخذ القرار من بيانات موحدة',
  'راجع العمولات وسجل العمليات المالية بدقة',
  'راقب حالة الأسطول وصلاحية الوثائق والتنبيهات',
  'أدر المنتجات والكميات المتاحة وعروض الأسعار',
  'استخرج تقارير الأداء التشغيلي والمالي الموحد',
  'اسأل مساعد ريجين الذكي عن بياناتك باللغة الطبيعية'
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Mouse Parallax coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Typewriter state
  const [typewriterText, setTypewriterText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Load custom logo if configured in system settings
  useEffect(() => {
    settingsService.getSettings().then((res) => {
      if (res.success && res.data?.settings?.LogoURL) {
        setLogoUrl(res.data.settings.LogoURL);
      }
    }).catch(() => {});

    // Check reduced motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  // Natural Typewriter Effect Loop
  useEffect(() => {
    if (prefersReducedMotion) {
      setTypewriterText(TYPEWRITER_PHRASES[0]);
      return;
    }

    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing forward
      if (typewriterText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setTypewriterText(currentPhrase.slice(0, typewriterText.length + 1));
        }, 55 + Math.random() * 25);
      } else {
        // Pause at completion
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2400);
      }
    } else {
      // Deleting backward
      if (typewriterText.length > 0) {
        timer = setTimeout(() => {
          setTypewriterText(currentPhrase.slice(0, typewriterText.length - 1));
        }, 28);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, phraseIndex, prefersReducedMotion]);

  // Feature carousel rotation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % SYSTEM_CAPABILITIES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mouse move handler for delicate desktop parallax (clamped 2px - 12px)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const normX = (clientX / innerWidth - 0.5) * 2; // -1 to 1
    const normY = (clientY / innerHeight - 0.5) * 2; // -1 to 1
    setMousePos({ x: normX, y: normY });
  };

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

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div
      dir="rtl"
      id="nmo-login-root"
      onMouseMove={handleMouseMove}
      className="min-h-screen relative overflow-hidden flex flex-col justify-between bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white"
    >
      {/* Dynamic Background Mesh & Ambient Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
            backgroundSize: '36px 36px',
            transform: `translate3d(${mousePos.x * -4}px, ${mousePos.y * -4}px, 0)`
          }}
        />

        {/* Ambient Light Orbs with subtle parallax */}
        <div
          className="absolute -top-[15%] right-[-10%] w-[55vw] h-[55vw] max-w-[680px] max-h-[680px] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/10 blur-[130px] transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`
          }}
        />
        <div
          className="absolute -bottom-[20%] left-[-10%] w-[60vw] h-[60vw] max-w-[720px] max-h-[720px] rounded-full bg-gradient-to-tr from-blue-700/15 via-indigo-600/10 to-transparent blur-[140px] transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * -10}px, ${mousePos.y * -10}px, 0)`
          }}
        />
        <div
          className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* ============================================================ */}
          {/* القسم الأول: بطاقة تسجيل الدخول (Right/Primary Form in RTL) */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto order-1 lg:order-1">
            <div
              id="login-card-container"
              className="relative bg-slate-900/75 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-black/50 transition-all duration-300 hover:border-slate-700/80"
              style={{
                boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.5), 0 0 30px 0 rgba(79, 70, 229, 0.08)'
              }}
            >
              {/* Subtle top card glow line */}
              <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

              {/* Header inside Login Card */}
              <div className="text-center sm:text-start mb-7">
                <div className="flex items-center justify-center sm:justify-start gap-3.5 mb-5">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="NMO Labs Logo"
                      className="h-10 w-auto max-w-[120px] object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
                      <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
                        <Layers className="w-6 h-6 text-indigo-300" />
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-white tracking-tight">NMO ERP</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        إصدار المؤسسات
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">نظام نمو لإدارة العمليات والتوزيع</p>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                  مرحبًا بعودتك
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  سجّل الدخول للوصول إلى لوحة التحكم وإدارة العمليات
                </p>
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
                      className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
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

              {/* Quick Fill Demo Helper (Discreet & Practical) */}
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <p className="text-[11px] font-medium text-slate-400 mb-2.5 text-center sm:text-start">
                  حسابات الوصول السريع التجريبية:
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin@erp.com', 'admin')}
                    className="px-2 py-1.5 rounded-xl bg-slate-800/60 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-700/50 text-[11px] text-slate-300 hover:text-white transition-all text-center"
                  >
                    مدير النظام
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('rep@erp.com', 'rep')}
                    className="px-2 py-1.5 rounded-xl bg-slate-800/60 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-700/50 text-[11px] text-slate-300 hover:text-white transition-all text-center"
                  >
                    مندوب مبيعات
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('acc@erp.com', 'acc')}
                    className="px-2 py-1.5 rounded-xl bg-slate-800/60 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-700/50 text-[11px] text-slate-300 hover:text-white transition-all text-center"
                  >
                    محاسب مالي
                  </button>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>اتصال مشفر وآمن عبر شبكة NMO Cloud</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* القسم الثاني: القيمة التشغيلية للنظام (Left in RTL desktop) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:space-y-8 order-2 lg:order-2">

            {/* Main Headline & Typewriter */}
            <div className="space-y-4 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-indigo-300 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>منصة إدارة العمليات والتوزيع المتكاملة</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2]">
                إدارة تشغيلية أوضح، <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-purple-300">
                  من شاشة موحدة
                </span>
              </h2>

              {/* Typewriter Banner */}
              <div className="h-16 flex items-center justify-center lg:justify-start">
                <div
                  id="typewriter-box"
                  className="px-4 py-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2 text-sm sm:text-base text-slate-300 font-medium shadow-inner min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-white font-semibold">{typewriterText}</span>
                  {!prefersReducedMotion && (
                    <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Feature Cards Showcase (Operational modules) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {SYSTEM_CAPABILITIES.map((cap, idx) => {
                const IconComponent = cap.icon;
                const isActive = activeCardIndex === idx;

                return (
                  <div
                    key={cap.id}
                    onClick={() => setActiveCardIndex(idx)}
                    className={`group relative p-4.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                      isActive
                        ? `${cap.bgColor} ${cap.borderColor} shadow-lg shadow-black/40 scale-[1.02]`
                        : 'bg-slate-900/40 border-slate-800/70 hover:bg-slate-900/70 hover:border-slate-700/80'
                    }`}
                  >
                    {/* Active Card Indicator bar */}
                    {isActive && (
                      <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${cap.color}`} />
                    )}

                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-950/60 border border-slate-800 ${cap.lightColor} group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800/80 text-slate-400">
                        {cap.metric}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors mb-1">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cap.shortDesc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Floating Live Telemetry Ribbon (Parallax effect) */}
            <div
              className="hidden lg:flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md transition-transform duration-500 ease-out text-xs text-slate-300"
              style={{
                transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>العمولات والتحصيلات مربوطة بالعمليات الفعلية</span>
              </div>
              <div className="h-3 w-px bg-slate-800" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>سجلات الأسطول والوثائق محدثة آنياً</span>
              </div>
              <div className="h-3 w-px bg-slate-800" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>مساعد ريجين جاهز للاستعلامات</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* أسفل الصفحة: الروابط والحقوق (RTL Footer) */}
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
