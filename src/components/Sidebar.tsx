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
  Sparkles,
  ShieldCheck,
  X,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useSettings } from "@/contexts/SettingsContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "./ui/button";

export function Sidebar() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const {
    isPinned,
    togglePin,
    isHovered,
    setIsHovered,
    isMobileOpen,
    setIsMobileOpen,
  } = useSidebar();
  const location = useLocation();
  const desktopSidebarRef = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Close mobile drawer and hover expansion on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsHovered(false);
  }, [location.pathname, setIsMobileOpen, setIsHovered]);

  // Click outside to collapse hover if open and not pinned on desktop
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        desktopSidebarRef.current &&
        !desktopSidebarRef.current.contains(event.target as Node)
      ) {
        if (!isPinned) {
          setIsHovered(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPinned, setIsHovered]);

  // Keyboard accessibility (Escape to close mobile drawer or temporary hover expansion)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        if (!isPinned) {
          setIsHovered(false);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPinned, setIsMobileOpen, setIsHovered]);

  const navItems = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: t("common.dashboard", "لوحة التحكم"),
      exact: true,
    },
    {
      to: "/commission",
      icon: Calculator,
      label: t("modules.commission", "تتبع العمولات"),
      exact: false,
    },
    {
      to: "/fleet",
      icon: Truck,
      label: t("modules.fleet", "الباصات والأسطول"),
      exact: false,
    },
    {
      to: "/hr",
      icon: Users,
      label: t("employees.list", "الموظفون"),
      exact: false,
    },
    {
      to: "/inventory",
      icon: Package,
      label: t("modules.inventory", "المخزون"),
      exact: false,
    },
    {
      to: "/quotes",
      icon: FileText,
      label: t("modules.quotes", "عروض الأسعار"),
      exact: false,
    },
    {
      to: "/documents",
      icon: ShieldCheck,
      label: t("modules.documents", "المستندات والوثائق"),
      exact: false,
    },
    {
      to: "/reports",
      icon: BarChart,
      label: t("modules.reports", "التقارير"),
      exact: false,
    },
    {
      to: "/ai-assistant",
      icon: Sparkles,
      label: "مساعد ريجين الذكي",
      exact: false,
    },
  ];

  const checkIsActive = (to: string, exact?: boolean) => {
    if (exact || to === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(to);
  };

  // Desktop width: 250px when expanded (pinned or hovered), 68px when collapsed
  const isDesktopExpanded = isPinned || isHovered;
  const desktopWidth = isDesktopExpanded ? 250 : 68;

  return (
    <>
      {/* =========================================================================
          1. DESKTOP SIDEBAR (Strictly lg:flex, ALWAYS rendered & visible on Desktop >= 1024px)
          - NEVER translated offscreen
          - NEVER hidden or width 0
          - Width: 68px (collapsed rail) or 250px (expanded)
         ========================================================================= */}
      <aside
        ref={desktopSidebarRef}
        aria-label="Desktop Sidebar Navigation"
        aria-expanded={isDesktopExpanded}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredIndex(null);
        }}
        style={{ width: `${desktopWidth}px` }}
        className={cn(
          "hidden lg:flex fixed inset-y-0 start-0 z-40 flex-col border-e border-slate-200/80 bg-white/95 backdrop-blur-md transition-[width,box-shadow] duration-200 ease-in-out select-none",
          isDesktopExpanded
            ? "shadow-xl shadow-indigo-950/10 ring-1 ring-slate-900/5"
            : "shadow-sm"
        )}
      >
        {/* Header / Logo section */}
        <div className="relative flex flex-col items-center justify-center pt-5 pb-4 px-3 border-b border-slate-100 min-h-[84px] shrink-0">
          {/* Desktop Pin/Unpin Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePin();
            }}
            className={cn(
              "absolute top-3 end-3 p-1.5 rounded-md transition-all duration-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50",
              isDesktopExpanded
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-75 pointer-events-none"
            )}
            title={
              isPinned
                ? t("common.unpinSidebar", "إلغاء تثبيت القائمة")
                : t("common.pinSidebar", "تثبيت القائمة")
            }
            aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {isPinned ? (
              <PinOff className="w-4 h-4 text-indigo-600" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </button>

          {/* Logo & Branding */}
          <div
            className={cn(
              "flex items-center justify-center gap-3 w-full transition-all duration-200",
              !isDesktopExpanded && "flex-col gap-1 px-0"
            )}
          >
            {settings.LogoURL ? (
              <img
                src={settings.LogoURL}
                alt="Logo"
                className={cn(
                  "object-contain transition-all duration-200 shrink-0",
                  isDesktopExpanded ? "h-9 w-auto max-w-[110px]" : "h-8 w-8"
                )}
              />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/20">
                <LayoutDashboard className="w-5 h-5" />
              </div>
            )}

            <div
              className={cn(
                "flex flex-col min-w-0 transition-all duration-200 overflow-hidden whitespace-nowrap",
                isDesktopExpanded
                  ? "opacity-100 w-auto max-w-[150px]"
                  : "opacity-0 w-0 max-w-0 pointer-events-none"
              )}
            >
              <h1 className="font-bold text-sm text-slate-900 tracking-tight truncate">
                {settings.CompanyNameAr || "نظام نمو ERP"}
              </h1>
              <span className="text-[11px] font-medium text-slate-400 truncate">
                NMO Labs OS
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-1.5 scrollbar-thin"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navItems.map((item, index) => {
            const isActive = checkIsActive(item.to, item.exact);
            const isItemHovered = hoveredIndex === index;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                onMouseEnter={() => setHoveredIndex(index)}
                className={cn(
                  "group relative flex items-center rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
                  isDesktopExpanded
                    ? "px-3 py-2.5 w-full justify-start"
                    : "p-2.5 w-11 h-11 mx-auto justify-center",
                  // Active state: Liquid glass & subtle 3D highlight
                  isActive
                    ? "bg-gradient-to-r from-indigo-50/95 via-indigo-100/50 to-purple-50/80 text-indigo-700 font-semibold border border-indigo-200/70 shadow-[0_2px_8px_rgba(79,70,229,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
                    : "text-slate-600 hover:text-indigo-600 border border-transparent",
                  // Soft hover effect when not active
                  !isActive &&
                    isItemHovered &&
                    "bg-slate-50/90 text-slate-900 border-slate-200/50 shadow-sm scale-[1.01]"
                )}
              >
                {/* Active Indicator bar on the starting edge */}
                {isActive && (
                  <span
                    className={cn(
                      "absolute start-0 top-1.5 bottom-1.5 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/50 transition-all duration-200",
                      !isDesktopExpanded && "start-0.5"
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Icon Container */}
                <div
                  className={cn(
                    "flex items-center justify-center shrink-0 rounded-lg transition-all duration-200",
                    isActive
                      ? "text-indigo-600 bg-white shadow-sm border border-indigo-100/80 w-7 h-7"
                      : "text-slate-500 group-hover:text-indigo-600 w-7 h-7"
                  )}
                >
                  <item.icon className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
                </div>

                {/* Label (visible when expanded) */}
                <span
                  className={cn(
                    "whitespace-nowrap text-sm font-medium transition-all duration-200 overflow-hidden",
                    isDesktopExpanded
                      ? "ms-3 opacity-100 w-auto"
                      : "opacity-0 w-0 ms-0 pointer-events-none"
                  )}
                >
                  {item.label}
                </span>

                {/* Floating Tooltip for Desktop when collapsed */}
                {!isDesktopExpanded && (
                  <div
                    role="tooltip"
                    className="absolute start-[72px] invisible opacity-0 translate-x-1 rtl:-translate-x-1 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 rtl:group-hover:translate-x-0 transition-all duration-150 z-[70] px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-800 pointer-events-none whitespace-nowrap"
                  >
                    {item.label}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-1/2 -translate-y-1/2 end-full border-4 border-transparent border-e-slate-900" />
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section: Settings & System */}
        <div className="border-t border-slate-100/90 p-2.5 bg-slate-50/40 shrink-0">
          <NavLink
            to="/settings"
            aria-label={t("common.settings", "الإعدادات")}
            aria-current={checkIsActive("/settings") ? "page" : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                isDesktopExpanded
                  ? "px-3 py-2.5 w-full justify-start"
                  : "p-2.5 w-11 h-11 mx-auto justify-center",
                isActive
                  ? "bg-gradient-to-r from-indigo-50/95 via-indigo-100/50 to-purple-50/80 text-indigo-700 font-semibold border border-indigo-200/70 shadow-[0_2px_8px_rgba(79,70,229,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 border border-transparent"
              )
            }
          >
            {checkIsActive("/settings") && (
              <span
                className={cn(
                  "absolute start-0 top-1.5 bottom-1.5 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/50",
                  !isDesktopExpanded && "start-0.5"
                )}
                aria-hidden="true"
              />
            )}

            <div
              className={cn(
                "flex items-center justify-center shrink-0 rounded-lg transition-all duration-200",
                checkIsActive("/settings")
                  ? "text-indigo-600 bg-white shadow-sm border border-indigo-100/80 w-7 h-7"
                  : "text-slate-500 group-hover:text-indigo-600 w-7 h-7"
              )}
            >
              <Settings className="w-[18px] h-[18px] transition-transform duration-200 group-hover:rotate-45" />
            </div>

            <span
              className={cn(
                "whitespace-nowrap text-sm font-medium transition-all duration-200 overflow-hidden",
                isDesktopExpanded
                  ? "ms-3 opacity-100 w-auto"
                  : "opacity-0 w-0 ms-0 pointer-events-none"
              )}
            >
              {t("common.settings", "الإعدادات")}
            </span>

            {/* Tooltip for Settings */}
            {!isDesktopExpanded && (
              <div
                role="tooltip"
                className="absolute start-[72px] invisible opacity-0 translate-x-1 rtl:-translate-x-1 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 rtl:group-hover:translate-x-0 transition-all duration-150 z-[70] px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-800 pointer-events-none whitespace-nowrap"
              >
                {t("common.settings", "الإعدادات")}
                <div className="absolute top-1/2 -translate-y-1/2 end-full border-4 border-transparent border-e-slate-900" />
              </div>
            )}
          </NavLink>
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE / TABLET DRAWER (Strictly lg:hidden, rendered below 1024px)
          - Independent overlay drawer
          - Backdrop blur on open
          - Closes on link click or outside click
         ========================================================================= */}
      <div className="lg:hidden">
        {/* Mobile Backdrop Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Drawer */}
        <aside
          aria-label="Mobile Drawer Navigation"
          aria-hidden={!isMobileOpen}
          className={cn(
            "fixed inset-y-0 start-0 z-50 flex flex-col w-72 border-e border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-in-out select-none",
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full rtl:translate-x-full"
          )}
        >
          {/* Mobile Header */}
          <div className="relative flex items-center justify-between p-4 border-b border-slate-100 min-h-[72px]">
            <div className="flex items-center gap-3">
              {settings.LogoURL ? (
                <img
                  src={settings.LogoURL}
                  alt="Logo"
                  className="h-8 w-auto max-w-[100px] object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <h1 className="font-bold text-sm text-slate-900 tracking-tight truncate">
                  {settings.CompanyNameAr || "نظام نمو ERP"}
                </h1>
                <span className="text-[10px] font-medium text-slate-400 truncate">
                  NMO Labs OS
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-900"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Nav items */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = checkIsActive(item.to, item.exact);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium",
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 via-indigo-100/50 to-purple-50 text-indigo-700 font-semibold border border-indigo-200/70 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center shrink-0 w-7 h-7 rounded-lg me-3",
                      isActive
                        ? "text-indigo-600 bg-white shadow-sm border border-indigo-100"
                        : "text-slate-500"
                    )}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Settings footer */}
          <div className="border-t border-slate-100 p-3 bg-slate-50/50">
            <NavLink
              to="/settings"
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium",
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 via-indigo-100/50 to-purple-50 text-indigo-700 font-semibold border border-indigo-200/70 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                )
              }
            >
              <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-lg me-3 text-slate-500">
                <Settings className="w-[18px] h-[18px]" />
              </div>
              <span className="truncate">
                {t("common.settings", "الإعدادات")}
              </span>
            </NavLink>
          </div>
        </aside>
      </div>
    </>
  );
}
