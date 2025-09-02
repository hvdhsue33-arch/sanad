import { createClient } from '@libsql/client';
import { z } from "zod";
// @ts-ignore
import dbConfig from '../database.config.js';

// Turso SQLite Connection
export const client = createClient({
  url: dbConfig.url,
  authToken: dbConfig.authToken
});

// Local SQLite for development
export const localClient = createClient({
  url: `file:${dbConfig.localFile}`
});

// Connect to Turso
export const connectDB = async () => {
  try {
    // Test connection
    await client.execute('SELECT 1');
    console.log('Turso SQLite connected successfully');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('Turso connection error:', error);
    console.log('Falling back to local SQLite...');
    
    try {
      await localClient.execute('SELECT 1');
      console.log('Local SQLite connected successfully');
      await createTables();
    } catch (localError) {
      console.error('Local SQLite connection error:', localError);
      process.exit(1);
    }
  }
};

// Create database tables
async function createTables() {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      role TEXT NOT NULL DEFAULT 'viewer',
      isActive INTEGER NOT NULL DEFAULT 1,
      tenantId TEXT NOT NULL,
      profileImageUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tenants table
    `CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subscriptionExpiresAt DATETIME NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Products table
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      purchasePrice REAL NOT NULL,
      salePrice REAL NOT NULL,
      supplier TEXT,
      minStockLevel INTEGER NOT NULL DEFAULT 0,
      tenantId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Revenues table
    `CREATE TABLE IF NOT EXISTS revenues (
      id TEXT PRIMARY KEY,
      operationNumber TEXT NOT NULL,
      customerName TEXT,
      transactionType TEXT NOT NULL,
      productService TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unitPrice REAL NOT NULL,
      totalAmount REAL NOT NULL,
      currency TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      notes TEXT,
      tenantId TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Expenses table
    `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      operationNumber TEXT NOT NULL,
      supplierName TEXT,
      expenseType TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      notes TEXT,
      tenantId TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      isRead INTEGER NOT NULL DEFAULT 0,
      tenantId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const table of tables) {
    try {
      await client.execute(table);
    } catch (error) {
      console.log('Table might already exist:', error);
    }
  }
}

// Enums
export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  WAREHOUSE_KEEPER: 'warehouse_keeper',
  VIEWER: 'viewer'
} as const;

export const Currency = {
  SYP: 'SYP', // Syrian Pound
  TRY: 'TRY', // Turkish Lira
  USD: 'USD'  // US Dollar
} as const;

export const TransactionType = {
  SALE: 'sale',
  SERVICE: 'service',
  ADVANCE_PAYMENT: 'advance_payment',
  OTHER: 'other'
} as const;

export const PaymentMethod = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  OTHER: 'other'
} as const;

export const ExpenseType = {
  RENT: 'rent',
  SALARIES: 'salaries',
  SERVICES: 'services',
  PURCHASE: 'purchase',
  UTILITIES: 'utilities',
  MAINTENANCE: 'maintenance',
  OTHER: 'other'
} as const;

// Interfaces
export interface IUser {
  id?: string;
  username: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: keyof typeof UserRole;
  isActive: boolean;
  tenantId: string;
  profileImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITenant {
  id?: string;
  name: string;
  subscriptionExpiresAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProduct {
  id?: string;
  name: string;
  category?: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  supplier?: string;
  minStockLevel: number;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRevenue {
  id?: string;
  operationNumber: string;
  customerName?: string;
  transactionType: keyof typeof TransactionType;
  productService: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: keyof typeof Currency;
  paymentMethod: keyof typeof PaymentMethod;
  notes?: string;
  tenantId: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExpense {
  id?: string;
  operationNumber: string;
  supplierName?: string;
  expenseType: keyof typeof ExpenseType;
  description: string;
  amount: number;
  currency: keyof typeof Currency;
  paymentMethod: keyof typeof PaymentMethod;
  notes?: string;
  tenantId: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotification {
  id?: string;
  title: string;
  message: string;
  type: string; // low_stock, subscription_expiry, high_spending, backup_success
  isRead: boolean;
  tenantId: string;
  createdAt?: Date;
}

// Zod Schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().email().optional(),
  password: z.string().min(6),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]),
  isActive: z.boolean().default(true),
  tenantId: z.string(),
  profileImageUrl: z.string().optional(),
});

export const insertTenantSchema = z.object({
  name: z.string().min(1).max(100),
  subscriptionExpiresAt: z.date(),
  isActive: z.boolean().default(true),
});

export const insertProductSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(50).optional(),
  unit: z.string().min(1).max(20),
  quantity: z.number().min(0),
  purchasePrice: z.number().positive(),
  salePrice: z.number().positive(),
  supplier: z.string().max(100).optional(),
  minStockLevel: z.number().min(0).default(0),
  tenantId: z.string(),
});

export const insertRevenueSchema = z.object({
  customerName: z.string().max(100).optional(),
  transactionType: z.enum(Object.values(TransactionType) as [string, ...string[]]),
  productService: z.string().min(1).max(100),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().positive(),
  totalAmount: z.number().positive().refine((val) => val <= 999999999, {
    message: "Amount exceeds maximum limit"
  }),
  currency: z.enum(Object.values(Currency) as [string, ...string[]]),
  paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
  notes: z.string().optional(),
  tenantId: z.string(),
  createdBy: z.string(),
});

export const insertExpenseSchema = z.object({
  supplierName: z.string().max(100).optional(),
  expenseType: z.enum(Object.values(ExpenseType) as [string, ...string[]]),
  description: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.enum(Object.values(Currency) as [string, ...string[]]),
  paymentMethod: z.enum(Object.values(PaymentMethod) as [string, ...string[]]),
  notes: z.string().optional(),
  tenantId: z.string(),
  createdBy: z.string(),
});

export const insertNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1),
  type: z.string().min(1).max(20),
  isRead: z.boolean().default(false),
  tenantId: z.string(),
});

// Types
export type User = IUser;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tenant = ITenant;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type Product = IProduct;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Revenue = IRevenue;
export type InsertRevenue = z.infer<typeof insertRevenueSchema>;

export type Expense = IExpense;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Notification = INotification;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
