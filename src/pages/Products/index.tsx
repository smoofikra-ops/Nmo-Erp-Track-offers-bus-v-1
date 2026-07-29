import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Trash2, Save, Image as ImageIcon, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { productService } from '@/services/productService';
import { ApiClient } from '@/services/apiClient';
import { Product, ProductStatus } from '@/types';
import { cn } from '@/utils/cn';
// @ts-ignore
import { getProductImageUrl, handleImageError, getDefaultProductImage } from '@/utils/imageUtils';
import { useAuth } from '@/contexts/AuthContext';

export function Products() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  const { data: response, isLoading } = useQuery({
    queryKey: ['products', companyId],
    queryFn: () => productService.getProducts(companyId),
    enabled: Boolean(companyId),
  });

  const products = response?.data || [];
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [sku, setSku] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [category, setCategory] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [purchaseCostExVAT, setPurchaseCostExVAT] = useState('');
  const [vatRate, setVatRate] = useState('15');
  const [sellingPriceExVAT, setSellingPriceExVAT] = useState('');
  const [status, setStatus] = useState<ProductStatus>(ProductStatus.ACTIVE);
  const [imageUrl, setImageUrl] = useState('');
  const [isSyncingImages, setIsSyncingImages] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const resetForm = () => {
    setEditingProduct(null);
    setSku('');
    setArabicName('');
    setEnglishName('');
    setCategory('');
    setAvailableQuantity('');
    setPurchaseCostExVAT('');
    setVatRate('15');
    setSellingPriceExVAT('');
    setStatus(ProductStatus.ACTIVE);
    setImageUrl('');
    setIsFormOpen(false);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setSku(p.SKU || '');
    setArabicName(p.ArabicName || '');
    setEnglishName(p.EnglishName || '');
    setCategory(p.Category || '');
    setAvailableQuantity(p.AvailableQuantity?.toString() || '0');
    setPurchaseCostExVAT(p.PurchaseCostExVAT?.toString() || '0');
    setVatRate(p.VATRate?.toString() || '15');
    setSellingPriceExVAT(p.SellingPriceExVAT?.toString() || '0');
    setStatus(p.Status || ProductStatus.ACTIVE);
    setImageUrl(p.ImageURL || '');
    setIsFormOpen(true);
  };

  // Calculations for form
  const parsedPurchaseExVAT = parseFloat(purchaseCostExVAT) || 0;
  const parsedVATRate = parseFloat(vatRate) || 0;
  const parsedSellingExVAT = parseFloat(sellingPriceExVAT) || 0;
  
  const purchaseIncVAT = parsedPurchaseExVAT * (1 + parsedVATRate / 100);
  const sellingIncVAT = parsedSellingExVAT * (1 + parsedVATRate / 100);
  const profitAmount = parsedSellingExVAT - parsedPurchaseExVAT;
  const profitMargin = parsedSellingExVAT > 0 ? (profitAmount / parsedSellingExVAT) * 100 : 0;

  

  const handleAutoGenerateImage = () => {
    if (sku) {
      setImageUrl(getProductImageUrl(sku));
    } else {
      alert('الرجاء إدخال رمز SKU أولاً.');
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingProduct) {
        payload.ProductID = editingProduct.ProductID;
        return productService.updateProduct(payload);
      } else {
        return productService.createProduct(payload);
      }
    },
    onSuccess: async (res) => {
      if (res.success) {
        resetForm();
        await queryClient.invalidateQueries({ queryKey: ['products', companyId] });
      } else {
        alert(res.message || 'Error saving product');
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (prod: Product) => productService.deleteProduct(prod.ProductID, companyId),
    onSuccess: async (res) => {
      if (res.success) await queryClient.invalidateQueries({ queryKey: ['products', companyId] });
    }
  });

  
  const handleSyncImages = async () => {
    if (!confirm('هل أنت متأكد من بدء مزامنة صور المنتجات مع Cloudinary؟ قد تستغرق هذه العملية بعض الوقت.')) return;
    setIsSyncingImages(true);
    setSyncResult(null);
    try {
      const response = await ApiClient.post('SYNC_PRODUCT_IMAGES', { companyId });
      if (response.success) {
        setSyncResult(response.data);
        alert('تمت المزامنة بنجاح! يتم الآن إعادة تحميل المنتجات.');
        refetch();
      } else {
        alert('فشل المزامنة: ' + response.message);
      }
    } catch (e) {
      alert('حدث خطأ أثناء المزامنة.');
    } finally {
      setIsSyncingImages(false);
    }
  };
  
  const handleSave = () => {
    if (!arabicName || !sku) {
      alert('اسم المنتج ورمز SKU مطلوبان.');
      return;
    }
    const finalImageUrl = imageUrl || "";

    const payload = {
      CompanyID: companyId,
      SKU: sku,
      ArabicName: arabicName,
      EnglishName: englishName,
      Category: category,
      AvailableQuantity: parseFloat(availableQuantity) || 0,
      PurchaseCostExVAT: parsedPurchaseExVAT,
      VATRate: parsedVATRate,
      PurchaseCostIncVAT: purchaseIncVAT,
      SellingPriceExVAT: parsedSellingExVAT,
      SellingPriceIncVAT: sellingIncVAT,
      ProfitAmount: profitAmount,
      ProfitMargin: profitMargin,
      Status: status,
      ImageURL: finalImageUrl,
    };
    saveMutation.mutate(payload);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (search && !(p.ArabicName?.includes(search) || p.SKU?.includes(search))) return false;
      return true;
    });
  }, [products, search]);

  if (isFormOpen) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
          </h2>
          <Button variant="outline" onClick={resetForm}>إلغاء</Button>
        </div>
        
      {syncResult && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-2">نتيجة مزامنة الصور:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>إجمالي المنتجات في النظام: {syncResult.totalProducts}</li>
            <li>إجمالي الصور في Cloudinary: {syncResult.totalImages}</li>
            <li>عدد المطابقات الناجحة (صور موجودة): {syncResult.matchCount}</li>
            <li>عدد المنتجات التي لم تجد صورة: {syncResult.noMatchCount}</li>
            <li>عدد المنتجات التي تم تحديث رابطها في هذه العملية: {syncResult.updatedCount}</li>
            {syncResult.duplicates && syncResult.duplicates.length > 0 && (
              <li className="text-amber-600">أسماء صور مكررة تحتاج مراجعة: {syncResult.duplicates.join(', ')}</li>
            )}
          </ul>
        </div>
      )}
  
      <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">رمز المنتج (SKU)*</label>
                <input className="w-full h-10 rounded-md border px-3" value={sku} onChange={e => setSku(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم (عربي)*</label>
                <input className="w-full h-10 rounded-md border px-3" value={arabicName} onChange={e => setArabicName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم (إنجليزي)</label>
                <input className="w-full h-10 rounded-md border px-3" value={englishName} onChange={e => setEnglishName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">التصنيف</label>
                <input className="w-full h-10 rounded-md border px-3" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              
              {/* Image Auto Gen */}
              <div className="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-lg border flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-sm font-medium">رابط الصورة (Image URL)</label>
                  <input className="w-full h-10 rounded-md border px-3" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="أدخل الرابط أو سيتم إنشاؤه تلقائياً..." />
                </div>
                <Button variant="secondary" className="mt-6 shrink-0" onClick={handleAutoGenerateImage}>
                  <LinkIcon className="h-4 w-4 mr-2" /> إنشاء رابط تلقائي عبر SKU
                </Button>
                {imageUrl && (
                  <div className="h-16 w-16 border rounded bg-white p-1 shrink-0 mt-6">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-contain" onError={handleImageError} />
                  </div>
                )}
              </div>

              {/* Financials */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الكمية المتوفرة</label>
                <input type="number" className="w-full h-10 rounded-md border px-3" value={availableQuantity} onChange={e => setAvailableQuantity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">تكلفة الشراء (بدون ضريبة)</label>
                <input type="number" className="w-full h-10 rounded-md border px-3" value={purchaseCostExVAT} onChange={e => setPurchaseCostExVAT(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">سعر البيع (بدون ضريبة)</label>
                <input type="number" className="w-full h-10 rounded-md border px-3" value={sellingPriceExVAT} onChange={e => setSellingPriceExVAT(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">نسبة الضريبة %</label>
                <input type="number" className="w-full h-10 rounded-md border px-3" value={vatRate} onChange={e => setVatRate(e.target.value)} />
              </div>
            </div>

            {/* Readonly Summary */}
            <div className="bg-indigo-50 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
              <div>
                <div className="text-slate-500 mb-1">الشراء (شامل)</div>
                <div className="font-semibold">{purchaseIncVAT.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">البيع (شامل)</div>
                <div className="font-semibold">{sellingIncVAT.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">مبلغ الربح</div>
                <div className="font-semibold text-emerald-600">{profitAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">نسبة الربح</div>
                <div className="font-semibold text-emerald-600">{profitMargin.toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600">
                <Save className="h-4 w-4 mr-2" /> حفظ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">المخزون (المنتجات)</h2>
          <p className="mt-1 text-sm text-slate-500">إدارة منتجات الشركة والأسعار</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSyncImages} disabled={isSyncingImages} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <RefreshCw className={cn("w-4 h-4", isSyncingImages && "animate-spin")} />
            مزامنة صور المنتجات
          </Button>
          <Button onClick={() => openEdit({} as Product)}>
            <Plus className="w-4 h-4 ml-2" /> إضافة منتج
          </Button>
        </div>
  
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو SKU..." 
            className="flex h-10 w-full rounded-md border border-slate-300 pr-10 pl-3 py-2 text-sm"
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
                <th className="px-4 py-3 font-medium">صورة</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">اسم المنتج</th>
                <th className="px-4 py-3 font-medium">التصنيف</th>
                <th className="px-4 py-3 font-medium">الكمية</th>
                <th className="px-4 py-3 font-medium">الشراء (بدون)</th>
                <th className="px-4 py-3 font-medium">الشراء (شامل)</th>
                <th className="px-4 py-3 font-medium">البيع (بدون)</th>
                <th className="px-4 py-3 font-medium">البيع (شامل)</th>
                <th className="px-4 py-3 font-medium">الربح</th>
                <th className="px-4 py-3 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p, i) => {
                const imgSource = getProductImageUrl(p.SKU, p.ImageURL);
                const isDeleted = p.IsDeleted === true || (p.IsDeleted as any) === 'true';
                if (isDeleted) return null;
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2">
                      <div className="h-10 w-10 rounded border bg-white flex items-center justify-center p-1">
                        <img 
                          src={imgSource} 
                          alt={p.ArabicName} 
                          className="object-contain max-h-full"
                          onError={handleImageError}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium">{p.SKU}</td>
                    <td className="px-4 py-2 text-wrap min-w-[200px]">{p.ArabicName}</td>
                    <td className="px-4 py-2 text-slate-500">{p.Category || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", (p.AvailableQuantity || 0) <= 5 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")}>
                        {p.AvailableQuantity || 0}
                      </span>
                    </td>
                    <td className="px-4 py-2">{Number(p.PurchaseCostExVAT || 0).toFixed(2)}</td>
                    <td className="px-4 py-2">{Number(p.PurchaseCostIncVAT || 0).toFixed(2)}</td>
                    <td className="px-4 py-2">{Number(p.SellingPriceExVAT || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 font-bold text-indigo-600">{Number(p.SellingPriceIncVAT || 0).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col text-xs">
                        <span className="text-emerald-600 font-semibold">{Number(p.ProfitAmount || 0).toFixed(2)}</span>
                        <span className="text-slate-400">{Number(p.ProfitMargin || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                        if (confirm('تأكيد الحذف؟')) deleteMutation.mutate(p);
                      }}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
