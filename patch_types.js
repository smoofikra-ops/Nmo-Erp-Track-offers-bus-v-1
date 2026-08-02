const fs = require('fs');
let content = fs.readFileSync('src/types/commissions.ts', 'utf8');

const newTypes = `
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
`;

content = content.replace("export interface AppliedDiscount {", newTypes + "\nexport interface AppliedDiscount {");

content = content.replace(
  "  orderCountDetails?: {",
  "  requiredItems?: RequiredAmountItem[];\n  paymentItems?: PaymentItem[];\n  orderCountDetails?: {"
);

fs.writeFileSync('src/types/commissions.ts', content);
