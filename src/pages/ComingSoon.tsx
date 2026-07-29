import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

export function ComingSoon() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-indigo-50 p-6">
        <Clock className="h-12 w-12 text-indigo-600" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
        {t('common.comingSoon')}
      </h2>
      <p className="mt-2 text-slate-500 max-w-sm">
        {t('modules.moduleUnavailable')}
      </p>
    </div>
  );
}
