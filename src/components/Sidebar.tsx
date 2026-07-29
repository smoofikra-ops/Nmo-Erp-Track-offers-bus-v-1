import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Calculator, 
  Truck, 
  Users, 
  Package, 
  BarChart, 
  Settings,
  FileText
} from 'lucide-react';
import { cn } from '@/utils/cn';

export function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('common.dashboard') },
    { to: '/commission', icon: Calculator, label: t('modules.commission') },
    { to: '/fleet', icon: Truck, label: t('modules.fleet') },
    { to: '/hr', icon: Users, label: t('employees.list', 'Employees') },
    { to: '/inventory', icon: Package, label: t('modules.inventory') },
    { to: '/quotes', icon: FileText, label: t('modules.quotes', 'Price Quotes') },
    { to: '/reports', icon: BarChart, label: t('modules.reports') },
  ];

  return (
    <aside className="fixed inset-y-0 start-0 z-50 flex w-72 flex-col border-e bg-white shadow-sm">
      <div className="flex h-16 items-center border-b px-6 flex-col justify-center items-start">
        <h1 className="text-xl font-bold text-indigo-900 tracking-tight">{t('common.appName', 'Nomu ERP')}</h1>
        <span className="text-[10px] text-slate-500">{t('common.poweredBy', 'Powered by NmoLabs')}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )
          }
        >
          <Settings className="h-5 w-5 shrink-0" />
          {t('common.settings')}
        </NavLink>
      </div>
    </aside>
  );
}
