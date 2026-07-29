import { useAuth } from "@/contexts/AuthContext";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Package, History, FileText, BarChart, Settings, Users, Box, AlertCircle, ArrowLeft, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { employeeService } from '@/services/employeeService';
import { Employee } from '@/types';

export function CommissionsHub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  const { data: response, isLoading } = useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => employeeService.getEmployees(companyId),
    enabled: Boolean(companyId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const employees = (response?.data || []).filter(e => e.Status === 'ACTIVE');

  if ((import.meta as any).env.DEV) {
    console.log("CommissionsHub - All Employees from API:", response?.data);
    console.log("CommissionsHub - Filtered Active Employees:", employees);
  }

  const primaryCards = [
    {
      id: 'order-count',
      title: t('commissions.orderCount', 'Order Count Commission'),
      description: t('commissions.orderCountDesc', 'Calculate commission based on monthly orders and tiers.'),
      icon: Calculator,
      path: '/commission/order-count',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100 hover:border-indigo-300'
    },
    {
      id: 'products',
      title: t('commissions.products', 'Product Commission'),
      description: t('commissions.productsDesc', 'Calculate commission based on sold products and quantities.'),
      icon: Package,
      path: '/commission/products',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100 hover:border-emerald-300'
    }
  ];

  const shortcuts = [
    { title: t('commissions.history', 'History'), icon: History, path: '/commission/history' },
    { title: t('commissions.closings', 'Daily Closings'), icon: FileText, path: '/commission/closings' },
    { title: t('commissions.reports', 'Reports'), icon: BarChart, path: '/commission/reports' },
    { title: t('employees.list', 'Employees'), icon: Users, path: '/hr' },
    { title: t('modules.inventory', 'Products'), icon: Box, path: '/inventory' },
    { title: t('common.settings', 'Settings'), icon: Settings, path: '/settings' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="h-24 w-24 bg-amber-50 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-amber-500" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">{t('employees.noneAvailable', 'There are no employees available.')}</h2>
          <p className="text-slate-500">You need to add at least one active employee before using the commission module.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-5 w-5" /> {t('common.back', 'Back')}
          </Button>
          <Button onClick={() => navigate('/hr')}>
            <Plus className="mr-2 h-5 w-5" /> {t('employees.add', 'Add Employee')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('modules.commission', 'Commission Tracking')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage and calculate employee commissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {primaryCards.map(card => (
          <Card 
            key={card.id} 
            className={cn("cursor-pointer transition-all shadow-sm hover:shadow-md", card.border)}
            onClick={() => navigate(card.path)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={cn("rounded-xl p-4", card.bg, card.color)}>
                <card.icon className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">{card.description}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('commissions.shortcuts', 'Shortcuts')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {shortcuts.map((shortcut, i) => (
            <div 
              key={i}
              onClick={() => navigate(shortcut.path)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <shortcut.icon className="h-6 w-6 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{shortcut.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
