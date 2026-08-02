export type CommissionTypeCategory = 'PRODUCT_COMMISSION' | 'ORDER_COUNT_COMMISSION';

export interface ProductCommissionItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
  unitCommission: number;
  totalCommission: number;
}

export type RequiredAmountItem = {
  id: string;
  description: string;
  amount: number;
};

export type PaymentMethod =
  | 'ZID'
  | 'BALANCE'
  | 'CASH'
  | 'INTERMEDIARY_ACCOUNT'
  | 'BANK_TRANSFER'
  | 'STC_PAY'
  | 'CREDIT_SALE'
  | 'OTHER';

export type PaymentItem = {
  id: string;
  method: PaymentMethod;
  description?: string;
  amount: number;
};

export type DiscountItem = {
  id: string;
  code?: string;
  description: string;
  amount: number;
};

export interface AppliedDiscount {
  id: string;
  name: string;
  amount: number;
}

export interface CommissionRecord {
  id: string;
  transactionNo: string; // e.g. TRX-2026-001
  companyId: string;
  createdAt: string; // ISO format
  formattedDate: string; // YYYY-MM-DD HH:mm
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  commissionType: CommissionTypeCategory;
  commissionTypeLabel: string; // "عمولة منتجات" | "عمولة عدد الطلبات"
  
  quantityOrOrdersCount: number; // عدد المنتجات أو عدد الطلبات
  grossCommission: number; // إجمالي العمولة
  totalDiscount: number; // قيمة الخصومات المطبقة
  netCommission: number; // صافي العمولة = grossCommission - totalDiscount
  
  totalOrderValue?: number;
  totalRequiredAmount?: number; // إجمالي المبلغ المطلوب تحصيله من المندوب
  onlinePaidAmount: number; // المبلغ المدفوع أونلاين
  codRequiredAmount?: number; // legacy
  totalDiscounts?: number; // إجمالي الخصومات المالية (ZID)
  finalRequiredAmount?: number; // المبلغ النهائي المطلوب تحصيله من المندوب
  remainingBalance?: number; // legacy
  
  notes?: string;
  items?: ProductCommissionItem[];
  discounts?: AppliedDiscount[]; // Also mapped to DiscountItem[] in logic if needed
  requiredItems?: RequiredAmountItem[];
  paymentItems?: PaymentItem[];
  
  orderCountDetails?: {
    pastOrders: number;
    newOrders: number;
    totalOrders: number;
    tier1Count: number;
    tier1Rate: number;
    tier2Count: number;
    tier2Rate: number;
  };
}
