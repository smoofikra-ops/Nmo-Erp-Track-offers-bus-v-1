import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Save, ArrowLeft, Printer, FileText, CheckCircle2, AlertCircle, Plus, Minus, Tag, Trash2, ShieldCheck, CreditCard, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { employeeService } from '@/services/employeeService';
import { productService } from '@/services/productService';
import { commissionService } from '@/services/commissionService';
import { CommissionRecord, AppliedDiscount } from '@/types';
import { getProductImageUrl } from '@/utils/imageUtils';
import { PrintableCommissionSummary } from '@/components/commissions/PrintableCommissionSummary';

export function ProductCommission() {
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

  const { data: prodRes, isLoading: prodLoading } = useQuery({
    queryKey: ['products', companyId],
    queryFn: () => productService.getProducts(companyId),
    enabled: Boolean(companyId),
  });

  const employees = (empRes?.data || []).filter((e) => e.Status === 'ACTIVE');
  const products = (prodRes?.data || []).filter((p) => p.Status === 'ACTIVE');

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const selectedEmployee = employees.find((e) => e.EmployeeID === selectedEmployeeId) || null;

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const [totalRequiredAmount, setTotalRequiredAmount] = useState<number | ''>('');
  const [onlinePaidAmount, setOnlinePaidAmount] = useState<number | ''>('');
  const [discounts, setDiscounts] = useState<AppliedDiscount[]>([]);
  const [notes, setNotes] = useState('');
  
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [activeRecordForPrint, setActiveRecordForPrint] = useState<CommissionRecord | null>(null);
  const [showSavedSuccessModal, setShowSavedSuccessModal] = useState(false);
  const [savedRecord, setSavedRecord] = useState<CommissionRecord | null>(null);

  // Calculations
  const activeProducts = products.filter((p) => (quantities[p.ProductID] || 0) > 0);
  const totalProductsCount = activeProducts.reduce((sum, p) => sum + (quantities[p.ProductID] || 0), 0);
  
  const grossCommission = activeProducts.reduce(
    (sum, p) => sum + (quantities[p.ProductID] || 0) * (Number(p.DefaultCommission) || 0),
    0
  );

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

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
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
      commissionType: 'PRODUCT_COMMISSION',
      commissionTypeLabel: 'عمولة منتجات',
      
      quantityOrOrdersCount: totalProductsCount,
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
      items: activeProducts.map((p) => ({
        productId: p.ProductID,
        sku: p.SKU,
        productName: p.ArabicName || p.EnglishName,
        quantity: quantities[p.ProductID],
        unitPrice: p.SellingPriceIncVAT || p.SellingPriceExVAT || 0,
        unitCommission: Number(p.DefaultCommission) || 0,
        totalCommission: quantities[p.ProductID] * (Number(p.DefaultCommission) || 0),
      })),
      discounts: discounts.filter((d) => d.amount > 0),
    };
  };

  const saveMutation = useMutation({
    mutationFn: (record: CommissionRecord) => commissionService.saveCommissionRecord(record),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['commissionRecords'] });
      queryClient.invalidateQueries({ queryKey: ['commissionReceipts'] });
      
      alert('تم حفظ سجل العمولة بنجاح');
      navigate('/commission/records');
    },
    onError: (err: any) => {
      console.error(err);
      alert('فشل الحفظ: ' + (err.message || 'خطأ غير معروف'));
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
    setQuantities({});
    setTotalRequiredAmount('');
    setOnlinePaidAmount('');
    setDiscounts([]);
    setNotes('');
    setIsConfirmed(false);
    setShowSavedSuccessModal(false);
    setSavedRecord(null);
  };

  const canProceedToSummary = selectedEmployeeId && totalProductsCount > 0 && numTotalRequired >= 0 && numOnlinePaid >= 0;

  if (empLoading || prodLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            <span>عمولة المنتجات</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            إدخال المبيعات، حساب العمولة، والمبالغ المالية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/commission/records')} className="gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
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
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">1</span>
                  اختيار المندوب
                </h3>
                <div className="space-y-2">
                  <select
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
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
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">2</span>
                  البيانات المالية والخصومات
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">إجمالي المبلغ المطلوب تحصيله من المندوب</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
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
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                      value={onlinePaidAmount}
                      onChange={(e) => setOnlinePaidAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-slate-700">الخصومات</label>
                      <Button variant="outline" size="sm" onClick={handleAddDiscount} className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
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
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-lg"
            >
              عرض الملخص المالي
            </Button>
          </div>

          {/* Left Panel: Products Grid */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">3</span>
                شبكة المنتجات (العمولة: {grossCommission.toFixed(2)} ر.س)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map(product => {
                const qty = quantities[product.ProductID] || 0;
                const unitComm = Number(product.DefaultCommission) || 0;
                const itemComm = qty * unitComm;
                const img = getProductImageUrl(product.SKU, product.ImageURL, product);
                
                return (
                  <div key={product.ProductID} className={cn("border rounded-xl p-3 bg-white flex flex-col items-center gap-3 transition-all", qty > 0 ? "border-emerald-500 shadow-sm ring-1 ring-emerald-500" : "border-slate-200 hover:border-emerald-300")}>
                    <div className="h-20 w-20 rounded-lg overflow-hidden bg-slate-50 border p-1">
                      <img src={img} alt={product.ArabicName} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-center w-full">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-2 h-8 leading-snug" title={product.ArabicName}>{product.ArabicName}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">{product.SKU}</p>
                    </div>
                    <div className="w-full bg-slate-50 rounded-lg p-2 text-center border">
                      <span className="text-[10px] text-slate-500 block mb-1">العمولة: {unitComm.toFixed(2)} ر.س</span>
                      <div className="flex items-center justify-between bg-white rounded-md border p-1">
                        <button onClick={() => updateQuantity(product.ProductID, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-600">
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          className="w-10 text-center text-sm font-bold outline-none"
                          value={qty || ''}
                          onChange={(e) => setQuantities({...quantities, [product.ProductID]: Number(e.target.value)})}
                        />
                        <button onClick={() => updateQuantity(product.ProductID, 1)} className="w-6 h-6 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 rounded text-emerald-700">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {qty > 0 && (
                        <div className="mt-2 text-xs font-bold text-emerald-700">
                          الإجمالي: {itemComm.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <FileText className="h-8 w-8 text-emerald-600" />
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
                      <div className="flex justify-between"><span className="text-slate-500">إجمالي قطع المنتجات:</span><span className="font-bold text-slate-900">{totalProductsCount} قطعة</span></div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-slate-200">
                        <span className="font-bold text-emerald-800">إجمالي عمولة المندوب:</span>
                        <span className="font-black text-emerald-700 text-lg">{grossCommission.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ملاحظات العملية (اختياري)</label>
                    <textarea
                      className="w-full p-3 rounded-lg border border-slate-300 focus:border-emerald-500 outline-none text-sm min-h-[100px]"
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
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold px-6 w-full sm:w-auto"
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
