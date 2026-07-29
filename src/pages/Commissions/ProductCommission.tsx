import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { employeeService } from '@/services/employeeService';
import { productService } from '@/services/productService';
import { commissionService } from '@/services/commissionService';
import { Search, Plus, Trash2, CheckCircle, Package, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
// @ts-ignore
import { getProductImageUrl, handleImageError } from '@/utils/imageUtils';

export function ProductCommission() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  const { data: empRes, isLoading: empLoading } = useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => employeeService.getEmployees(companyId),
    enabled: Boolean(companyId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: prodRes, isLoading: prodLoading } = useQuery({
    queryKey: ['products', companyId],
    queryFn: () => productService.getProducts(companyId),
    enabled: Boolean(companyId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const employees = (empRes?.data || []).filter(e => e.Status === 'ACTIVE');
  const products = (prodRes?.data || []).filter(p => p.Status === 'ACTIVE');

  if ((import.meta as any).env.DEV) {
    console.log("ProductCommission - All Employees from API:", empRes?.data);
    console.log("ProductCommission - Filtered Active Employees:", employees);
  }

  // Step 1: Employee
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const selectedEmployee = employees.find(e => e.EmployeeID === selectedEmployeeId) || null;

  // Step 2: Products
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Step 3: Discounts
  const [discounts, setDiscounts] = useState<{id: string, name: string, amount: number}[]>([]);
  
  // Step 4: Closing
  const [requiredAmount, setRequiredAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  
  // Step 5: Review confirmation
  const [confirmed, setConfirmed] = useState(false);

  const activeProducts = products.filter(p => quantities[p.ProductID] > 0);
  const grossCommission = activeProducts.reduce((sum, p) => sum + (quantities[p.ProductID] * p.DefaultCommission), 0);
  const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0);
  const netCommission = Math.max(0, grossCommission - discountTotal);
  const balance = (paidAmount + netCommission) - requiredAmount;

  const saveMutation = useMutation({
    mutationFn: (payload: any) => commissionService.createProductCommission(payload),
    onSuccess: (res) => {
      if (res.success) {
        alert(t('commissions.saveSuccess', 'Commission saved successfully! Receipt: ') + res.data.receipt?.ReceiptNumber);
        setStep(1);
        setSelectedEmployeeId('');
        setQuantities({});
        setDiscounts([]);
        setRequiredAmount(0);
        setPaidAmount(0);
        setNotes('');
        setConfirmed(false);
      } else {
        alert(res.message);
      }
    },
    onError: (e) => {
      console.error(e);
    }
  });

  const handleSave = () => {
    if (!selectedEmployee) return;
    const d = new Date();
    
    saveMutation.mutate({
      CompanyID: companyId,
      EmployeeID: selectedEmployee.EmployeeID,
      ReceiptDate: d.toISOString().split('T')[0],
      Items: activeProducts.map(p => ({
        ProductID: p.ProductID,
        Quantity: quantities[p.ProductID],
        UnitPrice: p.SellingPriceIncVAT || 0,
        CommissionPerUnit: p.DefaultCommission
      })),
      Discounts: discounts.filter(d => d.amount > 0).map(d => ({
        Name: d.name,
        Amount: d.amount
      })),
      RequiredAmount: requiredAmount,
      PaidAmount: paidAmount,
      GrossCommission: grossCommission,
      TotalDiscount: discountTotal,
      NetCommission: netCommission,
      Notes: notes
    });
  };

  const isLoading = empLoading || prodLoading;

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

  const steps = [
    t('commissions.stepEmployee', 'Employee'),
    t('commissions.stepProducts', 'Products'),
    t('commissions.stepDiscounts', 'Discounts'),
    t('commissions.stepClosing', 'Closing'),
    t('commissions.stepReview', 'Review')
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('commissions.products', 'Product Commission')}</h2>
      </div>

      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
        {steps.map((s, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={s} className="flex items-center shrink-0">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                isActive ? "border-indigo-600 bg-indigo-600 text-white" : 
                isDone ? "border-indigo-600 bg-indigo-50 text-indigo-600" : 
                "border-slate-200 text-slate-400 bg-white"
              )}>
                {isDone ? <CheckCircle className="h-5 w-5" /> : num}
              </div>
              <span className={cn(
                "ml-3 text-sm font-medium",
                isActive ? "text-indigo-900" :
                isDone ? "text-indigo-600" :
                "text-slate-400"
              )}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <div className={cn(
                  "mx-4 h-0.5 w-12 transition-colors",
                  isDone ? "bg-indigo-600" : "bg-slate-200"
                )} />
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4 max-w-md">
              <h3 className="text-lg font-medium">{t('commissions.stepEmployee', 'Employee')}</h3>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">{t('commissions.selectEmployee', 'Select Employee...')}</option>
                {employees.map(e => (
                  <option key={e.EmployeeID} value={e.EmployeeID}>
                    {e.ArabicName || e.EnglishName} ({e.EmployeeCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Select Products</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="flex h-10 w-full rounded-md border border-slate-300 pl-10 pr-3 py-2 text-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {products.filter(p => (p.ArabicName?.includes(search) || p.SKU?.includes(search))).map(p => {
                  const qty = quantities[p.ProductID] || 0;
                  return (
                    <div key={p.ProductID} className={cn(
                      "rounded-xl border transition-all overflow-hidden bg-white flex flex-col",
                      qty > 0 ? "border-indigo-300 ring-1 ring-indigo-300" : "border-slate-200"
                    )}>
                      <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative overflow-hidden border-b">
                        <img 
  src={getProductImageUrl(p.SKU, p.ImageURL)} 
  alt={p.ArabicName || p.EnglishName} 
  className="object-cover w-full h-full"
  onError={handleImageError}
                        />
                      </div>
                      <div className={cn("p-4 flex flex-col flex-1", qty > 0 ? "bg-indigo-50/50" : "")}>
                        <div className="font-semibold text-slate-900 line-clamp-2 min-h-[40px] leading-tight">{p.ArabicName || p.EnglishName}</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">SKU: {p.SKU}</div>
                        <div className="text-indigo-600 font-medium text-sm mt-1">{p.DefaultCommission} SAR commission</div>
                        
                        <div className="flex flex-1 items-end pt-4">
                          <div className="flex items-center justify-between gap-4 w-full">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 shrink-0 rounded-full bg-white"
                              onClick={() => setQuantities(q => ({...q, [p.ProductID]: Math.max(0, qty - 1)}))}
                              disabled={qty === 0}
                            >-</Button>
                            <span className="text-center font-semibold text-slate-700">{qty}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 shrink-0 rounded-full border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50"
                              onClick={() => setQuantities(q => ({...q, [p.ProductID]: qty + 1}))}
                            >+</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 max-w-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Discounts</h3>
                <Button variant="outline" size="sm" onClick={() => setDiscounts([...discounts, {id: Date.now().toString(), name: '', amount: 0}])}>
                  <Plus className="h-4 w-4 mr-2" /> Add Discount
                </Button>
              </div>
              
              {discounts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                  No discounts applied.
                </div>
              ) : (
                <div className="space-y-3">
                  {discounts.map((d, i) => (
                    <div key={d.id} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="Reason (e.g. Broken item)" 
                        className="flex h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm"
                        value={d.name}
                        onChange={e => {
                          const nd = [...discounts];
                          nd[i].name = e.target.value;
                          setDiscounts(nd);
                        }}
                      />
                      <input 
                        type="number" 
                        min="0"
                        placeholder="Amount (SAR)" 
                        className="flex h-10 w-32 rounded-md border border-slate-300 px-3 text-sm"
                        value={d.amount || ''}
                        onChange={e => {
                          const nd = [...discounts];
                          nd[i].amount = parseFloat(e.target.value) || 0;
                          setDiscounts(nd);
                        }}
                      />
                      <Button variant="ghost" size="icon" className="text-red-500 shrink-0" onClick={() => {
                        setDiscounts(discounts.filter((_, idx) => idx !== i));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {discountTotal > grossCommission && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm mt-4">
                  Warning: Total discounts ({discountTotal}) exceed gross commission ({grossCommission}). Net will be 0.
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-lg font-medium">{t('commissions.dailyClosing', 'Daily Closing')}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('commissions.requiredAmount', 'Required Amount')}</label>
                  <input 
                    type="number"
                    min="0"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    value={requiredAmount || ''}
                    onChange={e => setRequiredAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('commissions.paidAmount', 'Paid Invoices Amount')}</label>
                  <input 
                    type="number"
                    min="0"
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    value={paidAmount || ''}
                    onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex justify-between py-3 border-t border-slate-200">
                  <span className="font-semibold">{t('commissions.remainingBalance', 'Remaining Balance')}</span>
                  <span className={cn("font-bold text-lg", balance < 0 ? "text-red-600" : "text-emerald-600")}>
                    {balance} SAR
                  </span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.notes', 'Notes')}</label>
                  <textarea 
                    className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[80px]"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">{t('commissions.review', 'Final Review')}</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Employee</h4>
                    <div className="font-medium">{selectedEmployee?.ArabicName || selectedEmployee?.EnglishName} ({selectedEmployee?.EmployeeCode})</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Products ({activeProducts.length})</h4>
                    <div className="space-y-2">
                      {activeProducts.map(p => (
                        <div key={p.ProductID} className="flex justify-between text-sm">
                          <span className="truncate pr-4">{quantities[p.ProductID]}x {p.ArabicName}</span>
                          <span className="font-medium shrink-0">{quantities[p.ProductID] * p.DefaultCommission} SAR</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {discounts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Discounts</h4>
                      <div className="space-y-2">
                        {discounts.filter(d => d.amount > 0).map(d => (
                          <div key={d.id} className="flex justify-between text-sm text-red-600">
                            <span>{d.name || 'Discount'}</span>
                            <span>-{d.amount} SAR</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit space-y-4">
                  <h4 className="font-semibold text-slate-900 border-b pb-2">Financial Summary</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Gross Commission</span>
                      <span className="font-medium">{grossCommission} SAR</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Total Discounts</span>
                      <span>-{discountTotal} SAR</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-lg text-indigo-700">
                      <span>Net Commission</span>
                      <span>{netCommission} SAR</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm pt-4 mt-4 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Required Amount</span>
                      <span className="font-medium">{requiredAmount} SAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Paid Invoices</span>
                      <span className="font-medium">{paidAmount} SAR</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-emerald-700">
                      <span>Balance</span>
                      <span>{balance} SAR</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="confirm" 
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                />
                <label htmlFor="confirm" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                  {t('commissions.confirmData', 'I confirm that the data has been reviewed and is correct.')}
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || saveMutation.isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180" /> {t('common.back', 'Back')}
            </Button>
            
            {step < 5 ? (
              <Button 
                onClick={() => setStep(s => Math.min(5, s + 1))}
                disabled={(step === 1 && !selectedEmployee) || (step === 2 && activeProducts.length === 0)}
              >
                {t('common.next', 'Next')} <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            ) : (
              <Button 
                onClick={handleSave}
                disabled={!confirmed || saveMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saveMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Confirm & Save')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
