import React, { useState } from 'react';
import { Vehicle } from '@/types/fleet';
import { Zap, Fuel, Wrench, Shield, FileCheck, AlertOctagon, X } from 'lucide-react';
import { AddFuelModal } from './AddFuelModal';
import { AddMaintenanceModal } from './AddMaintenanceModal';
import { AddInsuranceModal } from './AddInsuranceModal';
import { AddComplianceModal } from './AddComplianceModal';
import { AddAccidentModal } from './AddAccidentModal';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onOperationSuccess: () => void;
}

export function QuickEntryModal({ isOpen, onClose, vehicles, onOperationSuccess }: QuickEntryModalProps) {
  const [activeTab, setActiveTab] = useState<'FUEL' | 'MAINTENANCE' | 'INSURANCE' | 'COMPLIANCE' | 'ACCIDENT'>('FUEL');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.Vehicle_ID || '');

  if (!isOpen) return null;

  const tabs = [
    { id: 'FUEL', label: 'تعبئة وقود', icon: Fuel, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800' },
    { id: 'MAINTENANCE', label: 'صيانة وإصلاح', icon: Wrench, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800' },
    { id: 'INSURANCE', label: 'وثيقة تأمين', icon: Shield, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800' },
    { id: 'COMPLIANCE', label: 'فحص واستمارة', icon: FileCheck, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800' },
    { id: 'ACCIDENT', label: 'تقرير حادث', icon: AlertOctagon, color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">الإدخال السريع لعمليات الأسطول</h3>
              <p className="text-xs text-slate-500">سجل أي عملية وقود أو صيانة أو حادث أو تأمين فورياً</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="p-4 bg-slate-100/70 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? `${tab.color} shadow-sm scale-102 ring-2 ring-indigo-500/20`
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Render Active Operation Form directly inside */}
        <div className="p-2">
          {activeTab === 'FUEL' && (
            <AddFuelModal
              isOpen={true}
              onClose={onClose}
              vehicles={vehicles}
              defaultVehicleId={selectedVehicleId}
              onSuccess={() => {
                onOperationSuccess();
                onClose();
              }}
              onSaveAndNew={() => {
                onOperationSuccess();
              }}
            />
          )}

          {activeTab === 'MAINTENANCE' && (
            <AddMaintenanceModal
              isOpen={true}
              onClose={onClose}
              vehicles={vehicles}
              defaultVehicleId={selectedVehicleId}
              onSuccess={() => {
                onOperationSuccess();
                onClose();
              }}
              onSaveAndNew={() => {
                onOperationSuccess();
              }}
            />
          )}

          {activeTab === 'INSURANCE' && (
            <AddInsuranceModal
              isOpen={true}
              onClose={onClose}
              vehicles={vehicles}
              defaultVehicleId={selectedVehicleId}
              onSuccess={() => {
                onOperationSuccess();
                onClose();
              }}
            />
          )}

          {activeTab === 'COMPLIANCE' && (
            <AddComplianceModal
              isOpen={true}
              onClose={onClose}
              vehicles={vehicles}
              defaultVehicleId={selectedVehicleId}
              onSuccess={() => {
                onOperationSuccess();
                onClose();
              }}
            />
          )}

          {activeTab === 'ACCIDENT' && (
            <AddAccidentModal
              isOpen={true}
              onClose={onClose}
              vehicles={vehicles}
              defaultVehicleId={selectedVehicleId}
              onSuccess={() => {
                onOperationSuccess();
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
