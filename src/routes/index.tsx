import React, { Suspense } from 'react';
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
const Fleet = React.lazy(() => import('@/pages/Fleet').then(m => ({ default: m.default })));
const ReportsPage = React.lazy(() => import('@/pages/Reports').then(m => ({ default: m.ReportsPage })));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
    {children}
  </Suspense>
);


const router = createBrowserRouter([
  { path: '*', element: <SuspenseWrapper><ComingSoon /></SuspenseWrapper>, errorElement: <RouteErrorBoundary /> },
  {
    path: '/login',
    element: <Login />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'settings',
            element: <SuspenseWrapper><Settings /></SuspenseWrapper>,
          },
          {
            path: 'quotes',
            element: <SuspenseWrapper><QuotesPage /></SuspenseWrapper>,
          },
          {
            path: 'commission',
            element: <SuspenseWrapper><CommissionsHub /></SuspenseWrapper>,
          },
          {
            path: 'commission/order-count',
            element: <SuspenseWrapper><OrderCountCommission /></SuspenseWrapper>,
          },
          {
            path: 'commission/products',
            element: <SuspenseWrapper><ProductCommission /></SuspenseWrapper>,
          },
          {
            path: 'commission/history',
            element: <SuspenseWrapper><CommissionRecords /></SuspenseWrapper>,
          },
          {
            path: 'commission/records',
            element: <SuspenseWrapper><CommissionRecords /></SuspenseWrapper>,
          },
          {
            path: 'commission/closings',
            element: <SuspenseWrapper><DailyClosings /></SuspenseWrapper>,
          },
          {
            path: 'commission/reports',
            element: <SuspenseWrapper><CommissionReports /></SuspenseWrapper>,
          },
          {
            path: 'hr',
            element: <SuspenseWrapper><Employees /></SuspenseWrapper>,
          },
          {
            path: 'inventory',
            element: <SuspenseWrapper><Products /></SuspenseWrapper>,
          },
          {
            path: 'fleet',
            element: <SuspenseWrapper><Fleet /></SuspenseWrapper>,
          },
          {
            path: 'vehicles',
            element: <SuspenseWrapper><Fleet /></SuspenseWrapper>,
          },
          {
            path: 'reports',
            element: <SuspenseWrapper><ReportsPage /></SuspenseWrapper>,
          },
          {
            path: '*',
            element: <SuspenseWrapper><ComingSoon /></SuspenseWrapper>,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
