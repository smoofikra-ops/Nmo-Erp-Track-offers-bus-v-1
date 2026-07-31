import React from 'react';
import { AppSettings } from '@/services/settingsService';

interface Props {
  settings: AppSettings;
  onChange: (key: keyof AppSettings, value: any) => void;
}

export function PrintingTab({ settings, onChange }: Props) {
  const toggleSetting = (key: keyof AppSettings) => {
    onChange(key, settings[key] === 'true' ? 'false' : 'true');
  };

  const isChecked = (key: keyof AppSettings) => settings[key] === 'true';

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900">إعدادات الطباعة</h3>
        <p className="mt-1 text-sm text-slate-500">تحكم في البيانات والصور التي تظهر على الفواتير، عروض الأسعار، وسندات العمولات.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-base font-medium text-slate-900 border-b pb-2">إظهار/إخفاء البيانات</h4>
          
          <div className="space-y-3">
            {[
              { key: 'ShowLogoOnPrint', label: 'إظهار شعار الشركة' },
              { key: 'ShowVATOnPrint', label: 'إظهار الرقم الضريبي' },
              { key: 'ShowCROnPrint', label: 'إظهار السجل التجاري' },
              { key: 'ShowAddressOnPrint', label: 'إظهار العنوان' },
              { key: 'ShowPhoneOnPrint', label: 'إظهار الهاتف' },
              { key: 'ShowEmailOnPrint', label: 'إظهار البريد الإلكتروني' },
              { key: 'ShowWebsiteOnPrint', label: 'إظهار الموقع الإلكتروني' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked(key as keyof AppSettings)}
                  onChange={() => toggleSetting(key as keyof AppSettings)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-base font-medium text-slate-900 border-b pb-2">الأختام والتواقيع</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">رابط صورة الختم (Stamp)</label>
            <input
              type="text"
              value={settings.StampImageURL || ''}
              onChange={(e) => onChange('StampImageURL', e.target.value)}
              placeholder="https://example.com/stamp.png"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">رابط صورة التوقيع (Signature)</label>
            <input
              type="text"
              value={settings.SignatureImageURL || ''}
              onChange={(e) => onChange('SignatureImageURL', e.target.value)}
              placeholder="https://example.com/signature.png"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left"
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
