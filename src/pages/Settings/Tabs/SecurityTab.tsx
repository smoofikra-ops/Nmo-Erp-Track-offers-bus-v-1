import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

export function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    const storedHash = localStorage.getItem('erp_settings_pwd');
    // Simple base64 encode/decode for obscurity as requested
    const defaultPwd = btoa('AdminCo123');
    const actualHash = storedHash || defaultPwd;
    
    if (btoa(currentPassword) !== actualHash) {
      toast.error('كلمة المرور الحالية غير صحيحة');
      return;
    }

    localStorage.setItem('erp_settings_pwd', btoa(newPassword));
    toast.success('تم تغيير كلمة مرور الإعدادات بنجاح');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium leading-6 text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          أمان الإعدادات
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          تغيير كلمة المرور الخاصة بالوصول إلى صفحة الإعدادات.
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">كلمة المرور الحالية</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left"
            dir="ltr"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">كلمة المرور الجديدة</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left"
            dir="ltr"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">تأكيد كلمة المرور الجديدة</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left"
            dir="ltr"
          />
        </div>

        <Button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
