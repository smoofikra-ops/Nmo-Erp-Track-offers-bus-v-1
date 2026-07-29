import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { productService } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { ProductCategory, OfferItem } from '@/types/quotes';
import { Product } from '@/types/models';
import { calculateOfferItem } from '@/features/quotes/utils/quoteCalculator';
import { cn } from '@/utils/cn';
// @ts-ignore
import { getProductImageUrl, handleImageError } from '@/utils/imageUtils';

export function CatalogTab({ onAddToQuote }: { onAddToQuote: (item: OfferItem) => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['products', companyId],
    queryFn: () => productService.getProducts(companyId),
    enabled: Boolean(companyId),
  });

  const products = response?.data || [];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.ArabicName.includes(searchTerm) || (p.EnglishName && p.EnglishName.includes(searchTerm)) || p.SKU.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || p.Category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = (product: any) => {
    const item = calculateOfferItem(product, 1);
    onAddToQuote(item);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 pl-10" 
            placeholder={t('quotes.search', 'Search by name or SKU...')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex h-10 w-full sm:w-[200px] rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">{t('quotes.categoryFilter', 'All Categories')}</option>
          {Object.values(ProductCategory).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 w-full bg-slate-200 animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-slate-200 animate-pulse rounded" />
                <div className="h-10 w-full mt-4 bg-slate-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">
          Error loading products
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">{t('quotes.emptyCatalog', 'No products found')}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.ProductID} className="overflow-hidden flex flex-col group transition-all hover:shadow-md">
              <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
                <img src={getProductImageUrl(product.SKU, product.ImageURL)} alt={product.ArabicName} className="object-cover w-full h-full" onError={handleImageError} />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-slate-700 shadow-sm">
                  {product.SKU}
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="mb-1 text-xs text-indigo-600 font-medium">{product.Category}</div>
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2" title={product.ArabicName}>{product.ArabicName}</h3>
                
                <div className="mt-auto space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('quotes.purchaseCost', 'Purchase Cost')}:</span>
                    <span className="font-medium">{(product.PurchaseCostIncVAT || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">سعر البيع المقترح:</span>
                    <span className="font-bold text-slate-900">{(product.SellingPriceIncVAT || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>الكمية المتوفرة:</span>
                    <span>{product.AvailableQuantity}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4 group-active:scale-95 transition-transform"
                  onClick={() => handleAdd(product)}
                >
                  <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('quotes.addToQuote', 'Add to Quote')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
