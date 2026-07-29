import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Breadcrumb } from './Breadcrumb';
import { User, LogOut, Building, ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export function Header() {
  const { t } = useTranslation();
  const { user, logout, switchCompany } = useAuth();
  const { toggleDirection, direction } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <Breadcrumb />
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="sm" onClick={toggleDirection} title="Toggle Direction">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            {direction.toUpperCase()}
          </Button>

          <LanguageSwitcher />
          
          {user && user.companies.length > 1 && (
             <div className="flex items-center gap-2 border-r pr-4 rtl:border-l rtl:border-r-0 rtl:pl-4 rtl:pr-0 border-slate-200">
               <Building className="h-4 w-4 text-slate-500" />
               <select 
                 className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer"
                 value={user.currentCompanyId}
                 onChange={(e) => switchCompany(e.target.value)}
               >
                 {user.companies.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
             </div>
          )}

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />
          
          <div className="flex items-center gap-x-4">
            <div className="flex flex-col text-end hidden sm:flex">
              <span className="text-sm font-semibold leading-6 text-slate-900">{user?.name}</span>
              <span className="text-xs leading-4 text-slate-500">{user?.role}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
              <User className="h-5 w-5" />
            </div>
            <Button variant="ghost" size="icon" title={t('common.logout')} onClick={logout}>
              <LogOut className="h-5 w-5 text-slate-500" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
