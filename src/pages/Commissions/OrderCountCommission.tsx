import toast from 'react-hot-toast';
import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Save, ArrowLeft, Printer, FileText, CheckCircle2, AlertCircle, Plus, Minus, Trash2, ShieldCheck, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { employeeService } from '@/services/employeeService';
import { commissionService } from '@/services/commissionService';
import { CommissionRecord, AppliedDiscount } from '@/types';
import { PrintableCommissionSummary } from '@/components/commissions/PrintableCommissionSummary';

export function OrderCountCommission() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  // Step 1: Input, Step 2: Summary
  const [step, setStep] = useState<number>(1);

  // Queries
  const { data: empRes, isLoading: empLoading } = useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => employeeService.getEmployees(companyId),
    enabled: Boolean(companyId),
  });

  const { data: settingsRes, isLoading: settingsLoading } = useQuery({
    queryKey: ['commissionSettings', companyId],
    queryFn: () => commissionService.getSettings(companyId),
    enabled: Boolean(companyId),
  });

  const employees = (empRes?.data || []).filter(
    (e) =>
      e.Status === 'ACTIVE' &&
      (e.CommissionType === 'SALARY_AND_COMMISSION' ||
        e.CommissionType === 'PRODUCT_COMMISSION_ONLY' ||
        !e.CommissionType)
  );

  let settings = { monthly_threshold: 250, first_tier_rate: 3, second_tier_rate: 4 };
  if (settingsRes?.success && settingsRes?.data && Object.keys(settingsRes.data).length > 0) {
    settings = {
      monthly_threshold: parseInt(settingsRes.data.monthly_threshold) || 250,
      first_tier_rate: parseFloat(settingsRes.data.first_tier_rate) || 3,
      second_tier_rate: parseFloat(settingsRes.data.second_tier_rate) || 4,
    };
  }

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const selectedEmployee = employees.find((e) => e.EmployeeID === selectedEmployeeId) || null;

  const [ordersCount, setOrdersCount] = useState<string>('');
  const [pastOrders, setPastOrders] = useState<number>(0);
  
  const [totalRequiredAmount, setTotalRequiredAmount] = useState<number | ''>('');
  const [onlinePaidAmount, setOnlinePaidAmount] = useState<number | ''>('');
  const [discounts, setDiscounts] = useState<AppliedDiscount[]>([]);
  const [notes, setNotes] = useState('');
  
  const [activeRecordForPrint, setActiveRecordForPrint] = useState<CommissionRecord | null>(null);
  const [showSavedSuccessModal, setShowSavedSuccessModal] = useState(false);
  const [savedRecord, setSavedRecord] = useState<CommissionRecord | null>(null);

  useEffect(() => {
    if (selectedEmployeeId) {
      const fetchPast = async () => {
        const d = new Date();
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const res = await commissionService.getMonthlyEmployeeOrderTotal(
          companyId,
          selectedEmployeeId,
          monthStr
        );
        if (res.success && res.data) {
          setPastOrders(res.data.totalOrders);
        }
      };
      fetchPast();
    } else {
      setPastOrders(0);
    }
  }, [selectedEmployeeId]);

  // Calculations
  const newOrdersNum = parseInt(ordersCount) || 0;
  const newTotal = pastOrders + newOrdersNum;

  let firstTier = 0;
  let secondTier = 0;
  const threshold = settings.monthly_threshold || 250;
  const rate1 = settings.first_tier_rate || 3;
  const rate2 = settings.second_tier_rate || 4;

  for (let i = pastOrders + 1; i <= newTotal; i++) {
    if (i <= threshold) firstTier++;
    else secondTier++;
  }

  const grossCommission = firstTier * rate1 + secondTier * rate2;
  const reachedLimitNow = pastOrders < threshold && newTotal >= threshold;

  const numTotalRequired = Number(totalRequiredAmount) || 0;
  const numOnlinePaid = Number(onlinePaidAmount) || 0;
  const numTotalDiscounts = discounts.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  
  const finalRequiredAmount = numTotalRequired - numOnlinePaid - numTotalDiscounts;
  const isFinalAmountNegative = finalRequiredAmount < 0;

  const handleAddDiscount = () => {
    setDiscounts([...discounts, { id: Date.now().toString(), name: 'كود خصم منصة زد', amount: 0 }]);
  };

  const handleRemoveDiscount = (id: string) => {
    setDiscounts(discounts.filter((d) => d.id !== id));
  };

  const updateDiscount = (id: string, field: keyof AppliedDiscount, value: any) => {
    setDiscounts(discounts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleBuildRecord = (): CommissionRecord => {
    const d = new Date();
    const formattedDate = d.toLocaleString('sv-SE', { timeZone: 'Asia/Riyadh' }).replace('T', ' ').slice(0, 16);
    const trxNo = 'TRX-' + d.getFullYear() + '-' + String(Math.floor(Math.random() * 8999 + 1000));
    
    return {
      id: 'REC-' + Date.now(),
      transactionNo: trxNo,
      companyId,
      createdAt: d.toISOString(),
      formattedDate,
      employeeId: selectedEmployee?.EmployeeID || '',
      employeeName: selectedEmployee ? (selectedEmployee.ArabicName || selectedEmployee.EnglishName) : 'غير محدد',
      employeeCode: selectedEmployee?.EmployeeCode || '',
      commissionType: 'ORDER_COUNT_COMMISSION',
      commissionTypeLabel: 'عمولة طلبات',
      
      quantityOrOrdersCount: newOrdersNum,
      grossCommission,
      totalDiscount: numTotalDiscounts,
      netCommission: grossCommission, 
      
      totalRequiredAmount: numTotalRequired,
      onlinePaidAmount: numOnlinePaid,
      totalDiscounts: numTotalDiscounts,
      finalRequiredAmount,
      
      // legacy compat
      totalOrderValue: numTotalRequired,
      codRequiredAmount: finalRequiredAmount,
      remainingBalance: finalRequiredAmount,
      
      notes,
      orderCountDetails: {
        pastOrders,
        newOrders: newOrdersNum,
        totalOrders: newTotal,
        tier1Count: firstTier,
        tier1Rate: rate1,
        tier2Count: secondTier,
        tier2Rate: rate2,
      },
      discounts: discounts.filter((d) => d.amount > 0),
    };
  };

  const saveMutation = useMutation({
    mutationFn: (record: CommissionRecord) => commissionService.saveCommissionRecord(record),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['commissionRecords'] });
      queryClient.invalidateQueries({ queryKey: ['commissionReceipts'] });
      
      toast.success('تم حفظ سجل العمولة بنجاح');
      navigate('/commission/records');
    },
    onError: (err: any) => {
      console.error(err);
      toast.error('فشل الحفظ: ' + (err.message || 'خطأ غير معروف'));
    },
  });

  const handleConfirmAndSave = () => {
    if (!selectedEmployee) return;
    const record = handleBuildRecord();
    setSavedRecord(record);
    saveMutation.mutate(record);
  };

  const handleResetForm = () => {
    setStep(1);
    setSelectedEmployeeId('');
    setOrdersCount('');
    setTotalRequiredAmount('');
    setOnlinePaidAmount('');
    setDiscounts([]);
    setNotes('');
    setShowSavedSuccessModal(false);
    setSavedRecord(null);
  };

  const canProceedToSummary = selectedEmployeeId && newOrdersNum > 0 && numTotalRequired >= 0 && numOnlinePaid >= 0;

  if (empLoading || settingsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6" dir="rtl">
        <div className="h-24 w-24 bg-amber-50 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-amber-500" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">لا يوجد مندوبون متاحون</h2>
          <p className="text-slate-500">يجب إضافة مندوب واحد على الأقل للاستفادة من وحدة العمولات.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-5 w-5" /> العودة
          </Button>
          <Button onClick={() => navigate('/hr')}>
            <Plus className="mr-2 h-5 w-5" /> إضافة مندوب
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            <span>عمولة الطلبات</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إدخال عدد الطلبات، حساب العمولة، والمبالغ المالية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/commission/records')} className="gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>سجل العمولات</span>
          </Button>
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Right Panel: Employee & Financials */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">1</span>
                  اختيار المندوب
                </h3>
                <div className="space-y-2">
                  <select
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    <option value="">-- اختر المندوب --</option>
                    {employees.map(e => (
                      <option key={e.EmployeeID} value={e.EmployeeID}>{e.ArabicName || e.EnglishName} ({e.EmployeeCode})</option>
                    ))}
                  </select>
                  {selectedEmployee && (
                    <div className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-100 flex justify-between items-center">
                      <span className="text-slate-600">كود المندوب:</span>
                      <span className="font-bold text-slate-900 font-mono">{selectedEmployee.EmployeeCode}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">2</span>
                  البيانات المالية والخصومات
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">إجمالي المبلغ المطلوب تحصيله من المندوب</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                      value={totalRequiredAmount}
                      onChange={(e) => setTotalRequiredAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">المبلغ المدفوع أونلاين</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                      value={onlinePaidAmount}
                      onChange={(e) => setOnlinePaidAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-700">الخصومات</label>
                      <Button variant="outline" size="sm" onClick={handleAddDiscount} className="h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Plus className="w-3 h-3 mr-1" /> إضافة خصم
                      </Button>
                    </div>
                    
                    {discounts.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2 border rounded border-dashed">لا توجد خصومات مطبقة</p>
                    ) : (
                      <div className="space-y-2">
                        {discounts.map(discount => (
                          <div key={discount.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded border">
                            <select 
                              className="flex-1 p-1.5 rounded border text-xs outline-none"
                              value={discount.name}
                              onChange={(e) => updateDiscount(discount.id, 'name', e.target.value)}
                            >
                              <option value="كود خصم منصة زد">كود خصم منصة زد</option>
                              <option value="خصم آخر">خصم آخر</option>
                            </select>
                            <input
                              type="number"
                              min="0"
                              className="w-24 p-1.5 rounded border text-xs outline-none"
                              value={discount.amount || ''}
                              onChange={(e) => updateDiscount(discount.id, 'amount', Number(e.target.value))}
                              placeholder="المبلغ"
                            />
                            <button onClick={() => handleRemoveDiscount(discount.id)} className="text-red-500 hover:text-red-700 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
                      <span className="font-bold text-sm text-slate-700">المبلغ النهائي المطلوب تحصيله من المندوب:</span>
                      <span className={cn("font-black text-lg", isFinalAmountNegative ? "text-red-600" : "text-slate-900")} dir="ltr">
                        {isFinalAmountNegative ? (
                          <span className="text-sm font-normal ml-1">(دائن) {Math.abs(finalRequiredAmount).toFixed(2)}</span>
                        ) : (
                          finalRequiredAmount.toFixed(2)
                        )} ر.س
                      </span>
                    </div>
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            <Button 
              disabled={!canProceedToSummary}
              onClick={() => setStep(2)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-lg"
            >
              عرض الملخص المالي
            </Button>
          </div>

          {/* Left Panel: Orders Details */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <Card className="bg-slate-50/70 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">3</span>
                  تفاصيل الطلبات (العمولة المستحقة: {grossCommission.toFixed(2)} ر.س)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 max-w-sm">
                  <label className="text-sm font-bold text-slate-700">عدد الطلبات الجديدة</label>
                  <input
                    type="number"
                    min="1"
                    className="flex h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={ordersCount}
                    onChange={(e) => setOrdersCount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-indigo-600" />
                    معاينة الاحتساب الفوري
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">الطلبات السابقة (هذا الشهر)</span>
                      <span className="font-bold text-slate-900">{pastOrders} طلب</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">إجمالي الطلبات الجديد</span>
                      <span className="font-bold text-indigo-700 text-sm">{newTotal} طلب</span>
                    </div>

                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between py-1 bg-slate-50 px-2 rounded">
                        <span className="text-slate-600">الشريحة الأولى (≤ {threshold}) @ {rate1} ر.س: <span className="font-bold text-indigo-700">{firstTier} طلب</span></span>
                        <span className="font-bold">{firstTier * rate1} ر.س</span>
                      </div>
                      <div className="flex justify-between py-1 bg-slate-50 px-2 rounded">
                        <span className="text-slate-600">الشريحة الثانية (&gt; {threshold}) @ {rate2} ر.س: <span className="font-bold text-indigo-700">{secondTier} طلب</span></span>
                        <span className="font-bold">{secondTier * rate2} ر.س</span>
                      </div>
                    </div>
                  </div>
                </div>

                {reachedLimitNow && (
                  <div className="bg-amber-50 text-amber-900 p-3 rounded-xl text-sm flex items-start gap-2 border border-amber-200">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                    <p>تجاوز المندوب حد الـ {threshold} طلب، وسيتم احتساب الطلبات الإضافية برسم {rate2} ر.س لكل طلب.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <FileText className="h-8 w-8 text-indigo-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">الملخص النهائي للعملية</h3>
                  <p className="text-sm text-slate-500">راجع البيانات قبل الطباعة والحفظ</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Employee Info */}
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">بيانات المندوب والعمولة</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">اسم المندوب:</span><span className="font-bold text-slate-900">{selectedEmployee?.ArabicName || selectedEmployee?.EnglishName}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">كود المندوب:</span><span className="font-bold font-mono text-slate-900">{selectedEmployee?.EmployeeCode}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">إجمالي الطلبات للعملية:</span><span className="font-bold text-slate-900">{newOrdersNum} طلب</span></div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-slate-200">
                        <span className="font-bold text-indigo-800">إجمالي عمولة المندوب:</span>
                        <span className="font-black text-indigo-700 text-lg">{grossCommission.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ملاحظات العملية (اختياري)</label>
                    <textarea
                      className="w-full p-3 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none text-sm min-h-[100px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أضف أي ملاحظات للرجوع إليها..."
                    />
                  </div>
                </div>

                {/* Financial Info */}
                <div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-2">التفاصيل المالية والتحصيل</h4>
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 text-sm">إجمالي المبلغ المطلوب:</span>
                      <span className="font-bold text-slate-900">{numTotalRequired.toFixed(2)} ر.س</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 text-sm">المبلغ المدفوع أونلاين:</span>
                      <span className="font-bold text-blue-700">{numOnlinePaid.toFixed(2)} ر.س</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 text-sm">إجمالي الخصومات:</span>
                      <span className="font-bold text-red-600">-{numTotalDiscounts.toFixed(2)} ر.س</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 px-3 mt-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <span className="font-bold text-slate-800 text-sm">المبلغ النهائي المطلوب تحصيله:</span>
                      <span className={cn("font-black text-lg", isFinalAmountNegative ? "text-red-600" : "text-slate-900")}>
                        {isFinalAmountNegative ? `(دائن) ${Math.abs(finalRequiredAmount).toFixed(2)}` : finalRequiredAmount.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-slate-200">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="ml-2 h-4 w-4" /> رجوع للتعديل
                </Button>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => setActiveRecordForPrint(handleBuildRecord())}
                    variant="outline"
                    className="gap-2 border-slate-300 w-full sm:w-auto"
                  >
                    <Printer className="h-4 w-4 text-slate-600" />
                    <span>معاينة الطباعة</span>
                  </Button>
                  <Button
                    onClick={handleConfirmAndSave}
                    disabled={saveMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold px-6 w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ سجل العمولة'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {showSavedSuccessModal && savedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-slate-200">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">تم حفظ العملية بنجاح!</h3>
              <p className="text-xs text-slate-500">رقم السجل:</p>
              <div className="inline-block font-mono font-bold text-sm bg-slate-100 text-slate-800 px-3 py-1 rounded-lg">
                {savedRecord.transactionNo}
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => setActiveRecordForPrint(savedRecord)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Printer className="h-4 w-4" /> طباعة الملخص
              </Button>
              <Button variant="outline" onClick={() => { handleResetForm(); navigate('/commission/records'); }}>
                الذهاب إلى سجل العمولات
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Modal */}
      {activeRecordForPrint && (
        <PrintableCommissionSummary
          record={activeRecordForPrint}
          onClose={() => setActiveRecordForPrint(null)}
          autoPrint={false}
        />
      )}
    </div>
  );
}
