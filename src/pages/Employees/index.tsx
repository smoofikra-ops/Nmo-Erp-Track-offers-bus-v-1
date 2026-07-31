import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit, Trash2, RotateCcw, AlertCircle, Save } from 'lucide-react';
import { employeeService } from '@/services/employeeService';
import { Employee, EmployeeStatus, CommissionType } from '@/types';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';

export function Employees() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';
  const isAdmin = user?.role === 'ADMIN';

  const { data: response, isLoading, isFetching } = useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => employeeService.getEmployees(companyId),
    enabled: Boolean(companyId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const employees = response?.data || [];

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [commissionFilter, setCommissionFilter] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Form fields
  const [arabicName, setArabicName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [alias, setAlias] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [commissionType, setCommissionType] = useState<CommissionType | ''>('');
  const [status, setStatus] = useState<EmployeeStatus | ''>('');
  const [notes, setNotes] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setEditingEmployee(null);
    setArabicName('');
    setEnglishName('');
    setAlias('');
    setMobile('');
    setEmail('');
    setBasicSalary('');
    setCommissionType(CommissionType.SALARY_AND_COMMISSION);
    setStatus(EmployeeStatus.ACTIVE);
    setNotes('');
    setErrorMsg('');
    setIsFormOpen(false);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setArabicName(emp.ArabicName || '');
    setEnglishName(emp.EnglishName || '');
    setAlias(emp.Alias || '');
    setMobile(emp.Mobile || '');
    setEmail(emp.Email || '');
    setBasicSalary(emp.BasicSalary ? String(emp.BasicSalary) : '');
    setCommissionType(emp.CommissionType);
    setStatus(emp.Status);
    setNotes(emp.Notes || '');
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingEmployee) {
        payload.EmployeeID = editingEmployee.EmployeeID;
        return employeeService.updateEmployee(payload);
      } else {
        return employeeService.createEmployee(payload);
      }
    },
    onSuccess: async (res) => {
      if (res.success) {
        setIsFormOpen(false);
        resetForm();
        toast.success('تم حفظ بيانات الموظف بنجاح.');
        await queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
      } else {
        console.error('Save error details:', res);
        if (res.error?.details?.includes('DuplicateMobile') || res.message?.includes('DuplicateMobile')) {
          setErrorMsg(t('employees.duplicateMobile', 'رقم الجوال مسجل مسبقاً.'));
        } else {
          setErrorMsg('تعذر حفظ بيانات الموظف. يرجى المحاولة لاحقاً.');
        }
      }
    },
    onError: (e: any) => {
      setErrorMsg(e.message || 'An error occurred');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (emp: Employee) => employeeService.deleteEmployee(emp.EmployeeID, companyId),
    onSuccess: async (res) => {
      if (res.success) {
        toast.success('تم حذف الموظف بنجاح.');
        await queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
      } else {
        console.error('Delete error details:', res);
        toast.error('تعذر حذف الموظف. يرجى المحاولة لاحقاً.');
      }
    },
    onError: (e: any) => {
      console.error('Delete network error:', e);
      toast.error('تعذر الاتصال بالخادم.');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (emp: Employee) => employeeService.restoreEmployee(emp.EmployeeID, companyId),
    onSuccess: async (res) => {
      if (res.success) await queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
    }
  });

  const handleSave = () => {
    if (!arabicName) {
      setErrorMsg(t('common.name') + ' ' + t('common.required', 'is required'));
      return;
    }
    if (!commissionType) {
      setErrorMsg(t('employees.commissionType') + ' ' + t('common.required', 'is required'));
      return;
    }
    
    setErrorMsg('');

    const payload: any = {
      CompanyID: companyId,
      ArabicName: arabicName,
      EnglishName: englishName,
      Alias: alias,
      Mobile: mobile,
      Email: email,
      BasicSalary: parseFloat(basicSalary) || 0,
      CommissionType: commissionType,
      Status: status,
      Notes: notes
    };

    saveMutation.mutate(payload);
  };

  const handleDelete = (emp: Employee) => {
    setEmployeeToDelete(emp);
  };
  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteMutation.mutate(employeeToDelete);
      setEmployeeToDelete(null);
    }
  };
  const cancelDelete = () => {
    setEmployeeToDelete(null);
  };

  const handleRestore = (emp: Employee) => {
    restoreMutation.mutate(emp);
  };

  const filtered = employees.filter(e => {
    if (search && !(e.ArabicName?.includes(search) || e.EnglishName?.includes(search) || e.EmployeeCode?.includes(search) || e.Mobile?.includes(search))) return false;
    if (statusFilter && e.Status !== statusFilter) return false;
    if (commissionFilter && e.CommissionType !== commissionFilter) return false;
    return true;
  });

  const getCommissionTypeLabel = (type: string) => {
    switch (type) {
      case CommissionType.SALARY_AND_COMMISSION: return t('employees.typeSalaryAndCommission', 'Salary + Commission');
      case CommissionType.PRODUCT_COMMISSION_ONLY: return t('employees.typeProductCommissionOnly', 'Product Commission Only');
      case CommissionType.NONE: return t('employees.typeNone', 'None');
      default: return type;
    }
  };

  if ((import.meta as any).env.DEV) {
    console.count("EmployeesPage render");
    console.log({ isLoading, isFetching, employeeCount: employees.length, isFormOpen });
  }

  if ((import.meta as any).env.DEV) {
    console.count("EmployeesPage render");
    console.log({ isLoading, isFetching, employeeCount: employees.length, isFormOpen });
  }

  if (isFormOpen) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {editingEmployee ? t('employees.edit', 'Edit Employee') : t('employees.add', 'Add Employee')}
          </h2>
          <Button variant="outline" onClick={resetForm}>{t('common.cancel', 'Cancel')}</Button>
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {errorMsg}
          </div>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('employees.arabicName', 'Arabic Name')} <span className="text-red-500">*</span></label>
                <input type="text" className="w-full h-10 px-3 rounded-md border" value={arabicName} onChange={e => setArabicName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('employees.englishName', 'English Name')}</label>
                <input type="text" className="w-full h-10 px-3 rounded-md border" value={englishName} onChange={e => setEnglishName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('employees.alias', 'Alias')}</label>
                <input type="text" className="w-full h-10 px-3 rounded-md border" value={alias} onChange={e => setAlias(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('employees.mobile', 'Mobile')}</label>
                <input type="text" className="w-full h-10 px-3 rounded-md border" value={mobile} onChange={e => setMobile(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('employees.email', 'Email')}</label>
                <input type="email" className="w-full h-10 px-3 rounded-md border" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('employees.basicSalary', 'Basic Salary')}</label>
                <input type="number" min="0" className="w-full h-10 px-3 rounded-md border" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('employees.commissionType', 'Commission Type')} <span className="text-red-500">*</span></label>
                <select className="w-full h-10 px-3 rounded-md border" value={commissionType} onChange={e => setCommissionType(e.target.value as CommissionType)}>
                  <option value="" disabled>Select type</option>
                  <option value={CommissionType.SALARY_AND_COMMISSION}>{t('employees.typeSalaryAndCommission')}</option>
                  <option value={CommissionType.PRODUCT_COMMISSION_ONLY}>{t('employees.typeProductCommissionOnly')}</option>
                  <option value={CommissionType.NONE}>{t('employees.typeNone')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('common.status', 'Status')}</label>
                <select className="w-full h-10 px-3 rounded-md border" value={status} onChange={e => setStatus(e.target.value as EmployeeStatus)}>
                  <option value={EmployeeStatus.ACTIVE}>{t('employees.statusActive', 'Active')}</option>
                  <option value={EmployeeStatus.INACTIVE}>{t('employees.statusInactive', 'Inactive')}</option>
                  <option value={EmployeeStatus.SUSPENDED}>{t('employees.statusSuspended', 'Suspended')}</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.notes', 'Notes')}</label>
              <textarea className="w-full p-3 rounded-md border min-h-[80px]" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600">
                <Save className="h-4 w-4 mr-2" /> {saveMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
              </Button>
            </div>
          </CardContent>
              </Card>

      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 text-slate-900">تأكيد الحذف</h3>
              <p className="text-slate-600 mb-6">
                هل أنت متأكد من حذف الموظف "{employeeToDelete.ArabicName || employeeToDelete.EnglishName}"؟<br/>
                سيتم إخفاؤه من القوائم ولن يُحذف سجله التاريخي.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={cancelDelete}>إلغاء</Button>
                <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">حذف</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">{t('employees.empty', 'No employees have been created yet.')}</h2>
          <p className="text-slate-500">Add an employee to start assigning commissions and tracking performance.</p>
        </div>
        <Button size="lg" onClick={() => { 
          resetForm(); 
          setIsFormOpen(true); 
        }}>
          <Plus className="mr-2 h-5 w-5" /> {t('employees.addFirst', 'Add First Employee')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('employees.list', 'Employees')}</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your employees</p>
        </div>
        <Button onClick={() => { 
          resetForm(); 
          setIsFormOpen(true); 
        }}>
          <Plus className="mr-2 h-4 w-4" /> {t('employees.add', 'Add Employee')}
        </Button>
      </div>

      {isFetching && (
        <div className="text-xs text-slate-400">Updating...</div>
      )}

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('common.search', 'Search...')} 
            className="flex h-10 w-full rounded-md border border-slate-300 pl-10 pr-3 py-2 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="h-10 rounded-md border px-3 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value={EmployeeStatus.ACTIVE}>{t('employees.statusActive', 'Active')}</option>
          <option value={EmployeeStatus.INACTIVE}>{t('employees.statusInactive', 'Inactive')}</option>
          <option value={EmployeeStatus.SUSPENDED}>{t('employees.statusSuspended', 'Suspended')}</option>
        </select>
        <select 
          className="h-10 rounded-md border px-3 text-sm"
          value={commissionFilter}
          onChange={e => setCommissionFilter(e.target.value)}
        >
          <option value="">All Commission Types</option>
          <option value={CommissionType.SALARY_AND_COMMISSION}>{t('employees.typeSalaryAndCommission')}</option>
          <option value={CommissionType.PRODUCT_COMMISSION_ONLY}>{t('employees.typeProductCommissionOnly')}</option>
          <option value={CommissionType.NONE}>{t('employees.typeNone')}</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">{t('employees.code', 'Code')}</th>
                <th className="px-6 py-4 font-medium">{t('employees.arabicName', 'Name')}</th>
                <th className="px-6 py-4 font-medium">{t('employees.mobile', 'Mobile')}</th>
                <th className="px-6 py-4 font-medium">{t('employees.commissionType', 'Commission')}</th>
                <th className="px-6 py-4 font-medium">{t('common.status', 'Status')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No records match your filters.
                  </td>
                </tr>
              ) : filtered.map((e, i) => {
                const isDeleted = e.IsDeleted === true || (e.IsDeleted as any) === 'TRUE' || (e.IsDeleted as any) === 'true';
                return (
                  <tr key={i} className={cn("transition-colors", isDeleted ? "bg-red-50/50 opacity-60" : "hover:bg-slate-50/50")}>
                    <td className="px-6 py-4 font-medium">{e.EmployeeCode}</td>
                    <td className="px-6 py-4">
                      <div>{e.ArabicName || e.EnglishName}</div>
                      {e.Alias && <div className="text-xs text-slate-500">{e.Alias}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{e.Mobile || '-'}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">{getCommissionTypeLabel(e.CommissionType)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {isDeleted ? (
                        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Deleted</span>
                      ) : (
                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", 
                          e.Status === EmployeeStatus.ACTIVE ? "bg-emerald-100 text-emerald-700" :
                          e.Status === EmployeeStatus.SUSPENDED ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        )}>
                          {e.Status === EmployeeStatus.ACTIVE ? t('employees.statusActive', 'Active') : 
                           e.Status === EmployeeStatus.SUSPENDED ? t('employees.statusSuspended', 'Suspended') :
                           t('employees.statusInactive', 'Inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {!isDeleted ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(e)} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleRestore(e)} disabled={restoreMutation.isPending}><RotateCcw className="h-4 w-4 mr-2" /> {t('employees.restore', 'Restore')}</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
