import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { quoteService } from '@/services/quoteService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { QuoteOffer, OfferStatus } from '@/types/quotes';
import { cn } from '@/utils/cn';

export function HistoryTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  const { data: response, isLoading } = useQuery({
    queryKey: ['quotes', companyId],
    queryFn: () => quoteService.getOffers(companyId),
    enabled: Boolean(companyId),
  });

  const quotes = response?.data || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b">
            <tr>
              <th className="px-4 py-3">{t('quotes.offerNumber', 'Quote Number')}</th>
              <th className="px-4 py-3">{t('quotes.quoteTitle', 'Title')}</th>
              <th className="px-4 py-3">{t('quotes.customerName', 'Customer Name')}</th>
              <th className="px-4 py-3">{t('quotes.date', 'Date')}</th>
              <th className="px-4 py-3">{t('quotes.status', 'Status')}</th>
              <th className="px-4 py-3 text-right">{t('quotes.finalPrice', 'Final Price')}</th>
              <th className="px-4 py-3 text-right">{t('quotes.profit', 'Profit')}</th>
              <th className="px-4 py-3 text-right">{t('common.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-500">
                  No quotes found
                </td>
              </tr>
            ) : (
              quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{quote.offerNumber}</td>
                  <td className="px-4 py-3">{quote.title}</td>
                  <td className="px-4 py-3">{quote.customerName}</td>
                  <td className="px-4 py-3">{new Date(quote.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      quote.status === OfferStatus.Draft ? 'bg-slate-100 text-slate-800' :
                      
                      quote.status === OfferStatus.Approved ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{quote.totals.customerFinalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                    {quote.totals.profitAmount.toFixed(2)} 
                    <span className="text-xs text-slate-500 block">({quote.totals.profitMarginPercent.toFixed(1)}%)</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
