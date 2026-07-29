import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { CatalogTab } from './CatalogTab';
import { HistoryTab } from './HistoryTab';
import { BuilderTab } from './BuilderTab';
import { OfferItem, OfferAdjustment } from '@/types/quotes';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { verifyAndInitializeQuotesDatabase } from '@/features/quotes/utils/diagnostic';
import { Settings } from 'lucide-react';

export function QuotesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('new') === 'true' ? 'builder' : 'catalog');
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  
  const [currentQuoteItems, setCurrentQuoteItems] = useState<OfferItem[]>([]);
  const [currentQuoteAdjustments, setCurrentQuoteAdjustments] = useState<OfferAdjustment[]>([]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setActiveTab('builder');
    }
  }, [searchParams]);

  const handleRunDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    const result = await verifyAndInitializeQuotesDatabase();
    setIsDiagnosticRunning(false);
    if (result.success) {
      alert(t('quotes.diagnosticSuccess', 'Google Sheets connected and initialized successfully!'));
    } else {
      alert(t('quotes.diagnosticError', 'Error connecting to Google Sheets. Check your Apps Script URL.'));
    }
  };

  const handleAddToQuote = (item: OfferItem) => {
    setCurrentQuoteItems((prev) => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        const newQty = existing.quantity + item.quantity;
        return prev.map(i => i.productId === item.productId ? { ...i, quantity: newQty } : i);
      }
      return [...prev, item];
    });
    setActiveTab('builder');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('quotes.title', 'Price Quotes')}</h2>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRunDiagnostic} 
          disabled={isDiagnosticRunning}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          {isDiagnosticRunning ? 'Verifying...' : 'Verify Google Sheets Connection'}
        </Button>
      </div>

      <div className="w-full">
        <div className="flex space-x-1 space-x-reverse rounded-xl bg-slate-100 p-1 w-full max-w-md mb-6">
          <button
            onClick={() => setActiveTab('catalog')}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all",
              activeTab === 'catalog' 
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600 hover:bg-white/[0.12] hover:text-slate-900"
            )}
          >
            {t('quotes.catalog', 'Products Catalog')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all",
              activeTab === 'history' 
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600 hover:bg-white/[0.12] hover:text-slate-900"
            )}
          >
            {t('quotes.history', 'Quotes History')}
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all",
              activeTab === 'builder' 
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600 hover:bg-white/[0.12] hover:text-slate-900"
            )}
          >
            {t('quotes.newQuote', 'New Quote')}
          </button>
        </div>
        
        {activeTab === 'catalog' && (
          <CatalogTab onAddToQuote={handleAddToQuote} />
        )}
        {activeTab === 'history' && (
          <HistoryTab />
        )}
        {activeTab === 'builder' && (
          <BuilderTab 
            items={currentQuoteItems} 
            setItems={setCurrentQuoteItems}
            adjustments={currentQuoteAdjustments}
            setAdjustments={setCurrentQuoteAdjustments}
            onQuoteSaved={() => {
              setCurrentQuoteItems([]);
              setCurrentQuoteAdjustments([]);
              setActiveTab('history');
            }}
          />
        )}
      </div>
    </div>
  );
}
