
import { useAuth } from "@/contexts/AuthContext";
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { commissionService, normalizeCommissionRecords } from '@/services/commissionService';
import { CommissionRecord, CommissionTypeCategory } from '@/types/commissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Users, Wallet, CreditCard, Banknote, Filter, Calendar as CalendarIcon, ChevronDown, ChevronUp, Package, Lock, Truck, Gauge, Wrench, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fleetService } from '@/services/fleetService';
import { format, startOfMonth, endOfDay, subDays, startOfYear, subMonths, endOfMonth, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/utils/cn';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

export function Dashboard() {
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';
  const [isMetricsUnlocked, setIsMetricsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAgentPerformanceOpen, setIsAgentPerformanceOpen] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin') {
      setIsMetricsUnlocked(true);
      setPasswordError('');
    } else {
      setPasswordError('كلمة المرور غير صحيحة');
      setPasswordInput('');
    }
  };

  const { data: recordsRes, isLoading, refetch: refetchRecords, isFetching } = useQuery({
    queryKey: ['commissionRecords', companyId],
    queryFn: () => commissionService.getCommissionRecords(companyId),
    enabled: Boolean(companyId),
    retry: 2,
    retryDelay: 1000,
  });

  const { data: fleetKpisRes } = useQuery({
    queryKey: ['fleetKPIs', companyId],
    queryFn: () => fleetService.getFleetKPIs(companyId),
    enabled: Boolean(companyId),
  });

  const records: CommissionRecord[] = useMemo(() => normalizeCommissionRecords(recordsRes), [recordsRes]);
  const fleetKpis = fleetKpisRes?.data;

  // Filters State
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfDay(new Date()));
  const [datePreset, setDatePreset] = useState<string>('this_month');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [commissionFilter, setCommissionFilter] = useState<'all' | CommissionTypeCategory>('all');

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    switch (preset) {
      case 'today':
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case 'last_7_days':
        setStartDate(startOfDay(subDays(now, 7)));
        setEndDate(endOfDay(now));
        break;
      case 'last_30_days':
        setStartDate(startOfDay(subDays(now, 30)));
        setEndDate(endOfDay(now));
        break;
      case 'this_month':
        setStartDate(startOfMonth(now));
        setEndDate(endOfDay(now));
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfDay(endOfMonth(lastMonth)));
        break;
      case 'this_year':
        setStartDate(startOfYear(now));
        setEndDate(endOfDay(now));
        break;
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (commissionFilter !== 'all' && r.commissionType !== commissionFilter) return false;
      if (selectedEmployeeId !== 'all' && r.employeeId !== selectedEmployeeId) return false;
      if (r.createdAt) {
        const d = new Date(r.createdAt);
        if (d < startDate || d > endDate) return false;
      }
      return true;
    });
  }, [records, startDate, endDate, commissionFilter, selectedEmployeeId]);

  // Unique Employees for the dropdown (from all records)
  const allEmployees = useMemo(() => {
    const empMap = new Map<string, string>();
    records.forEach(r => {
      if (!empMap.has(r.employeeId)) empMap.set(r.employeeId, r.employeeName);
    });
    return Array.from(empMap.entries()).map(([id, name]) => ({ id, name }));
  }, [records]);

  // Calculate metrics based on FILTERED records
  const productCommissions = filteredRecords
    .filter(r => r.commissionType === 'PRODUCT_COMMISSION')
    .reduce((sum, r) => sum + (r.netCommission || 0), 0);
  const orderCommissions = filteredRecords
    .filter(r => r.commissionType === 'ORDER_COUNT_COMMISSION')
    .reduce((sum, r) => sum + (r.netCommission || 0), 0);
  const totalCommissions = productCommissions + orderCommissions;

  // New calculations based on dynamic lists
  const totalRequired = filteredRecords.reduce((sum, r) => {
    if (r.requiredItems) {
      return sum + r.requiredItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    }
    return sum + (r.totalRequiredAmount || r.totalOrderValue || 0);
  }, 0);

  const totalCollected = filteredRecords.reduce((sum, r) => {
    if (r.paymentItems) {
      return sum + r.paymentItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    }
    return sum + (r.onlinePaidAmount || 0);
  }, 0);

  const totalDiscounts = filteredRecords.reduce((sum, r) => {
    if (r.discounts) {
      return sum + r.discounts.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    }
    return sum + (r.totalDiscounts || r.totalDiscount || 0);
  }, 0);

  const netRequiredFromAgents = filteredRecords.reduce((sum, r) => {
    if (r.finalRequiredAmount !== undefined && !isNaN(r.finalRequiredAmount)) return sum + r.finalRequiredAmount;
    
    // Fallback to recalculate
    const req = r.requiredItems ? r.requiredItems.reduce((s, i) => s + (Number(i.amount)||0), 0) : (r.totalRequiredAmount || r.totalOrderValue || 0);
    const pay = r.paymentItems ? r.paymentItems.reduce((s, i) => s + (Number(i.amount)||0), 0) : (r.onlinePaidAmount || 0);
    const disc = r.discounts ? r.discounts.reduce((s, d) => s + (Number(d.amount)||0), 0) : (r.totalDiscounts || r.totalDiscount || 0);
    const comm = r.grossCommission || 0;
    return sum + (req - pay - disc - comm);
  }, 0);

  const numberOfOperations = filteredRecords.length;
  
  const activeAgentsCount = new Set(filteredRecords.map(r => r.employeeId)).size;

  // Chart Data
  const pieData = [
    { name: 'عمولات المنتجات', value: productCommissions },
    { name: 'عمولات الطلبات', value: orderCommissions },
  ];
  const COLORS = ['#4f46e5', '#10b981'];

  const agentStatsMap: Record<string, { name: string; commission: number; required: number; collected: number; remaining: number }> = {};

  filteredRecords.forEach(r => {
    if (!agentStatsMap[r.employeeId]) {
      agentStatsMap[r.employeeId] = {
        name: r.employeeName || r.employeeId,
        commission: 0,
        required: 0,
        collected: 0,
        remaining: 0,
      };
    }
    agentStatsMap[r.employeeId].commission += (r.netCommission || 0);
    const req = r.requiredItems ? r.requiredItems.reduce((s, i) => s + (Number(i.amount)||0), 0) : (r.totalRequiredAmount || r.totalOrderValue || 0);
    const pay = r.paymentItems ? r.paymentItems.reduce((s, i) => s + (Number(i.amount)||0), 0) : (r.onlinePaidAmount || 0);
    
    agentStatsMap[r.employeeId].required += req;
    agentStatsMap[r.employeeId].collected += pay;
  });

  const agentStatsList = Object.values(agentStatsMap).map(agent => ({
    ...agent,
    remaining: agent.required - agent.collected
  })).sort((a, b) => b.commission - a.commission);

  const topAgents = agentStatsList.slice(0, 5);

  const dateMap: Record<string, number> = {};
  filteredRecords.forEach(r => {
    const date = r.createdAt ? r.createdAt.split('T')[0] : 'Unknown';
    if (date !== 'Unknown') {
      dateMap[date] = (dateMap[date] || 0) + (r.netCommission || 0);
    }
  });

  const timeSeriesData = Object.entries(dateMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const agentsWithDebt = agentStatsList.filter(a => a.remaining > 0).sort((a, b) => b.remaining - a.remaining);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (recordsRes && recordsRes.success === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6" dir="rtl">
        <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">تعذر الاتصال بقاعدة البيانات</h2>
          <p className="text-slate-500">
            {recordsRes.message || 'يرجى التأكد من أن رابط Google Apps Script صحيح وأنه يعمل بشكل سليم.'}
          </p>
          {recordsRes.error?.details && (
            <p className="text-xs font-mono text-slate-400 bg-slate-100 p-2 rounded max-w-sm mx-auto overflow-hidden text-ellipsis">
              {recordsRes.error.details}
            </p>
          )}
        </div>
        <button
          onClick={() => refetchRecords()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          <span>{isFetching ? 'جاري إعادة المحاولة...' : 'إعادة المحاولة'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3.5 max-w-7xl mx-auto w-full min-w-0" dir="rtl">
      
      {/* Filters Toolbar */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-2 sm:p-2.5">
          <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                <select 
                  className="bg-transparent text-xs font-semibold outline-none text-slate-700 cursor-pointer"
                  value={datePreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                >
                  <option value="today">اليوم</option>
                  <option value="last_7_days">آخر 7 أيام</option>
                  <option value="last_30_days">آخر 30 يوماً</option>
                  <option value="this_month">هذا الشهر</option>
                  <option value="last_month">الشهر الماضي</option>
                  <option value="this_year">هذه السنة</option>
                  <option value="custom">فترة مخصصة</option>
                </select>
              </div>
              
              {datePreset === 'custom' && (
                <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                  <input type="date" className="bg-transparent outline-none text-xs" value={format(startDate, 'yyyy-MM-dd')} onChange={e => setStartDate(startOfDay(new Date(e.target.value)))} />
                  <span className="text-slate-400">-</span>
                  <input type="date" className="bg-transparent outline-none text-xs" value={format(endDate, 'yyyy-MM-dd')} onChange={e => setEndDate(endOfDay(new Date(e.target.value)))} />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 flex-1 md:flex-none">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <select 
                  className="bg-transparent text-xs font-semibold outline-none text-slate-700 w-full cursor-pointer"
                  value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                >
                  <option value="all">جميع المندوبين</option>
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 flex-1 md:flex-none">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                <select 
                  className="bg-transparent text-xs font-semibold outline-none text-slate-700 w-full cursor-pointer"
                  value={commissionFilter}
                  onChange={e => setCommissionFilter(e.target.value as any)}
                >
                  <option value="all">جميع العمولات</option>
                  <option value="PRODUCT_COMMISSION">عمولات المنتجات</option>
                  <option value="ORDER_COUNT_COMMISSION">عمولات عدد الطلبات</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Financial Metrics */}
      {!isMetricsUnlocked ? (
        <Card className="border-slate-200 bg-white shadow-2xs overflow-hidden w-full">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">البيانات المالية محمية</h3>
                <p className="text-xs text-slate-500">أدخل كلمة مرور الإدارة لعرض الملخص المالي.</p>
              </div>
            </div>
            <form onSubmit={handleUnlock} className="flex w-full sm:w-auto max-w-sm items-center space-x-2 space-x-reverse">
              <input
                type="password"
                placeholder="كلمة المرور"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg text-xs font-bold bg-slate-900 text-white h-8 sm:h-9 px-3 py-1 hover:bg-slate-800 shrink-0 cursor-pointer"
              >
                عرض
              </button>
            </form>
            {passwordError && <p className="text-rose-500 text-xs mt-1">{passwordError}</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
          <Card className="border-emerald-200/80 bg-emerald-50/70 shadow-2xs min-w-0">
            <CardContent className="p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-emerald-800 truncate leading-tight">إجمالي العمولات</p>
                <h3 className="text-sm sm:text-lg xl:text-xl font-black text-emerald-950 mt-0.5 truncate">{totalCommissions.toFixed(2)}</h3>
                <p className="text-[10px] text-emerald-700 truncate">{numberOfOperations} عملية</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-indigo-200/80 bg-indigo-50/70 shadow-2xs min-w-0">
            <CardContent className="p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-indigo-200 text-indigo-800 flex items-center justify-center shrink-0 shadow-2xs">
                <Banknote className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-indigo-800 truncate leading-tight">إجمالي المطلوبات</p>
                <h3 className="text-sm sm:text-lg xl:text-xl font-black text-indigo-950 mt-0.5 truncate">{totalRequired.toFixed(2)}</h3>
                <p className="text-[10px] text-indigo-700 truncate">من المندوبين</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200/80 bg-blue-50/70 shadow-2xs min-w-0">
            <CardContent className="p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-blue-200 text-blue-800 flex items-center justify-center shrink-0 shadow-2xs">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-blue-800 truncate leading-tight">إجمالي المدفوع</p>
                <h3 className="text-sm sm:text-lg xl:text-xl font-black text-blue-950 mt-0.5 truncate">{totalCollected.toFixed(2)}</h3>
                <p className="text-[10px] text-blue-700 truncate">التسويات والدفعات</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-200/80 bg-rose-50/70 shadow-2xs min-w-0">
            <CardContent className="p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 shadow-2xs">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-rose-800 truncate leading-tight">صافي المطلوب</p>
                <h3 className="text-sm sm:text-lg xl:text-xl font-black text-rose-950 mt-0.5 truncate" dir="ltr">{netRequiredFromAgents.toFixed(2)}</h3>
                <p className="text-[10px] text-rose-700 truncate">{activeAgentsCount} مندوب نشط</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Visual & Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 w-full min-w-0">
        
        {/* Left/Middle Column (8 cols): Charts */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {/* Chart 1: Pie (Commission Types) */}
          <Card className="border-slate-200 shadow-2xs flex flex-col justify-between">
            <CardHeader className="py-2.5 px-3.5 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-800">توزيع العمولات</CardTitle>
              <span className="text-[10px] text-slate-400 font-medium">حسب النوع</span>
            </CardHeader>
            <CardContent className="p-2 h-44 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'المبلغ']} />
                  <Legend verticalAlign="bottom" height={28} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Line / Area (Commissions over time) */}
          <Card className="border-slate-200 shadow-2xs flex flex-col justify-between">
            <CardHeader className="py-2.5 px-3.5 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-800">تطور العمولات</CardTitle>
              <span className="text-[10px] text-slate-400 font-medium">الوتيرة الزمنية</span>
            </CardHeader>
            <CardContent className="p-2 h-44 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 8, right: 12, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                  <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'العمولة']} />
                  <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 3: Bar (Agents commissions) - Full Width across 8 cols on tablet/desktop */}
          <Card className="sm:col-span-2 border-slate-200 shadow-2xs">
            <CardHeader className="py-2 px-3.5 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-800">أعلى المندوبين من حيث العمولات</CardTitle>
              <span className="text-[10px] text-indigo-600 font-bold">أفضل 5 مندوبين</span>
            </CardHeader>
            <CardContent className="p-2 h-36 sm:h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topAgents} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'العمولة']} />
                  <Bar dataKey="commission" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Collection Alerts + Fleet Operations Summary */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 sm:gap-3 justify-between">
          
          {/* Collection Alerts Card */}
          <Card className="border-rose-200/80 bg-rose-50/60 shadow-2xs flex-1 flex flex-col justify-between">
            <CardHeader className="py-2.5 px-3 border-b border-rose-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                تنبيهات التحصيل
              </CardTitle>
              {agentsWithDebt.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {agentsWithDebt.length} مستحق
                </span>
              )}
            </CardHeader>
            <CardContent className="p-2.5 flex-1">
              {agentsWithDebt.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="max-h-32 sm:max-h-36 overflow-y-auto space-y-1 pr-0.5">
                    {agentsWithDebt.slice(0, 4).map((agent, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-1.5 px-2.5 rounded-lg border border-rose-100/80 shadow-2xs">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[130px]">{agent.name}</span>
                        <span className="text-xs font-black text-rose-600 shrink-0">{agent.remaining.toFixed(2)} ر.س</span>
                      </div>
                    ))}
                    {agentsWithDebt.length > 4 && (
                      <p className="text-[10px] text-rose-700 text-center font-medium pt-1">
                        + {agentsWithDebt.length - 4} مندوبين آخرين في قائمة التحصيل
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 bg-white/60 rounded-lg border border-emerald-100 text-center p-2">
                  <p className="text-xs text-emerald-700 font-semibold">لا توجد مبالغ معلقة للتحصيل.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compact Fleet Operations Summary Card (Directly below Collection Alerts) */}
          <Card className="border-indigo-900 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white overflow-hidden shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      نظام الأسطول
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        مباشر
                      </span>
                    </h3>
                  </div>
                </div>

                <Link
                  to="/fleet"
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <span>منصة الأسطول</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/10 text-center">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-indigo-200/70 block">في الخدمة</span>
                  <span className="text-xs font-black font-mono text-emerald-400">
                    {fleetKpis?.activeVehicles ?? 0}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-indigo-200/70 block">في الصيانة</span>
                  <span className="text-xs font-black font-mono text-amber-400">
                    {fleetKpis?.inMaintenanceVehicles ?? 0}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-indigo-200/70 block">الجاهزية</span>
                  <span className="text-xs font-black font-mono text-teal-300">
                    {(fleetKpis?.totalVehicles ?? 0) > 0 ? `${fleetKpis?.averageReadinessIndex}%` : '100%'}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-[9px] text-indigo-200/70 block">تنبيهات</span>
                  <span className="text-xs font-black font-mono text-rose-300">
                    {((fleetKpis?.expiringInsuranceCount ?? 0) + (fleetKpis?.expiringInspectionCount ?? 0) + (fleetKpis?.expiringLicenseCount ?? 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Collapsible Agent Performance Table Accordion (Collapsed by default, zero persistence) */}
      <Card className="border-slate-200 shadow-2xs transition-all duration-300 overflow-hidden">
        <CardHeader 
          onClick={() => setIsAgentPerformanceOpen(!isAgentPerformanceOpen)}
          className="cursor-pointer hover:bg-slate-50/80 transition-colors py-2.5 px-4 select-none bg-slate-50/40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-bold text-slate-900">
                أداء المندوبين وتفاصيل التحصيل
              </CardTitle>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                {filteredRecords.length} سجل ({agentStatsList.length} مندوب)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <span className="text-[11px]">{isAgentPerformanceOpen ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
              <div className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                {isAgentPerformanceOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        {isAgentPerformanceOpen && (
          <CardContent className="p-0 overflow-x-auto border-t border-slate-100 animate-fadeIn">
            <table className="w-full text-xs text-right hidden md:table">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold">اسم المندوب</th>
                  <th className="px-4 py-3 font-semibold">إجمالي العمولة المستحقة</th>
                  <th className="px-4 py-3 font-semibold">المطلوب تحصيله</th>
                  <th className="px-4 py-3 font-semibold">تم تحصيله (دفعات وتسويات)</th>
                  <th className="px-4 py-3 font-semibold">المتبقي للتحصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentStatsList.length === 0 ? (
                   <tr><td colSpan={5} className="text-center py-6 text-slate-500">لا توجد بيانات مطابقة للبحث</td></tr>
                ) : agentStatsList.map((agent, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{agent.name}</td>
                    <td className="px-4 py-2.5 font-bold text-indigo-600">{agent.commission.toFixed(2)} ر.س</td>
                    <td className="px-4 py-2.5 text-slate-600">{agent.required.toFixed(2)} ر.س</td>
                    <td className="px-4 py-2.5 text-emerald-600 font-semibold">{agent.collected.toFixed(2)} ر.س</td>
                    <td className={`px-4 py-2.5 font-black ${agent.remaining > 0 ? 'text-rose-600' : 'text-emerald-500'}`}>
                      {agent.remaining.toFixed(2)} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100 p-2">
              {agentStatsList.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">لا توجد بيانات</div>
              ) : (
                agentStatsList.map((agent, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-2 space-y-2 shadow-2xs">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="font-bold text-slate-900 text-sm">{agent.name}</span>
                      <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">{agent.commission.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">المطلوب تحصيله:</span>
                      <span className="font-medium text-slate-800">{agent.required.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">تم تحصيله:</span>
                      <span className="font-medium text-emerald-600">{agent.collected.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200">
                      <span className="font-bold text-slate-800">المتبقي للتحصيل:</span>
                      <span className={`font-black ${agent.remaining > 0 ? 'text-rose-600' : 'text-emerald-500'}`}>
                        {agent.remaining.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
