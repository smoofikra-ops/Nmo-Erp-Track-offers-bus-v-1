import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { commissionService } from '@/services/commissionService';
import { Button } from '@/components/ui/button';
import { FileText, Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CommissionHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<any[]>([]);
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await commissionService.getCommissionReceipts(companyId);
      if (res.success && res.data) {
        setReceipts(res.data);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/commission')}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('commissions.history', 'History')}</h2>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Receipt #</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">System</th>
                <th className="px-6 py-4 font-medium">Net Commission</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              ) : receipts.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{r.ReceiptNumber}</td>
                  <td className="px-6 py-4">{r.ReceiptDate?.split('T')[0]}</td>
                  <td className="px-6 py-4">{r.CommissionSystem}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{r.NetCommission} SAR</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {r.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
