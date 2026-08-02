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
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useSettings } from "@/contexts/SettingsContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "./ui/button";

export function Sidebar() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { isOpen, setIsOpen } = useSidebar();
  const location = useLocation();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location.pathname, setIsOpen]);

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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-72 flex-col border-e bg-white shadow-sm transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-6 justify-between">
          <div className="flex flex-col justify-center items-start overflow-hidden">
            {settings.LogoURL ? (
              <img
                src={settings.LogoURL}
                alt="Logo"
                className="max-h-8 mb-1 object-contain"
              />
            ) : null}
            <h1 className="text-xl font-bold text-indigo-900 tracking-tight truncate w-full">
              {settings.CompanyNameAr || "NMO Labs Operations OS"}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t p-4">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )
            }
          >
            <Settings className="h-5 w-5 shrink-0" />
            {t("common.settings")}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
