import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SystemHealth } from './Settings/SystemHealth';

export function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'health'>('general');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('common.settings')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage system preferences and configurations.
        </p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'general' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('settings.systemPreferences')}
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'health' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('settings.systemHealth')}
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.systemPreferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t('settings.companyName')}
                </label>
                <input 
                  type="text" 
                  defaultValue="مؤسسة المستهلك الأخير"
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t('settings.timezone')}
                </label>
                <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent">
                  <option value="Asia/Riyadh">Asia/Riyadh</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t('settings.currency')}
                </label>
                <select className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent">
                  <option value="SAR">SAR (Saudi Riyal)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
              <div className="pt-4">
                <Button>{t('settings.save')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'health' && <SystemHealth />}
    </div>
  );
}
