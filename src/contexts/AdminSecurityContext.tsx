import React, { createContext, useContext, useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface AdminSecurityContextType {
  requireAdminAuth: (actionDescription: string, onReady: () => void) => void;
  isAuthorized: boolean;
  authorizeManually: () => void;
}

const AdminSecurityContext = createContext<AdminSecurityContextType | undefined>(undefined);

export function AdminSecurityProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');
  const [onSuccessCb, setOnSuccessCb] = useState<(() => void) | null>(null);
  const [lastAuthTime, setLastAuthTime] = useState<number>(0);
  const [error, setError] = useState('');

  const AUTH_DURATION = 5 * 60 * 1000; // 5 minutes

  const isAuthorized = Date.now() - lastAuthTime < AUTH_DURATION;

  // Cleanup interval
  useEffect(() => {
    const interval = setInterval(() => {
      // Just a dummy state update if we need to force re-render, but usually not needed
      // because we only care at the moment of action.
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const requireAdminAuth = (actionDescription: string, onReady: () => void) => {
    if (Date.now() - lastAuthTime < AUTH_DURATION) {
      onReady();
    } else {
      setDescription(actionDescription);
      setOnSuccessCb(() => onReady);
      setPassword('');
      setError('');
      setIsOpen(true);
    }
  };

  const authorizeManually = () => {
    setLastAuthTime(Date.now());
  };

  const handleConfirm = () => {
    const storedHash = localStorage.getItem('erp_settings_pwd');
    const defaultPwd = btoa('AdminCo123');
    const actualHash = storedHash || defaultPwd;

    if (btoa(password) === actualHash) {
      setLastAuthTime(Date.now());
      setIsOpen(false);
      setPassword('');
      if (onSuccessCb) {
        onSuccessCb();
      }
    } else {
      setError('رمز المدير غير صحيح.');
    }
  };

  return (
    <AdminSecurityContext.Provider value={{ requireAdminAuth, isAuthorized, authorizeManually }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden" dir="rtl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">تأكيد صلاحية المدير</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium">{description}</p>
              <div className="space-y-2">
                <input
                  autoFocus
                  type="password"
                  placeholder="كلمة مرور المدير..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirm();
                  }}
                  dir="ltr"
                  className="w-full text-center px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                />
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex gap-2 justify-end">
              <Button onClick={handleConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white">تأكيد</Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </AdminSecurityContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminSecurityContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminSecurityProvider');
  }
  return context;
}
