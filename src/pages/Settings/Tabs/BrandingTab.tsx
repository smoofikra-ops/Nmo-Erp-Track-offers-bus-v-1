import React from 'react';
import { AppSettings } from '@/services/settingsService';

interface Props {
  settings: AppSettings;
  onChange: (key: keyof AppSettings, value: any) => void;
}

export function BrandingTab({ settings, onChange }: Props) {
  // A helper function to render a color picker
  const renderColorPicker = (label: string, key: keyof AppSettings) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-300">
          <input
            type="color"
            value={settings[key] || '#ffffff'}
            onChange={(e) => onChange(key, e.target.value)}
            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={settings[key] || ''}
          onChange={(e) => onChange(key, e.target.value)}
          className="block w-32 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-left"
          dir="ltr"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900">الهوية البصرية</h3>
        <p className="mt-1 text-sm text-slate-500">تخصيص الألوان والشعارات لتتناسب مع هوية شركتك (White Labeling).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="text-base font-medium text-slate-900 border-b pb-2">الألوان</h4>
          {renderColorPicker('اللون الرئيسي (Primary)', 'PrimaryColor')}
          {renderColorPicker('اللون الثانوي (Secondary)', 'SecondaryColor')}
          {renderColorPicker('لون الأزرار', 'ButtonColor')}
          {renderColorPicker('لون التحذيرات', 'WarningColor')}
          {renderColorPicker('لون النجاح', 'SuccessColor')}
        </div>

        <div className="space-y-6">
          <h4 className="text-base font-medium text-slate-900 border-b pb-2">الصور والشعارات</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">رابط الشعار (Logo)</label>
            <input
              type="text"
              value={settings.LogoURL || ''}
              onChange={(e) => onChange('LogoURL', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left"
              dir="ltr"
            />
            {settings.LogoURL && (
              <div className="mt-2 p-4 bg-slate-50 border rounded-md flex items-center justify-center h-24">
                <img src={settings.LogoURL} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">أيقونة النظام (Favicon)</label>
            <input
              type="text"
              value={settings.FaviconURL || ''}
              onChange={(e) => onChange('FaviconURL', e.target.value)}
              placeholder="https://example.com/favicon.ico"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">صورة تسجيل الدخول</label>
            <input
              type="text"
              value={settings.LoginImageURL || ''}
              onChange={(e) => onChange('LoginImageURL', e.target.value)}
              placeholder="https://example.com/login-bg.jpg"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left"
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
