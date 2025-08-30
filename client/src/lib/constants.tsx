export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.netlify.app/api' 
  : 'http://localhost:3000/api';

export const APP_NAME = "نظام إبراهيم للمحاسبة";
export const APP_VERSION = "1.0.0";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    USER: '/auth/user',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_TRANSACTIONS: '/dashboard/recent-transactions',
    CURRENCY_DISTRIBUTION: '/dashboard/currency-distribution',
    MONTHLY_REVENUE: '/dashboard/monthly-revenue',
  },
  REVENUES: '/revenues',
  EXPENSES: '/expenses',
  PRODUCTS: '/products',
  NOTIFICATIONS: '/notifications',
  USERS: '/users',
  TENANTS: '/tenants',
} as const;

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  WAREHOUSE_KEEPER: 'warehouse_keeper',
  VIEWER: 'viewer',
} as const;

// Currencies
export const CURRENCIES = {
  SYP: 'SYP',
  TRY: 'TRY',
  USD: 'USD',
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  SALE: 'sale',
  SERVICE: 'service',
  ADVANCE_PAYMENT: 'advance_payment',
  OTHER: 'other',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  OTHER: 'other',
} as const;

// Expense Types
export const EXPENSE_TYPES = {
  RENT: 'rent',
  SALARIES: 'salaries',
  SERVICES: 'services',
  PRODUCT_PURCHASE: 'product_purchase',
  OTHER: 'other',
} as const;

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
