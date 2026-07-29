import {
  AdjustmentType,
  OfferAdjustment,
  OfferItem,
  OfferTotals,
  QuoteProduct
} from '../../../types/quotes';

const roundMoney = (value: number): number =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const safeNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

export function calculateOfferTotals(
  items: OfferItem[],
  adjustments: OfferAdjustment[],
): OfferTotals {
  const purchaseCostIncVat = items.reduce(
    (sum, item) => sum + safeNumber(item.linePurchaseTotalIncVat),
    0,
  );

  const sellingSubtotalExVat = items.reduce(
    (sum, item) => sum + safeNumber(item.lineSellingSubtotalExVat),
    0,
  );

  const vatAmount = items.reduce(
    (sum, item) => sum + safeNumber(item.lineVatAmount),
    0,
  );

  const sellingTotalIncVat = items.reduce(
    (sum, item) => sum + safeNumber(item.lineSellingTotalIncVat),
    0,
  );

  const discountsTotal = adjustments
    .filter((item) => item.type === AdjustmentType.Discount)
    .reduce((sum, item) => sum + safeNumber(item.value), 0);

  const expensesTotal = adjustments
    .filter((item) => item.type === AdjustmentType.Expense)
    .reduce((sum, item) => sum + safeNumber(item.value), 0);

  const customerFinalPrice = Math.max(
    0,
    sellingTotalIncVat - discountsTotal,
  );

  const profitAmount =
    customerFinalPrice - purchaseCostIncVat - expensesTotal;

  const profitMarginPercent =
    customerFinalPrice > 0
      ? (profitAmount / customerFinalPrice) * 100
      : 0;

  const markupPercent =
    purchaseCostIncVat > 0
      ? (profitAmount / purchaseCostIncVat) * 100
      : 0;

  const totalQuantity = items.reduce(
    (sum, item) => sum + safeNumber(item.quantity),
    0,
  );

  return {
    purchaseCostIncVat: roundMoney(purchaseCostIncVat),
    sellingSubtotalExVat: roundMoney(sellingSubtotalExVat),
    vatAmount: roundMoney(vatAmount),
    sellingTotalIncVat: roundMoney(sellingTotalIncVat),
    discountsTotal: roundMoney(discountsTotal),
    expensesTotal: roundMoney(expensesTotal),
    customerFinalPrice: roundMoney(customerFinalPrice),
    profitAmount: roundMoney(profitAmount),
    profitMarginPercent: roundMoney(profitMarginPercent),
    markupPercent: roundMoney(markupPercent),
    totalQuantity,
  };
}

export function calculateOfferItem(
  product: any,
  quantity: number,
  sellingPriceIncVat?: number,
): OfferItem {
  const safeQty = Math.max(0, safeNumber(quantity));
  
  const vatRate = safeNumber((product.VATRate || product.vatRate || 15));
  
  const unitPurchaseCostIncVat = safeNumber((product.PurchaseCostIncVAT || product.purchaseCostIncVat || 0));
  const unitPurchaseCostExVat = unitPurchaseCostIncVat / (1 + vatRate);
  
  const finalUnitSellingPriceIncVat = sellingPriceIncVat !== undefined 
    ? Math.max(0, safeNumber(sellingPriceIncVat)) 
    : safeNumber((product.SellingPriceIncVAT || product.suggestedPrice || 0));
    
  const finalUnitSellingPriceExVat = finalUnitSellingPriceIncVat / (1 + vatRate);

  const linePurchaseTotalIncVat = unitPurchaseCostIncVat * safeQty;
  const lineSellingTotalIncVat = finalUnitSellingPriceIncVat * safeQty;
  const lineSellingSubtotalExVat = finalUnitSellingPriceExVat * safeQty;
  const lineVatAmount = lineSellingTotalIncVat - lineSellingSubtotalExVat;

  return {
    id: '', 
    offerId: '',
    productId: (product.ProductID || product.id),
    sku: (product.SKU || product.sku),
    productName: (product.ArabicName || product.nameAr),
    unitType: (product.UnitType || product.unitType || "unit"),
    quantity: safeQty,
    vatRate,
    unitPurchaseCostExVat: roundMoney(unitPurchaseCostExVat),
    unitPurchaseCostIncVat: roundMoney(unitPurchaseCostIncVat),
    unitSellingPriceExVat: roundMoney(finalUnitSellingPriceExVat),
    unitSellingPriceIncVat: roundMoney(finalUnitSellingPriceIncVat),
    linePurchaseTotalIncVat: roundMoney(linePurchaseTotalIncVat),
    lineSellingSubtotalExVat: roundMoney(lineSellingSubtotalExVat),
    lineVatAmount: roundMoney(lineVatAmount),
    lineSellingTotalIncVat: roundMoney(lineSellingTotalIncVat),
  };
}
