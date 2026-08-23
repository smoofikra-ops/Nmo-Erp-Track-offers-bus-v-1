import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isPinned: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  togglePin: () => void;
  setIsPinned: (val: boolean) => void;
  setIsHovered: (val: boolean) => void;
  toggleMobile: () => void;
  setIsMobileOpen: (val: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sidebar_pinned');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sidebar_pinned', String(isPinned));
    } catch {
      // ignore
    }
  }, [isPinned]);

  const togglePin = () => setIsPinned(prev => !prev);
  const toggleMobile = () => setIsMobileOpen(prev => !prev);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      toggleMobile();
    } else {
      togglePin();
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isPinned,
        isHovered,
        isMobileOpen,
        togglePin,
        setIsPinned,
        setIsHovered,
        toggleMobile,
        setIsMobileOpen,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

