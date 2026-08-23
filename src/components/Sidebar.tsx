import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Calculator,
  Truck,
  Users,
  Package,
  BarChart,
  Settings,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useSettings } from "@/contexts/SettingsContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "./ui/button";

export function Sidebar() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { 
    isHovered, setIsHovered, 
    isMobileOpen, setIsMobileOpen,
    isPinned, togglePin
  } = useSidebar();
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const [isClickedOpen, setIsClickedOpen] = useState(false);

  // Close sidebar on mobile when navigating, and on desktop when navigating
  useEffect(() => {
    setIsMobileOpen(false);
    setIsClickedOpen(false);
    setIsHovered(false);
  }, [location.pathname, setIsMobileOpen, setIsHovered]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
        setIsClickedOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsMobileOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
        setIsClickedOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setIsMobileOpen]);

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t("common.dashboard") },
    { to: "/commission", icon: Calculator, label: t("modules.commission") },
    { to: "/fleet", icon: Truck, label: t("modules.fleet") },
    { to: "/hr", icon: Users, label: t("employees.list", "Employees") },
    { to: "/inventory", icon: Package, label: t("modules.inventory") },
    {
      to: "/quotes",
      icon: FileText,
      label: t("modules.quotes", "Price Quotes"),
    },
    { to: "/reports", icon: BarChart, label: t("modules.reports") },
  ];
  
  const isExpanded = isHovered || isClickedOpen || isMobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <aside
        ref={sidebarRef}
        onClick={() => {
          if (window.innerWidth >= 1024) setIsClickedOpen(true);
        }}
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (window.innerWidth >= 1024) setIsHovered(false);
        }}
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex flex-col border-e bg-white shadow-sm transition-all duration-200 ease-in-out",
          // Mobile classes
          "w-72 lg:w-auto", 
          isMobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:translate-x-0",
          // Desktop expansion
          isExpanded ? "lg:w-[250px]" : "lg:w-[64px]"
        )}
        aria-expanded={isExpanded}
      >
        <div className="relative flex flex-col items-center pt-6 pb-4 border-b border-slate-100 min-h-[120px]">
          
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 end-2 lg:hidden text-slate-500"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileOpen(false);
            }}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Logo & Company Name */}
          <div className={cn(
            "flex flex-col items-center justify-center w-full px-4 gap-3 transition-all duration-200",
            !isExpanded && "px-1"
          )}>
            {settings.LogoURL ? (
              <img
                src={settings.LogoURL}
                alt="Logo"
                className={cn(
                  "object-contain transition-all duration-200",
                  isExpanded ? "h-12 w-auto max-w-full" : "h-8 w-8"
                )}
              />
            ) : (
              <div className={cn(
                "bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                isExpanded ? "w-10 h-10" : "w-8 h-8"
              )}>
                <LayoutDashboard className={cn("transition-all duration-200", isExpanded ? "w-6 h-6" : "w-5 h-5")} />
              </div>
            )}
            
            <h1 
              className={cn(
                "font-bold text-indigo-900 tracking-tight text-center transition-all duration-200 overflow-hidden whitespace-nowrap",
                isExpanded ? "text-sm max-w-full opacity-100 h-auto mt-2" : "w-0 opacity-0 h-0 m-0"
              )}
            >
              {settings.CompanyNameAr || "NMO Labs OS"}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  !isExpanded && "justify-center px-0"
                )
              }
            >
              <item.icon className={cn("shrink-0 transition-all duration-200", isExpanded ? "h-5 w-5" : "h-5 w-5")} aria-hidden="true" />
              
              <span 
                className={cn(
                  "whitespace-nowrap transition-all duration-200 overflow-hidden",
                  isExpanded ? "ms-3 opacity-100 w-auto" : "opacity-0 w-0 ms-0"
                )}
              >
                {item.label}
              </span>

              {/* Tooltip for desktop only when collapsed */}
              {!isExpanded && (
                <div className="absolute start-[72px] rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-[60] pointer-events-none">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        <div className="border-t border-slate-100 p-3">
          <NavLink
            to="/settings"
            aria-label={t("common.settings")}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                !isExpanded && "justify-center px-0"
              )
            }
          >
            <Settings className={cn("shrink-0 transition-all duration-200", isExpanded ? "h-5 w-5" : "h-5 w-5")} aria-hidden="true" />
            <span 
                className={cn(
                  "whitespace-nowrap transition-all duration-200 overflow-hidden",
                  isExpanded ? "ms-3 opacity-100 w-auto" : "opacity-0 w-0 ms-0"
                )}
              >
              {t("common.settings")}
            </span>
            
            {/* Tooltip */}
            {!isExpanded && (
              <div className="absolute start-[72px] rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-[60] pointer-events-none">
                {t("common.settings")}
              </div>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
