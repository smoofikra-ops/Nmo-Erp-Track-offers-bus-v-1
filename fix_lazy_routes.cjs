const fs = require('fs');

let code = fs.readFileSync('src/routes/index.tsx', 'utf8');

const imports = `import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Eagerly loaded
import { Login } from '@/pages/Auth/Login';
import { Dashboard } from '@/pages/Dashboard';

// Lazy loaded heavy routes
const Settings = React.lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));
const ComingSoon = React.lazy(() => import('@/pages/ComingSoon').then(m => ({ default: m.ComingSoon })));
const CommissionsHub = React.lazy(() => import('@/pages/Commissions').then(m => ({ default: m.CommissionsHub })));
const OrderCountCommission = React.lazy(() => import('@/pages/Commissions/OrderCountCommission').then(m => ({ default: m.OrderCountCommission })));
const ProductCommission = React.lazy(() => import('@/pages/Commissions/ProductCommission').then(m => ({ default: m.ProductCommission })));
const CommissionRecords = React.lazy(() => import('@/pages/Commissions/CommissionRecords').then(m => ({ default: m.CommissionRecords })));
const DailyClosings = React.lazy(() => import('@/pages/Commissions/Closings').then(m => ({ default: m.DailyClosings })));
const CommissionReports = React.lazy(() => import('@/pages/Commissions/Reports').then(m => ({ default: m.CommissionReports })));
const Employees = React.lazy(() => import('@/pages/Employees').then(m => ({ default: m.Employees })));
const Products = React.lazy(() => import('@/pages/Products').then(m => ({ default: m.Products })));
const QuotesPage = React.lazy(() => import('@/pages/Quotes').then(m => ({ default: m.QuotesPage })));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
    {children}
  </Suspense>
);
`;

const replaceRegex = /import \{ RouteErrorBoundary \}[\s\S]*?import \{ TermsOfService \} from '@\/pages\/TermsOfService';/;
code = code.replace(replaceRegex, imports);

// Now wrap elements in SuspenseWrapper
code = code.replace(/element: <Settings \/>/g, 'element: <SuspenseWrapper><Settings /></SuspenseWrapper>');
code = code.replace(/element: <ComingSoon \/>/g, 'element: <SuspenseWrapper><ComingSoon /></SuspenseWrapper>');
code = code.replace(/element: <CommissionsHub \/>/g, 'element: <SuspenseWrapper><CommissionsHub /></SuspenseWrapper>');
code = code.replace(/element: <OrderCountCommission \/>/g, 'element: <SuspenseWrapper><OrderCountCommission /></SuspenseWrapper>');
code = code.replace(/element: <ProductCommission \/>/g, 'element: <SuspenseWrapper><ProductCommission /></SuspenseWrapper>');
code = code.replace(/element: <CommissionRecords \/>/g, 'element: <SuspenseWrapper><CommissionRecords /></SuspenseWrapper>');
code = code.replace(/element: <DailyClosings \/>/g, 'element: <SuspenseWrapper><DailyClosings /></SuspenseWrapper>');
code = code.replace(/element: <CommissionReports \/>/g, 'element: <SuspenseWrapper><CommissionReports /></SuspenseWrapper>');
code = code.replace(/element: <Employees \/>/g, 'element: <SuspenseWrapper><Employees /></SuspenseWrapper>');
code = code.replace(/element: <Products \/>/g, 'element: <SuspenseWrapper><Products /></SuspenseWrapper>');
code = code.replace(/element: <QuotesPage \/>/g, 'element: <SuspenseWrapper><QuotesPage /></SuspenseWrapper>');
code = code.replace(/path: 'commission\/history',\n\s*element: <CommissionHistory \/>,/, ''); // Removed since it's duplicate of records

fs.writeFileSync('src/routes/index.tsx', code);
console.log("Applied lazy loading to routes");
