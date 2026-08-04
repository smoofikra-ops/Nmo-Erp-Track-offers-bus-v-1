const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

const badBlockRegex = /\{canViewFinancials && \([\s\S]*?\{?\/\* Financial Summary Breakdown \*\/\}?[\s\S]*?الملخص المالي التفصيلي:[\s\S]*?إغلاق[\s\S]*?<\/Button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

const fixedBlock = `
            {canViewFinancials && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">الملخص المالي التفصيلي:</h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                    <span>إجمالي قيمة الطلب:</span>
                    <span className="font-bold">{viewRecordModal.totalOrderValue.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>المبلغ المدفوع أونلاين:</span>
                    <span className="font-bold text-blue-700">{viewRecordModal.onlinePaidAmount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                    <span>المبلغ المطلوب تحصيله عند الاستلام (COD):</span>
                    <span className="font-bold text-amber-700">{viewRecordModal.codRequiredAmount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>إجمالي العمولة قبل الخصم:</span>
                    <span className="font-bold">{viewRecordModal.grossCommission.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                    <span>قيمة الخصومات المقتطعة:</span>
                    <span className="font-bold text-red-600">-{viewRecordModal.totalDiscount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between p-3 bg-emerald-50 text-emerald-950 font-bold text-sm">
                    <span>صافي العمولة المستحقة:</span>
                    <span className="font-black text-emerald-700 text-base">
                      {viewRecordModal.netCommission.toFixed(2)} ر.س
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                onClick={() => {
                  const rec = viewRecordModal;
                  setViewRecordModal(null);
                  setSelectedRecordForPrint(rec);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>طباعة الملخص الرسمية (Print Summary)</span>
              </Button>
              <Button variant="outline" onClick={() => setViewRecordModal(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
`;

// wait, to be safe, I'll just write a replace logic that uses indexOf
const startIdx = code.indexOf('{canViewFinancials && (');
const endIdx = code.indexOf('          </div>\n        </div>\n      )}', startIdx);
if (startIdx !== -1 && endIdx !== -1) {
  const before = code.substring(0, startIdx);
  const after = code.substring(endIdx + '          </div>\n        </div>\n      )}'.length);
  code = before + fixedBlock + after;
  fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
  console.log("Fixed syntax successfully");
} else {
  console.log("Could not find block boundaries");
}
