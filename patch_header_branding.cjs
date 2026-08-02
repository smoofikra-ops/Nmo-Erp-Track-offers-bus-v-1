const fs = require('fs');
let content = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

const oldHeader = `          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md print:border print:border-emerald-800">
                {settings?.LogoURL && settings?.ShowLogoOnPrint === 'true' ? (    <img src={settings.LogoURL} alt="Logo" className="w-full h-full object-contain rounded-2xl" />  ) : (    <Building2 className="h-9 w-9" />  )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{settings?.CompanyNameAr || 'شركة نمو الفكرة للتجارة'}</h1>
                <p className="text-xs text-slate-500 mt-0.5">قسم المحاسبة والمبيعات - إدارة العمولات</p>
                <span className="inline-block mt-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  {settings?.CommercialRegistration ? \`سجل تجاري: \${settings.CommercialRegistration}\` : 'سجل تجاري: 1010892341'}
                </span>
              </div>
            </div>
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-1 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>تقرير احتساب وخصم رسمي</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">ملخص تسوية وعمولة مندوب</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">{record.transactionNo}</p>
            </div>
          </div>`;

const newHeader = `          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-6 mb-6">
            <div className="flex items-start gap-4">
              {(settings?.ShowLogoOnPrint === 'true' || settings?.ShowLogoOnPrint === true) && settings?.LogoURL ? (
                <div className="h-20 w-20 flex-shrink-0">
                  <img src={settings.LogoURL} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="h-16 w-16 bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md print:border print:border-emerald-800">
                  <Building2 className="h-9 w-9" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{settings?.CompanyNameAr || 'اسم الشركة'}</h1>
                <p className="text-xs text-slate-500">قسم المحاسبة والمبيعات - إدارة العمولات</p>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  {(settings?.ShowCROnPrint === 'true' || settings?.ShowCROnPrint === true) && settings?.CommercialRegistration && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">
                      س.ت: {settings.CommercialRegistration}
                    </span>
                  )}
                  {(settings?.ShowVATOnPrint === 'true' || settings?.ShowVATOnPrint === true) && settings?.VATNumber && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">
                      الرقم الضريبي: {settings.VATNumber}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-500">
                  {(settings?.ShowPhoneOnPrint === 'true' || settings?.ShowPhoneOnPrint === true) && settings?.Phone && <span>هاتف: <span dir="ltr">{settings.Phone}</span></span>}
                  {(settings?.ShowEmailOnPrint === 'true' || settings?.ShowEmailOnPrint === true) && settings?.Email && <span>| ايميل: {settings.Email}</span>}
                  {(settings?.ShowWebsiteOnPrint === 'true' || settings?.ShowWebsiteOnPrint === true) && settings?.Website && <span>| موقع: {settings.Website}</span>}
                  {(settings?.ShowAddressOnPrint === 'true' || settings?.ShowAddressOnPrint === true) && settings?.Address && <span>| عنوان: {settings.Address}</span>}
                </div>
              </div>
            </div>
            <div className="text-left flex flex-col items-end">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>تقرير احتساب وخصم رسمي</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">ملخص تسوية وعمولة مندوب</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">رقم: {record.transactionNo}</p>
            </div>
          </div>`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', content);
