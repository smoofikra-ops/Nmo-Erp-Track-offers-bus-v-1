import React from 'react';
import { AppSettings } from '@/services/settingsService';

interface Props {
  settings: AppSettings;
  onChange: (key: keyof AppSettings, value: any) => void;
}

export function CompanyInfoTab({ settings, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900">معلومات المؤسسة</h3>
        <p className="mt-1 text-sm text-slate-500">البيانات الأساسية للشركة والتي ستظهر في النظام.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">اسم المؤسسة (عربي)</label>
          <input
            type="text"
            value={settings.CompanyNameAr || ''}
            onChange={(e) => onChange('CompanyNameAr', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">اسم المؤسسة (إنجليزي)</label>
          <input
            type="text"
            value={settings.CompanyNameEn || ''}
            onChange={(e) => onChange('CompanyNameEn', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">اسم النشاط التجاري</label>
          <input
            type="text"
            value={settings.BusinessActivity || ''}
            onChange={(e) => onChange('BusinessActivity', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">رقم السجل التجاري</label>
          <input
            type="text"
            value={settings.CommercialRegistration || ''}
            onChange={(e) => onChange('CommercialRegistration', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">الرقم الضريبي</label>
          <input
            type="text"
            value={settings.VATNumber || ''}
            onChange={(e) => onChange('VATNumber', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">الهاتف</label>
          <input
            type="text"
            value={settings.Phone || ''}
            onChange={(e) => onChange('Phone', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">الجوال</label>
          <input
            type="text"
            value={settings.Mobile || ''}
            onChange={(e) => onChange('Mobile', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
          <input
            type="email"
            value={settings.Email || ''}
            onChange={(e) => onChange('Email', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">الموقع الإلكتروني</label>
          <input
            type="text"
            value={settings.Website || ''}
            onChange={(e) => onChange('Website', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">العنوان الكامل</label>
        <textarea
          value={settings.Address || ''}
          onChange={(e) => onChange('Address', e.target.value)}
          rows={3}
          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">المدينة</label>
          <input
            type="text"
            value={settings.City || ''}
            onChange={(e) => onChange('City', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">الدولة</label>
          <input
            type="text"
            value={settings.Country || ''}
            onChange={(e) => onChange('Country', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">الرمز البريدي</label>
          <input
            type="text"
            value={settings.PostalCode || ''}
            onChange={(e) => onChange('PostalCode', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
