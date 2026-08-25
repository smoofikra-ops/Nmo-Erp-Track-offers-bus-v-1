import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function TermsOfService() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-xl backdrop-blur-xl">
        <Link to="/login" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium mb-8 gap-2">
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى صفحة تسجيل الدخول</span>
        </Link>
        <h1 className="text-3xl font-bold text-white mb-6">شروط وأحكام الاستخدام</h1>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-4 leading-relaxed">
          <p className="text-sm text-slate-400">آخر تحديث: أغسطس 2026</p>
          <p>
            مرحبًا بك في نظام NMO ERP (نظام نمو لإدارة العمليات والتوزيع). باستخدامك لهذا النظام المؤسسي، فإنك توافق على الالتزام بهذه الشروط والضوابط.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. ترخيص الاستخدام</h2>
          <p>
            يُمنح المستخدم ترخيصاً محدوداً وغير حصري وقابل للإلغاء للوصول إلى خدمات النظام واستخدامها وفقًا للصلاحيات الممنوحة من إدارة المؤسسة.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. مسؤوليات المستخدم وحماية الحساب</h2>
          <p>
            المستخدم مسؤول بشكل كامل عن الحفاظ على سرية بيانات تسجيل الدخول وكلمة المرور الخاصة به، وعدم مشاركتها مع أي أطراف غير مصرح لها.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. التعديلات والتحديثات</h2>
          <p>
            تحتفظ إدارة النظام بالحق في تحديث وتطوير الميزات والسياسات لضمان أعلى مستويات الأمان والكفاءة التشغيلية.
          </p>
        </div>
      </div>
    </div>
  );
}
