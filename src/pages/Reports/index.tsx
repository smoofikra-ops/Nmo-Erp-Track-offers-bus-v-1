import React, { useState, useEffect } from 'react';
import { Vehicle, FuelLog, MaintenanceLog } from '@/types/fleet';
import { fleetService } from '@/services/fleetService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  BarChart3, Truck, Fuel, Wrench, Shield, FileText, 
  Download, Filter, Calendar, Users, DollarSign, ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'FLEET' | 'COMMISSIONS' | 'HR'>('FLEET');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = async () => {
    setIsLoading(true);
    try {
      const res = await fleetService.getVehicles('COM-0001');
      if (res.success && res.data) {
        setVehicles(res.data);
      }
    } catch (err) {
      console.error('Failed to load fleet data for reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fleet Analytics Data
  const fleetCostByMonth = [
    { month: 'أكتوبر', fuel: 4800, maint: 2100, insurance: 1200 },
    { month: 'نوفمبر', fuel: 5200, maint: 1800, insurance: 0 },
    { month: 'ديسمبر', fuel: 5100, maint: 3400, insurance: 0 },
    { month: 'يناير', fuel: 5600, maint: 2200, insurance: 2800 },
    { month: 'فبراير', fuel: 4900, maint: 1500, insurance: 0 },
    { month: 'مارس', fuel: 5400, maint: 2900, insurance: 1500 },
  ];

  const vehicleTypeDist = [
    { name: 'سيدان', value: vehicles.filter(v => v.Vehicle_Type === 'SEDAN').length || 2, color: '#4f46e5' },
    { name: 'فان بضائع', value: vehicles.filter(v => v.Vehicle_Type === 'VAN').length || 2, color: '#06b6d4' },
    { name: 'شاحنة / دينا', value: vehicles.filter(v => v.Vehicle_Type === 'TRUCK').length || 1, color: '#f59e0b' },
    { name: 'بيك آب / ونيت', value: vehicles.filter(v => v.Vehicle_Type === 'PICKUP').length || 1, color: '#10b981' },
  ];

  const readinessDist = [
    { name: 'جاهزية ممتازة (90%+)', count: vehicles.filter(v => (v.Readiness_Score || 0) >= 90).length, color: '#10b981' },
    { name: 'تحتاج متابعة (70-89%)', count: vehicles.filter(v => (v.Readiness_Score || 0) >= 70 && (v.Readiness_Score || 0) < 90).length, color: '#f59e0b' },
    { name: 'جاهزية حرجة (< 70%)', count: vehicles.filter(v => (v.Readiness_Score || 0) < 70).length, color: '#ef4444' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              مركز التقارير والتحليلات المتقدمة
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              مؤشرات الأداء الشاملة للأسطول، استهلاك الوقود، الصيانة، والعمليات المالية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 shadow-2xs"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            طباعة / تصدير PDF
          </button>
        </div>
      </div>

      {/* Reports Category Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('FLEET')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'FLEET'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          تحليلات الأسطول والمركبات
        </button>
        <button
          onClick={() => setActiveTab('COMMISSIONS')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'COMMISSIONS'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          تقارير العمولات والمبيعات
        </button>
        <button
          onClick={() => setActiveTab('HR')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'HR'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          تقارير الموظفين والسائقين
        </button>
      </div>

      {/* Fleet Reports Content */}
      {activeTab === 'FLEET' && (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">إجمالي تكاليف تشغيل الأسطول (YTD)</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">112,450 <span className="text-xs text-slate-400">ر.س</span></h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                ضمن الميزانية التقديرية المعتمدة
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">متوسط استهلاك الوقود للأسطول</span>
              <h3 className="text-2xl font-black text-amber-600 font-mono">10.4 <span className="text-xs text-slate-400">كم / لتر</span></h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                معدل الكفاءة العام: ممتاز
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">متوسط مؤشر الجاهزية التشغيلية</span>
              <h3 className="text-2xl font-black text-teal-600 font-mono">87.5%</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {vehicles.length} مركبة خاضعة للتقييم الآلي
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Cost Stacked Bar Chart */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                تطور مصروفات الأسطول الشهرية (وقود + صيانة + تأمين)
              </h3>
              <p className="text-xs text-slate-400 mb-4">قيم المصروفات بالريال السعودي</p>
              
              <div className="h-72 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fleetCostByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="fuel" name="وقود" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="maint" name="صيانة" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="insurance" name="تأمين وتراخيص" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vehicle Types Distribution Pie */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  توزيع أسطول المركبات حسب النوع
                </h3>
                <p className="text-xs text-slate-400 mb-4">تصنيف المركبات النشطة والاحتياط</p>
              </div>

              <div className="h-48 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleTypeDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {vehicleTypeDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {vehicleTypeDist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}:</span>
                    <strong className="text-slate-900 dark:text-white">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Readiness Distribution Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                جدول مؤشر الجاهزية الشامل وتنبيهات التجديد
              </h3>
              <Link to="/fleet" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                الانتقال لإدارة الأسطول &larr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">رقم اللوحة</th>
                    <th className="py-3 px-4">المركبة</th>
                    <th className="py-3 px-4">السائق المعتمد</th>
                    <th className="py-3 px-4">مؤشر الجاهزية</th>
                    <th className="py-3 px-4">أسباب الخصم / التنبيهات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vehicles.map((v, index) => (
                    <tr key={`${v.Vehicle_ID}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-bold">{v.Plate_Number}</td>
                      <td className="py-3 px-4 font-medium">{v.Brand} {v.Model} ({v.Year})</td>
                      <td className="py-3 px-4">{v.Primary_Driver_Name || 'بدون سائق'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono ${
                          (v.Readiness_Score || 0) >= 90 ? 'bg-emerald-100 text-emerald-800' :
                          (v.Readiness_Score || 0) >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {v.Readiness_Score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {v.Readiness_Reasons && v.Readiness_Reasons.length > 0 ? (
                          <span className="text-rose-600 font-medium">{v.Readiness_Reasons.join(' • ')}</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">سارية وجاهزة بالكامل</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Commissions Reports Content */}
      {activeTab === 'COMMISSIONS' && (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <DollarSign className="w-12 h-12 text-indigo-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">تقارير العمولات والمطابقات المالية</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            يمكنك الوصول إلى تفاصيل تقارير العمولات والتحصيلات وإغلاقات المندوبين اليومية من قسم العمولات.
          </p>
          <Link
            to="/commission/reports"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
          >
            فتح تقارير العمولات التفصيلية
          </Link>
        </div>
      )}

      {/* HR Reports Content */}
      {activeTab === 'HR' && (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-teal-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">تقارير الموظفين وتعيينات السائقين</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            سجلات الموظفين، تقييمات السائقين، وتاريخ استلام وتسليم العهد والمركبات.
          </p>
          <Link
            to="/hr"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20"
          >
            الانتقال إلى سجل الموظفين
          </Link>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
