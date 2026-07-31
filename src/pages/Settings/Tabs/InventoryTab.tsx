import React from 'react';
import { AppSettings } from '@/services/settingsService';

interface Props {
  settings: AppSettings;
  onChange: (key: keyof AppSettings, value: any) => void;
}

export function InventoryTab({ settings, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900">إعدادات المخزون</h3>
        <p className="mt-1 text-sm text-slate-500">إدارة وحدات القياس وتنبيهات المخزون وطرق الاحتساب.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">وحدات القياس (مفصولة بفاصلة)</label>
          <input
            type="text"
            value={settings.MeasurementUnits || 'حبة, كرتون, كيلو, جرام, لتر'}
            onChange={(e) => onChange('MeasurementUnits', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">التصنيفات الافتراضية</label>
          <input
            type="text"
            value={settings.Categories || ''}
            onChange={(e) => onChange('Categories', e.target.value)}
            placeholder="إلكترونيات, ملابس, أطعمة"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">الحد الأدنى للمخزون (افتراضي)</label>
          <input
            type="number"
            value={settings.MinStockAlert || '10'}
            onChange={(e) => onChange('MinStockAlert', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">طريقة احتساب الربح</label>
          <select
            value={settings.ProfitCalculationMethod || 'FIFO'}
            onChange={(e) => onChange('ProfitCalculationMethod', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            dir="ltr"
          >
            <option value="FIFO">First In First Out (FIFO)</option>
            <option value="LIFO">Last In First Out (LIFO)</option>
            <option value="AVERAGE">Average Cost</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">طريقة احتساب الضريبة</label>
          <select
            value={settings.TaxCalculationMethod || 'EXCLUSIVE'}
            onChange={(e) => onChange('TaxCalculationMethod', e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="EXCLUSIVE">السعر لا يشمل الضريبة (تضاف لاحقاً)</option>
            <option value="INCLUSIVE">السعر يشمل الضريبة</option>
          </select>
        </div>
      </div>
    </div>
  );
}
