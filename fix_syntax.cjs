const fs = require('fs');
let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

// We need to restore the lost functions.
// Let's replace the top part until `const printContent`

const brokenTopPartRegex = /React\.useEffect\(\(\) => \{[\s\S]*?const printContent = \(/;

const fixedTopPart = `React.useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        const orig = setPrintTitle();
        window.print();
        document.title = orig;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const setPrintTitle = () => {
    const originalTitle = document.title;
    const commTypeStr = record.commissionType === 'PRODUCT_COMMISSION' ? 'عمولة المنتجات' : 'عمولة عدد الطلبات';
    const finalReq = record.finalRequiredAmount !== undefined 
      ? record.finalRequiredAmount 
      : ((record.totalRequiredAmount || record.totalOrderValue || 0) - (record.onlinePaidAmount || 0) - (record.totalDiscounts || record.totalDiscount || 0));
    const dateStr = record.createdAt ? record.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
    
    document.title = \`\${commTypeStr} - \${record.employeeName} - \${record.grossCommission.toFixed(2)} ريال - \${finalReq.toFixed(2)} ريال - \${dateStr}\`;
    return originalTitle;
  };

  const handlePrint = () => {
    const orig = setPrintTitle();
    window.print();
    document.title = orig;
  };

  const printContent = (`;

code = code.replace(brokenTopPartRegex, fixedTopPart);
fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
