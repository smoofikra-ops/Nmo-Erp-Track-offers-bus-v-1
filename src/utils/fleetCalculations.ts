import { Vehicle, FuelLog, MaintenanceLog, InsuranceLog, ComplianceLog, AccidentLog, FleetNotification, AlertPriority } from '@/types/fleet';
import { differenceInDays, isBefore, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns';

export function calculateReadinessIndex(
  vehicle: Partial<Vehicle>,
  insuranceLogs: InsuranceLog[] = [],
  complianceLogs: ComplianceLog[] = [],
  maintenanceLogs: MaintenanceLog[] = [],
  accidentLogs: AccidentLog[] = []
): { score: number; reasons: string[] } {
  let score = 100;
  const reasons: string[] = [];
  const now = new Date();

  // 1. Insurance Check
  const activeInsurances = insuranceLogs
    .filter(i => !i.IsDeleted && i.Vehicle_ID === vehicle.Vehicle_ID)
    .sort((a, b) => new Date(b.End_Date).getTime() - new Date(a.End_Date).getTime());
  
  const latestInsurance = activeInsurances[0];
  const insuranceExpiryDateStr = latestInsurance?.End_Date || vehicle.Insurance_Expiry;
  if (insuranceExpiryDateStr) {
    const endDate = new Date(insuranceExpiryDateStr);
    if (isValid(endDate)) {
      if (isBefore(endDate, now)) {
        score -= 30;
        reasons.push('وثيقة التأمين منتهية (-30)');
      } else {
        const days = differenceInDays(endDate, now);
        if (days <= 7) {
          score -= 20;
          reasons.push(`وثيقة التأمين تنتهي خلال ${days} أيام (-20)`);
        } else if (days <= 30) {
          score -= 10;
          reasons.push(`وثيقة التأمين تنتهي خلال ${days} يوماً (-10)`);
        }
      }
    }
  }

  // 2. Periodic Inspection (الفحص الدوري) Check
  const activeCompliances = complianceLogs
    .filter(c => !c.IsDeleted && c.Vehicle_ID === vehicle.Vehicle_ID)
    .sort((a, b) => new Date(b.Inspection_Expiry).getTime() - new Date(a.Inspection_Expiry).getTime());
  
  const latestCompliance = activeCompliances[0];
  const inspectionExpiryDateStr = latestCompliance?.Inspection_Expiry || vehicle.Periodic_Inspection_Expiry || vehicle.Inspection_Expiry;
  if (inspectionExpiryDateStr) {
    const inspDate = new Date(inspectionExpiryDateStr);
    if (isValid(inspDate)) {
      if (isBefore(inspDate, now)) {
        score -= 25;
        reasons.push('الفحص الدوري منتهي (-25)');
      } else {
        const days = differenceInDays(inspDate, now);
        if (days <= 7) {
          score -= 15;
          reasons.push(`الفحص الدوري ينتهي خلال ${days} أيام (-15)`);
        } else if (days <= 30) {
          score -= 10;
          reasons.push(`الفحص الدوري ينتهي خلال ${days} يوماً (-10)`);
        }
      }
    }
  }

  // 3. Registration / License (الاستمارة) Check
  const registrationExpiryDateStr = latestCompliance?.License_Expiry || vehicle.Registration_Expiry || vehicle.License_Expiry;
  if (registrationExpiryDateStr) {
    const regDate = new Date(registrationExpiryDateStr);
    if (isValid(regDate)) {
      if (isBefore(regDate, now)) {
        score -= 25;
        reasons.push('استمارة المركبة منتهية (-25)');
      } else {
        const days = differenceInDays(regDate, now);
        if (days <= 7) {
          score -= 15;
          reasons.push(`استمارة المركبة تنتهي خلال ${days} أيام (-15)`);
        } else if (days <= 30) {
          score -= 10;
          reasons.push(`استمارة المركبة تنتهي خلال ${days} يوماً (-10)`);
        }
      }
    }
  }

  // 4. Overdue or upcoming critical Maintenance (<= 7 days)
  const upcomingMaint = maintenanceLogs
    .filter(m => !m.IsDeleted && m.Vehicle_ID === vehicle.Vehicle_ID && m.Next_Maintenance_Date && m.Status !== 'COMPLETED' && m.Status !== 'CANCELLED')
    .sort((a, b) => new Date(a.Next_Maintenance_Date!).getTime() - new Date(b.Next_Maintenance_Date!).getTime());

  if (upcomingMaint[0]?.Next_Maintenance_Date) {
    const nextMaint = new Date(upcomingMaint[0].Next_Maintenance_Date);
    if (isValid(nextMaint)) {
      const days = differenceInDays(nextMaint, now);
      if (days <= 7) {
        score -= 10;
        reasons.push(days < 0 ? 'صيانة دورية متأخرة (-10)' : 'صيانة دورية مستحقة خلال 7 أيام (-10)');
      }
    }
  } else if (vehicle.Next_Maint_Date) {
    const nextMaint = new Date(vehicle.Next_Maint_Date);
    if (isValid(nextMaint)) {
      const days = differenceInDays(nextMaint, now);
      if (days <= 7) {
        score -= 10;
        reasons.push(days < 0 ? 'صيانة دورية متأخرة (-10)' : 'صيانة دورية مستحقة خلال 7 أيام (-10)');
      }
    }
  }

  // 5. Open Accidents
  const openAccidents = accidentLogs.filter(
    a => !a.IsDeleted && a.Vehicle_ID === vehicle.Vehicle_ID && a.Status !== 'CLOSED'
  );
  if (openAccidents.length > 0) {
    const penalty = openAccidents.length * 10;
    score -= penalty;
    reasons.push(`${openAccidents.length} حادث مفتوح غير مكتمل الإجراءات (-${penalty})`);
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return { score: finalScore, reasons };
}

export function getReadinessColor(score: number): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  label: string;
  ring: string;
} {
  if (score >= 80) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      label: 'جاهزية ممتازة',
      ring: 'stroke-emerald-500',
    };
  }
  if (score >= 60) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      label: 'جاهزية متوسطة',
      ring: 'stroke-yellow-500',
    };
  }
  if (score >= 40) {
    return {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800 border-orange-300',
      label: 'تحتاج مراجعة',
      ring: 'stroke-orange-500',
    };
  }
  return {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    label: 'غير جاهزة / حرجة',
    ring: 'stroke-rose-500',
  };
}

export function calculateFuelMetrics(
  currentOdometer: number,
  liters: number,
  cost: number,
  prevOdometer: number = 0,
  expectedAvgKmPerL: number = 10
): {
  kmSinceLast: number;
  costPerKm: number;
  actualKmPerLiter: number;
  variancePercentage: number;
  isAnomaly: boolean;
  anomalyMessage?: string;
} {
  const kmSinceLast = currentOdometer > prevOdometer && prevOdometer > 0
    ? currentOdometer - prevOdometer
    : 0;

  const costPerKm = kmSinceLast > 0 && cost > 0
    ? Number((cost / kmSinceLast).toFixed(2))
    : 0;

  const actualKmPerLiter = kmSinceLast > 0 && liters > 0
    ? Number((kmSinceLast / liters).toFixed(2))
    : expectedAvgKmPerL;

  let variancePercentage = 0;
  if (expectedAvgKmPerL > 0 && kmSinceLast > 0) {
    variancePercentage = Number(
      (((actualKmPerLiter - expectedAvgKmPerL) / expectedAvgKmPerL) * 100).toFixed(1)
    );
  }

  let isAnomaly = false;
  let anomalyMessage = '';

  if (kmSinceLast > 0 && variancePercentage < -35) {
    isAnomaly = true;
    anomalyMessage = `استهلاك الوقود أعلى من المعدل الطبيعي للمركبة بنسبة ${Math.abs(variancePercentage)}%`;
  } else if (kmSinceLast > 0 && variancePercentage > 60) {
    isAnomaly = true;
    anomalyMessage = `المسافة المسجلة مرتفعة جداً مقارنة بكمية الوقود المستهلكة (+${variancePercentage}%)`;
  }

  return {
    kmSinceLast,
    costPerKm,
    actualKmPerLiter,
    variancePercentage,
    isAnomaly,
    anomalyMessage: isAnomaly ? anomalyMessage : undefined,
  };
}

export function calculateMonthlyCosts(
  vehicleId: string,
  fuelLogs: FuelLog[],
  maintenanceLogs: MaintenanceLog[],
  accidentLogs: AccidentLog[],
  date: Date = new Date()
): {
  fuelCostMTD: number;
  maintCostMTD: number;
  accidentCostMTD: number;
  otherCostMTD: number;
  totalCostMTD: number;
} {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const isInCurrentMonth = (dStr?: string) => {
    if (!dStr) return false;
    const d = new Date(dStr);
    return isValid(d) && d >= monthStart && d <= monthEnd;
  };

  const fuelCostMTD = fuelLogs
    .filter(f => !f.IsDeleted && f.Vehicle_ID === vehicleId && isInCurrentMonth(f.Date))
    .reduce((sum, f) => sum + (Number(f.Cost) || 0), 0);

  const maintCostMTD = maintenanceLogs
    .filter(m => !m.IsDeleted && m.Vehicle_ID === vehicleId && isInCurrentMonth(m.Date))
    .reduce((sum, m) => sum + (Number(m.Cost) || 0), 0);

  const accidentCostMTD = accidentLogs
    .filter(a => !a.IsDeleted && a.Vehicle_ID === vehicleId && isInCurrentMonth(a.Date))
    .reduce((sum, a) => sum + (Number(a.Cost) || 0), 0);

  const otherCostMTD = 0;
  const totalCostMTD = fuelCostMTD + maintCostMTD + accidentCostMTD + otherCostMTD;

  return {
    fuelCostMTD: Number(fuelCostMTD.toFixed(2)),
    maintCostMTD: Number(maintCostMTD.toFixed(2)),
    accidentCostMTD: Number(accidentCostMTD.toFixed(2)),
    otherCostMTD,
    totalCostMTD: Number(totalCostMTD.toFixed(2)),
  };
}

export function generateFleetNotifications(
  vehicles: Vehicle[],
  insuranceLogs: InsuranceLog[] = [],
  complianceLogs: ComplianceLog[] = [],
  maintenanceLogs: MaintenanceLog[] = [],
  accidentLogs: AccidentLog[] = []
): FleetNotification[] {
  const notifications: FleetNotification[] = [];
  const now = new Date();

  vehicles.forEach(vehicle => {
    if (vehicle.IsDeleted || vehicle.Operational_Status === 'ARCHIVED' || vehicle.Operational_Status === 'SOLD') {
      return;
    }

    // 1. Insurance expiry notifications
    const vInsurance = insuranceLogs
      .filter(i => !i.IsDeleted && i.Vehicle_ID === vehicle.Vehicle_ID)
      .sort((a, b) => new Date(b.End_Date).getTime() - new Date(a.End_Date).getTime())[0];
    
    const insExpiryStr = vInsurance?.End_Date || vehicle.Insurance_Expiry;
    if (insExpiryStr) {
      const insExpiry = new Date(insExpiryStr);
      if (isValid(insExpiry)) {
        const days = differenceInDays(insExpiry, now);
        if (days < 0) {
          notifications.push({
            id: `ins-exp-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'INSURANCE',
            title: `تأمين المركبة ${vehicle.Plate_Number} منتهي`,
            description: `انتهت وثيقة التأمين منذ ${Math.abs(days)} يوماً. القيادة بدون تأمين تشكل خطراً قانونياً ومالياً.`,
            severity: 'CRITICAL',
            dueDate: insExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 7) {
          notifications.push({
            id: `ins-due-7-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'INSURANCE',
            title: `تأمين المركبة ${vehicle.Plate_Number} ينتهي قريباً`,
            description: `تنتهي وثيقة التأمين بعد ${days} أيام. يرجى المبادرة بالتجديد.`,
            severity: 'CRITICAL',
            dueDate: insExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 30) {
          notifications.push({
            id: `ins-due-30-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'INSURANCE',
            title: `تجديد تأمين المركبة ${vehicle.Plate_Number}`,
            description: `تستحق وثيقة التأمين التجديد بعد ${days} يوماً.`,
            severity: 'HIGH',
            dueDate: insExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 60) {
          notifications.push({
            id: `ins-due-60-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'INSURANCE',
            title: `تذكير بتأمين المركبة ${vehicle.Plate_Number}`,
            description: `موعد تجديد التأمين بعد ${days} يوماً.`,
            severity: 'LOW',
            dueDate: insExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        }
      }
    }

    // 2. Periodic Inspection (الفحص الدوري) Expiry
    const vCompliance = complianceLogs
      .filter(c => !c.IsDeleted && c.Vehicle_ID === vehicle.Vehicle_ID)
      .sort((a, b) => new Date(b.Inspection_Expiry).getTime() - new Date(a.Inspection_Expiry).getTime())[0];
    
    const inspExpiryStr = vCompliance?.Inspection_Expiry || vehicle.Periodic_Inspection_Expiry || vehicle.Inspection_Expiry;
    if (inspExpiryStr) {
      const inspExpiry = new Date(inspExpiryStr);
      if (isValid(inspExpiry)) {
        const days = differenceInDays(inspExpiry, now);
        if (days < 0) {
          notifications.push({
            id: `insp-exp-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'INSPECTION',
            title: `الفحص الدوري للمركبة ${vehicle.Plate_Number} منتهي`,
            description: `انتهت صلاحية شهادة الفحص الدوري منذ ${Math.abs(days)} يوماً.`,
            severity: 'CRITICAL',
            dueDate: inspExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 7) {
          notifications.push({
            id: `insp-due-7-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'INSPECTION',
            title: `الفحص الدوري للمركبة ${vehicle.Plate_Number} ينتهي خلال ${days} أيام (تنبيه عاجل)`,
            description: `يجب حجز موعد للفحص الدوري وتجهيز المركبة قبل انتهاء المهلة.`,
            severity: 'CRITICAL',
            dueDate: inspExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 30) {
          notifications.push({
            id: `insp-due-30-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'INSPECTION',
            title: `موعد الفحص الدوري للمركبة ${vehicle.Plate_Number} يقترب (تنبيه مهم)`,
            description: `متبقي ${days} يوماً على موعد الفحص الدوري.`,
            severity: 'HIGH',
            dueDate: inspExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 60) {
          notifications.push({
            id: `insp-due-60-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'INSPECTION',
            title: `تذكير بالفحص الدوري للمركبة ${vehicle.Plate_Number} (تنبيه مبكر)`,
            description: `متبقي ${days} يوماً على موعد الفحص الدوري.`,
            severity: 'LOW',
            dueDate: inspExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        }
      }
    }

    // 3. Registration (الاستمارة) Expiry
    const licExpiryStr = vCompliance?.License_Expiry || vehicle.Registration_Expiry || vehicle.License_Expiry;
    if (licExpiryStr) {
      const licExpiry = new Date(licExpiryStr);
      if (isValid(licExpiry)) {
        const days = differenceInDays(licExpiry, now);
        if (days < 0) {
          notifications.push({
            id: `lic-exp-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'LICENSE',
            title: `استمارة المركبة ${vehicle.Plate_Number} منتهية`,
            description: `استمارة السير منتهية منذ ${Math.abs(days)} يوماً.`,
            severity: 'CRITICAL',
            dueDate: licExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 7) {
          notifications.push({
            id: `lic-due-7-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'LICENSE',
            title: `استمارة المركبة ${vehicle.Plate_Number} تنتهي خلال ${days} أيام (تنبيه عاجل)`,
            description: `تنتهي رخصة السير / الاستمارة قريباً جداً، يرجى التجديد فوراً.`,
            severity: 'CRITICAL',
            dueDate: licExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 30) {
          notifications.push({
            id: `lic-due-30-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'LICENSE',
            title: `تجديد استمارة المركبة ${vehicle.Plate_Number} (تنبيه مهم)`,
            description: `تنتهي رخصة السير بعد ${days} يوماً.`,
            severity: 'HIGH',
            dueDate: licExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 60) {
          notifications.push({
            id: `lic-due-60-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'LICENSE',
            title: `تذكير باستمارة المركبة ${vehicle.Plate_Number} (تنبيه مبكر)`,
            description: `تنتهي رخصة السير بعد ${days} يوماً.`,
            severity: 'LOW',
            dueDate: licExpiryStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        }
      }
    }

    // 4. Maintenance Alerts
    const vMaint = maintenanceLogs
      .filter(m => !m.IsDeleted && m.Vehicle_ID === vehicle.Vehicle_ID && m.Next_Maintenance_Date && m.Status !== 'COMPLETED' && m.Status !== 'CANCELLED')
      .sort((a, b) => new Date(a.Next_Maintenance_Date!).getTime() - new Date(b.Next_Maintenance_Date!).getTime())[0];

    const nextMaintStr = vMaint?.Next_Maintenance_Date || vehicle.Next_Maint_Date;
    if (nextMaintStr) {
      const maintDate = new Date(nextMaintStr);
      if (isValid(maintDate)) {
        const days = differenceInDays(maintDate, now);
        if (days < 0) {
          notifications.push({
            id: `maint-ovr-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'MAINTENANCE',
            title: `صيانة متأخرة للمركبة ${vehicle.Plate_Number}`,
            description: `تجاوزت المركبة موعد الصيانة المجدول منذ ${Math.abs(days)} يوماً.`,
            severity: 'HIGH',
            dueDate: nextMaintStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        } else if (days <= 7) {
          notifications.push({
            id: `maint-due-${vehicle.Vehicle_ID}`,
            vehicleId: vehicle.Vehicle_ID,
            plateNumber: vehicle.Plate_Number,
            type: 'MAINTENANCE',
            title: `صيانة دورية مستحقة للمركبة ${vehicle.Plate_Number}`,
            description: `موعد الصيانة خلال ${days} أيام.`,
            severity: 'MEDIUM',
            dueDate: nextMaintStr,
            daysRemaining: days,
            isRead: false,
            createdAt: now.toISOString(),
          });
        }
      }
    }

    // 5. Open Accidents
    const vAccidents = accidentLogs.filter(
      a => !a.IsDeleted && a.Vehicle_ID === vehicle.Vehicle_ID && a.Status !== 'CLOSED'
    );
    if (vAccidents.length > 0) {
      notifications.push({
        id: `acc-open-${vehicle.Vehicle_ID}`,
        vehicleId: vehicle.Vehicle_ID,
        plateNumber: vehicle.Plate_Number,
        type: 'ACCIDENT',
        title: `حادث مفتوح قيد المتابعة (${vehicle.Plate_Number})`,
        description: `يوجد ${vAccidents.length} حادث مفتوح بانتظار استكمال إجراءات التأمين أو الإصلاح.`,
        severity: vAccidents.some(a => a.Severity === 'CRITICAL' || a.Severity === 'SEVERE') ? 'CRITICAL' : 'HIGH',
        isRead: false,
        createdAt: now.toISOString(),
      });
    }

    // 6. Readiness Index Critical Drop (< 50)
    if (vehicle.Readiness_Index < 50) {
      notifications.push({
        id: `readiness-low-${vehicle.Vehicle_ID}`,
        vehicleId: vehicle.Vehicle_ID,
        plateNumber: vehicle.Plate_Number,
        type: 'READINESS',
        title: `مؤشر الجاهزية منخفض (${vehicle.Readiness_Index}%) للمركبة ${vehicle.Plate_Number}`,
        description: `المركبة غير جاهزة للتشغيل الآمن بسبب تراكم المخالفات أو الصيانة أو الحوادث.`,
        severity: 'CRITICAL',
        isRead: false,
        createdAt: now.toISOString(),
      });
    }
  });

  // Sort by priority: CRITICAL -> HIGH -> MEDIUM -> LOW, then by daysRemaining ASC
  const severityWeight: Record<AlertPriority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return notifications.sort((a, b) => {
    const diff = severityWeight[b.severity] - severityWeight[a.severity];
    if (diff !== 0) return diff;
    if (a.daysRemaining !== undefined && b.daysRemaining !== undefined) {
      return a.daysRemaining - b.daysRemaining;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
