import { calculateOfferItem, calculateOfferTotals } from './quoteCalculator';
import { QuoteProduct, ProductCategory, ProductUnitType, AdjustmentType } from '../../../types/quotes';

function runTests() {
  console.log('Running Quote Calculator Tests...');

  // --- Case 1 ---
  // Purchase Cost Inc VAT = 80
  // Selling Price Inc VAT = 100
  // Qty = 1
  // No discounts/expenses
  console.log('\n--- Case 1 ---');
  const product1: QuoteProduct = {
    id: 'P1', companyId: 'C1', sku: 'S1', nameAr: 'P1', category: ProductCategory.Others, unitType: ProductUnitType.Piece, unitsPerItem: 1,
    vatRate: 0.15,
    purchaseCostExVat: 80 / 1.15,
    purchaseCostIncVat: 80,
    storePrice: 100, marketPrice: 100, suggestedPrice: 100, availableQuantity: 10,
    active: true, isDeleted: false, createdAt: '', updatedAt: ''
  };
  
  const item1 = calculateOfferItem(product1, 1, 100);
  const totals1 = calculateOfferTotals([item1], []);

  console.assert(totals1.customerFinalPrice === 100, `Case 1: customerFinalPrice expected 100, got ${totals1.customerFinalPrice}`);
  console.assert(totals1.profitAmount === 20, `Case 1: profitAmount expected 20, got ${totals1.profitAmount}`);
  console.assert(totals1.profitMarginPercent === 20, `Case 1: profitMarginPercent expected 20, got ${totals1.profitMarginPercent}`);
  console.assert(totals1.markupPercent === 25, `Case 1: markupPercent expected 25, got ${totals1.markupPercent}`);
  console.log('Case 1 passed.');

  // --- Case 2 ---
  // Cost: 800
  // Selling: 1000
  // Discount: 50
  // Expense: 30
  console.log('\n--- Case 2 ---');
  const product2: QuoteProduct = {
    id: 'P2', companyId: 'C1', sku: 'S2', nameAr: 'P2', category: ProductCategory.Others, unitType: ProductUnitType.Piece, unitsPerItem: 1,
    vatRate: 0.15,
    purchaseCostExVat: 800 / 1.15,
    purchaseCostIncVat: 800,
    storePrice: 1000, marketPrice: 1000, suggestedPrice: 1000, availableQuantity: 10,
    active: true, isDeleted: false, createdAt: '', updatedAt: ''
  };

  const item2 = calculateOfferItem(product2, 1, 1000);
  const totals2 = calculateOfferTotals([item2], [
    { id: 'd1', offerId: 'o1', name: 'Discount', type: AdjustmentType.Discount, value: 50 },
    { id: 'e1', offerId: 'o1', name: 'Expense', type: AdjustmentType.Expense, value: 30 }
  ]);

  console.assert(totals2.customerFinalPrice === 950, `Case 2: customerFinalPrice expected 950, got ${totals2.customerFinalPrice}`);
  console.assert(totals2.profitAmount === 120, `Case 2: profitAmount expected 120, got ${totals2.profitAmount}`);
  // 120 / 950 * 100 = 12.6315...
  console.assert(Math.abs(totals2.profitMarginPercent - 12.63) < 0.01, `Case 2: profitMarginPercent expected ~12.63, got ${totals2.profitMarginPercent}`);
  console.assert(totals2.markupPercent === 15, `Case 2: markupPercent expected 15, got ${totals2.markupPercent}`);
  console.log('Case 2 passed.');
  
  // --- Case 3 ---
  // Test zero values for infinity/NaN prevention
  console.log('\n--- Case 3 ---');
  const totals3 = calculateOfferTotals([], []);
  console.assert(totals3.customerFinalPrice === 0, `Case 3: expected 0, got ${totals3.customerFinalPrice}`);
  console.assert(totals3.profitMarginPercent === 0, `Case 3: expected 0, got ${totals3.profitMarginPercent}`);
  console.assert(totals3.markupPercent === 0, `Case 3: expected 0, got ${totals3.markupPercent}`);
  console.log('Case 3 passed.');
  
  // --- Case 4 ---
  // Reject negative values and invalid quantities
  console.log('\n--- Case 4 ---');
  const item4 = calculateOfferItem(product1, -5, -20);
  console.assert(item4.quantity === 0, `Case 4: quantity expected 0, got ${item4.quantity}`);
  console.assert(item4.unitSellingPriceIncVat === 0, `Case 4: unitSellingPriceIncVat expected 0, got ${item4.unitSellingPriceIncVat}`);
  console.log('Case 4 passed.');
  
  console.log('\nAll tests passed successfully!');
}

runTests();
