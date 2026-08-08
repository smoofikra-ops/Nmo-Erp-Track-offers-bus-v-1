const fs = require('fs');

let code = fs.readFileSync('src/components/commissions/FinancialLists.tsx', 'utf8');

const amountInput = `
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
`;

const newPaymentList = `export function PaymentList({ items, onChange }: PaymentListProps) {
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
          <div className="hidden md:flex gap-2 px-2 text-xs font-semibold text-slate-500">
            <div style={{ width: '30%' }}>نوع الدفع</div>
            <div style={{ width: '45%' }}>الوصف (اختياري)</div>
            <div style={{ width: '25%' }}>المبلغ المحصل</div>
            <div className="w-8"></div>
          </div>

          {items.map(item => {
            const isDescInvalid = /^\\d/.test(item.description || '');
            
            return (
              <div key={item.id} className="flex flex-col md:flex-row gap-2 md:items-start bg-white p-3 md:p-2 rounded-lg border border-slate-200 shadow-sm relative">
                
                {/* Payment Type */}
                <div className="w-full md:w-[30%]">
                  <label className="block md:hidden text-xs text-slate-500 mb-1">نوع الدفع</label>
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
                <div className="w-full md:w-[45%]">
                  <label className="block md:hidden text-xs text-slate-500 mb-1">الوصف (اختياري)</label>
                  <input
                    type="text"
                    className={\`w-full p-2.5 md:p-2 rounded-md border text-sm outline-none \${isDescInvalid ? 'border-red-400 focus:border-red-500 bg-red-50 text-red-900' : 'border-slate-300 focus:border-indigo-500'}\`}
                    value={item.description || ''}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="مثال: فاتورة #1058"
                  />
                  {isDescInvalid && (
                    <p className="text-red-500 text-xs mt-1">هذا الحقل للوصف فقط.</p>
                  )}
                </div>

                {/* Amount */}
                <div className="w-full md:w-[25%] flex items-start gap-2">
                  <div className="flex-1">
                    <label className="block md:hidden text-xs text-slate-500 mb-1">المبلغ المحصل</label>
                    <FormattedAmountInput
                      value={item.amount || 0}
                      onChange={(val) => updateItem(item.id, 'amount', val)}
                      placeholder="مثال: 250.00"
                      className="w-full p-2.5 md:p-2 rounded-md border border-slate-300 text-sm outline-none focus:border-indigo-500"
                    />
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
`;

if (!code.includes('FormattedAmountInput')) {
  // Regex to remove old PaymentList
  const oldPaymentListRegex = /export function PaymentList\(\{ items, onChange \}: PaymentListProps\) \{[\s\S]*?(?=interface DiscountListProps)/;
  code = code.replace(oldPaymentListRegex, amountInput + '\n' + newPaymentList + '\n\n');
  fs.writeFileSync('src/components/commissions/FinancialLists.tsx', code);
}
