import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, Printer, FileEdit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quoteService } from '@/services/quoteService';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminSecurityContext';
import { Quote } from '@/types/quotes';
import { PrintLayout } from './PrintLayout';

interface HistoryTabProps {
  onEditQuote: (quote: Quote) => void;
}

export function HistoryTab({ onEditQuote }: HistoryTabProps) {
  const { user } = useAuth();
  const { requireAdminAuth } = useAdminAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [printingQuote, setPrintingQuote] = useState<Quote | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['quotes', companyId],
    queryFn: () => quoteService.getQuotes(companyId),
    enabled: Boolean(companyId),
  });

  const quotes = response?.data || [];

  const filteredQuotes = quotes.filter(q => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return (
      (q.title && q.title.toLowerCase().includes(lowerSearch)) ||
      (q.quoteNumber && q.quoteNumber.toLowerCase().includes(lowerSearch)) ||
      (q.customerName && q.customerName.toLowerCase().includes(lowerSearch))
    );
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => quoteService.changeQuoteStatus(id, status, companyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes', companyId] })
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-teal-100 text-teal-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      case 'cancelled': return 'bg-gray-200 text-gray-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'approved': return 'معتمد';
      case 'sent': return 'مرسل';
      case 'accepted': return 'مقبول';
      case 'rejected': return 'مرفوض';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (printingQuote) {
    return (
      <div className="bg-slate-100 p-4 min-h-screen">
        <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center no-print bg-white p-4 rounded shadow-sm">
          <Button variant="outline" onClick={() => setPrintingQuote(null)}>العودة</Button>
          <Button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Printer className="w-4 h-4" /> طباعة
          </Button>
        </div>
        <div id="quote-print-area">
          <PrintLayout quote={printingQuote} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <p>جاري تحميل العروض...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث برقم العرض أو العميل أو العنوان..."
            className="w-full h-10 rounded-full border border-slate-300 pr-10 pl-4 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">رقم العرض</th>
                <th className="px-4 py-3 font-medium">تاريخ الإنشاء</th>
                <th className="px-4 py-3 font-medium">العميل</th>
                <th className="px-4 py-3 font-medium">القيمة النهائية</th>
                <th className="px-4 py-3 font-medium">الربح</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    لا توجد عروض محفوظة
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{quote.quoteNumber || quote.id.slice(-6)}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(quote.createdAt || Date.now()).toLocaleDateString('ar-SA')}</td>
                    <td className="px-4 py-3 text-slate-800">
                      <div>{quote.customerName || 'بدون عميل'}</div>
                      <div className="text-xs text-slate-500">{quote.title}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">
                      {quote.totals.finalQuotePriceIncVat?.toFixed(2) || '0.00'} ر.س
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{quote.totals.netProfit?.toFixed(2) || '0.00'} ر.س</div>
                      <div className="text-xs">{quote.totals.profitMarginPercent?.toFixed(1) || '0'}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(quote.status)}`}>
                        {getStatusText(quote.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-reverse space-x-2">
                      <button onClick={() => setPrintingQuote(quote)} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded" title="طباعة">
                        <Printer className="w-4 h-4" />
                      </button>
                      
                      {quote.status === 'draft' && (
                        <button onClick={() => requireAdminAuth('تعديل عرض سعر', () => onEditQuote(quote))} className="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded" title="تعديل">
                          <FileEdit className="w-4 h-4" />
                        </button>
                      )}

                      {quote.status === 'draft' && (
                        <button onClick={() => {
                          requireAdminAuth('تغيير حالة عرض سعر', () => {
                            if (confirm('هل أنت متأكد من اعتماد العرض؟')) statusMutation.mutate({ id: quote.id, status: 'approved' });
                          });
                        }} className="p-1.5 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded" title="اعتماد">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
