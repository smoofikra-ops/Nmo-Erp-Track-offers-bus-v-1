import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

export function Breadcrumb() {
  const { t } = useTranslation();
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  if (paths.length === 0) {
    return null;
  }

  return (
    <nav className="flex text-sm font-medium text-slate-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link to="/" className="hover:text-slate-900 transition-colors">
            {t('common.dashboard')}
          </Link>
        </li>
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const href = `/${paths.slice(0, index + 1).join('/')}`;
          
          return (
            <li key={path} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              {isLast ? (
                <span className="text-slate-900 capitalize">
                  {t(`modules.${path}`, { defaultValue: path })}
                </span>
              ) : (
                <Link to={href} className="hover:text-slate-900 transition-colors capitalize">
                  {t(`modules.${path}`, { defaultValue: path })}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
