import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isPinned: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  togglePin: () => void;
  setIsHovered: (val: boolean) => void;
  toggleMobile: () => void;
  setIsMobileOpen: (val: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('sidebar_pinned');
    return saved !== null ? saved === 'true' : true; // Default pinned
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar_pinned', String(isPinned));
  }, [isPinned]);

  const togglePin = () => setIsPinned(!isPinned);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <SidebarContext.Provider value={{ isPinned, isHovered, isMobileOpen, togglePin, setIsHovered, toggleMobile, setIsMobileOpen }}>
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
