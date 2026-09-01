import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Settings,
  RefreshCw,
  Search,
  Filter,
  LayoutGrid,
  List,
  ShieldCheck,
  Clock,
  AlertTriangle,
  XCircle,
  Archive,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { CompanyDocument, DocumentCategory, DocumentType, DocumentSummary } from '@/types/documents';
import { documentService } from '@/services/documentService';
import { calculateDocumentExpiry, formatDateArabic } from '@/utils/documentExpiry';
import { DigitalDocumentCard } from './DigitalDocumentCard';
import { DocumentTableView } from './DocumentTableView';
import { DocumentDetailsModal } from './DocumentDetailsModal';
import { DocumentFormModal } from './DocumentFormModal';
import { DocumentRenewalModal } from './DocumentRenewalModal';
import { DocumentSettingsModal } from './DocumentSettingsModal';
import { cn } from '@/utils/cn';

interface DocumentsProps {
  companyId?: string;
}

export const Documents: React.FC<DocumentsProps> = ({ companyId = 'COM-0001' }) => {
  // State
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SAFE' | 'ARCHIVED'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [sortBy, setSortBy] = useState<'EXPIRY_ASC' | 'EXPIRY_DESC' | 'NAME' | 'CREATED'>('EXPIRY_ASC');

  // Modals
  const [detailsDoc, setDetailsDoc] = useState<CompanyDocument | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<CompanyDocument | null>(null);
  const [renewingDoc, setRenewingDoc] = useState<CompanyDocument | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<CompanyDocument | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Data
  const loadAllData = async () => {
    try {
      setRefreshing(true);
      const [docsRes, typesRes, catsRes] = await Promise.all([
        documentService.getCompanyDocuments(companyId, true),
        documentService.getDocumentTypes(companyId),
        documentService.getDocumentCategories(companyId),
      ]);

      if (docsRes.data) setDocuments(docsRes.data);
      if (typesRes.data) setDocumentTypes(typesRes.data);
      if (catsRes.data) setCategories(catsRes.data);
    } catch (err: any) {
      console.error('Failed to load documents data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [companyId]);

  // Compute KPI Summary Stats
  const summary: DocumentSummary = useMemo(() => {
    const activeDocs = documents.filter(d => !d.Is_Archived);
    let safe = 0;
    let expiringSoon = 0;
    let expired = 0;
    let nearestDoc: any = null;
    let minDays = Infinity;

    activeDocs.forEach(doc => {
      const type = documentTypes.find(t => t.Type_ID === doc.Document_Type_ID);
      const hasExpiry = type ? type.HasExpiry : Boolean(doc.Expiry_Date);
      const reminderDays = doc.Reminder_Days || type?.DefaultReminderDays || 60;
      const expiry = calculateDocumentExpiry(doc.Expiry_Date, hasExpiry, reminderDays, doc.Issue_Date);

      if (expiry.status === 'EXPIRED') {
        expired++;
      } else if (expiry.status === 'CRITICAL' || expiry.status === 'WARNING') {
        expiringSoon++;
      } else {
        safe++;
      }

      if (expiry.daysRemaining !== null && expiry.daysRemaining >= 0 && expiry.daysRemaining < minDays) {
        minDays = expiry.daysRemaining;
        nearestDoc = {
          id: doc.Document_ID,
          name: doc.Document_Name,
          daysRemaining: expiry.daysRemaining,
          expiryDate: doc.Expiry_Date || '',
        };
      }
    });

    return {
      totalActive: activeDocs.length,
      safeCount: safe,
      expiringSoonCount: expiringSoon,
      expiredCount: expired,
      nearestExpiringDoc: nearestDoc,
    };
  }, [documents, documentTypes]);

  // Filtered & Sorted Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = doc.Document_Name?.toLowerCase().includes(q);
        const matchAuth = doc.Issuing_Authority?.toLowerCase().includes(q);
        const matchPrim = doc.Primary_Number?.toLowerCase().includes(q);
        const matchSec = doc.Secondary_Number?.toLowerCase().includes(q);
        const matchBranch = doc.Branch?.toLowerCase().includes(q);
        if (!matchName && !matchAuth && !matchPrim && !matchSec && !matchBranch) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL' && doc.Category_ID !== selectedCategory) {
        return false;
      }

      // 3. Status Tab Filter
      if (selectedStatusTab === 'ARCHIVED') {
        return Boolean(doc.Is_Archived);
      }

      // Non-archived tabs
      if (doc.Is_Archived) return false;

      const type = documentTypes.find(t => t.Type_ID === doc.Document_Type_ID);
      const hasExpiry = type ? type.HasExpiry : Boolean(doc.Expiry_Date);
      const reminderDays = doc.Reminder_Days || type?.DefaultReminderDays || 60;
      const expiry = calculateDocumentExpiry(doc.Expiry_Date, hasExpiry, reminderDays, doc.Issue_Date);

      if (selectedStatusTab === 'CRITICAL') {
        return expiry.status === 'EXPIRED' || expiry.status === 'CRITICAL';
      }
      if (selectedStatusTab === 'WARNING') {
        return expiry.status === 'WARNING' || expiry.status === 'ATTENTION';
      }
      if (selectedStatusTab === 'SAFE') {
        return expiry.status === 'SAFE' || expiry.status === 'NO_EXPIRY';
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NAME') {
        return a.Document_Name.localeCompare(b.Document_Name, 'ar');
      }
      if (sortBy === 'CREATED') {
        return new Date(b.Created_At || 0).getTime() - new Date(a.Created_At || 0).getTime();
      }

      const dateA = a.Expiry_Date ? new Date(a.Expiry_Date).getTime() : (sortBy === 'EXPIRY_ASC' ? Infinity : -Infinity);
      const dateB = b.Expiry_Date ? new Date(b.Expiry_Date).getTime() : (sortBy === 'EXPIRY_ASC' ? Infinity : -Infinity);

      return sortBy === 'EXPIRY_ASC' ? dateA - dateB : dateB - dateA;
    });
  }, [documents, documentTypes, searchQuery, selectedCategory, selectedStatusTab, sortBy]);

  // Handlers
  const handleArchiveToggle = async (doc: CompanyDocument) => {
    try {
      const res = await documentService.archiveCompanyDocument(doc.Document_ID, !doc.Is_Archived, companyId);
      if (res.success) {
        showToast(doc.Is_Archived ? 'تم استعادة الوثيقة إلى السجلات النشطة' : 'تم نقل الوثيقة إلى الأرشيف');
        loadAllData();
        if (detailsDoc?.Document_ID === doc.Document_ID) {
          setDetailsDoc(null);
        }
      }
    } catch (err: any) {
      alert(err.message || 'فشلت عملية الأرشفة');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteDoc) return;
    try {
      const res = await documentService.deleteCompanyDocument(confirmDeleteDoc.Document_ID, companyId);
      if (res.success) {
        showToast('تم حذف الوثيقة بنجاح');
        setConfirmDeleteDoc(null);
        if (detailsDoc?.Document_ID === confirmDeleteDoc.Document_ID) {
          setDetailsDoc(null);
        }
        loadAllData();
      }
    } catch (err: any) {
      alert(err.message || 'فشل حذف الوثيقة');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 start-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-200 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                مركز المستندات والوثائق والتراخيص
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                إدارة وحفظ الرخص والشهادات الحكومية، تواريخ الانتهاء، والتنبيهات المبكرة
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => loadAllData()}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
            title="تحديث البيانات"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
            title="إعدادات وأنواع الوثائق"
          >
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>إعدادات الوثائق</span>
          </button>

          <button
            onClick={() => { setEditingDoc(null); setIsFormOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة وثيقة جديدة</span>
          </button>
        </div>
      </div>

      {/* KPI Dashboard Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Active */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي الوثائق النشطة</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {summary.totalActive}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">وثيقة ورخصة مسجلة</span>
        </div>

        {/* Safe / Compliant */}
        <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">سارية ومستقرة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-2">
            {summary.safeCount}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 block">
            صلاحية أكثر من 60 يوماً
          </span>
        </div>

        {/* Expiring Soon */}
        <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">تنتهي قريباً</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950 dark:text-amber-200 mt-2">
            {summary.expiringSoonCount}
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 block">تحتاج للمتابعة والتجديد</span>
        </div>

        {/* Expired */}
        <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">منتهية الصلاحية</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-950 dark:text-rose-200 mt-2">
            {summary.expiredCount}
          </div>
          <span className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5 block">تتطلب تجديد فوري</span>
        </div>

        {/* Nearest Expiry */}
        <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">أقرب موعد استحقاق</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          {summary.nearestExpiringDoc ? (
            <div className="mt-1.5">
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {summary.nearestExpiringDoc.name}
              </div>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                متبقي {summary.nearestExpiringDoc.daysRemaining} يوم
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 mt-3 font-semibold">لا يوجد استحقاق قريب</div>
          )}
        </div>
      </div>

      {/* Search, Filter Tabs & View Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الرقم الموحد، السجل، أو الجهة..."
              className="w-full h-10 ps-10 pe-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-x-auto max-w-full text-xs font-bold">
            <button
              onClick={() => setSelectedStatusTab('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
                selectedStatusTab === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              الكل ({documents.filter(d => !d.Is_Archived).length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('CRITICAL')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
                selectedStatusTab === 'CRITICAL'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              حرج / منتهي ({summary.expiredCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('WARNING')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
                selectedStatusTab === 'WARNING'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              تنبيه قادم ({summary.expiringSoonCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('SAFE')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
                selectedStatusTab === 'SAFE'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              سارية ({summary.safeCount})
            </button>
            <button
              onClick={() => setSelectedStatusTab('ARCHIVED')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1',
                selectedStatusTab === 'ARCHIVED'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>الأرشيف ({documents.filter(d => d.Is_Archived).length})</span>
            </button>
          </div>

          {/* Sort and View Toggle */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="EXPIRY_ASC">الأقرب انتهاءً أولاً</option>
              <option value="EXPIRY_DESC">الأبعد انتهاءً</option>
              <option value="NAME">أبجدياً بالاسم</option>
              <option value="CREATED">الأحدث إضافة</option>
            </select>

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('GRID')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  viewMode === 'GRID' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-400'
                )}
                title="عرض البطاقات الرقمية"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  viewMode === 'TABLE' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xs' : 'text-slate-400'
                )}
                title="عرض الجدول المفصل"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            التصنيف:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={cn(
              'px-3 py-1 rounded-full transition-colors whitespace-nowrap text-xs',
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            )}
          >
            جميع التصنيفات
          </button>
          {categories.map((cat) => (
            <button
              key={cat.CategoryID}
              onClick={() => setSelectedCategory(cat.CategoryID)}
              className={cn(
                'px-3 py-1 rounded-full transition-colors whitespace-nowrap text-xs',
                selectedCategory === cat.CategoryID
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              )}
            >
              {cat.CategoryNameAR}
            </button>
          ))}
        </div>
      </div>

      {/* Main Document Content */}
      {loading ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">جاري تحميل سجلات الوثائق والتراخيص...</h3>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            لم يتم العثور على وثائق مطابقة
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'جرّب تغيير كلمات البحث أو إعادة تعيين الفلاتر لعرض الوثائق المسجلة'
              : 'ابدأ بتسجيل السجل التجاري والتراخيص الرسمية الخاصة بالمنشأة'}
          </p>
          <button
            onClick={() => { setEditingDoc(null); setIsFormOpen(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول وثيقة</span>
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <DigitalDocumentCard
              key={doc.Document_ID}
              document={doc}
              documentTypes={documentTypes}
              categories={categories}
              onViewDetails={(d) => setDetailsDoc(d)}
              onRenew={(d) => setRenewingDoc(d)}
              onEdit={(d) => { setEditingDoc(d); setIsFormOpen(true); }}
              onArchive={handleArchiveToggle}
              onDelete={(d) => setConfirmDeleteDoc(d)}
            />
          ))}
        </div>
      ) : (
        <DocumentTableView
          documents={filteredDocuments}
          documentTypes={documentTypes}
          categories={categories}
          onViewDetails={(d) => setDetailsDoc(d)}
          onRenew={(d) => setRenewingDoc(d)}
          onEdit={(d) => { setEditingDoc(d); setIsFormOpen(true); }}
          onArchive={handleArchiveToggle}
          onDelete={(d) => setConfirmDeleteDoc(d)}
        />
      )}

      {/* Details Modal */}
      {detailsDoc && (
        <DocumentDetailsModal
          document={detailsDoc}
          documentTypes={documentTypes}
          categories={categories}
          onClose={() => setDetailsDoc(null)}
          onRenew={(d) => { setDetailsDoc(null); setRenewingDoc(d); }}
          onEdit={(d) => { setDetailsDoc(null); setEditingDoc(d); setIsFormOpen(true); }}
          onArchive={handleArchiveToggle}
          onDelete={(d) => setConfirmDeleteDoc(d)}
        />
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <DocumentFormModal
          document={editingDoc}
          documentTypes={documentTypes}
          categories={categories}
          companyId={companyId}
          onClose={() => { setIsFormOpen(false); setEditingDoc(null); }}
          onSuccess={(saved) => {
            setIsFormOpen(false);
            setEditingDoc(null);
            showToast('تم حفظ بيانات الوثيقة بنجاح');
            loadAllData();
          }}
        />
      )}

      {/* Renewal Modal */}
      {renewingDoc && (
        <DocumentRenewalModal
          document={renewingDoc}
          companyId={companyId}
          onClose={() => setRenewingDoc(null)}
          onSuccess={(updated) => {
            setRenewingDoc(null);
            showToast('تم تسجيل التجديد وتحديث تاريخ الصلاحية بنجاح');
            loadAllData();
          }}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <DocumentSettingsModal
          documentTypes={documentTypes}
          categories={categories}
          companyId={companyId}
          onClose={() => setIsSettingsOpen(false)}
          onRefresh={() => loadAllData()}
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDeleteDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                تأكيد حذف الوثيقة
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف وثيقة <strong className="text-slate-900 dark:text-white">{confirmDeleteDoc.Document_Name}</strong>؟ سيتم إخفاء الوثيقة من السجلات النشطة.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Documents;
