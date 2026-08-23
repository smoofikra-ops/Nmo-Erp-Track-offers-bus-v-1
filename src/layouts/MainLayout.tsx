import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { cn } from '@/utils/cn';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300 lg:ps-[64px]"
      )}>
        <Header />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="w-full max-w-full px-2 sm:px-4 py-6 sm:py-8 lg:px-8 min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
