const fs = require('fs');

function mergeTrans(lang, addObj) {
  const path = `src/translations/${lang}.json`;
  let data = JSON.parse(fs.readFileSync(path, 'utf8'));
  
  if (!data.commissions) data.commissions = {};
  Object.assign(data.commissions, addObj.commissions);
  
  if (!data.common) data.common = {};
  Object.assign(data.common, addObj.common);

  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

const enAdd = {
  commissions: {
    "orderCount": "Order Count Commission",
    "orderCountDesc": "Calculate commission based on monthly orders and tiers.",
    "products": "Product Commission",
    "productsDesc": "Calculate commission based on sold products and quantities.",
    "history": "History",
    "closings": "Daily Closings",
    "reports": "Reports",
    "shortcuts": "Shortcuts",
    "entryForm": "Entry Form",
    "employee": "Employee",
    "selectEmployee": "Select Employee...",
    "newOrders": "New Orders Count",
    "preview": "Calculation Preview",
    "pastOrders": "Past Orders (This Month)",
    "newTotal": "New Total",
    "totalCommission": "Total Commission",
    "limitReached": "The representative has reached 250 orders. Additional orders will be calculated at SAR 4.",
    "saveSuccess": "Commission saved successfully! Receipt: ",
    "stepEmployee": "Employee",
    "stepProducts": "Products",
    "stepDiscounts": "Discounts",
    "stepClosing": "Closing",
    "stepReview": "Review",
    "discounts": "Discounts",
    "dailyClosing": "Daily Closing",
    "requiredAmount": "Required Amount",
    "paidAmount": "Paid Invoices Amount",
    "remainingBalance": "Remaining Balance",
    "review": "Final Review",
    "confirmData": "I confirm that the data has been reviewed and is correct."
  },
  common: {
    "save": "Save", "saving": "Saving...", "cancel": "Cancel", "name": "Name", "amount": "Amount", "notes": "Notes", "clear": "Clear", "search": "Search...", "add": "Add", "back": "Back", "next": "Next"
  }
};

const arAdd = {
  commissions: {
    "orderCount": "عمولة عدد الطلبات",
    "orderCountDesc": "احتساب عمولة المندوب حسب عدد الطلبات الشهرية والشرائح المحددة.",
    "products": "عمولة المنتجات",
    "productsDesc": "احتساب العمولة بناءً على المنتجات والكميات المباعة.",
    "history": "سجل العمليات",
    "closings": "الإغلاقات اليومية",
    "reports": "التقارير",
    "shortcuts": "اختصارات",
    "entryForm": "نموذج الإدخال",
    "employee": "الموظف",
    "selectEmployee": "اختر الموظف...",
    "newOrders": "عدد الطلبات الجديدة",
    "preview": "معاينة الحساب",
    "pastOrders": "الطلبات السابقة هذا الشهر",
    "newTotal": "إجمالي الطلبات",
    "totalCommission": "إجمالي العمولة",
    "limitReached": "وصل المندوب إلى حد 250 طلبًا، وستُحتسب الطلبات الإضافية بسعر 4 ريالات.",
    "saveSuccess": "تم حفظ العمولة بنجاح! رقم الإيصال: ",
    "stepEmployee": "الموظف",
    "stepProducts": "المنتجات",
    "stepDiscounts": "الخصومات",
    "stepClosing": "الإغلاق",
    "stepReview": "المراجعة",
    "discounts": "الخصومات",
    "dailyClosing": "الإغلاق اليومي",
    "requiredAmount": "المبلغ المطلوب",
    "paidAmount": "إجمالي الفواتير المدفوعة",
    "remainingBalance": "الرصيد المتبقي",
    "review": "المراجعة النهائية",
    "confirmData": "أؤكد أن البيانات تمت مراجعتها وهي صحيحة."
  },
  common: {
    "save": "حفظ", "saving": "جاري الحفظ...", "cancel": "إلغاء", "name": "الاسم", "amount": "المبلغ", "notes": "ملاحظات", "clear": "مسح", "search": "بحث...", "add": "إضافة", "back": "السابق", "next": "التالي"
  }
};

mergeTrans('en', enAdd);
mergeTrans('ar', arAdd);
