import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ComingSoon() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

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
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {isRTL ? <ArrowRight className="ml-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
        {t('common.backToHome')}
      </Link>
    </div>
  );
}
