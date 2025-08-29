import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'owner', 
  'manager',
  'accountant',
  'warehouse_keeper',
  'viewer'
]);

export const currencyEnum = pgEnum('currency', [
  'SYP', // Syrian Pound
  'TRY', // Turkish Lira
  'USD'  // US Dollar
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'sale',
  'service', 
  'advance_payment',
  'other'
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'card',
  'transfer',
  'other'
]);

export const expenseTypeEnum = pgEnum('expense_type', [
  'rent',
  'salaries',
  'services',
  'purchase',
  'utilities',
  'maintenance',
  'other'
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email").unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  role: userRoleEnum('role').notNull().default('viewer'),
  isActive: boolean("is_active").notNull().default(true),
  tenantId: varchar("tenant_id").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenants table for multi-tenant support
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }),
  unit: varchar("unit", { length: 20 }).notNull(), // unit of measurement
  quantity: integer("quantity").notNull().default(0),
  purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 15, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 100 }),
  minStockLevel: integer("min_stock_level").notNull().default(0),
  tenantId: varchar("tenant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Revenues table
export const revenues = pgTable("revenues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationNumber: varchar("operation_number", { length: 20 }).notNull(),
  customerName: varchar("customer_name", { length: 100 }),
  transactionType: transactionTypeEnum('transaction_type').notNull(),
  productService: varchar("product_service", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  currency: currencyEnum('currency').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  notes: text("notes"),
  tenantId: varchar("tenant_id").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationNumber: varchar("operation_number", { length: 20 }).notNull(),
  supplierName: varchar("supplier_name", { length: 100 }),
  expenseType: expenseTypeEnum('expense_type').notNull(),
  description: varchar("description", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: currencyEnum('currency').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  notes: text("notes"),
  tenantId: varchar("tenant_id").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 100 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // low_stock, subscription_expiry, high_spending, backup_success
  isRead: boolean("is_read").notNull().default(false),
  tenantId: varchar("tenant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  products: many(products),
  revenues: many(revenues),
  expenses: many(expenses),
  notifications: many(notifications),
}));

export const productsRelations = relations(products, ({ one }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
}));

export const revenuesRelations = relations(revenues, ({ one }) => ({
  tenant: one(tenants, {
    fields: [revenues.tenantId],
    references: [tenants.id],
  }),
  createdByUser: one(users, {
    fields: [revenues.createdBy],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  tenant: one(tenants, {
    fields: [expenses.tenantId],
    references: [tenants.id],
  }),
  createdByUser: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notifications.tenantId],
    references: [tenants.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRevenueSchema = createInsertSchema(revenues).omit({
  id: true,
  operationNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  operationNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Revenue = typeof revenues.$inferSelect;
export type InsertRevenue = z.infer<typeof insertRevenueSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
