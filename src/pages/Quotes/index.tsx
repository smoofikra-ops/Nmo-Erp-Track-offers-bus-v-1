import React, { useState, useEffect } from 'react';
import { FileText, ShoppingCart, History, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CatalogTab } from './CatalogTab';
import { BuilderTab } from './BuilderTab';
import { HistoryTab } from './HistoryTab';
import { QuoteCartItem, Quote } from '@/types/quotes';
import { useAuth } from '@/contexts/AuthContext';

export function QuotesPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'builder' | 'history'>('catalog');
  const [cartItems, setCartItems] = useState<QuoteCartItem[]>([]);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const handleAddToCart = (item: QuoteCartItem) => {
    setCartItems(prev => {
      const existing = prev.find(p => p.productId === item.productId);
      if (existing) {
        return prev.map(p => 
          p.productId === item.productId 
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }
      return [...prev, item];
    });
  };

  const handleUpdateCartItem = (productId: string, updates: Partial<QuoteCartItem>) => {
    setCartItems(prev => prev.map(p => 
      p.productId === productId ? { ...p, ...updates } : p
    ));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(p => p.productId !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setEditingQuote(null);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    
    // Map quote items to cart items
    const mappedItems: QuoteCartItem[] = quote.items.map(item => ({
      productId: item.productId,
      sku: item.sku,
      productName: item.productName,
      imageUrl: item.imageUrl,
      offerUnitName: item.offerUnitName,
      piecesPerOfferUnit: item.piecesPerOfferUnit,
      quantity: item.quantity,
      unitPurchaseCostExVat: item.unitPurchaseCostExVat,
      unitPurchaseCostIncVat: item.unitPurchaseCostIncVat,
      unitSellingPriceExVat: item.unitSellingPriceExVat,
      unitSellingPriceIncVat: item.unitSellingPriceIncVat,
      defaultUnitSellingPriceIncVat: item.defaultUnitSellingPriceIncVat,
      vatRate: item.vatRate,
    }));
    
    setCartItems(mappedItems);
    setActiveTab('builder');
  };

  // Floating Cart Calculation
  const totalOfferUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const estimatedValue = cartItems.reduce((acc, item) => acc + (item.unitSellingPriceIncVat * item.quantity), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">عروض الأسعار والتوريدات</h1>
          <p className="text-slate-500 mt-2">إدارة عروض الأسعار المبنية على وحدات العرض الجزئية.</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('catalog')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === 'catalog' ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          كتالوج العروض
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 relative",
            activeTab === 'builder' ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          )}
        >
          <CheckCircle className="w-4 h-4" />
          مراجعة العرض
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {totalOfferUnits}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === 'history' ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          )}
        >
          <History className="w-4 h-4" />
          سجل العروض
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'catalog' && (
          <CatalogTab 
            onAddToCart={handleAddToCart} 
            cartItems={cartItems} 
          />
        )}
        {activeTab === 'builder' && (
          <BuilderTab 
            cartItems={cartItems}
            onUpdateItem={handleUpdateCartItem}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            editingQuote={editingQuote}
            onSaveSuccess={() => {
              handleClearCart();
              setActiveTab('history');
            }}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab 
            onEditQuote={handleEditQuote}
          />
        )}
      </div>

      {/* Floating Cart for Catalog Tab */}
      {activeTab === 'catalog' && totalOfferUnits > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-full relative animate-pulse">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm text-slate-300">القيمة التقريبية</div>
              <div className="font-bold">{estimatedValue.toFixed(2)} ر.س</div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700 mx-2"></div>
          <div className="text-sm font-medium">
            <span className="text-emerald-400 font-bold">{totalOfferUnits}</span> وحدات عرض
          </div>
          <button 
            onClick={() => setActiveTab('builder')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors ml-2"
          >
            مراجعة العرض
          </button>
        </div>
      )}
    </div>
  );
}
