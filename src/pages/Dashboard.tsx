import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ShoppingBag, CreditCard, AlertTriangle, Wallet, TrendingUp, AlertCircle, FileText, Banknote } from 'lucide-react';
import { commissionService } from '@/services/commissionService';
import { useAuth } from '@/contexts/AuthContext';
import { CommissionRecord } from '@/types/commissions';
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

  // Calculate metrics
  const productCommissions = records
    .filter(r => r.commissionType === 'PRODUCT_COMMISSION')
    .reduce((sum, r) => sum + (r.netCommission || 0), 0);

  const orderCommissions = records
    .filter(r => r.commissionType === 'ORDER_COUNT_COMMISSION')
    .reduce((sum, r) => sum + (r.netCommission || 0), 0);

  const totalCommissions = productCommissions + orderCommissions;

  // Collection
  const totalRequired = records.reduce((sum, r) => sum + (r.finalRequiredAmount || r.codRequiredAmount || 0), 0);
  const totalCollected = 0; // No collection system exists yet
  const remainingCollection = totalRequired - totalCollected;

  // Chart Data
  const pieData = [
    { name: 'عمولات المنتجات', value: productCommissions },
    { name: 'عمولات الطلبات', value: orderCommissions },
  ];
  const COLORS = ['#4f46e5', '#10b981'];

  const agentStatsMap: Record<string, { name: string; commission: number; required: number; collected: number; remaining: number }> = {};
  records.forEach(r => {
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
    agentStatsMap[r.employeeId].required += (r.finalRequiredAmount || r.codRequiredAmount || 0);
  });

  const agentStatsList = Object.values(agentStatsMap).map(agent => ({
    ...agent,
    remaining: agent.required - agent.collected
  })).sort((a, b) => b.commission - a.commission);

  const topAgents = agentStatsList.slice(0, 5);

  const dateMap: Record<string, number> = {};
  records.forEach(r => {
    const date = r.createdAt ? r.createdAt.split('T')[0] : 'Unknown';
    if (date !== 'Unknown') {
      dateMap[date] = (dateMap[date] || 0) + (r.netCommission || 0);
    }
  });

  const timeSeriesData = Object.entries(dateMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const collectionData = [
    { name: 'المبلغ المستلم', amount: totalCollected, fill: '#10b981' },
    { name: 'المتبقي للتحصيل', amount: remainingCollection, fill: '#ef4444' },
  ];

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

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">لا توجد بيانات حتى الآن</h2>
          <p className="text-slate-500">
            لم يتم تسجيل أي عمولات بعد في النظام. ستظهر الإحصائيات الحقيقية هنا بمجرد إضافة أول سجل عمولة.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">لوحة القيادة</h2>
        <p className="mt-1 text-sm text-slate-500">نظرة عامة على العمولات والتحصيلات من البيانات الفعلية.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">إجمالي العمولات</CardTitle>
            <Calculator className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalCommissions.toFixed(2)} ر.س</div>
            <p className="text-xs text-slate-500 mt-1">منتجات: {productCommissions.toFixed(2)} | طلبات: {orderCommissions.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">إجمالي المبالغ المطلوب تحصيلها</CardTitle>
            <Wallet className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalRequired.toFixed(2)} ر.س</div>
            <p className="text-xs text-slate-500 mt-1">الدفع عند الاستلام (COD)</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">التحصيل النقدي</CardTitle>
            <Banknote className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{totalCollected.toFixed(2)} ر.س</div>
                <p className="text-xs text-slate-500 mt-1">المبالغ المستلمة</p>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-rose-600">{remainingCollection.toFixed(2)} ر.س</div>
                <p className="text-xs text-slate-500 mt-1">المتبقي للتحصيل</p>
              </div>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'المبلغ']} />
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
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'العمولة']} />
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
                <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'العمولة']} />
                <Bar dataKey="commission" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts and Collection Progress */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">حالة التحصيل العام</CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collectionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                  <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'المبلغ']} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
                    {collectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
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
                  <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                    {agentsWithDebt.map((agent, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-rose-100">
                        <span className="text-sm font-medium text-slate-700">{agent.name}</span>
                        <span className="text-sm font-bold text-rose-600">{agent.remaining.toFixed(2)} ر.س</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-emerald-600 font-medium">لا توجد مبالغ معلقة للتحصيل.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Agents Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">أداء المندوبين وتفاصيل التحصيل</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">اسم المندوب</th>
                <th className="px-6 py-4 font-medium">إجمالي العمولة المستحقة</th>
                <th className="px-6 py-4 font-medium">المطلوب تحصيله</th>
                <th className="px-6 py-4 font-medium">تم تحصيله</th>
                <th className="px-6 py-4 font-medium">المتبقي للتحصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agentStatsList.map((agent, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{agent.name}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600">{agent.commission.toFixed(2)} ر.س</td>
                  <td className="px-6 py-4 text-slate-600">{agent.required.toFixed(2)} ر.س</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">{agent.collected.toFixed(2)} ر.س</td>
                  <td className={`px-6 py-4 font-bold ${agent.remaining > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
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
