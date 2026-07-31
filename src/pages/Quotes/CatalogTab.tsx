import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Loader2, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quoteService } from '@/services/quoteService';
import { useAuth } from '@/contexts/AuthContext';
import { QuoteCatalogProduct, QuoteCartItem } from '@/types/quotes';
import { getProductImageUrl, handleImageError } from '@/utils/imageUtils';

interface CatalogTabProps {
  onAddToCart: (item: QuoteCartItem) => void;
  cartItems: QuoteCartItem[];
}

export function CatalogTab({ onAddToCart, cartItems }: CatalogTabProps) {
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['quoteCatalog', companyId],
    queryFn: () => quoteService.getQuoteCatalog(companyId),
    enabled: Boolean(companyId),
  });

  const products = response || [];

  const [search, setSearch] = useState('');
  React.useEffect(() => {
    if (products.length > 0) {
      console.table(products.map(p => ({
        SKU: p.sku,
        Name: p.nameAr,
        Image: p.imageUrl,
        Active: p.active,
        Configured: p.configurationComplete
      })));
    }
  }, [products]);
  

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);
  
  React.useEffect(() => {
    if (selectedCategory !== 'all' && !categories.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = products; // active is already filtered or used later if needed
    filtered = filtered.filter(p => p.active);

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        p => p.nameAr.toLowerCase().includes(lowerSearch) || 
             p.sku.toLowerCase().includes(lowerSearch) ||
             (p.nameEn && p.nameEn.toLowerCase().includes(lowerSearch))
      );
    }

    const normalizedSelectedCategory = selectedCategory || 'all';
    if (normalizedSelectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === normalizedSelectedCategory);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.nameAr.localeCompare(b.nameAr);
        case 'price_asc': return a.storePricePerOfferUnitIncVat - b.storePricePerOfferUnitIncVat;
        case 'price_desc': return b.storePricePerOfferUnitIncVat - a.storePricePerOfferUnitIncVat;
        case 'cost_asc': return a.purchaseCostPerOfferUnitExVat - b.purchaseCostPerOfferUnitExVat;
        default: return 0;
      }
    });

    return filtered;
  }, [products, search, selectedCategory, sortBy]);

  const handleAdd = (p: QuoteCatalogProduct) => {
    onAddToCart({
      productId: p.id,
      sku: p.sku,
      productName: p.nameAr,
      imageUrl: p.imageUrl,
      offerUnitName: p.offerUnitName,
      piecesPerOfferUnit: p.piecesPerOfferUnit,
      quantity: 1,
      unitPurchaseCostExVat: p.purchaseCostPerOfferUnitExVat,
      unitPurchaseCostIncVat: p.purchaseCostPerOfferUnitIncVat,
      unitSellingPriceExVat: p.storePricePerOfferUnitExVat,
      unitSellingPriceIncVat: p.storePricePerOfferUnitIncVat,
      defaultUnitSellingPriceIncVat: p.storePricePerOfferUnitIncVat,
      marketPricePerOfferUnitIncVat: p.marketPricePerOfferUnitIncVat,
      vatRate: p.vatRate,
      availableOfferUnits: p.availableOfferUnits
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <p>جاري تحميل كتالوج العروض...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
        <p className="mb-4">تعذر تحميل منتجات كتالوج العروض.</p>
        <p className="text-sm opacity-80 mb-4">{error instanceof Error ? error.message : 'حدث خطأ غير متوقع'}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-red-200 hover:bg-red-100 text-red-700">إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'الكل' : cat}
            </button>
          ))}
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث برقم SKU أو الاسم..."
              className="w-full h-10 rounded-full border border-slate-300 pr-10 pl-4 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-full border border-slate-300 px-4 text-sm bg-white focus:border-emerald-500 outline-none"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="name_asc">الاسم أبجدياً</option>
            <option value="price_asc">السعر: الأقل للأعلى</option>
            <option value="price_desc">السعر: الأعلى للأقل</option>
            <option value="cost_asc">التكلفة: الأقل للأعلى</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">الكتالوج فارغ</h3>
          <p className="text-slate-500 text-sm mt-1">لم يُرجع الخادم أي منتجات نشطة من جدول Products.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">لا توجد نتائج</h3>
          <p className="text-slate-500 text-sm mt-1">لا توجد منتجات مطابقة للبحث أو التصنيف الحالي.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const inCart = cartItems.filter(i => i.productId === product.id).reduce((a, b) => a + b.quantity, 0);
            const isOutOfStock = product.availableOfferUnits !== undefined && product.availableOfferUnits <= 0;
            const canAddMore = product.availableOfferUnits === undefined || inCart < product.availableOfferUnits;
            
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full border-slate-200/60">
                <div className="aspect-[4/3] bg-slate-50 relative p-4 flex items-center justify-center border-b border-slate-100">
                  <img
                    src={getProductImageUrl(product.sku, product.imageUrl, product as any)}
                    alt={product.nameAr}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                    onError={handleImageError}
                  />
                  {product.category && (
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm border border-slate-100">
                      {product.category}
                    </span>
                  )}
                  {product.configurationComplete === false && (
                    <span className="absolute bottom-3 right-3 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                      تأكد من التعبئة
                    </span>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="mb-1 text-xs text-slate-500 font-mono" dir="ltr">{product.sku}</div>
                  <h3 className="font-semibold text-slate-900 leading-tight mb-2 line-clamp-2" title={product.nameAr}>
                    {product.nameAr}
                  </h3>
                  {product.nameEn && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-1 text-left font-sans" dir="ltr" title={product.nameEn}>
                      {product.nameEn}
                    </p>
                  )}
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">سعر الوحدة ({product.offerUnitName})</div>
                        <div className="font-bold text-lg text-emerald-700">
                          {product.storePricePerOfferUnitIncVat?.toFixed(2)} ر.س
                        </div>
                      </div>
                      
                      {product.suggestedPricePerOfferUnitIncVat && product.suggestedPricePerOfferUnitIncVat !== product.storePricePerOfferUnitIncVat && (
                        <div className="text-left">
                          <div className="text-[10px] text-slate-400">السعر المقترح</div>
                          <div className="text-sm font-medium text-slate-500 line-through">
                            {product.suggestedPricePerOfferUnitIncVat?.toFixed(2)} ر.س
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleAdd(product)}
                      disabled={isOutOfStock || !canAddMore}
                      className="w-full"
                      variant={inCart > 0 ? "secondary" : "default"}
                    >
                      {isOutOfStock ? (
                        <>نفذت الكمية</>
                      ) : !canAddMore ? (
                        <>الحد الأقصى ({product.availableOfferUnits})</>
                      ) : inCart > 0 ? (
                        <>أضف المزيد ({inCart} في العرض)</>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة للعرض
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
