import React from 'react';
import { AppSettings } from '@/services/settingsService';

interface Props {
  settings: AppSettings;
  onChange: (key: keyof AppSettings, value: any) => void;
}

export function SystemTab({ settings, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900">إعدادات النظام</h3>
        <p className="mt-1 text-sm text-slate-500">التفضيلات الإقليمية وإعدادات النظام الأساسية.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">اللغة الافتراضية</label>
          <select
            value={settings.DefaultLanguage || 'ar'}
            onChange={(e) => onChange('DefaultLanguage', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ar">العربية (Arabic)</option>
            <option value="en">الإنجليزية (English)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">العملة</label>
          <select
            value={settings.Currency || 'SAR'}
            onChange={(e) => onChange('Currency', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="SAR">ريال سعودي (SAR)</option>
            <option value="USD">دولار أمريكي (USD)</option>
            <option value="AED">درهم إماراتي (AED)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">المنطقة الزمنية</label>
          <select
            value={settings.Timezone || 'Asia/Riyadh'}
            onChange={(e) => onChange('Timezone', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            dir="ltr"
          >
            <option value="Asia/Riyadh">Asia/Riyadh</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">تنسيق التاريخ</label>
          <select
            value={settings.DateFormat || 'YYYY-MM-DD'}
            onChange={(e) => onChange('DateFormat', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            dir="ltr"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">نسبة الضريبة الافتراضية (%)</label>
          <input
            type="number"
            value={settings.DefaultVATRate || '15'}
            onChange={(e) => onChange('DefaultVATRate', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">بداية السنة المالية</label>
          <select
            value={settings.FiscalYearStart || 'January'}
            onChange={(e) => onChange('FiscalYearStart', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="January">يناير</option>
            <option value="April">أبريل</option>
            <option value="July">يوليو</option>
            <option value="October">أكتوبر</option>
          </select>
        </div>
      </div>
    </div>
  );
}
