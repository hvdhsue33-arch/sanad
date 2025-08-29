import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    SYP: 'ل.س',
    TRY: '₺', 
    USD: '$'
  };
  
  return `${amount.toLocaleString('ar-SA')} ${currencySymbols[currency] || currency}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
}

export function calculateDaysUntilExpiry(expiryDate: string | Date): number {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    super_admin: 'مالك النظام',
    owner: 'مالك المتجر',
    manager: 'مدير فرعي',
    accountant: 'محاسب',
    warehouse_keeper: 'أمين مستودع',
    viewer: 'قارئ'
  };
  
  return roleNames[role] || role;
}

export function getTransactionTypeDisplayName(type: string): string {
  const typeNames: Record<string, string> = {
    sale: 'بيع',
    service: 'خدمة',
    advance_payment: 'دفعة مسبقة',
    other: 'أخرى'
  };
  
  return typeNames[type] || type;
}

export function getExpenseTypeDisplayName(type: string): string {
  const typeNames: Record<string, string> = {
    rent: 'إيجار',
    salaries: 'رواتب',
    services: 'خدمات',
    purchase: 'مشتريات',
    utilities: 'فواتير',
    maintenance: 'صيانة',
    other: 'أخرى'
  };
  
  return typeNames[type] || type;
}

export function getPaymentMethodDisplayName(method: string): string {
  const methodNames: Record<string, string> = {
    cash: 'نقداً',
    card: 'بطاقة',
    transfer: 'حوالة',
    other: 'أخرى'
  };
  
  return methodNames[method] || method;
}
