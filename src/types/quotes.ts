export type QuoteStatus =
  | 'draft'
  | 'approved'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export interface QuoteCatalogProduct {
  id: string;
  sku: string;
  nameAr: string;
  nameEn?: string;
  category: string;

  inventoryUnitName: string;
  offerUnitName: string;

  offerUnitsPerInventoryItem: number;
  piecesPerOfferUnit?: number;

  purchaseCostPerOfferUnitExVat: number;
  purchaseCostPerOfferUnitIncVat: number;

  storePricePerOfferUnitExVat: number;
  storePricePerOfferUnitIncVat: number;

  suggestedPricePerOfferUnitExVat?: number;
  suggestedPricePerOfferUnitIncVat?: number;

  marketPricePerOfferUnitIncVat?: number;

  vatRate: number;
  availableOfferUnits?: number;

  imageUrl?: string;
  active: boolean;
  configurationComplete?: boolean;
}

export interface QuoteCartItem {
  productId: string;
  sku: string;
  productName: string;
  imageUrl?: string;

  offerUnitName: string;
  piecesPerOfferUnit?: number;

  quantity: number;

  unitPurchaseCostExVat: number;
  unitPurchaseCostIncVat: number;

  unitSellingPriceExVat: number;
  unitSellingPriceIncVat: number;

  defaultUnitSellingPriceIncVat: number;
  marketPricePerOfferUnitIncVat?: number;

  vatRate: number;
  availableOfferUnits?: number;
}

export interface QuoteItemSnapshot {
  id: string;
  quoteId: string;

  productId: string;
  sku: string;
  productName: string;
  category?: string;
  imageUrl?: string;

  inventoryUnitName?: string;
  offerUnitName: string;
  offerUnitsPerInventoryItem?: number;
  piecesPerOfferUnit?: number;

  quantity: number;

  unitPurchaseCostExVat: number;
  unitPurchaseCostIncVat: number;

  defaultUnitSellingPriceIncVat: number;
  unitSellingPriceExVat: number;
  unitSellingPriceIncVat: number;

  vatRate: number;

  linePurchaseCostExVat: number;
  linePurchaseCostIncVat: number;

  lineSellingPriceExVat: number;
  lineSellingPriceIncVat: number;
}

export interface QuoteAdjustment {
  id: string;
  name: string;
  type: 'discount' | 'addition' | 'internal_expense';
  calculationType: 'fixed' | 'percentage';
  value: number;
  calculatedAmount: number;
  notes?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;

  title: string;

  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;

  salesRepresentativeId?: string;
  salesRepresentativeName?: string;

  createdAt: string;
  updatedAt: string;
  validUntil?: string;
  approvedAt?: string;

  items: QuoteItemSnapshot[];
  adjustments: QuoteAdjustment[];

  totals: {
    purchaseCostExVat: number;
    inputVat: number;
    purchaseCostIncVat: number;

    retailValueExVat: number;
    outputVat: number;
    retailValueIncVat: number;

    discountTotal: number;
    additionTotal: number;
    internalExpenseTotal: number;

    finalQuotePriceIncVat: number;
    netProfit: number;
    profitMarginPercent: number;

    totalOfferUnits: number;
    totalPieces: number;
  };

  paymentTerms?: string;
  deliveryTerms?: string;
  customerNotes?: string;
  internalNotes?: string;
  terms?: string;

  createdBy?: string;
  updatedBy?: string;
}
