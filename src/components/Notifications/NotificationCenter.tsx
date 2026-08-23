import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, AlertTriangle, Package, DollarSign, Truck, Check, ExternalLink } from 'lucide-react';
import { fleetService } from '../../services/fleetService';
import { commissionService } from '../../services/commissionService';
import { productService } from '../../services/productService';
import { useNavigate } from 'react-router-dom';

export interface ERPNotification {
  id: string;
  title: string;
  description: string;
  module: 'FLEET' | 'COMMISSIONS' | 'INVENTORY';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  linkTo: string;
}

const DEFAULT_COMPANY_ID = 'COM-0001';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ERPNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [vehRes, commRes, prodRes] = await Promise.all([
        fleetService.getVehicles(DEFAULT_COMPANY_ID),
        commissionService.getCommissionRecords(DEFAULT_COMPANY_ID),
        productService.getProducts(DEFAULT_COMPANY_ID)
      ]);

      const notifs: ERPNotification[] = [];
      const now = new Date();

      // 1. Fleet Expiry & Maintenance Alerts
      const vehicles = (vehRes.data || []).filter(v => !v.IsDeleted);
      vehicles.forEach(v => {
        if (v.Insurance_Expiry) {
          const diffDays = Math.ceil((new Date(v.Insurance_Expiry).getTime() - now.getTime()) / (1000 * 3600 * 24));
          if (diffDays <= 30) {
            notifs.push({
              id: `notif-ins-${v.Vehicle_ID}`,
              title: `انتهاء تأمين المركبة ${v.Plate_Number}`,
              description: diffDays < 0 ? `وثيقة التأمين منتهية منذ ${Math.abs(diffDays)} يوم` : `ينتهي التأمين خلال ${diffDays} يوم`,
              module: 'FLEET',
              priority: diffDays <= 7 ? 'CRITICAL' : 'HIGH',
              timestamp: 'الآن',
              linkTo: `/fleet`
            });
          }
        }

        if (v.Operational_Status === 'IN_MAINTENANCE') {
          notifs.push({
            id: `notif-mnt-${v.Vehicle_ID}`,
            title: `مركبة قيد الصيانة (${v.Plate_Number})`,
            description: `${v.Brand} ${v.Model} - متابعة أمر الصيانة والإصلاح`,
            module: 'FLEET',
            priority: 'MEDIUM',
            timestamp: 'مستمر',
            linkTo: `/fleet`
          });
        }
      });

      // 2. Commissions Due Alerts
      const records = commRes.data || [];
      const pendingRecords = records.filter((c: any) => {
        const total = Number(c.totalCommission) || Number(c.netAmount) || Number(c.amount) || 0;
        const paid = Number(c.paidAmount) || 0;
        return total > paid && total > 0;
      });

      if (pendingRecords.length > 0) {
        notifs.push({
          id: 'notif-comm-pending',
          title: `مستحقات عمولات معلقة (${pendingRecords.length} حركة)`,
          description: 'توجد مبالغ عمولات مستحقة لم يتم استكمال صرفها بالكامل',
          module: 'COMMISSIONS',
          priority: 'HIGH',
          timestamp: 'اليوم',
          linkTo: '/commission'
        });
      }

      // 3. Inventory Critical Stock Alerts
      const products = prodRes.data || [];
      const criticalProds = products.filter((p: any) => (p.Quantity || p.stock || 0) <= (p.MinQuantity || p.minStock || 5));
      if (criticalProds.length > 0) {
        notifs.push({
          id: 'notif-prod-crit',
          title: `مخزون حرج (${criticalProds.length} صنف)`,
          description: 'بعض المنتجات وصلت للحد الأدنى في المستودع وتتطلب إعادة طلب',
          module: 'INVENTORY',
          priority: 'CRITICAL',
          timestamp: 'الآن',
          linkTo: '/inventory'
        });
      }

      setNotifications(notifs);
      setUnreadCount(notifs.length);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const getPriorityBadge = (p: ERPNotification['priority']) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">حرج</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">هام</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">متابعة</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">عادي</span>;
    }
  };

  const getModuleIcon = (m: ERPNotification['module']) => {
    switch (m) {
      case 'FLEET':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'COMMISSIONS':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'INVENTORY':
        return <Package className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="مركز الإشعارات الموحد"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute end-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden text-start animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <Bell className="w-4 h-4 text-indigo-600" />
              مركز الإشعارات الموحد (NMO Alerts)
            </div>
            <span className="text-[11px] text-slate-500">{notifications.length} تنبيه</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                لا توجد تنبيهات عاجلة حالياً. جميع الأنظمة تعمل بشكل ممتاز.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    setIsOpen(false);
                    navigate(notif.linkTo);
                  }}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                      {getModuleIcon(notif.module)}
                      <span>{notif.title}</span>
                    </div>
                    {getPriorityBadge(notif.priority)}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{notif.description}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/reports');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              عرض كافة تقارير وتحليلات النظام ←
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
