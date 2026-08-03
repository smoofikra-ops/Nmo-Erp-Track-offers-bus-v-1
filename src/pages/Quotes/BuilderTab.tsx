import toast from 'react-hot-toast';
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { quoteService } from '@/services/quoteService';
import { QuoteCartItem, QuoteAdjustment, Quote } from '@/types/quotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2, Save, ShoppingCart, Percent, DollarSign, X } from 'lucide-react';
import { getProductImageUrl, handleImageError } from '@/utils/imageUtils';

interface BuilderTabProps {
  cartItems: QuoteCartItem[];
  onUpdateItem: (productId: string, updates: Partial<QuoteCartItem>) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  editingQuote: Quote | null;
  onSaveSuccess: () => void;
}

export function BuilderTab({ cartItems, onUpdateItem, onRemoveItem, onClearCart, editingQuote, onSaveSuccess }: BuilderTabProps) {
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  const [title, setTitle] = useState(editingQuote?.title || 'عرض سعر جديد');
  const [customerName, setCustomerName] = useState(editingQuote?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(editingQuote?.customerPhone || '');
  const [validUntil, setValidUntil] = useState(editingQuote?.validUntil || '');
  
  const [adjustments, setAdjustments] = useState<QuoteAdjustment[]>(editingQuote?.adjustments || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Calculations
  const totals = useMemo(() => {
    let purchaseCostExVat = 0;
    let purchaseCostIncVat = 0;
    let retailValueExVat = 0;
    let retailValueIncVat = 0;
    let totalOfferUnits = 0;
    let totalPieces = 0;

    cartItems.forEach(item => {
      purchaseCostExVat += item.unitPurchaseCostExVat * item.quantity;
      purchaseCostIncVat += item.unitPurchaseCostIncVat * item.quantity;
      retailValueExVat += item.unitSellingPriceExVat * item.quantity;
      retailValueIncVat += item.unitSellingPriceIncVat * item.quantity;
      totalOfferUnits += item.quantity;
      if (item.piecesPerOfferUnit) {
        totalPieces += item.quantity * item.piecesPerOfferUnit;
      }
    });

    let discountTotal = 0;
    let additionTotal = 0;
    let internalExpenseTotal = 0;

    adjustments.forEach(adj => {
      let amount = 0;
      if (adj.calculationType === 'fixed') {
        amount = adj.value;
      } else {
        amount = retailValueIncVat * (adj.value / 100);
      }
      
      adj.calculatedAmount = amount; // update inline for render

      if (adj.type === 'discount') discountTotal += amount;
      if (adj.type === 'addition') additionTotal += amount;
      if (adj.type === 'internal_expense') internalExpenseTotal += amount;
    });

    const finalQuotePriceIncVat = retailValueIncVat - discountTotal + additionTotal;
    const netProfit = finalQuotePriceIncVat - purchaseCostIncVat - internalExpenseTotal;
    const profitMarginPercent = finalQuotePriceIncVat > 0 ? (netProfit / finalQuotePriceIncVat) * 100 : 0;

    return {
      purchaseCostExVat,
      inputVat: purchaseCostIncVat - purchaseCostExVat,
      purchaseCostIncVat,
      
      retailValueExVat,
      outputVat: retailValueIncVat - retailValueExVat,
      retailValueIncVat,
      
      discountTotal,
      additionTotal,
      internalExpenseTotal,
      
      finalQuotePriceIncVat,
      netProfit,
      profitMarginPercent,
      
      totalOfferUnits,
      totalPieces
    };
  }, [cartItems, adjustments]);

  const handlePriceChange = (productId: string, newPriceIncVat: number, vatRate: number) => {
    const newPriceExVat = newPriceIncVat / (1 + vatRate);
    onUpdateItem(productId, {
      unitSellingPriceIncVat: newPriceIncVat,
      unitSellingPriceExVat: newPriceExVat
    });
  };

  const addAdjustment = (type: 'discount' | 'addition' | 'internal_expense') => {
    setAdjustments([...adjustments, {
      id: Date.now().toString(),
      name: type === 'discount' ? 'خصم جديد' : type === 'addition' ? 'إضافة جديدة' : 'مصروف داخلي',
      type,
      calculationType: 'fixed',
      value: 0,
      calculatedAmount: 0
    }]);
  };

  const removeAdjustment = (id: string) => {
    setAdjustments(adjustments.filter(a => a.id !== id));
  };

  const updateAdjustment = (id: string, updates: Partial<QuoteAdjustment>) => {
    setAdjustments(adjustments.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleSave = async (status: 'draft' | 'approved') => {
    if (cartItems.length === 0) {
      setSaveError('لا يمكن حفظ عرض فارغ');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const quoteData = {
        id: editingQuote?.id, // If it exists, update it
        companyId,
        title,
        status,
        customerName,
        customerPhone,
        validUntil,
        items: cartItems.map(item => ({
          ...item,
          linePurchaseCostExVat: item.unitPurchaseCostExVat * item.quantity,
          linePurchaseCostIncVat: item.unitPurchaseCostIncVat * item.quantity,
          lineSellingPriceExVat: item.unitSellingPriceExVat * item.quantity,
          lineSellingPriceIncVat: item.unitSellingPriceIncVat * item.quantity,
        })),
        adjustments,
        totals
      };

      let response;
      if (editingQuote?.id) {
        response = await quoteService.updateQuote(quoteData);
      } else {
        response = await quoteService.createQuote(quoteData);
      }

      if (response.success) {
        toast.success(status === 'draft' ? 'تم حفظ العرض كمسودة' : 'تم اعتماد عرض السعر بنجاح');
        onSaveSuccess();
      } else {
        setSaveError(response.message || 'فشل حفظ العرض');
      }
    } catch (err: any) {
      setSaveError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsSaving(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">العرض فارغ</h2>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          لم تقم بإضافة أي وحدات عرض بعد. يرجى الذهاب إلى الكتالوج لإضافة المنتجات وبناء العرض.
        </p>
      </div>
    );
  }

  const marginWarning = totals.profitMarginPercent < 5; // Example warning threshold

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Items and Adjustments */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-bold text-slate-800">محتويات العرض</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => {
              if (confirm('هل أنت متأكد من تصفير القائمة؟')) onClearCart();
            }} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
              <Trash2 className="w-4 h-4 ml-1" /> تفريغ العرض
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-500 text-xs border-b">
                  <tr>
                    <th className="px-3 py-3 font-medium">المنتج</th>
                    <th className="px-3 py-3 font-medium text-center">الكمية (وحدة)</th>
                    <th className="px-3 py-3 font-medium text-center">التكلفة (بدون)</th>
                    <th className="px-3 py-3 font-medium text-center">التكلفة (شامل)</th>
                    <th className="px-3 py-3 font-medium text-center">سعر البيع (بدون)</th>
                    <th className="px-3 py-3 font-medium text-center">سعر البيع (شامل)</th>
                    <th className="px-3 py-3 font-medium text-center">إجمالي البيع</th>
                    <th className="px-3 py-3 font-medium text-center">الربح</th>
                    <th className="px-3 py-3 font-medium text-center">الهامش</th>
                    <th className="px-2 py-3 w-8"></th>
                  </tr>
                </thead>
                                <tbody className="divide-y divide-slate-100">
                  {cartItems.map(item => {
                    const totalCost = item.unitPurchaseCostExVat * item.quantity;
                    const totalSale = item.unitSellingPriceExVat * item.quantity;
                    const profit = totalSale - totalCost;
                    const margin = totalSale > 0 ? (profit / totalSale) * 100 : 0;
                    
                    return (
                    <tr key={item.productId} className="hover:bg-slate-50/30 transition-colors text-sm">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-white rounded border border-slate-100 p-1 flex-shrink-0">
                            <img src={getProductImageUrl(item.sku, item.imageUrl, item as any)} alt={item.productName} className="w-full h-full object-contain" onError={handleImageError} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 line-clamp-1 text-xs">{item.productName}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.sku} | <span className="font-medium text-indigo-600">وحدة/حبة</span></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => onUpdateItem(item.productId, { quantity: Math.max(1, item.quantity - 1) })}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                          >-</button>
                          <span className="w-8 text-center font-bold text-slate-700 text-xs">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateItem(item.productId, { quantity: item.quantity + 1 })}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                          >+</button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-slate-600 font-medium">
                        {item.unitPurchaseCostExVat.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center text-slate-500 text-xs">
                        {item.unitPurchaseCostIncVat.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitSellingPriceExVat === 0 ? '' : Number(item.unitSellingPriceExVat.toFixed(2))}
                          onChange={(e) => {
                             const val = parseFloat(e.target.value) || 0;
                             onUpdateItem(item.productId, { unitSellingPriceExVat: val, unitSellingPriceIncVat: val * (1 + item.vatRate) });
                          }}
                          className="w-20 text-center border-b border-slate-300 focus:border-indigo-500 focus:outline-none bg-transparent font-bold text-indigo-700 pb-0.5"
                        />
                      </td>
                      <td className="px-3 py-3 text-center text-slate-600 text-xs font-medium">
                        {item.unitSellingPriceIncVat.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-slate-800">
                        {totalSale.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-emerald-600">
                        {profit.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-emerald-700 bg-emerald-50 rounded">
                        {margin.toFixed(1)}%
                      </td>
                      <td className="px-2 py-3 text-left">
                        <button 
                          onClick={() => onRemoveItem(item.productId)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Adjustments Section */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
            <CardTitle className="text-lg font-bold text-slate-800">التسويات الإضافية</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {adjustments.map((adj) => (
              <div key={adj.id} className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className={`px-3 py-1 rounded text-xs font-bold ${
                  adj.type === 'discount' ? 'bg-rose-100 text-rose-700' :
                  adj.type === 'addition' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {adj.type === 'discount' ? 'خصم' : adj.type === 'addition' ? 'إضافة' : 'مصروف داخلي'}
                </div>
                
                <input 
                  value={adj.name} 
                  onChange={e => updateAdjustment(adj.id, { name: e.target.value })} 
                  className="w-40 h-9" 
                  placeholder="وصف البند" 
                />
                
                <select 
                  className="h-9 rounded-md border border-slate-300 px-3 text-sm bg-white"
                  value={adj.calculationType}
                  onChange={e => updateAdjustment(adj.id, { calculationType: e.target.value as any })}
                >
                  <option value="fixed">مبلغ ثابت</option>
                  <option value="percentage">نسبة %</option>
                </select>
                
                <div className="relative w-24">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {adj.calculationType === 'fixed' ? <DollarSign className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                  </div>
                  <input 
                    type="number" min="0" step="0.01"
                    value={adj.value || ''} 
                    onChange={e => updateAdjustment(adj.id, { value: parseFloat(e.target.value) || 0 })} 
                    className="h-9 pl-8 text-left" dir="ltr"
                  />
                </div>
                
                <div className="flex-1 text-left font-semibold text-slate-700">
                  {adj.calculatedAmount.toFixed(2)} ر.س
                </div>
                
                <button onClick={() => removeAdjustment(adj.id)} className="text-rose-400 hover:text-rose-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => addAdjustment('discount')} className="text-rose-600 border-rose-200 hover:bg-rose-50">
                <Plus className="w-4 h-4 ml-1" /> إضافة خصم
              </Button>
              <Button variant="outline" size="sm" onClick={() => addAdjustment('addition')} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                <Plus className="w-4 h-4 ml-1" /> إضافة رسوم
              </Button>
              <Button variant="outline" size="sm" onClick={() => addAdjustment('internal_expense')} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                <Plus className="w-4 h-4 ml-1" /> مصروف داخلي
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Totals and Save */}
      <div className="space-y-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
            <CardTitle className="text-lg font-bold text-slate-800">بيانات العرض</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">عنوان العرض</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: عرض توريد لشركة أحمد" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">اسم العميل</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">رقم الجوال</label>
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} dir="ltr" className="text-right" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">صالح حتى</label>
              <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <CardHeader className="py-4 pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">الفاتورة النهائية للعرض</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>وحدات العرض</span>
                <span className="font-semibold text-slate-800">{totals.totalOfferUnits} وحدة</span>
              </div>
              {totals.totalPieces > 0 && (
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>القطع الداخلية المتاحة للحساب</span>
                  <span>{totals.totalPieces} قطعة</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm border-b border-slate-100 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>قيمة السلع (بدون ضريبة)</span>
                <span>{totals.retailValueExVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ضريبة المبيعات</span>
                <span>{totals.outputVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800 pt-1">
                <span>إجمالي السلع (شامل)</span>
                <span>{totals.retailValueIncVat.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm border-b border-slate-100 pb-3">
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>إجمالي الخصومات (-)</span>
                  <span>{totals.discountTotal.toFixed(2)}</span>
                </div>
              )}
              {totals.additionTotal > 0 && (
                <div className="flex justify-between text-indigo-600">
                  <span>إجمالي الإضافات (+)</span>
                  <span>{totals.additionTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-base font-bold text-slate-900">القيمة النهائية للعميل</span>
                <div className="text-2xl font-bold text-emerald-600">
                  {totals.finalQuotePriceIncVat.toFixed(2)} <span className="text-sm font-normal text-slate-500">ر.س</span>
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg border ${marginWarning ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">صافي الربح المتوقع</span>
                <span className={`font-bold ${totals.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {totals.netProfit.toFixed(2)} ر.س
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">هامش الربح</span>
                <span className={`font-bold ${marginWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {totals.profitMarginPercent.toFixed(1)}%
                </span>
              </div>
              {marginWarning && (
                <div className="text-[10px] text-amber-700 mt-2 bg-amber-100/50 p-1.5 rounded">
                  تحذير: هامش الربح منخفض، قد يتطلب العرض موافقة الإدارة.
                </div>
              )}
            </div>

            {saveError && (
              <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                {saveError}
              </div>
            )}

            <div className="pt-4 grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="w-full text-slate-700 hover:bg-slate-50"
              >
                {isSaving ? 'جاري الحفظ...' : 'حفظ كمسودة'}
              </Button>
              <Button 
                onClick={() => handleSave('approved')}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isSaving ? 'جاري الاعتماد...' : 'اعتماد العرض'}
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
