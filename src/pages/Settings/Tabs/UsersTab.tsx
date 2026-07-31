import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, UserPlus, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UsersTab() {
  const roles = [
    { name: 'مدير النظام (Admin)', desc: 'صلاحيات كاملة على جميع وحدات النظام', permissions: ['الإعدادات', 'الموظفين', 'المخزون', 'العمولات', 'التقارير'] },
    { name: 'مدير التشغيل (Operations)', desc: 'إدارة العمليات اليومية والموظفين', permissions: ['الموظفين', 'المخزون', 'العمولات'] },
    { name: 'المحاسب (Accountant)', desc: 'إدارة الشؤون المالية والعمولات', permissions: ['العمولات', 'التقارير'] },
    { name: 'المشرف (Supervisor)', desc: 'إشراف على سير العمل', permissions: ['المخزون'] },
    { name: 'المندوب (Agent)', desc: 'وصول محدود لبياناته فقط', permissions: ['عرض العمولات الخاصة'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium leading-6 text-slate-900">المستخدمون والصلاحيات</h3>
          <p className="mt-1 text-sm text-slate-500">إدارة الأدوار وصلاحيات الوصول للمستخدمين.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="h-4 w-4 ml-2" />
          إضافة مستخدم
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roles.map((role, idx) => (
          <Card key={idx} className="border border-slate-200 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{role.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{role.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {role.permissions.map(p => (
                      <span key={p} className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        <Check className="h-3 w-3 mr-1" />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                تعديل الصلاحيات
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
