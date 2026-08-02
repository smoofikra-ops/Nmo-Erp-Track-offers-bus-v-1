const fs = require('fs');
let code = fs.readFileSync('src/pages/Commissions/OrderCountCommission.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { CommissionRecord, AppliedDiscount } from '@/types/commissions';",
  "import { CommissionRecord, AppliedDiscount, RequiredAmountItem, PaymentItem, DiscountItem } from '@/types/commissions';\nimport { RequiredAmountList, PaymentList, DiscountList } from './components/FinancialLists';"
);

// 2. Replace state declarations
code = code.replace(
  "const [totalRequiredAmount, setTotalRequiredAmount] = useState<number | ''>('');\n  const [onlinePaidAmount, setOnlinePaidAmount] = useState<number | ''>('');\n  const [discounts, setDiscounts] = useState<AppliedDiscount[]>([]);",
  `const [requiredItems, setRequiredItems] = useState<RequiredAmountItem[]>([]);
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);`
);

// 3. Update calculations
code = code.replace(
  /const numTotalRequired = Number\(totalRequiredAmount\) \|\| 0;\n  const numOnlinePaid = Number\(onlinePaidAmount\) \|\| 0;\n  const numTotalDiscounts = discounts\.reduce\(\(sum, d\) => sum \+ \(Number\(d\.amount\) \|\| 0\), 0\);/g,
  `const numTotalRequired = requiredItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const numOnlinePaid = paymentItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const numTotalDiscounts = discountItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const amountBeforeCommission = numTotalRequired - numOnlinePaid - numTotalDiscounts;`
);

// 4. Update final amount calculation
code = code.replace(
  "const finalRequiredAmount = numTotalRequired - numOnlinePaid - numTotalDiscounts;",
  "const finalRequiredAmount = amountBeforeCommission - grossCommission;"
);

// 5. Update Record Builder
code = code.replace(
  /discounts: discounts\.filter\(\(d\) => d\.amount > 0\),/g,
  `discounts: discountItems.map(d => ({ id: d.id, name: d.description, amount: d.amount })).filter(d => d.amount > 0),
      requiredItems: requiredItems.filter(i => i.amount > 0 && i.description.trim() !== ''),
      paymentItems: paymentItems.filter(i => i.amount > 0 && i.method),
      discountItems: discountItems.filter(d => d.amount > 0),`
);

// 6. Update Validation
code = code.replace(
  "const canProceedToSummary = selectedEmployeeId && numOrdersCount > 0;",
  "const canProceedToSummary = selectedEmployeeId && numOrdersCount > 0 && requiredItems.every(i => i.description.trim() !== '' && Number(i.amount) >= 0) && paymentItems.every(i => Number(i.amount) >= 0 && (i.method !== 'OTHER' || (i.description && i.description.trim() !== '')));"
);

// 7. Remove old discount handlers
code = code.replace(
  /const handleAddDiscount = \(\) => {[\s\S]*?};[\s\S]*?const updateDiscount = \([\s\S]*?};/g,
  ""
);

// 8. Replace UI elements in Step 1
code = code.replace(
  /<div className="space-y-1\.5">\s*<label className="text-sm font-medium text-slate-700">إجمالي المبلغ المطلوب تحصيله من المندوب<\/label>[\s\S]*?<div className="pt-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `<RequiredAmountList items={requiredItems} onChange={setRequiredItems} />
                  <PaymentList items={paymentItems} onChange={setPaymentItems} />
                  <DiscountList items={discountItems} onChange={setDiscountItems} />`
);

// 9. Update Step 2 Summary Section
code = code.replace(
  /التفاصيل المالية والتحصيل<\/h4>[\s\S]*?<\/div>\s*<\/div>/,
  `التفاصيل المالية والتحصيل</h4>
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 text-sm">إجمالي المبلغ المطلوب:</span>
                      <span className="font-bold text-slate-900">{numTotalRequired.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 text-sm">إجمالي الدفعات والتسويات:</span>
                      <span className="font-bold text-blue-700">{numOnlinePaid.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 text-sm">إجمالي الخصومات:</span>
                      <span className="font-bold text-red-600">-{numTotalDiscounts.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center py-2 mt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 text-sm">المبلغ قبل خصم العمولة:</span>
                      <span className="font-bold text-slate-900">{amountBeforeCommission.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600 text-sm">إجمالي عمولة المندوب:</span>
                      <span className="font-bold text-emerald-600">-{grossCommission.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-3 mt-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <span className="font-bold text-slate-800 text-sm">صافي المبلغ النهائي المطلوب من المندوب:</span>
                      <span className={cn("font-black text-lg", isFinalAmountNegative ? "text-red-600" : "text-slate-900")} dir="ltr">
                        {isFinalAmountNegative ? (
                          <span className="text-sm font-normal ml-1">(دائن) {Math.abs(finalRequiredAmount).toFixed(2)}</span>
                        ) : (
                          finalRequiredAmount.toFixed(2)
                        )} ر.س
                      </span>
                    </div>
                  </div>`
);

fs.writeFileSync('src/pages/Commissions/OrderCountCommission.tsx', code);
