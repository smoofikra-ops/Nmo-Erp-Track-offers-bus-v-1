const fs = require('fs');

const code = `
import { useAuth } from "@/contexts/AuthContext";
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { commissionService } from '@/services/commissionService';
import { CommissionRecord, CommissionTypeCategory } from '@/types/commissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Users, Wallet, CreditCard, Banknote, Filter, Calendar as CalendarIcon, ChevronDown, Package } from 'lucide-react';
import { format, startOfMonth, endOfDay, subDays, startOfYear, subMonths, endOfMonth, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

export function Dashboard() {
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  const { data: recordsRes, isLoading } = useQuery({
    queryKey: ['commissionRecords', companyId],
    queryFn: () => commissionService.getCommissionRecords(companyId),
    enabled: Boolean(companyId),
  });

  const records: CommissionRecord[] = useMemo(() => recordsRes?.data || [], [recordsRes]);

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">تعذر الاتصال بقاعدة البيانات</h2>
          <p className="text-slate-500">
            {recordsRes.message || 'يرجى التأكد من أن رابط Google Apps Script صحيح وأنه يعمل بشكل سليم.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      
      {/* Filters Section */}
      <Card className="border-slate-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                <CalendarIcon className="h-4 w-4 text-slate-500 ml-1" />
                <select 
                  className="bg-transparent text-sm font-medium outline-none text-slate-700 min-w-[120px]"
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
                <div className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-lg p-1.5 px-3">
                  <input type="date" className="bg-transparent outline-none" value={format(startDate, 'yyyy-MM-dd')} onChange={e => setStartDate(startOfDay(new Date(e.target.value)))} />
                  <span className="text-slate-400">-</span>
                  <input type="date" className="bg-transparent outline-none" value={format(endDate, 'yyyy-MM-dd')} onChange={e => setEndDate(endOfDay(new Date(e.target.value)))} />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 px-3 flex-1 md:flex-none">
                <Users className="h-4 w-4 text-slate-500" />
                <select 
                  className="bg-transparent text-sm font-medium outline-none text-slate-700 w-full"
                  value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                >
                  <option value="all">جميع المندوبين</option>
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 px-3 flex-1 md:flex-none">
                <Filter className="h-4 w-4 text-slate-500" />
                <select 
                  className="bg-transparent text-sm font-medium outline-none text-slate-700 w-full"
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

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-emerald-100 bg-emerald-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">إجمالي العمولات</p>
              <h3 className="text-2xl font-black text-emerald-950 mt-1">{totalCommissions.toFixed(2)}</h3>
              <p className="text-xs text-emerald-700 mt-1">{numberOfOperations} عملية</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-indigo-100 bg-indigo-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-800">إجمالي المبالغ المطلوبة</p>
              <h3 className="text-2xl font-black text-indigo-950 mt-1">{totalRequired.toFixed(2)}</h3>
              <p className="text-xs text-indigo-700 mt-1">المستحق من المندوبين</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">إجمالي المدفوع والتسويات</p>
              <h3 className="text-2xl font-black text-blue-950 mt-1">{totalCollected.toFixed(2)}</h3>
              <p className="text-xs text-blue-700 mt-1">الدفعات المستلمة</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-rose-800">صافي المطلوب من المندوبين</p>
              <h3 className="text-2xl font-black text-rose-950 mt-1" dir="ltr">{netRequiredFromAgents.toFixed(2)}</h3>
              <p className="text-xs text-rose-700 mt-1">{activeAgentsCount} مندوب نشط</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts: Pie (Commission Types) */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">توزيع العمولات</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => [\`\${value.toFixed(2)} ر.س\`, 'المبلغ']} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Charts: Line (Commissions over time) */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">تطور العمولات</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => \`\${v}\`} />
                <RechartsTooltip formatter={(value: number) => [\`\${value.toFixed(2)} ر.س\`, 'العمولة']} />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts: Bar (Agents commissions) */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">أعلى المندوبين (عمولات)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAgents} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <RechartsTooltip formatter={(value: number) => [\`\${value.toFixed(2)} ر.س\`, 'العمولة']} />
                <Bar dataKey="commission" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts and Collection Progress */}
        <div className="space-y-6">
          <Card className="border-rose-200 bg-rose-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-rose-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                تنبيهات التحصيل
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentsWithDebt.length > 0 ? (
                <div className="space-y-3 mt-2">
                  <p className="text-sm text-rose-700 font-medium">يوجد {agentsWithDebt.length} مندوبين لديهم مبالغ غير محصلة:</p>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {agentsWithDebt.map((agent, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-rose-100 shadow-sm">
                        <span className="text-sm font-bold text-slate-700">{agent.name}</span>
                        <span className="text-sm font-black text-rose-600">{agent.remaining.toFixed(2)} ر.س</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-emerald-600 font-medium p-4 text-center bg-white rounded-lg border border-emerald-100 shadow-sm">لا توجد مبالغ معلقة للتحصيل.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Agents Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">أداء المندوبين وتفاصيل التحصيل ({filteredRecords.length} سجل)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">اسم المندوب</th>
                <th className="px-6 py-4 font-medium">إجمالي العمولة المستحقة</th>
                <th className="px-6 py-4 font-medium">المطلوب تحصيله</th>
                <th className="px-6 py-4 font-medium">تم تحصيله (دفعات وتسويات)</th>
                <th className="px-6 py-4 font-medium">المتبقي للتحصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agentStatsList.length === 0 ? (
                 <tr><td colSpan={5} className="text-center py-8 text-slate-500">لا توجد بيانات مطابقة للبحث</td></tr>
              ) : agentStatsList.map((agent, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{agent.name}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600">{agent.commission.toFixed(2)} ر.س</td>
                  <td className="px-6 py-4 text-slate-600">{agent.required.toFixed(2)} ر.س</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">{agent.collected.toFixed(2)} ر.س</td>
                  <td className={\`px-6 py-4 font-black \${agent.remaining > 0 ? 'text-rose-600' : 'text-emerald-500'}\`}>
                    {agent.remaining.toFixed(2)} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/Dashboard.tsx', code);
