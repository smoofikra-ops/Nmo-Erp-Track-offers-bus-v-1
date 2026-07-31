import React from 'react';
import { Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackupTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900">النسخ الاحتياطي</h3>
        <p className="mt-1 text-sm text-slate-500">حماية بياناتك من خلال إنشاء نسخ احتياطية واستعادتها عند الحاجة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Download className="h-6 w-6 text-indigo-600" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-2">تصدير البيانات (Export)</h4>
          <p className="text-sm text-slate-500 mb-6">
            تحميل نسخة كاملة من قاعدة البيانات الحالية بصيغة JSON أو Excel للاحتفاظ بها كنسخة احتياطية.
          </p>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            إنشاء وتحميل النسخة
          </Button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-emerald-600" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-2">استيراد البيانات (Import)</h4>
          <p className="text-sm text-slate-500 mb-6">
            استعادة النظام من ملف نسخة احتياطية سابق. سيتم استبدال البيانات الحالية بالكامل.
          </p>
          <Button variant="outline" className="w-full text-emerald-700 border-emerald-300 hover:bg-emerald-50">
            رفع ملف الاستعادة
          </Button>
        </div>
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 items-start">
        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
        <div>
          <h5 className="font-bold text-amber-900">ملاحظة هامة</h5>
          <p className="text-sm text-amber-700 mt-1">
            عملية الاستعادة (Import) لا يمكن التراجع عنها. تأكد دائماً من أخذ نسخة احتياطية جديدة قبل استعادة أي نسخة قديمة.
          </p>
        </div>
      </div>
    </div>
  );
}
