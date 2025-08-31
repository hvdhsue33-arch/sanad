import mongoose, { Schema, Document } from 'mongoose';
import { z } from "zod";

// MongoDB Connection
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sehx0190_db_user:Sanad$sa19971997@cluster0.yselhek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

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
export interface IUser extends Document {
  username: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: keyof typeof UserRole;
  isActive: boolean;
  tenantId: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITenant extends Document {
  name: string;
  subscriptionExpiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  name: string;
  category?: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  supplier?: string;
  minStockLevel: number;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRevenue extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpense extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  title: string;
  message: string;
  type: string; // low_stock, subscription_expiry, high_spending, backup_success
  isRead: boolean;
  tenantId: string;
  createdAt: Date;
}

// Schemas
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, maxlength: 50 },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  firstName: { type: String, maxlength: 50 },
  lastName: { type: String, maxlength: 50 },
  role: { 
    type: String, 
    required: true, 
    enum: Object.values(UserRole),
    default: UserRole.VIEWER 
  },
  isActive: { type: Boolean, required: true, default: true },
  tenantId: { type: String, required: true },
  profileImageUrl: String,
}, {
  timestamps: true
});

const TenantSchema = new Schema<ITenant>({
  name: { type: String, required: true, maxlength: 100 },
  subscriptionExpiresAt: { type: Date, required: true },
  isActive: { type: Boolean, required: true, default: true },
}, {
  timestamps: true
});

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, maxlength: 100 },
  category: { type: String, maxlength: 50 },
  unit: { type: String, required: true, maxlength: 20 },
  quantity: { type: Number, required: true, default: 0 },
  purchasePrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  supplier: { type: String, maxlength: 100 },
  minStockLevel: { type: Number, required: true, default: 0 },
  tenantId: { type: String, required: true },
}, {
  timestamps: true
});

const RevenueSchema = new Schema<IRevenue>({
  operationNumber: { type: String, required: true, maxlength: 20 },
  customerName: { type: String, maxlength: 100 },
  transactionType: { 
    type: String, 
    required: true, 
    enum: Object.values(TransactionType) 
  },
  productService: { type: String, required: true, maxlength: 100 },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  currency: { 
    type: String, 
    required: true, 
    enum: Object.values(Currency) 
  },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: Object.values(PaymentMethod) 
  },
  notes: String,
  tenantId: { type: String, required: true },
  createdBy: { type: String, required: true },
}, {
  timestamps: true
});

const ExpenseSchema = new Schema<IExpense>({
  operationNumber: { type: String, required: true, maxlength: 20 },
  supplierName: { type: String, maxlength: 100 },
  expenseType: { 
    type: String, 
    required: true, 
    enum: Object.values(ExpenseType) 
  },
  description: { type: String, required: true, maxlength: 200 },
  amount: { type: Number, required: true },
  currency: { 
    type: String, 
    required: true, 
    enum: Object.values(Currency) 
  },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: Object.values(PaymentMethod) 
  },
  notes: String,
  tenantId: { type: String, required: true },
  createdBy: { type: String, required: true },
}, {
  timestamps: true
});

const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true },
  type: { type: String, required: true, maxlength: 20 },
  isRead: { type: Boolean, required: true, default: false },
  tenantId: { type: String, required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes
UserSchema.index({ tenantId: 1 });
TenantSchema.index({ subscriptionExpiresAt: 1 });
ProductSchema.index({ tenantId: 1 });
ProductSchema.index({ quantity: 1 });
RevenueSchema.index({ tenantId: 1 });
RevenueSchema.index({ createdAt: -1 });
ExpenseSchema.index({ tenantId: 1 });
ExpenseSchema.index({ createdAt: -1 });
NotificationSchema.index({ tenantId: 1 });
NotificationSchema.index({ isRead: 1 });

// Models
export const User = mongoose.model<IUser>('User', UserSchema);
export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
export const Product = mongoose.model<IProduct>('Product', ProductSchema);
export const Revenue = mongoose.model<IRevenue>('Revenue', RevenueSchema);
export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

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
  totalAmount: z.number().positive(),
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
