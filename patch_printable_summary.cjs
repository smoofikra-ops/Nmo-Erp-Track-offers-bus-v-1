const fs = require('fs');
let content = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

// Add useAuth if not present
if (!content.includes('useAuth')) {
    content = content.replace("import { useSettings } from '@/contexts/SettingsContext';", "import { useSettings } from '@/contexts/SettingsContext';\nimport { useAuth } from '@/contexts/AuthContext';");
    content = content.replace("const { settings } = useSettings();", "const { settings } = useSettings();\n  const { user } = useAuth();");
}

// Replace footer
const oldFooter = `{/* Footer stamp */}
          <div className="mt-12 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 flex justify-between items-center">
            <span>تم استخراج هذا المستند تلقائياً عبر نظام {settings?.CompanyNameAr || 'NMO Labs Operations OS'}</span>
            <span>تاريخ الطباعة: {new Date().toLocaleString('ar-SA')}</span>
          </div>`;

const newFooter = `{/* Footer stamp */}
          <div className="mt-12 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-end print:block print:w-full print:pt-4">
            <div className="flex flex-col gap-1 text-right">
              <span className="font-medium text-slate-700">تم إنشاء هذا المستند بواسطة: NmoLabs Flow ERP</span>
              <span>تاريخ الطباعة: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date().toLocaleTimeString('ar-SA')}</span>
            </div>
            <div className="flex flex-col gap-1 text-left">
              <span>Printed By: {user?.name || 'System Admin'}</span>
              <span>Document Version: Version 1.0</span>
            </div>
          </div>`;

content = content.replace(oldFooter, newFooter);

// Replace Date format in top info row
content = content.replace(
  "{record.date ? new Date(record.date).toLocaleDateString('ar-SA') : new Date(record.createdAt).toLocaleDateString('ar-SA')}",
  "{record.date ? new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}"
);
content = content.replace(
  "{record.formattedDate || (record.createdAt ? new Date(record.createdAt).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA'))}",
  "{record.formattedDate || (record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))}"
);

// Apply logo from branding settings (the user says "استخدام شعار الشركة الموجود داخل Branding Settings... واسم الشركة... الرقم الضريبي... السجل التجاري... الموقع... وسائل التواصل... حسب إعدادات الطباعة")
// The header already uses this, but let's check it.
fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', content);
