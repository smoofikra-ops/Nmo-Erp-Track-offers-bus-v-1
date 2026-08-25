import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-xl backdrop-blur-xl">
        <Link to="/login" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium mb-8 gap-2">
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى صفحة تسجيل الدخول</span>
        </Link>
        <h1 className="text-3xl font-bold text-white mb-6">سياسة الخصوصية وأمان البيانات</h1>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-4 leading-relaxed">
          <p className="text-sm text-slate-400">آخر تحديث: أغسطس 2026</p>
          <p>
            في NMO Labs، نولي خصوصية وأمان البيانات التشغيلية والمؤسسية أقصى درجات الأهمية. توضح هذه السياسة كيفية التعامل مع البيانات وحمايتها داخل نظام NMO ERP.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. البيانات التي تتم معالجتها</h2>
          <p>
            يقوم النظام بمعالجة البيانات التشغيلية التي يدخلها المستخدمون، مثل بيانات الموظفين، سجلات المركبات، حركات المخزون، وعمليات العمولات والتحصيلات.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. أمان وسرية المعلومات</h2>
          <p>
            تُطبق أعلى معايير التشفير والبروتوكولات الأمنية لحماية البيانات المخزنة والمنقولة ضد أي وصول غير مصرح به.
          </p>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. الامتثال والتحكم في الوصول</h2>
          <p>
            يتم ضبط صلاحيات الوصول بناءً على الأدوار الوظيفية المحددة لكل مستخدم في الهيكل الإداري للشركة.
          </p>
        </div>
      </div>
    </div>
  );
}
