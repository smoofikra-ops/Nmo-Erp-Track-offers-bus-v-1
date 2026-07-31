import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={settings.LoginImageURL ? { backgroundImage: `url(${settings.LoginImageURL})` } : {}}
    >
      <div className={settings.LoginImageURL ? "absolute inset-0 bg-slate-900/40 backdrop-blur-sm" : ""} />
      
      <Card className="w-full max-w-md relative z-10 shadow-xl border-0">
        <CardHeader className="space-y-4 text-center pb-2">
          {settings.LogoURL && (
            <img src={settings.LogoURL} alt="Logo" className="h-16 mx-auto object-contain" />
          )}
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 font-cairo">
            {settings.CompanyNameAr || 'NMO Labs Operations OS'}
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email Address</label>
              <input
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white/80 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="admin@erp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password</label>
              <input
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white/80 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11">
              Sign In
            </Button>
            
            <div className="mt-4 text-xs text-center text-slate-500">
              <p>Demo accounts:</p>
              <p>admin@erp.com / admin (Admin)</p>
              <p>user@erp.com / user (User)</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
