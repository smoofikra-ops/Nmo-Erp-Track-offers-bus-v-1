import React, { useState, useMemo } from 'react';
import { CommissionRecord, CommissionRevision, RequiredAmountItem, PaymentItem, DiscountItem } from '@/types';
import { X, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RequiredAmountList, PaymentList, DiscountList } from './FinancialLists';

interface EditCommissionRecordModalProps {
  record: CommissionRecord;
  onClose: () => void;
  onSave: (updatedRecord: CommissionRecord, reason: string) => Promise<void>;
  adminUser: { id: string; name: string; role: string };
}


const safeParse = (data: any, fallback: any[] = []) => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    if (!data.trim()) return fallback;
    try {
      return JSON.parse(data);
    } catch (e) {
      console.warn("Failed to parse JSON string:", data);
      return fallback;
    }
  }
  return fallback;
};

export function EditCommissionRecordModal({ record, onClose, onSave, adminUser }: EditCommissionRecordModalProps) {
  if (!record) return null;
  const [grossCommission, setGrossCommission] = useState(record.grossCommission || 0);
  const [requiredItems, setRequiredItems] = useState<RequiredAmountItem[]>(safeParse(record.requiredItems));
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>(safeParse(record.paymentItems));
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>(safeParse(record.discounts));
  const [editReason, setEditReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Recalculations
  const numTotalRequired = useMemo(() => (requiredItems || []).reduce((sum, item) => sum + (Number(item?.amount) || 0), 0), [requiredItems]);
  const numOnlinePaid = useMemo(() => (paymentItems || []).reduce((sum, item) => sum + (Number(item?.amount) || 0), 0), [paymentItems]);
  const numTotalDiscounts = useMemo(() => (discountItems || []).reduce((sum, item) => sum + (Number(item?.amount) || 0), 0), [discountItems]);
  
  const amountBeforeCommission = numTotalRequired - numOnlinePaid - numTotalDiscounts;
  const finalRequiredAmount = amountBeforeCommission - grossCommission;
  const isFinalAmountNegative = finalRequiredAmount < 0;

  const handleSave = async () => {
    if (!editReason.trim()) {
      alert('الرجاء إدخال سبب التعديل.');
      return;
    }
    
    // Build changes array
    const changes: any[] = [];
    if (record.grossCommission !== grossCommission) {
      changes.push({ field: 'العمولة (Commission)', oldValue: record.grossCommission, newValue: grossCommission });
    }
    if (record.totalRequiredAmount !== numTotalRequired) {
      changes.push({ field: 'المبلغ المطلوب (Required Amount)', oldValue: record.totalRequiredAmount, newValue: numTotalRequired });
    }
    if (record.onlinePaidAmount !== numOnlinePaid) {
      changes.push({ field: 'المدفوع أونلاين / كاش (Payments)', oldValue: record.onlinePaidAmount, newValue: numOnlinePaid });
    }
    if (record.totalDiscount !== numTotalDiscounts) {
      changes.push({ field: 'الخصومات (Discounts)', oldValue: record.totalDiscount || 0, newValue: numTotalDiscounts });
    }

    // Check individual payment items for detailed description change
    const oldPayments = safeParse(record.paymentItems);
    paymentItems.forEach(pi => {
      const oldPi = oldPayments.find(o => o.id === pi.id);
      if (oldPi && (oldPi.amount !== pi.amount || oldPi.description !== pi.description || oldPi.method !== pi.method)) {
        changes.push({ 
          field: `دفعة (${pi.method})`, 
          oldValue: `${oldPi.description || ''} - ${oldPi.amount}`, 
          newValue: `${pi.description || ''} - ${pi.amount}` 
        });
      }
    });

    if (changes.length === 0) {
      alert('لم تقم بإجراء أي تعديلات!');
      return;
    }

    const previousRecordSnapshot = JSON.parse(JSON.stringify(record));
    delete previousRecordSnapshot.revisions;
    delete previousRecordSnapshot.auditLogs;

    const newRevision: CommissionRevision = {
      version: (record.version || 1) + 1,
      editedBy: { id: adminUser.id, name: adminUser.name, role: adminUser.role },
      editedAt: new Date().toISOString(),
      editReason: editReason.trim(),
      changes,
      previousRecord: previousRecordSnapshot
    };

    const updatedRecord: CommissionRecord = {
      ...record,
      grossCommission,
      netCommission: grossCommission,
      totalDiscount: numTotalDiscounts,
      totalDiscounts: numTotalDiscounts,
      totalRequiredAmount: numTotalRequired,
      totalOrderValue: numTotalRequired,
      onlinePaidAmount: numOnlinePaid,
      finalRequiredAmount,
      codRequiredAmount: finalRequiredAmount,
      remainingBalance: finalRequiredAmount,
      requiredItems,
      paymentItems,
      discounts: discountItems,
      revisions: [...safeParse(record.revisions), newRevision],
      version: newRevision.version,
      lastModifiedBy: { id: adminUser.id, name: adminUser.name },
      lastModifiedAt: newRevision.editedAt,
    };

    setIsSaving(true);
    try {
      await onSave(updatedRecord, editReason.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">تعديل سجل عمولة</h2>
            <p className="text-sm text-slate-500 mt-1 font-mono">{record.transactionNo}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-right" dir="rtl">
          
          {/* Summary / Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">أنت تقوم بتعديل سجل مالي</p>
              <p>يجب إدخال سبب التعديل. سيتم حفظ جميع التعديلات في سجل التدقيق المالي.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">العمولة (إجمالي)</label>
              <input 
                type="number" 
                className="w-full p-3 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                value={grossCommission}
                onChange={e => setGrossCommission(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <RequiredAmountList items={requiredItems} onChange={setRequiredItems} />
          <PaymentList items={paymentItems} onChange={setPaymentItems} />
          <DiscountList items={discountItems} onChange={setDiscountItems} />

          {/* Recalculation Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-500" /> نتيجة إعادة الحساب
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">المبلغ المطلوب (COD):</span>
                <span className={`font-black ${isFinalAmountNegative ? 'text-red-600' : 'text-slate-900'}`}>
                  {finalRequiredAmount.toFixed(2)} ر.س
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">صافي العمولة:</span>
                <span className="font-black text-emerald-700">{grossCommission.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          {/* Edit Reason */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">سبب التعديل (إلزامي) <span className="text-red-500">*</span></label>
            <textarea
              className="w-full p-3 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none min-h-[80px]"
              placeholder="مثال: تصحيح إدخال خاطئ في المبلغ النقدي..."
              value={editReason}
              onChange={e => setEditReason(e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>إلغاء</Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold px-6"
            onClick={handleSave}
            disabled={isSaving || !editReason.trim()}
          >
            <Save className="w-4 h-4" /> 
            {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </Button>
        </div>

      </div>
    </div>
  );
}
