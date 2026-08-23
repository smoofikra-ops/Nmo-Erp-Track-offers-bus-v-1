import { employeeService } from './employeeService';
import { commissionService } from './commissionService';
import { fleetService, generateUniqueEntityId } from './fleetService';
import { productService } from './productService';
import { quoteService } from './quoteService';
import { Vehicle, MaintenanceLog, AccidentLog, OperationalStatus, AccidentSeverity, AccidentStatus, MaintenanceStatus } from '../types/fleet';
import { Employee } from '../types/models';

export type AICommandType = 'READ' | 'CREATE' | 'UPDATE' | 'REPORT' | 'SENSITIVE';

export type AIModuleTarget = 'FLEET' | 'COMMISSIONS' | 'EMPLOYEES' | 'INVENTORY' | 'QUOTES' | 'CROSS_MODULE' | 'SYSTEM';

export interface AIResolvedEntity {
  type: 'EMPLOYEE' | 'VEHICLE' | 'PRODUCT';
  id: string;
  label: string;
  rawObject?: any;
}

export interface AIPreviewChange {
  field: string;
  fieldLabel: string;
  previousValue: any;
  newValue: any;
}

export interface AIActionPayload {
  actionType: 'CREATE_ACCIDENT' | 'CREATE_MAINTENANCE' | 'CREATE_FUEL' | 'UPDATE_VEHICLE_STATUS' | 'UPDATE_INSURANCE_EXPIRY' | 'UPDATE_INSPECTION_EXPIRY' | 'GENERIC_UPDATE';
  module: AIModuleTarget;
  targetRecordId?: string;
  targetRecordLabel?: string;
  changes?: AIPreviewChange[];
  dataToSave: any;
  isSensitive?: boolean;
  requiresAdminConfirmation?: boolean;
}

export interface AIExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  errorDetails?: string;
  actionId?: string;
}

export interface AIQueryResult {
  type: 'TEXT' | 'METRICS' | 'TABLE' | 'REPORT' | 'PREVIEW_ACTION' | 'AMBIGUITY_RESOLUTION';
  module: AIModuleTarget;
  title?: string;
  summaryText: string;
  kpis?: { label: string; value: string | number; change?: string; color?: string }[];
  tableData?: { headers: string[]; rows: (string | number)[][] };
  reportFilters?: Record<string, any>;
  previewAction?: AIActionPayload;
  ambiguityChoices?: { id: string; title: string; subtitle?: string; onSelectQuery: string }[];
  contextEntities?: AIResolvedEntity[];
  requiresConfirmation?: boolean;
}

export interface SavedReportItem {
  id: string;
  title: string;
  query: string;
  category: string;
  createdAt: string;
  resultCache?: AIQueryResult;
}

const SAVED_REPORTS_KEY = 'nmo_rejeen_saved_reports';
const DEFAULT_COMPANY_ID = 'COM-0001';

class AIAssistantService {
  private savedReports: SavedReportItem[] = [];

  constructor() {
    this.loadSavedReports();
  }

  private loadSavedReports() {
    try {
      const stored = localStorage.getItem(SAVED_REPORTS_KEY);
      if (stored) {
        this.savedReports = JSON.parse(stored);
      } else {
        this.savedReports = [
          {
            id: 'rep-ins-30',
            title: 'تقرير التأمينات التي تنتهي خلال 60 يوم',
            query: 'اعرض تقرير المركبات التي ينتهي تأمينها خلال 60 يوم',
            category: 'FLEET',
            createdAt: new Date().toISOString()
          },
          {
            id: 'rep-maint-pending',
            title: 'تقرير المركبات في الصيانة والحوادث المفتوحة',
            query: 'ما المركبات الموجودة في الصيانة والحوادث المفتوحة؟',
            category: 'FLEET',
            createdAt: new Date().toISOString()
          },
          {
            id: 'rep-comm-month',
            title: 'تقرير عمولات ومستحقات المناديب لهذا الشهر',
            query: 'تقرير عمولات المندوبين والمبالغ المستحقة لهذا الشهر',
            category: 'COMMISSIONS',
            createdAt: new Date().toISOString()
          }
        ];
        this.saveReportsToStorage();
      }
    } catch {
      this.savedReports = [];
    }
  }

  private saveReportsToStorage() {
    try {
      localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(this.savedReports));
    } catch (e) {
      console.error('Error saving AI reports', e);
    }
  }

  public getSavedReports(): SavedReportItem[] {
    return this.savedReports;
  }

  public addSavedReport(title: string, query: string, category: string = 'GENERAL', resultCache?: AIQueryResult): SavedReportItem {
    const newItem: SavedReportItem = {
      id: 'rep-' + Date.now(),
      title,
      query,
      category,
      createdAt: new Date().toISOString(),
      resultCache
    };
    this.savedReports.unshift(newItem);
    this.saveReportsToStorage();
    return newItem;
  }

  public deleteSavedReport(id: string) {
    this.savedReports = this.savedReports.filter(r => r.id !== id);
    this.saveReportsToStorage();
  }

  // --- Entity Resolution Helpers ---
  public async resolveEmployee(queryPart: string, activeContextEmployeeId?: string, companyId: string = DEFAULT_COMPANY_ID): Promise<{ matched?: Employee; ambiguous?: Employee[]; notFound?: boolean }> {
    const empRes = await employeeService.getEmployees(companyId);
    const employees: Employee[] = empRes.data || [];
    
    if (!employees.length) return { notFound: true };

    const clean = queryPart.trim().toLowerCase();

    // 1. Direct active context
    if (clean === 'الموظف الحالي' || clean === 'هذا الموظف' || clean === 'هو' || clean === 'له') {
      if (activeContextEmployeeId) {
        const found = employees.find(e => e.EmployeeID === activeContextEmployeeId);
        if (found) return { matched: found };
      }
    }

    // 2. Exact match by EmployeeID
    const exactIdMatch = employees.find(e => e.EmployeeID.toLowerCase() === clean);
    if (exactIdMatch) return { matched: exactIdMatch };

    // 3. Match numeric code or tail (e.g., ends with 37 or 1058)
    const numericRegex = /(\d+)/;
    const numMatch = clean.match(numericRegex);
    if (numMatch) {
      const num = numMatch[1];
      const matchingById = employees.filter(e => e.EmployeeID.endsWith(num) || (e.EmployeeCode && String(e.EmployeeCode).endsWith(num)));
      if (matchingById.length === 1) return { matched: matchingById[0] };
      if (matchingById.length > 1) return { ambiguous: matchingById };
    }

    // 4. Exact match by Name
    const exactNameMatch = employees.filter(e => (e.ArabicName || e.EnglishName || '').toLowerCase() === clean);
    if (exactNameMatch.length === 1) return { matched: exactNameMatch[0] };
    if (exactNameMatch.length > 1) return { ambiguous: exactNameMatch };

    // 5. Partial Name match
    const partialMatch = employees.filter(e => {
      const ar = (e.ArabicName || '').toLowerCase();
      const en = (e.EnglishName || '').toLowerCase();
      return (ar && (ar.includes(clean) || clean.includes(ar))) || (en && (en.includes(clean) || clean.includes(en)));
    });
    if (partialMatch.length === 1) return { matched: partialMatch[0] };
    if (partialMatch.length > 1) return { ambiguous: partialMatch };

    return { notFound: true };
  }

  public async resolveVehicle(queryPart: string, activeContextVehicleId?: string, companyId: string = DEFAULT_COMPANY_ID): Promise<{ matched?: Vehicle; ambiguous?: Vehicle[]; notFound?: boolean }> {
    const vehRes = await fleetService.getVehicles(companyId);
    const vehicles: Vehicle[] = (vehRes.data || []).filter(v => !v.IsDeleted);

    if (!vehicles.length) return { notFound: true };

    const clean = queryPart.trim().toLowerCase();

    // 1. Active context check
    if (clean === 'المركبة الحالية' || clean === 'هذه المركبة' || clean === 'سيارتها' || clean === 'سيارته' || clean === 'مركبتها') {
      if (activeContextVehicleId) {
        const found = vehicles.find(v => v.Vehicle_ID === activeContextVehicleId);
        if (found) return { matched: found };
      }
    }

    // 2. Exact Vehicle_ID
    const exactId = vehicles.find(v => v.Vehicle_ID.toLowerCase() === clean);
    if (exactId) return { matched: exactId };

    // 3. Plate Number or VIN match
    const plateMatch = vehicles.filter(v => {
      const p = (v.Plate_Number || '').toLowerCase().replace(/\s+/g, '');
      const vin = (v.VIN_Chassis_Number || v.VIN || '').toLowerCase();
      const c = clean.replace(/\s+/g, '');
      return p.includes(c) || c.includes(p) || (vin && vin.includes(c));
    });
    if (plateMatch.length === 1) return { matched: plateMatch[0] };
    if (plateMatch.length > 1) return { ambiguous: plateMatch };

    // 4. By Driver Name / ID in query
    const driverMatch = vehicles.filter(v => {
      const dName = (v.Primary_Driver_Name || '').toLowerCase();
      const dId = (v.Primary_Driver_ID || '').toLowerCase();
      return (dName && (dName.includes(clean) || clean.includes(dName))) || (dId && dId === clean);
    });
    if (driverMatch.length === 1) return { matched: driverMatch[0] };
    if (driverMatch.length > 1) return { ambiguous: driverMatch };

    return { notFound: true };
  }

  // --- Main Natural Language Query & Command Router ---
  public async processQuery(
    rawPrompt: string, 
    context?: { currentVehicleId?: string; currentEmployeeId?: string; userRole?: string; userName?: string; companyId?: string }
  ): Promise<AIQueryResult> {
    const prompt = rawPrompt.trim();
    const lower = prompt.toLowerCase();
    const companyId = context?.companyId || DEFAULT_COMPANY_ID;

    // 1. Check for Save Report Command
    if (lower.startsWith('احفظ هذا باسم') || lower.startsWith('احفظ هذا التقرير باسم') || lower.startsWith('احفظ الاستعلام')) {
      const reportName = prompt.replace(/^احفظ (هذا التقرير|هذا|الاستعلام) باسم/i, '').trim() || 'تقرير مخصص';
      this.addSavedReport(reportName, prompt);
      return {
        type: 'TEXT',
        module: 'SYSTEM',
        summaryText: `✅ تم حفظ التقرير بنجاح باسم: "${reportName}". يمكنك الوصول إليه في أي وقت من قائمة التقارير المحفوظة أو بطلب "افتح ${reportName}".`
      };
    }

    // 2. Open Saved Report Command
    if (lower.startsWith('افتح تقرير') || lower.startsWith('عرض تقرير') || lower.startsWith('افتح ')) {
      const targetTitle = prompt.replace(/^(افتح تقرير|عرض تقرير|افتح)/i, '').trim();
      const matchedRep = this.savedReports.find(r => r.title.includes(targetTitle) || targetTitle.includes(r.title));
      if (matchedRep) {
        return this.processQuery(matchedRep.query, context);
      }
    }

    // 3. INTENT DETECTION: WRITE / UPDATE / CREATE INTENTS
    // A. Create Accident
    if (lower.includes('حادث') && (lower.includes('سجل') || lower.includes('أضف') || lower.includes('اضف') || lower.includes('إنشاء'))) {
      return this.handleCreateAccidentIntent(prompt, context, companyId);
    }

    // B. Create Maintenance
    if (lower.includes('صيانة') && (lower.includes('سجل') || lower.includes('أضف') || lower.includes('اضف') || lower.includes('إدخال'))) {
      return this.handleCreateMaintenanceIntent(prompt, context, companyId);
    }

    // C. Update Vehicle Status / Details
    if ((lower.includes('حدث') || lower.includes('غير') || lower.includes('تحديث') || lower.includes('تغيير')) && (lower.includes('مركبة') || lower.includes('سيارة') || lower.includes('حالة') || lower.includes('تأمين') || lower.includes('فحص'))) {
      return this.handleUpdateVehicleIntent(prompt, context, companyId);
    }

    // 4. INTENT DETECTION: COMMISSIONS & ORDERS
    if (lower.includes('عمول') || lower.includes('مستحق') || lower.includes('مبالغ معلقة') || lower.includes('صرف') || lower.includes('تسوية') || lower.includes('طلب') || lower.includes('استلم')) {
      return this.handleCommissionsIntent(prompt, context, companyId);
    }

    // 5. INTENT DETECTION: FLEET QUERIES & REPORTS
    if (lower.includes('مركبة') || lower.includes('سيارة') || lower.includes('أسطول') || lower.includes('تأمين') || lower.includes('فحص') || lower.includes('جاهزية') || lower.includes('وقود') || lower.includes('صيانة') || lower.includes('حادث')) {
      return this.handleFleetIntent(prompt, context, companyId);
    }

    // 6. INTENT DETECTION: EMPLOYEES
    if (lower.includes('موظف') || lower.includes('مندوب') || lower.includes('سائق') || lower.includes('نشطين')) {
      return this.handleEmployeesIntent(prompt, context, companyId);
    }

    // 7. INTENT DETECTION: INVENTORY & PRODUCTS
    if (lower.includes('مخزون') || lower.includes('منتج') || lower.includes('حرج') || lower.includes('منخفض') || lower.includes('كمية')) {
      return this.handleInventoryIntent(prompt, context, companyId);
    }

    // 8. INTENT DETECTION: QUOTATIONS
    if (lower.includes('عرض سعر') || lower.includes('عروض أسعار') || lower.includes('عرض السعر')) {
      return this.handleQuotesIntent(prompt, context, companyId);
    }

    // 9. CROSS-MODULE & GENERAL ERP OVERVIEW
    return this.handleCrossModuleOverview(prompt, context, companyId);
  }

  // --- HANDLER: Create Accident ---
  private async handleCreateAccidentIntent(prompt: string, context?: any, companyId: string = DEFAULT_COMPANY_ID): Promise<AIQueryResult> {
    const vehListRes = await fleetService.getVehicles(companyId);
    const vehicles = (vehListRes.data || []).filter(v => !v.IsDeleted);

    // Extract Cost
    const costMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:ريال|رس|SAR)?/);
    const cost = costMatch ? parseFloat(costMatch[1]) : 0;

    // Extract Severity
    let severity: AccidentSeverity = 'MINOR';
    if (prompt.includes('بسيط') || prompt.includes('خفيف')) severity = 'MINOR';
    else if (prompt.includes('متوسط')) severity = 'MODERATE';
    else if (prompt.includes('جسيم') || prompt.includes('كبير') || prompt.includes('بليغ') || prompt.includes('حاد')) severity = 'SEVERE';

    // Target Vehicle & Employee
    let targetVehicle: Vehicle | undefined;
    
    // Check if vehicle or employee mentioned in prompt
    for (const v of vehicles) {
      if (
        (v.Plate_Number && prompt.includes(v.Plate_Number)) ||
        (v.Vehicle_ID && prompt.includes(v.Vehicle_ID)) ||
        (v.Primary_Driver_Name && prompt.includes(v.Primary_Driver_Name)) ||
        (v.Primary_Driver_ID && prompt.includes(v.Primary_Driver_ID))
      ) {
        targetVehicle = v;
        break;
      }
    }

    if (!targetVehicle && context?.currentVehicleId) {
      targetVehicle = vehicles.find(v => v.Vehicle_ID === context.currentVehicleId);
    }

    if (!targetVehicle) {
      // Return Ambiguity Resolution
      return {
        type: 'AMBIGUITY_RESOLUTION',
        module: 'FLEET',
        summaryText: 'عذرًا، لم أتمكن من تحديد المركبة المراد تسجيل الحادث لها بدقة. يرجى اختيار المركبة المعنية:',
        ambiguityChoices: vehicles.slice(0, 5).map(v => ({
          id: v.Vehicle_ID,
          title: `${v.Plate_Number} (${v.Brand} ${v.Model})`,
          subtitle: `الموظف المسند إليه: ${v.Primary_Driver_Name || 'بدون سائق'}`,
          onSelectQuery: `سجل حادث ${severity === 'MINOR' ? 'خفيف' : 'متوسط'} للمركبة ${v.Plate_Number} بتكلفة ${cost || 500} ريال`
        }))
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newAccidentData: Partial<AccidentLog> = {
      Accident_ID: generateUniqueEntityId('ACC'),
      Vehicle_ID: targetVehicle.Vehicle_ID,
      Driver_Employee_ID: targetVehicle.Primary_Driver_ID || '',
      Driver_Name: targetVehicle.Primary_Driver_Name || 'غير محدد',
      Date: todayStr,
      Time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      Location: 'الرياض (تسجيل آلي عبر مساعد ريجين)',
      Severity: severity,
      Cost: cost,
      Description: `حادث مسجل عبر مساعد ريجين الذكي: ${prompt}`,
      Status: 'OPEN',
      CompanyID: companyId
    };

    const actionPayload: AIActionPayload = {
      actionType: 'CREATE_ACCIDENT',
      module: 'FLEET',
      targetRecordId: targetVehicle.Vehicle_ID,
      targetRecordLabel: `${targetVehicle.Plate_Number} - ${targetVehicle.Brand} ${targetVehicle.Model}`,
      changes: [
        { field: 'Date', fieldLabel: 'تاريخ الحادث', previousValue: '-', newValue: todayStr },
        { field: 'Severity', fieldLabel: 'درجة الحادث', previousValue: '-', newValue: severity === 'MINOR' ? 'خفيف / بسيط' : severity === 'MODERATE' ? 'متوسط' : 'جسيم' },
        { field: 'Cost', fieldLabel: 'التكلفة المقدرة', previousValue: '-', newValue: `${cost.toLocaleString('en-US')} ريال` },
        { field: 'Driver_Name', fieldLabel: 'السائق المرتبط', previousValue: '-', newValue: targetVehicle.Primary_Driver_Name || 'بدون سائق' }
      ],
      dataToSave: newAccidentData,
      isSensitive: false
    };

    return {
      type: 'PREVIEW_ACTION',
      module: 'FLEET',
      summaryText: `جاهز لتسجيل حادث جديد للمركبة **${targetVehicle.Plate_Number} (${targetVehicle.Brand} ${targetVehicle.Model})**. يرجى مراجعة التفاصيل أدناه وتأكيد العملية:`,
      previewAction: actionPayload,
      requiresConfirmation: true
    };
  }

  // --- HANDLER: Create Maintenance ---
  private async handleCreateMaintenanceIntent(prompt: string, context?: any, companyId: string = DEFAULT_COMPANY_ID): Promise<AIQueryResult> {
    const vehListRes = await fleetService.getVehicles(companyId);
    const vehicles = (vehListRes.data || []).filter(v => !v.IsDeleted);

    const costMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:ريال|رس|SAR)?/);
    const cost = costMatch ? parseFloat(costMatch[1]) : 0;

    let targetVehicle: Vehicle | undefined;
    for (const v of vehicles) {
      if (
        (v.Plate_Number && prompt.includes(v.Plate_Number)) ||
        (v.Vehicle_ID && prompt.includes(v.Vehicle_ID)) ||
        (v.Primary_Driver_Name && prompt.includes(v.Primary_Driver_Name))
      ) {
        targetVehicle = v;
        break;
      }
    }

    if (!targetVehicle && context?.currentVehicleId) {
      targetVehicle = vehicles.find(v => v.Vehicle_ID === context.currentVehicleId);
    }

    if (!targetVehicle) {
      return {
        type: 'AMBIGUITY_RESOLUTION',
        module: 'FLEET',
        summaryText: 'يرجى تحديد المركبة المطلوب تسجيل الصيانة لها:',
        ambiguityChoices: vehicles.slice(0, 5).map(v => ({
          id: v.Vehicle_ID,
          title: `${v.Plate_Number} (${v.Brand} ${v.Model})`,
          subtitle: `السائق: ${v.Primary_Driver_Name || 'بدون سائق'}`,
          onSelectQuery: `سجل صيانة للمركبة ${v.Plate_Number} بتكلفة ${cost || 350} ريال`
        }))
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const maintType = prompt.includes('دورية') ? 'صيانة دورية' : prompt.includes('زيت') ? 'تغيير زيت وفلاتر' : prompt.includes('إطارات') || prompt.includes('كفرات') ? 'تغيير إطارات' : 'صيانة وإصلاحات عامة';

    const newMaintData: Partial<MaintenanceLog> = {
      Maintenance_ID: generateUniqueEntityId('MNT'),
      Vehicle_ID: targetVehicle.Vehicle_ID,
      Date: todayStr,
      Maintenance_Type: maintType,
      Notes: `صيانة مسجلة بواسطة ريجين AI: ${prompt}`,
      Odometer: targetVehicle.Current_Odometer || 0,
      Cost: cost,
      Workshop: 'الورشة المعتمدة',
      Invoice_No: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
      Status: 'SCHEDULED',
      CompanyID: companyId
    };

    const actionPayload: AIActionPayload = {
      actionType: 'CREATE_MAINTENANCE',
      module: 'FLEET',
      targetRecordId: targetVehicle.Vehicle_ID,
      targetRecordLabel: `${targetVehicle.Plate_Number} - ${targetVehicle.Brand} ${targetVehicle.Model}`,
      changes: [
        { field: 'Maintenance_Type', fieldLabel: 'نوع الصيانة', previousValue: '-', newValue: maintType },
        { field: 'Date', fieldLabel: 'تاريخ الصيانة', previousValue: '-', newValue: todayStr },
        { field: 'Cost', fieldLabel: 'التكلفة المقدرة', previousValue: '-', newValue: `${cost.toLocaleString('en-US')} ريال` },
        { field: 'Odometer', fieldLabel: 'العداد الحالي', previousValue: '-', newValue: `${(targetVehicle.Current_Odometer || 0).toLocaleString('en-US')} كم` }
      ],
      dataToSave: newMaintData,
      isSensitive: false
    };

    return {
      type: 'PREVIEW_ACTION',
      module: 'FLEET',
      summaryText: `جاهز لجدولة أمر صيانة جديد للمركبة **${targetVehicle.Plate_Number}**. قم بمراجعة البيانات وتأكيد الإدخال:`,
      previewAction: actionPayload,
      requiresConfirmation: true
    };
  }

  // --- HANDLER: Update Vehicle ---
  private async handleUpdateVehicleIntent(prompt: string, context?: any, companyId: string = DEFAULT_COMPANY_ID): Promise<AIQueryResult> {
    const vehListRes = await fleetService.getVehicles(companyId);
    const vehicles = (vehListRes.data || []).filter(v => !v.IsDeleted);

    let targetVehicle: Vehicle | undefined;
    for (const v of vehicles) {
      if (
        (v.Plate_Number && prompt.includes(v.Plate_Number)) ||
        (v.Vehicle_ID && prompt.includes(v.Vehicle_ID)) ||
        (v.Primary_Driver_Name && prompt.includes(v.Primary_Driver_Name))
      ) {
        targetVehicle = v;
        break;
      }
    }

    if (!targetVehicle && context?.currentVehicleId) {
      targetVehicle = vehicles.find(v => v.Vehicle_ID === context.currentVehicleId);
    }

    if (!targetVehicle) {
      return {
        type: 'AMBIGUITY_RESOLUTION',
        module: 'FLEET',
        summaryText: 'عذرًا، حدد أي مركبة تريد تعديل بياناتها:',
        ambiguityChoices: vehicles.slice(0, 5).map(v => ({
          id: v.Vehicle_ID,
          title: `${v.Plate_Number} (${v.Brand} ${v.Model})`,
          subtitle: `السائق: ${v.Primary_Driver_Name || 'بدون سائق'}`,
          onSelectQuery: `حدث بيانات المركبة ${v.Plate_Number}`
        }))
      };
    }

    // 1. Check Status Change
    if (prompt.includes('صيانة') || prompt.includes('في الصيانة') || prompt.includes('نشط') || prompt.includes('متوقف') || prompt.includes('جاهز')) {
      let newStatus: OperationalStatus = targetVehicle.Operational_Status;
      let statusLabel = '';
      if (prompt.includes('صيانة') || prompt.includes('في الصيانة')) {
        newStatus = 'IN_MAINTENANCE';
        statusLabel = 'في الصيانة (IN_MAINTENANCE)';
      } else if (prompt.includes('نشط') || prompt.includes('جاهز') || prompt.includes('متاح')) {
        newStatus = 'ACTIVE';
        statusLabel = 'نشط / جاهز (ACTIVE)';
      } else if (prompt.includes('متوقف') || prompt.includes('تعطل')) {
        newStatus = 'STOPPED';
        statusLabel = 'متوقفة (STOPPED)';
      }

      const actionPayload: AIActionPayload = {
        actionType: 'UPDATE_VEHICLE_STATUS',
        module: 'FLEET',
        targetRecordId: targetVehicle.Vehicle_ID,
        targetRecordLabel: `${targetVehicle.Plate_Number} (${targetVehicle.Brand} ${targetVehicle.Model})`,
        changes: [
          {
            field: 'Operational_Status',
            fieldLabel: 'الحالة التشغيلية',
            previousValue: targetVehicle.Operational_Status,
            newValue: newStatus
          }
        ],
        dataToSave: { Operational_Status: newStatus },
        isSensitive: false
      };

      return {
        type: 'PREVIEW_ACTION',
        module: 'FLEET',
        summaryText: `تم تجهيز طلب تعديل الحالة التشغيلية للمركبة **${targetVehicle.Plate_Number}** إلى **${statusLabel}**. يرجى التأكيد:`,
        previewAction: actionPayload,
        requiresConfirmation: true
      };
    }

    // 2. Check Date Updates (Insurance / Inspection)
    const dateRegex = /(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/;
    const dateMatch = prompt.match(dateRegex);
    const newDate = dateMatch ? dateMatch[1].replace(/\//g, '-') : '2026-12-31';

    if (prompt.includes('تأمين')) {
      const actionPayload: AIActionPayload = {
        actionType: 'UPDATE_INSURANCE_EXPIRY',
        module: 'FLEET',
        targetRecordId: targetVehicle.Vehicle_ID,
        targetRecordLabel: `${targetVehicle.Plate_Number} (${targetVehicle.Brand} ${targetVehicle.Model})`,
        changes: [
          {
            field: 'Insurance_Expiry',
            fieldLabel: 'تاريخ انتهاء التأمين',
            previousValue: targetVehicle.Insurance_Expiry || 'غير مسجل',
            newValue: newDate
          }
        ],
        dataToSave: { Insurance_Expiry: newDate },
        isSensitive: true
      };

      return {
        type: 'PREVIEW_ACTION',
        module: 'FLEET',
        summaryText: `جاهز لتحديث موعد انتهاء وثيقة التأمين للمركبة **${targetVehicle.Plate_Number}**. راجع التغيير أدناه:`,
        previewAction: actionPayload,
        requiresConfirmation: true
      };
    }

    return {
      type: 'TEXT',
      module: 'FLEET',
      summaryText: `المركبة **${targetVehicle.Plate_Number}** (${targetVehicle.Brand} ${targetVehicle.Model}) حالتها الحالية: **${targetVehicle.Operational_Status}**، والعداد: **${(targetVehicle.Current_Odometer || 0).toLocaleString('en-US')} كم**. يمكنك أن تطلب: "غير حالتها إلى في الصيانة" أو "سجل لها حادث" أو "حدث انتهاء التأمين".`
    };
  }

  // --- HANDLER: Execute Confirmed Action ---
  public async executeAction(payload: AIActionPayload, userContext: { userId?: string; userName?: string; companyId?: string }): Promise<AIExecutionResult> {
    try {
      const companyId = userContext.companyId || DEFAULT_COMPANY_ID;

      if (payload.actionType === 'CREATE_ACCIDENT') {
        const res = await fleetService.addAccidentLog(payload.dataToSave, companyId);
        if (res.error) throw new Error(res.error.details || res.error.code || 'فشل تسجيل الحادث');

        return {
          success: true,
          message: `✅ تم تسجيل الحادث بنجاح للمركبة (${payload.targetRecordLabel}) برقم مرجعي: ${payload.dataToSave.Accident_ID}`,
          data: res.data
        };
      }

      if (payload.actionType === 'CREATE_MAINTENANCE') {
        const res = await fleetService.addMaintenanceLog(payload.dataToSave, companyId);
        if (res.error) throw new Error(res.error.details || res.error.code || 'فشل تسجيل الصيانة');

        return {
          success: true,
          message: `✅ تم جدولة أمر الصيانة بنجاح للمركبة (${payload.targetRecordLabel}) برقم: ${payload.dataToSave.Maintenance_ID}`,
          data: res.data
        };
      }

      if (payload.actionType === 'UPDATE_VEHICLE_STATUS' || payload.actionType === 'UPDATE_INSURANCE_EXPIRY' || payload.actionType === 'GENERIC_UPDATE') {
        if (!payload.targetRecordId) throw new Error('معرف السجل غير متوفر');
        const res = await fleetService.updateVehicle(payload.targetRecordId, payload.dataToSave, companyId);
        if (res.error) throw new Error(res.error.details || res.error.code || 'فشل تحديث بيانات المركبة');

        return {
          success: true,
          message: `✅ تم تحديث بيانات المركبة (${payload.targetRecordLabel}) بنجاح في قاعدة البيانات.`,
          data: res.data
        };
      }

      throw new Error('نوع العملية غير مدعوم حالياً');
    } catch (err: any) {
      return {
        success: false,
        message: `❌ فشلت العملية: ${err.message || 'خطأ غير متوقع أثناء الحفظ في Backend'}`,
        errorDetails: String(err)
      };
    }
  }

  // --- HANDLER: Commissions & Orders ---
  private async handleCommissionsIntent(prompt: string, context?: any, companyId: string = DEFAULT_COMPANY_ID): Promise<AIQueryResult> {
    const [empRes, commRes] = await Promise.all([
      employeeService.getEmployees(companyId),
      commissionService.getCommissionRecords(companyId)
    ]);

    const employees: Employee[] = empRes.data || [];
    const records = commRes.data || [];

    // Specific Employee inquiry
    let targetEmployee: Employee | undefined;
    for (const e of employees) {
      if (
        (e.EmployeeID && prompt.includes(e.EmployeeID)) ||
        (e.EmployeeCode && prompt.includes(String(e.EmployeeCode))) ||
        (e.ArabicName && prompt.includes(e.ArabicName)) ||
        (e.EnglishName && prompt.includes(e.EnglishName))
      ) {
        targetEmployee = e;
        break;
      }
    }

    if (!targetEmployee && context?.currentEmployeeId) {
      targetEmployee = employees.find(e => e.EmployeeID === context.currentEmployeeId);
    }

    if (targetEmployee) {
      // Find employee's specific records
      const empRecords = records.filter((c: any) => c.employeeId === targetEmployee!.EmployeeID || c.employeeCode === targetEmployee!.EmployeeID || c.EmployeeID === targetEmployee!.EmployeeID);
      const totalEarned = empRecords.reduce((sum: number, c: any) => sum + (Number(c.totalCommission) || Number(c.netAmount) || Number(c.amount) || 0), 0);
      const totalPaid = empRecords.reduce((sum: number, c: any) => sum + (Number(c.paidAmount) || 0), 0);
      const remainingDue = totalEarned - totalPaid;

      return {
        type: 'METRICS',
        module: 'COMMISSIONS',
        title: `تقرير عمولات الموظف: ${targetEmployee.ArabicName || targetEmployee.EnglishName} (${targetEmployee.EmployeeID})`,
        summaryText: `إجمالي عمولات ومستحقات الموظف **${targetEmployee.ArabicName || targetEmployee.EnglishName}** المسجلة في النظام: **${totalEarned.toLocaleString('en-US')} ريال**، والمصروف منها **${totalPaid.toLocaleString('en-US')} ريال**، مع متبقي مستحق قدره **${remainingDue.toLocaleString('en-US')} ريال**.`,
        kpis: [
          { label: 'إجمالي العمولات', value: `${totalEarned.toLocaleString('en-US')} ريال`, color: 'text-indigo-600' },
          { label: 'المبالغ المصروفة', value: `${totalPaid.toLocaleString('en-US')} ريال`, color: 'text-emerald-600' },
          { label: 'المستحق المتبقي', value: `${remainingDue.toLocaleString('en-US')} ريال`, color: remainingDue > 0 ? 'text-amber-600' : 'text-slate-600' }
        ],
        tableData: {
          headers: ['الفترة / التاريخ', 'إجمالي العمولة', 'المصروف', 'المتبقي', 'الحالة'],
          rows: empRecords.length ? empRecords.map((c: any) => [
            c.month || c.date || c.period || 'الشهر الحالي',
            `${(Number(c.totalCommission) || Number(c.amount) || 0).toLocaleString('en-US')} ريال`,
            `${(Number(c.paidAmount) || 0).toLocaleString('en-US')} ريال`,
            `${((Number(c.totalCommission) || Number(c.amount) || 0) - (Number(c.paidAmount) || 0)).toLocaleString('en-US')} ريال`,
            c.status || 'مكتمل'
          ]) : [[
            'الشهر الحالي',
            '0 ريال',
            '0 ريال',
            '0 ريال',
            'لا توجد حركات'
          ]]
        }
      };
    }

    // General Aggregate Commission Report
    const totalCommissionsAll = records.reduce((sum: number, c: any) => sum + (Number(c.totalCommission) || Number(c.netAmount) || Number(c.amount) || 0), 0);
    const totalPaidAll = records.reduce((sum: number, c: any) => sum + (Number(c.paidAmount) || 0), 0);
    const totalPendingAll = totalCommissionsAll - totalPaidAll;

    return {
      type: 'REPORT',
      module: 'COMMISSIONS',
      title: 'تقرير العمولات والمستحقات المجمعة لكافة المناديب',
      summaryText: `إجمالي العمولات المسجلة في النظام يبلغ **${totalCommissionsAll.toLocaleString('en-US')} ريال**، تم صرف **${totalPaidAll.toLocaleString('en-US')} ريال** منها، ويتبقى مبالغ مستحقة معلقة قدرها **${totalPendingAll.toLocaleString('en-US')} ريال**.`,
      kpis: [
        { label: 'إجمالي العمولات', value: `${totalCommissionsAll.toLocaleString('en-US')} ريال` },
        { label: 'المبالغ المصروفة', value: `${totalPaidAll.toLocaleString('en-US')} ريال`, color: 'text-emerald-600' },
        { label: 'المبالغ المعلقة', value: `${totalPendingAll.toLocaleString('en-US')} ريال`, color: 'text-amber-600' }
      ],
      tableData: {
        headers: ['الموظف', 'رقم الموظف', 'إجمالي العمولة', 'المصروف', 'المعلق'],
        rows: records.slice(0, 10).map((c: any) => [
          c.employeeName || 'مندوب مبيعات',
          c.employeeId || c.employeeCode || '-',
          `${(Number(c.totalCommission) || Number(c.amount) || 0).toLocaleString('en-US')} ريال`,
          `${(Number(c.paidAmount) || 0).toLocaleString('en-US')} ريال`,
          `${((Number(c.totalCommission) || Number(c.amount) || 0) - (Number(c.paidAmount) || 0)).toLocaleString('en-US')} ريال`
        ])
      }
    };
  }

  // --- HANDLER: Fleet Intent ---
  private async handleFleetIntent(prompt: string, context?: any, companyId: string = DEFAULT_COMPANY_ID): Promise<AIQueryResult> {
    const vehRes = await fleetService.getVehicles(companyId);
    const vehicles: Vehicle[] = (vehRes.data || []).filter(v => !v.IsDeleted);

    const now = new Date();

    // 1. Insurance Expiry query
    if (prompt.includes('تأمين')) {
      const expiringSoon = vehicles.filter(v => {
        if (!v.Insurance_Expiry) return false;
        const diffDays = Math.ceil((new Date(v.Insurance_Expiry).getTime() - now.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 60;
      });

      return {
        type: 'TABLE',
        module: 'FLEET',
        title: 'تقرير وثائق التأمين القريبة من الانتهاء (خلال 60 يوماً)',
        summaryText: `تم العثور على **${expiringSoon.length} مركبة** ينتهي تأمينها قريباً أو منتهي الصلاحية:`,
        kpis: [
          { label: 'مركبات بحاجة لتجديد التأمين', value: expiringSoon.length, color: expiringSoon.length > 0 ? 'text-rose-600' : 'text-emerald-600' },
          { label: 'إجمالي الأسطول', value: vehicles.length }
        ],
        tableData: {
          headers: ['رقم اللوحة', 'المركبة', 'السائق المسند', 'تاريخ انتهاء التأمين', 'الأيام المتبقية'],
          rows: expiringSoon.map(v => {
            const days = Math.ceil((new Date(v.Insurance_Expiry!).getTime() - now.getTime()) / (1000 * 3600 * 24));
            return [
              v.Plate_Number,
              `${v.Brand} ${v.Model} (${v.Manufacturing_Year || v.Year || ''})`,
              v.Primary_Driver_Name || 'بدون سائق',
              v.Insurance_Expiry || '-',
              days < 0 ? `منتهي منذ ${Math.abs(days)} يوم` : `${days} يوم متبقي`
            ];
          })
        }
      };
    }

    // 2. Readiness & Maintenance query
    if (prompt.includes('صيانة') || prompt.includes('غير جاهز') || prompt.includes('جاهزية')) {
      const inMaint = vehicles.filter(v => v.Operational_Status === 'IN_MAINTENANCE');
      const lowReadiness = vehicles.filter(v => (v.Readiness_Index || 100) < 70);

      return {
        type: 'TABLE',
        module: 'FLEET',
        title: 'تقرير جاهزية الأسطول والمركبات في الصيانة',
        summaryText: `يوجد حالياً **${inMaint.length} مركبة** قيد الصيانة، و **${lowReadiness.length} مركبة** بمؤشر جاهزية منخفض (< 70%):`,
        kpis: [
          { label: 'في الصيانة', value: inMaint.length, color: 'text-amber-600' },
          { label: 'جاهزية منخفضة', value: lowReadiness.length, color: 'text-rose-600' },
          { label: 'نسبة الجاهزية العامة', value: `${Math.round(vehicles.reduce((acc, v) => acc + (v.Readiness_Index || 100), 0) / (vehicles.length || 1))}%` }
        ],
        tableData: {
          headers: ['رقم اللوحة', 'المركبة', 'الحالة التشغيلية', 'مؤشر الجاهزية', 'السائق'],
          rows: [...inMaint, ...lowReadiness.filter(v => !inMaint.includes(v))].map(v => [
            v.Plate_Number,
            `${v.Brand} ${v.Model}`,
            v.Operational_Status === 'IN_MAINTENANCE' ? 'في الصيانة' : 'نشط',
            `${v.Readiness_Index || 100}%`,
            v.Primary_Driver_Name || 'بدون سائق'
          ])
        }
      };
    }

    // Default Fleet Summary
    const activeCount = vehicles.filter(v => v.Operational_Status === 'ACTIVE').length;
    const maintCount = vehicles.filter(v => v.Operational_Status === 'IN_MAINTENANCE').length;
    const totalCost = vehicles.reduce((sum, v) => sum + (v.Total_Cost_MTD || 0), 0);

    return {
      type: 'REPORT',
      module: 'FLEET',
      title: 'الملخص الشامل لأسطول المركبات',
      summaryText: `يحتوي الأسطول على **${vehicles.length} مركبة** مسجلة، منها **${activeCount} مركبة نشطة** و **${maintCount} في الصيانة**. إجمالي المصروفات التراكمية المسجلة: **${totalCost.toLocaleString('en-US')} ريال**.`,
      kpis: [
        { label: 'إجمالي المركبات', value: vehicles.length },
        { label: 'المركبات النشطة', value: activeCount, color: 'text-emerald-600' },
        { label: 'قيد الصيانة', value: maintCount, color: 'text-amber-600' },
        { label: 'إجمالي تكاليف الأسطول', value: `${totalCost.toLocaleString('en-US')} ريال` }
      ],
      tableData: {
        headers: ['رقم اللوحة', 'الماركة والموديل', 'السائق', 'العداد الحالي', 'الحالة'],
        rows: vehicles.slice(0, 10).map(v => [
          v.Plate_Number,
          `${v.Brand} ${v.Model} (${v.Manufacturing_Year || v.Year || ''})`,
          v.Primary_Driver_Name || 'بدون سائق',
          `${(v.Current_Odometer || 0).toLocaleString('en-US')} كم`,
          v.Operational_Status === 'ACTIVE' ? 'نشط' : v.Operational_Status === 'IN_MAINTENANCE' ? 'في الصيانة' : 'خارج الخدمة'
        ])
      }
    };
  }

  // --- HANDLER: Employees ---
  private async handleEmployeesIntent(prompt: string, context?: any, companyId: string = DEFAULT_COMPANY_ID): Promise<AIQueryResult> {
    const [empRes, vehRes] = await Promise.all([
      employeeService.getEmployees(companyId),
      fleetService.getVehicles(companyId)
    ]);

    const employees: Employee[] = empRes.data || [];
    const vehicles: Vehicle[] = (vehRes.data || []).filter(v => !v.IsDeleted);

    const activeEmployees = employees.filter(e => e.Status === 'ACTIVE' || !e.Status);

    return {
      type: 'TABLE',
      module: 'EMPLOYEES',
      title: 'بيانات الموظفين والمناديب والمركبات المسندة إليهم',
      summaryText: `يوجد **${employees.length} موظف** مسجل بالنظام (**${activeEmployees.length} نشط**). فيما يلي تفاصيل الموظفين والمركبات المرتبطة بهم:`,
      kpis: [
        { label: 'إجمالي الموظفين', value: employees.length },
        { label: 'الموظفون النشطون', value: activeEmployees.length, color: 'text-emerald-600' },
        { label: 'المناديب المسند لهم مركبات', value: vehicles.filter(v => v.Primary_Driver_ID).length }
      ],
      tableData: {
        headers: ['رقم الموظف (ID)', 'الاسم', 'المسمى الوظيفي', 'المركبة المسندة', 'رقم اللوحة', 'الحالة'],
        rows: employees.slice(0, 15).map(e => {
          const assignedVeh = vehicles.find(v => v.Primary_Driver_ID === e.EmployeeID || v.Primary_Driver_ID === String(e.EmployeeCode) || v.Assigned_Employee_ID === e.EmployeeID);
          return [
            e.EmployeeID,
            e.ArabicName || e.EnglishName || 'موظف',
            e.JobTitleAR || e.JobTitleEN || 'مندوب مبيعات',
            assignedVeh ? `${assignedVeh.Brand} ${assignedVeh.Model}` : 'لا يوجد',
            assignedVeh ? assignedVeh.Plate_Number : '-',
            e.Status === 'ACTIVE' || !e.Status ? 'نشط' : 'غير نشط'
          ];
        })
      }
    };
  }

  // --- HANDLER: Inventory & Products ---
  private async handleInventoryIntent(prompt: string, context?: any, companyId: string = DEFAULT_COMPANY_ID): Promise<AIQueryResult> {
    const prodRes = await productService.getProducts(companyId);
    const products = prodRes.data || [];

    const criticalItems = products.filter((p: any) => (p.Quantity || p.stock || 0) <= (p.MinQuantity || p.minStock || 5));

    return {
      type: 'TABLE',
      module: 'INVENTORY',
      title: 'تقرير المخزون والمنتجات الحرجة',
      summaryText: `يوجد **${products.length} صنف** في المستودع. المنتجات المنخفضة أو الحرجة التي تحتاج لإعادة طلب: **${criticalItems.length} صنف**.`,
      kpis: [
        { label: 'إجمالي الأصناف', value: products.length },
        { label: 'المنتجات الحرجة', value: criticalItems.length, color: criticalItems.length > 0 ? 'text-rose-600' : 'text-emerald-600' }
      ],
      tableData: {
        headers: ['رمز المنتج', 'اسم الصنف', 'التصنيف', 'الكمية المتوفرة', 'السعر', 'الحالة'],
        rows: products.slice(0, 12).map((p: any) => [
          p.ProductID || p.code || p.id || '-',
          p.ArabicName || p.EnglishName || p.name || 'منتج',
          p.Category || p.category || 'عام',
          `${p.Quantity || p.stock || 0} وحدة`,
          `${(p.UnitPrice || p.price || 0).toLocaleString('en-US')} ريال`,
          (p.Quantity || p.stock || 0) <= (p.MinQuantity || p.minStock || 5) ? 'مخزون حرج' : 'متوفر'
        ])
      }
    };
  }

  // --- HANDLER: Quotes ---
  private async handleQuotesIntent(prompt: string, context?: any, companyId: string = DEFAULT_COMPANY_ID): Promise<AIQueryResult> {
    const quoteRes = await quoteService.getQuotes(companyId);
    const quotes = quoteRes.data || [];

    const totalVal = quotes.reduce((sum: number, q: any) => sum + (Number(q.totalAmount) || Number(q.total) || 0), 0);
    const openQuotes = quotes.filter((q: any) => q.status === 'DRAFT' || q.status === 'PENDING' || !q.status);

    return {
      type: 'TABLE',
      module: 'QUOTES',
      title: 'تقرير عروض الأسعار المسجلة في النظام',
      summaryText: `تم تسجيل **${quotes.length} عرض سعر** بقيمة إجمالية **${totalVal.toLocaleString('en-US')} ريال**. عروض الأسعار المفتوحة / المعلقة: **${openQuotes.length}**.`,
      kpis: [
        { label: 'إجمالي عروض الأسعار', value: quotes.length },
        { label: 'العروض المفتوحة', value: openQuotes.length, color: 'text-indigo-600' },
        { label: 'إجمالي القيمة', value: `${totalVal.toLocaleString('en-US')} ريال` }
      ],
      tableData: {
        headers: ['رقم العرض', 'العميل', 'التاريخ', 'القيمة الإجمالية', 'الحالة'],
        rows: quotes.slice(0, 10).map((q: any) => [
          q.quoteNumber || q.id || '-',
          q.customerName || 'عميل',
          q.date || '-',
          `${(Number(q.totalAmount) || Number(q.total) || 0).toLocaleString('en-US')} ريال`,
          q.status || 'مفتوح'
        ])
      }
    };
  }

  // --- HANDLER: Cross-Module Overview ---
  private async handleCrossModuleOverview(prompt: string, context?: any, companyId: string = DEFAULT_COMPANY_ID): Promise<AIQueryResult> {
    const [empRes, vehRes, prodRes, quoteRes] = await Promise.all([
      employeeService.getEmployees(companyId),
      fleetService.getVehicles(companyId),
      productService.getProducts(companyId),
      quoteService.getQuotes(companyId)
    ]);

    const emps = empRes.data || [];
    const vehs = (vehRes.data || []).filter(v => !v.IsDeleted);
    const prods = prodRes.data || [];
    const quotes = quoteRes.data || [];

    return {
      type: 'REPORT',
      module: 'CROSS_MODULE',
      title: 'لوحة القيادة والمؤشرات الموحدة لجميع أقسام NMO ERP',
      summaryText: `مرحباً بك! نظام NMO ERP يعمل بكامل طاقته ومربوط بالبيانات الحية: **${emps.length} موظف**، **${vehs.length} مركبة** في الأسطول، **${prods.length} صنف** في المخزون، و **${quotes.length} عرض سعر**.`,
      kpis: [
        { label: 'الموظفون النشطون', value: emps.filter(e => e.Status === 'ACTIVE' || !e.Status).length, color: 'text-blue-600' },
        { label: 'جاهزية الأسطول', value: `${Math.round(vehs.reduce((acc, v) => acc + (v.Readiness_Index || 100), 0) / (vehs.length || 1))}%`, color: 'text-emerald-600' },
        { label: 'المركبات النشطة', value: vehs.filter(v => v.Operational_Status === 'ACTIVE').length, color: 'text-teal-600' },
        { label: 'أصناف المستودع', value: prods.length, color: 'text-amber-600' }
      ]
    };
  }
}

export const aiAssistantService = new AIAssistantService();
