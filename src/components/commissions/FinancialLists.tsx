import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { RequiredAmountItem, PaymentItem, DiscountItem, PaymentMethod } from '@/types/commissions';
import { Button } from '@/components/ui/button';

interface RequiredAmountListProps {
  items: RequiredAmountItem[];
  onChange: (items: RequiredAmountItem[]) => void;
}

export function RequiredAmountList({ items, onChange }: RequiredAmountListProps) {
  items = items || [];
  const handleAdd = () => {
    onChange([...items, { id: Date.now().toString(), description: '', amount: 0 }]);
  };
  
  const handleRemove = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };
  
  const updateItem = (id: string, field: keyof RequiredAmountItem, value: any) => {
    onChange(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-700">تفاصيل المبالغ المطلوبة</label>
        <Button variant="outline" size="sm" onClick={handleAdd} className="h-7 text-xs border-slate-200 text-slate-700 hover:bg-slate-50">
          <Plus className="w-3 h-3 mr-1" /> إضافة مبلغ مطلوب
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4 border rounded border-dashed bg-slate-50">لا توجد مبالغ مطلوبة. أضف مبلغاً للاستمرار.</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex gap-2 items-center bg-white p-2 rounded border border-slate-200 shadow-sm">
              <input
                type="text"
                className="flex-1 p-2 rounded-md border border-slate-300 text-sm outline-none focus:border-indigo-500"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="وصف المبلغ (مثل: فواتير أمس)"
              />
              <input
                type="number"
                min="0"
                className="w-28 p-2 rounded-md border border-slate-300 text-sm outline-none focus:border-indigo-500"
                value={item.amount || ''}
                onChange={(e) => updateItem(item.id, 'amount', Number(e.target.value))}
                placeholder="المبلغ"
              />
              <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 px-1 text-sm">
             <span className="font-bold text-slate-700">الإجمالي:</span>
             <span className="font-bold text-slate-900">{items.reduce((s, i) => s + (Number(i.amount)||0), 0).toFixed(2)} ر.س</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface PaymentListProps {
  items: PaymentItem[];
  onChange: (items: PaymentItem[]) => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'ZID', label: 'ZID' },
  { value: 'BALANCE', label: 'موازنة' },
  { value: 'CASH', label: 'كاش' },
  { value: 'INTERMEDIARY_ACCOUNT', label: 'حساب وسيط' },
  { value: 'BANK_TRANSFER', label: 'تحويل بنكي' },
  { value: 'STC_PAY', label: 'STC Pay' },
  { value: 'CREDIT_SALE', label: 'بيع آجل' },
  { value: 'OTHER', label: 'أخرى' },
];


function FormattedAmountInput({ value, onChange, placeholder, className }: { value: number, onChange: (val: number) => void, placeholder: string, className: string }) {
  const [localVal, setLocalVal] = React.useState(value ? value.toLocaleString('en-US') : '');

  React.useEffect(() => {
    const numericLocal = parseFloat(localVal.replace(/,/g, '')) || 0;
    if (numericLocal !== (value || 0)) {
      setLocalVal(value ? value.toLocaleString('en-US') : '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9.,]/g, '');
    setLocalVal(raw);
    
    const numericStr = raw.replace(/,/g, '');
    const num = parseFloat(numericStr);
    if (!isNaN(num)) {
      onChange(num);
    } else if (raw === '') {
      onChange(0);
    }
  };

  const handleBlur = () => {
    const numericStr = localVal.replace(/,/g, '');
    const num = parseFloat(numericStr);
    if (!isNaN(num)) {
      setLocalVal(num.toLocaleString('en-US'));
    }
  };

  return (
    <input
      type="text"
      className={className}
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
}

export function PaymentList({ items, onChange }: PaymentListProps) {
  items = items || [];
  const handleAdd = () => {
    onChange([...items, { id: Date.now().toString(), method: 'CASH', description: '', amount: 0 }]);
  };
  
  const handleRemove = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };
  
  const updateItem = (id: string, field: keyof PaymentItem, value: any) => {
    onChange(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100 mt-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-700">تفاصيل الدفعات والتسويات</label>
        <Button variant="outline" size="sm" onClick={handleAdd} className="h-7 text-xs border-slate-200 text-slate-700 hover:bg-slate-50">
          <Plus className="w-3 h-3 mr-1" /> إضافة دفعة
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4 border rounded border-dashed bg-slate-50">لا توجد دفعات أو تسويات.</p>
      ) : (
        <div className="space-y-4 md:space-y-2">
          {/* Header row for desktop */}
          <div className="hidden md:flex gap-2 px-2 text-xs font-semibold text-slate-500 text-right">
            <div style={{ width: '30%' }}>نوع العملية</div>
            <div style={{ width: '30%' }}>وصف العملية (اختياري)</div>
            <div style={{ width: '40%' }}>المبلغ المطلوب</div>
            <div className="w-8 shrink-0"></div>
          </div>
          {items.map(item => {
            const isDescInvalid = /^\d+(\.\d+)?$/.test((item.description || '').trim());
            
            return (
              <div key={item.id} className="flex flex-col md:flex-row gap-2 md:items-start bg-white p-3 md:p-2 rounded-lg border border-slate-200 shadow-sm relative">
                
                {/* Payment Type */}
                <div className="w-full md:w-[30%]">
                  <label className="block md:hidden text-xs text-slate-500 mb-1">نوع العملية</label>
                  <select
                    className="w-full p-2.5 md:p-2 rounded-md border border-slate-300 text-sm outline-none focus:border-indigo-500 bg-white"
                    value={item.method}
                    onChange={(e) => updateItem(item.id, 'method', e.target.value)}
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="w-full md:w-[30%]">
                  <label className="block md:hidden text-xs text-slate-500 mb-1">وصف العملية (اختياري)</label>
                  <input
                    type="text"
                    className={`w-full p-2.5 md:p-2 rounded-md border text-sm outline-none ${isDescInvalid ? 'border-red-400 focus:border-red-500 bg-red-50 text-red-900' : 'border-slate-300 focus:border-indigo-500'}`}
                    value={item.description || ''}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="مثال: تسوية فاتورة رقم 1058"
                  />
                  {isDescInvalid && (
                    <p className="text-red-500 text-xs mt-1">هذا الحقل مخصص لوصف العملية فقط، أدخل المبلغ في حقل المبلغ المطلوب.</p>
                  )}
                </div>

                {/* Amount */}
                <div className="w-full md:w-[40%] flex items-start gap-2">
                  <div className="flex-1">
                    <label className="block md:hidden text-xs text-slate-500 mb-1">المبلغ المطلوب</label>
                    <div className="flex items-center gap-2 w-full p-2 rounded-md border-2 border-slate-300 focus-within:border-indigo-600 focus-within:bg-indigo-50 bg-white shadow-sm transition-colors overflow-hidden">
                      <FormattedAmountInput
                        value={item.amount || 0}
                        onChange={(val) => updateItem(item.id, 'amount', val)}
                        placeholder="0.00"
                        className="w-full text-lg font-bold text-indigo-700 outline-none bg-transparent tabular-nums text-left"
                      />
                      <span className="text-sm font-bold text-slate-500 shrink-0 select-none">ر.س</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="mt-6 md:mt-0 text-red-500 hover:text-red-700 p-2.5 md:p-2 rounded-md hover:bg-red-50 transition-colors shrink-0"
                    title="حذف الدفعة"
                  >
                    <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between items-center pt-3 px-2 text-sm border-t border-slate-100">
             <span className="font-bold text-slate-700">الإجمالي:</span>
             <span className="font-bold text-indigo-700 text-base">{items.reduce((s, i) => s + (Number(i.amount)||0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</span>
          </div>
        </div>
      )}
    </div>
  );
}
interface DiscountListProps {
  items: DiscountItem[];
  onChange: (items: DiscountItem[]) => void;
}

export function DiscountList({ items, onChange }: DiscountListProps) {
  items = items || [];
  const handleAdd = () => {
    onChange([...items, { id: Date.now().toString(), description: 'ZID', amount: 0 }]);
  };
  
  const handleRemove = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };
  
  const updateItem = (id: string, field: keyof DiscountItem, value: any) => {
    onChange(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100 mt-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-slate-700">الخصومات</label>
        <Button variant="outline" size="sm" onClick={handleAdd} className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          <Plus className="w-3 h-3 mr-1" /> إضافة خصم
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2 border rounded border-dashed">لا توجد خصومات مطبقة</p>
      ) : (
        <div className="space-y-2">
          {items.map(discount => (
            <div key={discount.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
              <select
                 className="flex-1 p-2 rounded border border-slate-300 text-sm outline-none focus:border-emerald-500 bg-white"
                value={discount.description}
                onChange={(e) => updateItem(discount.id, 'description', e.target.value)}
              >
                <option value="ZID">خصم ZID</option>
                <option value="خصم آخر">خصم آخر</option>
              </select>
              <input
                type="number"
                min="0"
                className="w-28 p-2 rounded border border-slate-300 text-sm outline-none focus:border-emerald-500"
                value={discount.amount || ''}
                onChange={(e) => updateItem(discount.id, 'amount', Number(e.target.value))}
                placeholder="المبلغ"
              />
              <button onClick={() => handleRemove(discount.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 px-1 text-sm">
             <span className="font-bold text-slate-700">الإجمالي:</span>
             <span className="font-bold text-red-600">-{items.reduce((s, i) => s + (Number(i.amount)||0), 0).toFixed(2)} ر.س</span>
          </div>
        </div>
      )}
    </div>
  );
}
