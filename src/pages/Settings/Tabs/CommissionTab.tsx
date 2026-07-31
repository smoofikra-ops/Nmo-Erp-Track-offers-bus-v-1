import React, { useState } from 'react';
import { AppSettings } from '@/services/settingsService';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onChange: (key: keyof AppSettings, value: any) => void;
}

export function CommissionTab({ settings, onChange }: Props) {
  const [platforms, setPlatforms] = useState<string[]>(() => {
    try {
      return settings.Platforms ? JSON.parse(settings.Platforms) : ['منصة زد'];
    } catch {
      return ['منصة زد'];
    }
  });
  const [newPlatform, setNewPlatform] = useState('');

  const handleAddPlatform = () => {
    if (newPlatform.trim() && !platforms.includes(newPlatform.trim())) {
      const updated = [...platforms, newPlatform.trim()];
      setPlatforms(updated);
      onChange('Platforms', JSON.stringify(updated));
      setNewPlatform('');
    }
  };

  const handleRemovePlatform = (platform: string) => {
    const updated = platforms.filter((p) => p !== platform);
    setPlatforms(updated);
    onChange('Platforms', JSON.stringify(updated));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900">إعدادات العمولات</h3>
        <p className="mt-1 text-sm text-slate-500">إعداد العمولات الافتراضية والمنصات وأنواع الخصومات.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">العمولة الافتراضية للمنتجات (نسبة %)</label>
            <input
              type="number"
              value={settings.DefaultProductCommission || '5'}
              onChange={(e) => onChange('DefaultProductCommission', e.target.value)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">العمولة الافتراضية للطلبات (مبلغ ثابت)</label>
            <input
              type="number"
              value={settings.DefaultOrderCommission || '3'}
              onChange={(e) => onChange('DefaultOrderCommission', e.target.value)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">المنصات المدعومة</label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                placeholder="أضف منصة جديدة..."
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlatform()}
              />
              <Button type="button" onClick={handleAddPlatform} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <span className="text-sm text-slate-700 font-medium">{platform}</span>
                  <button
                    onClick={() => handleRemovePlatform(platform)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {platforms.length === 0 && <span className="text-sm text-slate-500">لا توجد منصات مضافة.</span>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">أنواع الخصومات (مفصولة بفاصلة)</label>
            <textarea
              value={settings.DiscountTypes || 'خصم رسوم شحن, خصم تأخير, خصم منتج تالف'}
              onChange={(e) => onChange('DiscountTypes', e.target.value)}
              rows={3}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">أكواد الخصم الثابتة (مفصولة بفاصلة)</label>
            <textarea
              value={settings.FixedDiscountCodes || 'DISC10, NEWYEAR2026, SUMMER'}
              onChange={(e) => onChange('FixedDiscountCodes', e.target.value)}
              rows={3}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
