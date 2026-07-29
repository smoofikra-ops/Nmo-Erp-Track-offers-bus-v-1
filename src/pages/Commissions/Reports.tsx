import { useAuth } from "@/contexts/AuthContext";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CommissionReports() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/commission')}>
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('commissions.reports', 'Reports')}</h2>
      </div>
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          Reports visualization will be implemented in the next iteration.
        </CardContent>
      </Card>
    </div>
  );
}
