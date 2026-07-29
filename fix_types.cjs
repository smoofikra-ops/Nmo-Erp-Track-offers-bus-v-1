const fs = require('fs');
let code = fs.readFileSync('src/types/models.ts', 'utf8');

const regex = /export interface Product extends BaseEntity \{[^}]+\}/;
const newProductType = `export interface Product extends BaseEntity {
  ProductID: string;
  ProductCode: string;
  SKU: string;
  Barcode?: string;
  ArabicName: string;
  EnglishName: string;
  CategoryID?: string;
  Category?: string;
  UnitID?: string;
  UnitType?: string;
  DefaultCommission: number;
  Status: ProductStatus;
  Notes?: string;
  ImageURL?: string;
  AvailableQuantity?: number;
  PurchaseCostExVAT?: number;
  VATRate?: number;
  PurchaseCostIncVAT?: number;
  SellingPriceExVAT?: number;
  SellingPriceIncVAT?: number;
  ProfitAmount?: number;
  ProfitMargin?: number;
}`;

code = code.replace(regex, newProductType);
fs.writeFileSync('src/types/models.ts', code);
