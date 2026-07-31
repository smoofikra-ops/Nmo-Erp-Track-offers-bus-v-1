import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Auth/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Settings } from '@/pages/Settings';
import { ComingSoon } from '@/pages/ComingSoon';
import { CommissionsHub } from '@/pages/Commissions';
import { OrderCountCommission } from '@/pages/Commissions/OrderCountCommission';
import { ProductCommission } from '@/pages/Commissions/ProductCommission';
import { CommissionHistory } from '@/pages/Commissions/History';
import { CommissionRecords } from '@/pages/Commissions/CommissionRecords';
import { DailyClosings } from '@/pages/Commissions/Closings';
import { CommissionReports } from '@/pages/Commissions/Reports';
import { Employees } from '@/pages/Employees';
import { Products } from '@/pages/Products';
import { QuotesPage } from '@/pages/Quotes';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
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
            element: <Settings />,
          },
          {
            path: 'quotes',
            element: <QuotesPage />,
          },
          {
            path: 'commission',
            element: <CommissionsHub />,
          },
          {
            path: 'commission/order-count',
            element: <OrderCountCommission />,
          },
          {
            path: 'commission/products',
            element: <ProductCommission />,
          },
          {
            path: 'commission/history',
            element: <CommissionRecords />,
          },
          {
            path: 'commission/records',
            element: <CommissionRecords />,
          },
          {
            path: 'commission/closings',
            element: <DailyClosings />,
          },
          {
            path: 'commission/reports',
            element: <CommissionReports />,
          },
          {
            path: 'hr',
            element: <Employees />,
          },
          {
            path: 'inventory',
            element: <Products />,
          },
          {
            path: '*',
            element: <ComingSoon />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
