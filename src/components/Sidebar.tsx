import React, { useEffect } from "react";
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
  Pin,
  PinOff
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useSettings } from "@/contexts/SettingsContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "./ui/button";

export function Sidebar() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { 
    isPinned, togglePin, 
    isHovered, setIsHovered, 
    isMobileOpen, setIsMobileOpen 
  } = useSidebar();
  const location = useLocation();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, setIsMobileOpen]);

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
  
  const isExpanded = isPinned || isHovered;

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex flex-col border-e bg-white shadow-sm transition-all duration-300 ease-in-out",
          // Mobile classes
          "w-72 lg:w-auto", 
          isMobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:translate-x-0",
          // Desktop expansion
          isExpanded ? "lg:w-72" : "lg:w-20"
        )}
      >
        <div className="relative flex flex-col items-center pt-6 pb-4 border-b border-slate-100 min-h-[120px]">
          {/* Pin Button (Desktop only) */}
          <button 
            onClick={togglePin}
            className={cn(
              "absolute top-4 start-4 hidden lg:flex text-slate-400 hover:text-indigo-600 transition-opacity",
              isExpanded ? "opacity-100" : "opacity-0"
            )}
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
          
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 end-2 lg:hidden text-slate-500"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Logo & Company Name */}
          <div className="flex flex-col items-center justify-center w-full px-4 gap-3">
            {settings.LogoURL ? (
              <img
                src={settings.LogoURL}
                alt="Logo"
                className={cn(
                  "object-contain transition-all duration-300",
                  isExpanded ? "h-12 w-auto max-w-full" : "h-8 w-8"
                )}
              />
            ) : (
              <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-6 h-6" />
              </div>
            )}
            
            <h1 
              className={cn(
                "font-bold text-indigo-900 tracking-tight text-center transition-all duration-300 overflow-hidden whitespace-nowrap",
                isExpanded ? "text-sm max-w-full opacity-100" : "w-0 opacity-0 h-0 m-0"
              )}
            >
              {settings.CompanyNameAr || "NMO Labs OS"}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={!isExpanded ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  !isExpanded && "justify-center"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span 
                className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden",
                  isExpanded ? "ms-3 opacity-100 w-auto" : "opacity-0 w-0 ms-0"
                )}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        <div className="border-t p-3">
          <NavLink
            to="/settings"
            title={!isExpanded ? t("common.settings") : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                !isExpanded && "justify-center"
              )
            }
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span 
                className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden",
                  isExpanded ? "ms-3 opacity-100 w-auto" : "opacity-0 w-0 ms-0"
                )}
              >
              {t("common.settings")}
            </span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
