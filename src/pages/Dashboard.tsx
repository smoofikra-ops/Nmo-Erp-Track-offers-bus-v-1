import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Truck, 
  Users, 
  Package, 
  BarChart,
  ArrowRight,
  TrendingUp,
  Activity,
  DollarSign,
  Plus,
  FileText
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const modules = [
    {
      id: 'commission',
      title: t('modules.commission', 'Commissions'),
      icon: Calculator,
      path: '/commission',
      available: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'fleet',
      title: t('modules.fleet', 'Vehicles'),
      icon: Truck,
      path: '/fleet',
      available: false,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      id: 'hr',
      title: t('modules.hr', 'Human Resources'),
      icon: Users,
      path: '/hr',
      available: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 'inventory',
      title: t('modules.inventory', 'Inventory'),
      icon: Package,
      path: '/inventory',
      available: true,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      id: 'quotes',
      title: t('modules.quotesAndCosting', 'Quotes & Costing'),
      icon: FileText,
      path: '/quotes',
      available: true,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      id: 'reports',
      title: t('modules.reports', 'Reports'),
      icon: BarChart,
      path: '/reports',
      available: false,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  const quickActions = [
    { label: t('quotes.newQuote', 'New Quote'), icon: FileText, path: '/quotes?new=true' },
    { label: 'Add New Product', icon: Package, path: '/inventory' },
    { label: 'Create Commission', icon: Calculator, path: '/commission' },
    { label: 'View Employee List', icon: Users, path: '/hr' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('common.dashboard', 'Control Panel')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {user?.name}. Here's an overview of your operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 45,231.89</div>
            <p className="text-xs text-slate-500">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+150</div>
            <p className="text-xs text-slate-500">+4 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Paid</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 12,234</div>
            <p className="text-xs text-slate-500">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-slate-500">+201 since last week</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="h-14 justify-start px-4 flex gap-3 hover:bg-slate-50 hover:border-indigo-200 transition-colors"
              onClick={() => navigate(action.path)}
            >
              <div className="bg-indigo-50 p-2 rounded-md text-indigo-600">
                <action.icon className="h-4 w-4" />
              </div>
              <span className="font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">ERP Modules</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <Card 
              key={mod.id} 
              className={cn(
                "group relative overflow-hidden transition-all hover:shadow-md",
                mod.available ? "cursor-pointer" : "opacity-80"
              )}
              onClick={() => mod.available && navigate(mod.path)}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={cn("rounded-xl p-3", mod.bg, mod.color)}>
                  <mod.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{mod.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {mod.available ? (
                  <div className="flex items-center text-sm font-medium text-indigo-600 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Module <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {t('common.comingSoon', 'Coming Soon')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
