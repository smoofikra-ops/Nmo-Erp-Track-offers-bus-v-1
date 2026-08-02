const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const importsToAdd = `
import { Filter, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfDay, subDays, startOfYear, subMonths, endOfMonth, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CommissionTypeCategory } from '@/types/commissions';
`;

code = code.replace("import { AlertTriangle, TrendingUp, Users, Wallet, CreditCard, Banknote } from 'lucide-react';", 
  "import { AlertTriangle, TrendingUp, Users, Wallet, CreditCard, Banknote, Filter, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';\nimport { format, startOfMonth, endOfDay, subDays, startOfYear, subMonths, endOfMonth, startOfDay } from 'date-fns';\nimport { ar } from 'date-fns/locale';\nimport { CommissionTypeCategory } from '@/types/commissions';");


fs.writeFileSync('src/pages/Dashboard.tsx', code);
