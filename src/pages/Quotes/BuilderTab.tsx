import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { quoteService } from '@/services/quoteService';
import { OfferItem, OfferAdjustment, QuoteOffer, OfferStatus } from '@/types/quotes';
import { calculateOfferTotals, calculateOfferItem } from '@/features/quotes/utils/quoteCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calculator } from 'lucide-react';

interface BuilderTabProps {
  items: OfferItem[];
  setItems: React.Dispatch<React.SetStateAction<OfferItem[]>>;
  adjustments: OfferAdjustment[];
  setAdjustments: React.Dispatch<React.SetStateAction<OfferAdjustment[]>>;
  onQuoteSaved: () => void;
}

export function BuilderTab({ items, setItems, adjustments, setAdjustments, onQuoteSaved }: BuilderTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  const [formData, setFormData] = useState({
    title: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    validUntil: '',
    notes: '',
    terms: '',
  });

  const totals = calculateOfferTotals(items, adjustments);

  const handleUpdateItem = (index: number, updates: Partial<OfferItem>) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = updates.quantity ?? item.quantity;
        const newPrice = updates.unitSellingPriceIncVat ?? item.unitSellingPriceIncVat;
        const subtotal = newQty * newPrice;
        const vat = subtotal * 0.15;
        const total = subtotal + vat;
        const margin = newPrice > 0 ? ((newPrice - item.unitPurchaseCostIncVat) / newPrice) * 100 : 0;
        
        return {
          ...item,
          ...updates,
          subtotal,
          vatAmount: vat,
          totalPriceIncVat: total,
          margin
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const offerData: Omit<QuoteOffer, 'id' | 'offerNumber' | 'createdAt' | 'updatedAt'> = {
        companyId,
        title: formData.title || 'عرض سعر جديد',
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        customerAddress: formData.customerAddress,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        items,
        adjustments,
        totals,
        status: OfferStatus.Draft,
        notes: formData.notes,
        terms: formData.terms,
        
      };
      
      await quoteService.createOffer(offerData);
      onQuoteSaved();
    } catch (error) {
      console.error('Error saving quote', error);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('quotes.quoteBuilder', 'Quote Builder')}</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Calculator className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p>{t('quotes.emptyQuote', 'No products in current quote')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                    <tr>
                      <th className="px-4 py-3">{t('common.name', 'Name')}</th>
                      <th className="px-4 py-3 w-24">{t('quotes.quantity', 'Quantity')}</th>
                      <th className="px-4 py-3 w-32">{t('quotes.purchaseCost', 'Purchase Cost')}</th>
                      <th className="px-4 py-3 w-32">{t('quotes.sellingPrice', 'Selling Price')}</th>
                      <th className="px-4 py-3 w-32 text-right">{t('quotes.total', 'Total')}</th>
                      <th className="px-4 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, index) => (
                      <tr key={`${item.productId}-${index}`} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium">{item.productName}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            min="1" 
                            value={item.quantity} 
                            onChange={(e) => handleUpdateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                            className="flex h-8 w-20 rounded-md border border-slate-300 bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-slate-500">{item.unitPurchaseCostIncVat.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            min={item.unitPurchaseCostIncVat} 
                            value={item.unitSellingPriceIncVat} 
                            onChange={(e) => handleUpdateItem(index, { unitSellingPriceIncVat: parseFloat(e.target.value) || 0 })}
                            className="flex h-8 w-24 rounded-md border border-slate-300 bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{item.lineSellingTotalIncVat.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('common.settings', 'Settings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('quotes.quoteTitle', 'Quote Title')}</label>
                <input 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={formData.title} 
                  onChange={e => setFormData(f => ({...f, title: e.target.value}))} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('quotes.validUntil', 'Valid Until')}</label>
                <input 
                  type="date" 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={formData.validUntil} 
                  onChange={e => setFormData(f => ({...f, validUntil: e.target.value}))} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('quotes.customerName', 'Customer Name')}</label>
                <input 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={formData.customerName} 
                  onChange={e => setFormData(f => ({...f, customerName: e.target.value}))} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('quotes.customerPhone', 'Phone')}</label>
                <input 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={formData.customerPhone} 
                  onChange={e => setFormData(f => ({...f, customerPhone: e.target.value}))} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('quotes.customerEmail', 'Email')}</label>
                <input 
                  type="email" 
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={formData.customerEmail} 
                  onChange={e => setFormData(f => ({...f, customerEmail: e.target.value}))} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('quotes.notes', 'Notes')}</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                value={formData.notes} 
                onChange={e => setFormData(f => ({...f, notes: e.target.value}))} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="sticky top-6">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>{t('quotes.summary', 'Financial Summary')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('quotes.purchaseCost', 'Purchase Cost')}</span>
              <span className="font-medium">{totals.purchaseCostIncVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('quotes.subtotal', 'Subtotal')}</span>
              <span className="font-medium">{totals.sellingSubtotalExVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('quotes.vat', 'VAT (15%)')}</span>
              <span className="font-medium">{totals.vatAmount.toFixed(2)}</span>
            </div>
            
            <div className="pt-4 border-t flex justify-between font-bold text-lg">
              <span>{t('quotes.finalPrice', 'Final Price')}</span>
              <span className="text-indigo-600">{totals.customerFinalPrice.toFixed(2)}</span>
            </div>

            <div className="pt-4 mt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('quotes.profit', 'Profit Amount')}</span>
                <span className="font-bold text-emerald-600">{totals.profitAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('quotes.margin', 'Profit Margin')}</span>
                <span className="font-bold text-emerald-600">{totals.profitMarginPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('quotes.markup', 'Markup')}</span>
                <span className="font-bold text-emerald-600">{totals.markupPercent.toFixed(1)}%</span>
              </div>
            </div>

            <Button 
              className="w-full mt-6 h-12 text-lg font-semibold" 
              onClick={handleSave}
              disabled={items.length === 0}
            >
              {t('quotes.saveQuote', 'Save Quote')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
