import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { employeeService } from '@/services/employeeService';
import { commissionService } from '@/services/commissionService';
import { Calculator, AlertCircle, CheckCircle, ArrowLeft, Plus } from 'lucide-react';

export function OrderCountCommission() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001'; // Fallback / mock context

  const { data: empRes, isLoading: empLoading } = useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => employeeService.getEmployees(companyId),
    enabled: Boolean(companyId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: settingsRes, isLoading: settingsLoading } = useQuery({
    queryKey: ['commissionSettings', companyId],
    queryFn: () => commissionService.getSettings(companyId),
    enabled: Boolean(companyId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const employees = (empRes?.data || []).filter(e => 
    e.Status === 'ACTIVE' && 
    (e.CommissionType === 'SALARY_AND_COMMISSION' || e.CommissionType === 'PRODUCT_COMMISSION_ONLY' || !e.CommissionType)
  );

  if ((import.meta as any).env.DEV) {
    console.log("OrderCountCommission - All Employees from API:", empRes?.data);
    console.log("OrderCountCommission - Filtered Active Employees:", employees);
  }

  let settings = { monthly_threshold: 250, first_tier_rate: 3, second_tier_rate: 4 };
  if (settingsRes?.success && settingsRes?.data && Object.keys(settingsRes.data).length > 0) {
    settings = {
      monthly_threshold: parseInt(settingsRes.data.monthly_threshold) || 250,
      first_tier_rate: parseFloat(settingsRes.data.first_tier_rate) || 3,
      second_tier_rate: parseFloat(settingsRes.data.second_tier_rate) || 4
    };
  }

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [ordersCount, setOrdersCount] = useState('');
  const [notes, setNotes] = useState('');
  
  const [pastOrders, setPastOrders] = useState(0);

  useEffect(() => {
    if (selectedEmployee) {
      const fetchPast = async () => {
        const d = new Date();
        const monthStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const res = await commissionService.getMonthlyEmployeeOrderTotal(companyId, selectedEmployee, monthStr);
        if (res.success && res.data) {
          setPastOrders(res.data.totalOrders);
        }
      };
      fetchPast();
    } else {
      setPastOrders(0);
    }
  }, [selectedEmployee]);

  // Calculations
  const newOrdersNum = parseInt(ordersCount) || 0;
  const newTotal = pastOrders + newOrdersNum;
  
  let firstTier = 0;
  let secondTier = 0;
  const threshold = settings.monthly_threshold || 250;
  const rate1 = settings.first_tier_rate || 3;
  const rate2 = settings.second_tier_rate || 4;

  for(let i = pastOrders + 1; i <= newTotal; i++) {
    if (i <= threshold) firstTier++;
    else secondTier++;
  }

  const currentCommission = (firstTier * rate1) + (secondTier * rate2);
  const reachedLimitNow = pastOrders < threshold && newTotal >= threshold;

  const saveMutation = useMutation({
    mutationFn: (payload: any) => commissionService.createOrderCountCommission(payload),
    onSuccess: (res) => {
      if (res.success) {
        alert(t('commissions.saveSuccess', 'Commission saved successfully! Receipt: ') + res.data.receipt?.ReceiptNumber);
        setOrdersCount('');
        setNotes('');
        setPastOrders(newTotal);
      } else {
        alert(res.message);
      }
    },
    onError: (e) => {
      console.error(e);
    }
  });

  const handleSave = () => {
    if (!selectedEmployee || newOrdersNum <= 0) return;
    
    const d = new Date();
    const monthStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    
    saveMutation.mutate({
      CompanyID: companyId,
      EmployeeID: selectedEmployee,
      OrdersCount: newOrdersNum,
      CommissionMonth: monthStr,
      ReceiptDate: d.toISOString().split('T')[0],
      ThresholdOrders: threshold,
      FirstTierRate: rate1,
      SecondTierRate: rate2,
      Notes: notes
    });
  };

  const isLoading = empLoading || settingsLoading;

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('commissions.orderCount', 'Order Count Commission')}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('commissions.entryForm', 'Entry Form')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('commissions.employee', 'Employee')}</label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
              >
                <option value="">{t('commissions.selectEmployee', 'Select Employee...')}</option>
                {employees.map(e => (
                  <option key={e.EmployeeID} value={e.EmployeeID}>
                    {e.ArabicName || e.EnglishName} ({e.EmployeeCode})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('commissions.newOrders', 'New Orders Count')}</label>
              <input 
                type="number"
                min="1"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={ordersCount}
                onChange={e => setOrdersCount(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.notes', 'Notes')}</label>
              <textarea 
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[80px]"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-600" />
              {t('commissions.preview', 'Calculation Preview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">{t('commissions.pastOrders', 'Past Orders (This Month)')}</span>
              <span className="font-semibold">{pastOrders}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">{t('commissions.newTotal', 'New Total')}</span>
              <span className="font-semibold">{newTotal}</span>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between py-1">
                <span className="text-xs text-slate-500">Tier 1 (≤ {threshold}) @ {rate1} SAR: {firstTier} orders</span>
                <span className="text-sm font-medium">{firstTier * rate1} SAR</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-xs text-slate-500">Tier 2 (&gt; {threshold}) @ {rate2} SAR: {secondTier} orders</span>
                <span className="text-sm font-medium">{secondTier * rate2} SAR</span>
              </div>
            </div>

            <div className="flex justify-between py-3 border-t-2 border-slate-200 mt-2">
              <span className="font-bold text-slate-900">{t('commissions.totalCommission', 'Total Commission')}</span>
              <span className="font-bold text-indigo-600 text-lg">{currentCommission} SAR</span>
            </div>

            {reachedLimitNow && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm flex items-start gap-2 border border-amber-200">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{t('commissions.limitReached', 'The representative has reached 250 orders. Additional orders will be calculated at SAR 4.')}</p>
              </div>
            )}
            
            <Button 
              className="w-full mt-4" 
              size="lg" 
              onClick={handleSave}
              disabled={saveMutation.isPending || !selectedEmployee || newOrdersNum <= 0}
            >
              {saveMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save Commission')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
