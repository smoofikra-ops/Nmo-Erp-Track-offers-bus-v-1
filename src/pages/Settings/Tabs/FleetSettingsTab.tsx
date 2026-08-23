import React from 'react';
import { AppSettings } from '@/services/settingsService';
import { Truck, Fuel, Wrench, Shield, Bell, AlertTriangle } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onChange: (key: keyof AppSettings, value: any) => void;
}

export function FleetSettingsTab({ settings, onChange }: Props) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-indigo-600" />
          إعدادات إدارة المركبات والأسطول
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          تخصيص تسعير الوقود الافتراضي، معايير مؤشر الجاهزية، ومواعيد تنبيهات الصيانة والتراخيص.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fuel Prices Defaults */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-500" />
            أسعار الوقود الافتراضية (ر.س / لتر)
          </h4>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                بنزين 91
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue={2.18}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                بنزين 95
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue={2.33}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ديزل
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue={1.15}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Readiness Index Rules */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            معايير احتساب مؤشر الجاهزية
          </h4>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-700 dark:text-slate-300">خصم انتهاء التأمين</span>
              <strong className="text-rose-600 font-mono">-25 نقطة</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-700 dark:text-slate-300">خصم انتهاء الفحص الدوري</span>
              <strong className="text-rose-600 font-mono">-20 نقطة</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-700 dark:text-slate-300">خصم تجاوز موعد الصيانة الدورية</span>
              <strong className="text-rose-600 font-mono">-15 نقطة</strong>
            </div>
          </div>
        </div>

        {/* Notification Thresholds */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            فترات التنبيه المبكر
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                تنبيه انتهاء التأمين قبل (أيام)
              </label>
              <input
                type="number"
                defaultValue={30}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                تنبيه انتهاء الفحص قبل (أيام)
              </label>
              <input
                type="number"
                defaultValue={15}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Intervals */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-500" />
            الفترات القياسية للصيانة الدورية
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                تغيير الزيت والفلتر كل (كم)
              </label>
              <input
                type="number"
                defaultValue={5000}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                الصيانة الشاملة كل (كم)
              </label>
              <input
                type="number"
                defaultValue={10000}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
