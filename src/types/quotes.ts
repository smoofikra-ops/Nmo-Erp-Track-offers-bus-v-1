export enum ProductCategory {
  Tissues = 'tissues',
  Rolls = 'rolls',
  TrashBags = 'trash_bags',
  Detergents = 'detergents',
  Cups = 'cups',
  Others = 'others',
}

export enum ProductUnitType {
  Bundle = 'bundle',
  Carton = 'carton',
  Roll = 'roll',
  Piece = 'piece',
  Pack = 'pack',
}

export enum AdjustmentType {
  Discount = 'discount',
  Expense = 'expense',
}

export enum OfferStatus {
  Draft = 'draft',
  Approved = 'approved',
  Cancelled = 'cancelled',
  Converted = 'converted',
}

export interface QuoteProduct {
  id: string;
  companyId: string;
  sku: string;
  nameAr: string;
  nameEn?: string;
  category: ProductCategory;
  unitType: ProductUnitType;
  unitsPerItem: number;

  vatRate: number;

  purchaseCostExVat: number;
  purchaseCostIncVat: number;

  storePrice: number;
  marketPrice: number;
  suggestedPrice: number;

  availableQuantity: number;

  imageUrl?: string;
  active: boolean;
  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface OfferItem {
  id: string;
  offerId: string;
  productId: string;

  sku: string;
  productName: string;
  unitType: ProductUnitType;

  quantity: number;

  vatRate: number;
  unitPurchaseCostExVat: number;
  unitPurchaseCostIncVat: number;
  unitSellingPriceExVat: number;
  unitSellingPriceIncVat: number;

  linePurchaseTotalIncVat: number;
  lineSellingSubtotalExVat: number;
  lineVatAmount: number;
  lineSellingTotalIncVat: number;
}

export interface OfferAdjustment {
  id: string;
  offerId: string;
  name: string;
  type: AdjustmentType;
  value: number;
}

export interface OfferTotals {
  purchaseCostIncVat: number;

  sellingSubtotalExVat: number;
  vatAmount: number;
  sellingTotalIncVat: number;

  discountsTotal: number;
  expensesTotal: number;

  customerFinalPrice: number;
  profitAmount: number;
  profitMarginPercent: number;
  markupPercent: number;

  totalQuantity: number;
}

export interface QuoteOffer {
  id: string;
  companyId: string;
  offerNumber: string;
  title: string;

  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;

  status: OfferStatus;

  items: OfferItem[];
  adjustments: OfferAdjustment[];
  totals: OfferTotals;

  notes?: string;
  terms?: string;
  validUntil?: string;

  createdAt: string;
  updatedAt: string;
}
