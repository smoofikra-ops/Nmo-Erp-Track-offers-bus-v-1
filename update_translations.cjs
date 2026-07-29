const fs = require('fs');
const path = require('path');

const arPath = path.join('src', 'translations', 'ar.json');
const enPath = path.join('src', 'translations', 'en.json');

let ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

ar.modules.quotes = "عروض الأسعار";
ar.modules.quotesAndCosting = "عروض الأسعار والتكاليف";
ar.quotes = {
  "title": "عروض الأسعار",
  "newQuote": "إنشاء عرض جديد",
  "history": "سجل العروض",
  "catalog": "كتالوج المنتجات",
  "addToQuote": "إضافة للعرض",
  "search": "بحث بالاسم أو SKU...",
  "categoryFilter": "جميع التصنيفات",
  "emptyCatalog": "لا توجد منتجات مطابقة",
  "productAdded": "تم إضافة المنتج بنجاح",
  "productUpdated": "تم تحديث الكمية",
  "quoteBuilder": "بناء عرض السعر",
  "saveQuote": "حفظ العرض",
  "customerName": "اسم العميل",
  "customerPhone": "رقم الهاتف",
  "customerEmail": "البريد الإلكتروني",
  "customerAddress": "العنوان",
  "validUntil": "صالح حتى",
  "notes": "ملاحظات",
  "terms": "الشروط والأحكام",
  "quoteTitle": "عنوان العرض",
  "offerNumber": "رقم العرض",
  "date": "التاريخ",
  "status": "الحالة",
  "finalPrice": "السعر النهائي",
  "profit": "الربح",
  "margin": "هامش الربح",
  "details": "التفاصيل",
  "summary": "الملخص المالي",
  "purchaseCost": "تكلفة الشراء",
  "subtotal": "المجموع قبل الضريبة",
  "vat": "الضريبة",
  "total": "إجمالي البيع",
  "discounts": "الخصومات",
  "expenses": "المصروفات",
  "markup": "نسبة الزيادة",
  "quantity": "الكمية",
  "sellingPrice": "سعر البيع",
  "remove": "حذف",
  "emptyQuote": "لا توجد منتجات في العرض الحالي",
  "successSave": "تم حفظ عرض السعر بنجاح"
};

en.modules.quotes = "Price Quotes";
en.modules.quotesAndCosting = "Quotes & Costing";
en.quotes = {
  "title": "Price Quotes",
  "newQuote": "New Quote",
  "history": "Quotes History",
  "catalog": "Products Catalog",
  "addToQuote": "Add to Quote",
  "search": "Search by name or SKU...",
  "categoryFilter": "All Categories",
  "emptyCatalog": "No products found",
  "productAdded": "Product added successfully",
  "productUpdated": "Quantity updated",
  "quoteBuilder": "Quote Builder",
  "saveQuote": "Save Quote",
  "customerName": "Customer Name",
  "customerPhone": "Phone",
  "customerEmail": "Email",
  "customerAddress": "Address",
  "validUntil": "Valid Until",
  "notes": "Notes",
  "terms": "Terms & Conditions",
  "quoteTitle": "Quote Title",
  "offerNumber": "Quote Number",
  "date": "Date",
  "status": "Status",
  "finalPrice": "Final Price",
  "profit": "Profit",
  "margin": "Margin",
  "details": "Details",
  "summary": "Financial Summary",
  "purchaseCost": "Purchase Cost",
  "subtotal": "Subtotal (ex VAT)",
  "vat": "VAT",
  "total": "Total",
  "discounts": "Discounts",
  "expenses": "Expenses",
  "markup": "Markup",
  "quantity": "Quantity",
  "sellingPrice": "Selling Price",
  "remove": "Remove",
  "emptyQuote": "No products in current quote",
  "successSave": "Quote saved successfully"
};

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
