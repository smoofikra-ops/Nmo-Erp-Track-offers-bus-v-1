import toast from 'react-hot-toast';
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings as SettingsIcon,
  Building2,
  Palette,
  Sliders,
  Printer,
  Package,
  Percent,
  Users,
  Database,
  Save,
  Loader2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { settingsService, AppSettings } from "@/services/settingsService";

import { CompanyInfoTab } from "./Tabs/CompanyInfoTab";
import { BrandingTab } from "./Tabs/BrandingTab";
import { SystemTab } from "./Tabs/SystemTab";
import { PrintingTab } from "./Tabs/PrintingTab";
import { InventoryTab } from "./Tabs/InventoryTab";
import { CommissionTab } from "./Tabs/CommissionTab";
import { UsersTab } from "./Tabs/UsersTab";
import { BackupTab } from "./Tabs/BackupTab";
import { SystemHealth } from "./SystemHealth";

const tabs = [
  { id: "company", label: "معلومات المؤسسة", icon: Building2 },
  { id: "branding", label: "الهوية البصرية", icon: Palette },
  { id: "system", label: "إعدادات النظام", icon: Sliders },
  { id: "printing", label: "إعدادات الطباعة", icon: Printer },
  { id: "inventory", label: "إعدادات المخزون", icon: Package },
  { id: "commission", label: "إعدادات العمولات", icon: Percent },
  { id: "users", label: "المستخدمون والصلاحيات", icon: Users },
  { id: "backup", label: "النسخ الاحتياطي", icon: Database },
  { id: "health", label: "صحة النظام", icon: Activity },
];

export function Settings() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key: keyof AppSettings, value: any) => {
    setIsDirty(true);
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await settingsService.saveSettings(localSettings);
      if (res.success) {
        if (res.data?.settings) updateSettings(res.data.settings); else updateSettings(localSettings);
        toast.success("تم حفظ الإعدادات بنجاح");
        setIsDirty(false);
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "company":
        return (
          <CompanyInfoTab settings={localSettings} onChange={handleChange} />
        );
      case "branding":
        return <BrandingTab settings={localSettings} onChange={handleChange} />;
      case "system":
        return <SystemTab settings={localSettings} onChange={handleChange} />;
      case "printing":
        return <PrintingTab settings={localSettings} onChange={handleChange} />;
      case "inventory":
        return (
          <InventoryTab settings={localSettings} onChange={handleChange} />
        );
      case "commission":
        return (
          <CommissionTab settings={localSettings} onChange={handleChange} />
        );
      case "users":
        return <UsersTab />;
      case "backup":
        return <BackupTab />;
      case "health":
        return <SystemHealth />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-indigo-600" />
            الإعدادات Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            إدارة إعدادات وتخصيص النظام بالكامل (White Labeling).
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[var(--primary-color,#4f46e5)] hover:opacity-90 min-w-[120px]"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <Save className="h-4 w-4 ml-2" />
          )}
          حفظ التغييرات
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav
            className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0"
            dir="rtl"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
