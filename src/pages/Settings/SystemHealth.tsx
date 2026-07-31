import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { systemHealthService } from '@/services/systemHealthService';
import { SystemHealthData } from '@/types';
import { Server, Database, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export function SystemHealth() {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [repairReport, setRepairReport] = useState<any>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await systemHealthService.getHealth();
      if (res.success && res.data) {
        setHealthData(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('تعذر الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const res = await systemHealthService.initializeDatabase();
      if (res.success) {
        setRepairReport(res.data);
        await fetchHealth();
        toast.success('تمت تهيئة أو إصلاح قاعدة البيانات بنجاح.');
      } else {
        toast.error('حدث خطأ أثناء التهيئة.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading system health...</div>;
  }

  if (!healthData) {
    return <div className="p-8 text-center text-red-500">Failed to load system health.</div>;
  }

  const StatusIcon = ({ status }: { status: boolean }) => (
    status ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900">{t('settings.systemHealth')}</h3>
        </div>
        <Button 
          onClick={handleInitialize} 
          disabled={initializing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${initializing ? 'animate-spin' : ''}`} />
          {t('settings.initializeDb')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Server className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-lg">Backend Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">{t('settings.gasStatus')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{healthData.gasConnected ? 'Connected' : 'Disconnected'}</span>
                <StatusIcon status={healthData.gasConnected} />
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">{t('settings.sheetsStatus')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{healthData.sheetsAccessible ? 'Accessible' : 'Inaccessible'}</span>
                <StatusIcon status={healthData.sheetsAccessible} />
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">{t('settings.appVersion')}</span>
              <span className="text-sm text-slate-900">{healthData.appVersion}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Database className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-lg">Database Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">{t('settings.dbVersion')}</span>
              <span className="text-sm text-slate-900">{healthData.databaseVersion}</span>
            </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">{t('settings.recordCount')}</span>
              <span className="text-sm text-slate-900">{healthData.coreRecordsCount}</span>
            </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">{t('settings.lastInit')}</span>
              <span className="text-sm text-slate-900">{healthData.lastInitializedAt || 'Never'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sheets Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Existing Sheets ({healthData.existingSheets.length})</h4>
              <div className="flex flex-wrap gap-2">
                {healthData.existingSheets.map(sheet => (
                  <span key={sheet} className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    {sheet}
                  </span>
                ))}
              </div>
            </div>
            
            {healthData.missingSheets.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-2">{t('settings.missingSheets')} ({healthData.missingSheets.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {healthData.missingSheets.map(sheet => (
                    <span key={sheet} className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                      {sheet}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {repairReport && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-800">{t('settings.repairReport')}</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-emerald-700 mb-4">{t('settings.repairSuccess')}</p>
             <pre className="text-xs bg-white p-4 rounded-md border border-emerald-100 overflow-auto max-h-40">
               {JSON.stringify(repairReport, null, 2)}
             </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
