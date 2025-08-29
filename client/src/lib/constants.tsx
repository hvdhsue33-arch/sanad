export const CURRENCIES = [
  { value: 'SYP', label: 'ليرة سورية', symbol: 'ل.س' },
  { value: 'TRY', label: 'ليرة تركية', symbol: '₺' },
  { value: 'USD', label: 'دولار أمريكي', symbol: '$' }
];

export const TRANSACTION_TYPES = [
  { value: 'sale', label: 'بيع' },
  { value: 'service', label: 'خدمة' },
  { value: 'advance_payment', label: 'دفعة مسبقة' },
  { value: 'other', label: 'أخرى' }
];

export const EXPENSE_TYPES = [
  { value: 'rent', label: 'إيجار' },
  { value: 'salaries', label: 'رواتب' },
  { value: 'services', label: 'خدمات' },
  { value: 'purchase', label: 'مشتريات' },
  { value: 'utilities', label: 'فواتير' },
  { value: 'maintenance', label: 'صيانة' },
  { value: 'other', label: 'أخرى' }
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'نقداً' },
  { value: 'card', label: 'بطاقة' },
  { value: 'transfer', label: 'حوالة' },
  { value: 'other', label: 'أخرى' }
];

export const USER_ROLES = [
  { value: 'super_admin', label: 'مالك النظام' },
  { value: 'owner', label: 'مالك المتجر' },
  { value: 'manager', label: 'مدير فرعي' },
  { value: 'accountant', label: 'محاسب' },
  { value: 'warehouse_keeper', label: 'أمين مستودع' },
  { value: 'viewer', label: 'قارئ' }
];

export const UNITS = [
  { value: 'piece', label: 'قطعة' },
  { value: 'kg', label: 'كيلوغرام' },
  { value: 'liter', label: 'لتر' },
  { value: 'meter', label: 'متر' },
  { value: 'pack', label: 'علبة' },
  { value: 'box', label: 'صندوق' },
  { value: 'bottle', label: 'زجاجة' },
  { value: 'bag', label: 'كيس' }
];

export const NOTIFICATION_TYPES = [
  { value: 'low_stock', label: 'نقص في المخزون', color: 'amber' },
  { value: 'subscription_expiry', label: 'انتهاء الاشتراك', color: 'red' },
  { value: 'high_spending', label: 'إنفاق عالي', color: 'blue' },
  { value: 'backup_success', label: 'نسخة احتياطية', color: 'green' }
];
