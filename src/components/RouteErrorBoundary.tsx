import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, ArrowRight, Flag } from 'lucide-react';
import { Button } from './ui/button';

export function RouteErrorBoundary() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  console.error("Router error:", error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">حدث خطأ غير متوقع</h1>
        <p className="text-sm text-slate-500 mb-8">
          نعتذر، واجه النظام مشكلة غير متوقعة. يرجى المحاولة مرة أخرى أو الإبلاغ عن المشكلة إذا استمرت.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="w-full"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للصفحة السابقة
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => alert('تم تسجيل المشكلة. شكراً لك!')} 
            className="w-full text-slate-500 hover:text-slate-700"
          >
            <Flag className="w-4 h-4 ml-2" />
            الإبلاغ عن المشكلة
          </Button>
        </div>
      </div>
    </div>
  );
}
