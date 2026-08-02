import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/utils/cn';

export function MainLayout() {
  const { isPinned } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        isPinned ? "lg:ps-72" : "lg:ps-20"
      )}>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
