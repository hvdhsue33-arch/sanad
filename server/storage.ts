import {
  users,
  tenants,
  products,
  revenues,
  expenses,
  notifications,
  type User,
  type InsertUser,
  type Tenant,
  type InsertTenant,
  type Product,
  type InsertProduct,
  type Revenue,
  type InsertRevenue,
  type Expense,
  type InsertExpense,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // Tenant operations
  getTenant(id: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant>;
  
  // Product operations
  getProducts(tenantId: string): Promise<Product[]>;
  getProduct(id: string, tenantId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string, tenantId: string): Promise<void>;
  getLowStockProducts(tenantId: string): Promise<Product[]>;
  
  // Revenue operations
  getRevenues(tenantId: string, limit?: number): Promise<Revenue[]>;
  getRevenue(id: string, tenantId: string): Promise<Revenue | undefined>;
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  updateRevenue(id: string, revenue: Partial<InsertRevenue>): Promise<Revenue>;
  deleteRevenue(id: string, tenantId: string): Promise<void>;
  getRevenueStats(tenantId: string, startDate?: Date, endDate?: Date): Promise<any>;
  
  // Expense operations
  getExpenses(tenantId: string, limit?: number): Promise<Expense[]>;
  getExpense(id: string, tenantId: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string, tenantId: string): Promise<void>;
  getExpenseStats(tenantId: string, startDate?: Date, endDate?: Date): Promise<any>;
  
  // Notification operations
  getNotifications(tenantId: string, limit?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string, tenantId: string): Promise<void>;
  getUnreadNotificationCount(tenantId: string): Promise<number>;
  
  // Dashboard operations
  getDashboardStats(tenantId: string): Promise<any>;
  getRecentTransactions(tenantId: string, limit?: number): Promise<any[]>;
  getCurrencyDistribution(tenantId: string): Promise<any>;
  getMonthlyRevenueData(tenantId: string, year: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Tenant operations
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async createTenant(tenantData: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(tenantData).returning();
    return tenant;
  }

  async updateTenant(id: string, tenantData: Partial<InsertTenant>): Promise<Tenant> {
    const [tenant] = await db
      .update(tenants)
      .set({ ...tenantData, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  // Product operations
  async getProducts(tenantId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.tenantId, tenantId))
      .orderBy(asc(products.name));
  }

  async getProduct(id: string, tenantId: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string, tenantId: string): Promise<void> {
    await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
  }

  async getLowStockProducts(tenantId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          sql`${products.quantity} <= ${products.minStockLevel}`
        )
      );
  }

  // Revenue operations
  async getRevenues(tenantId: string, limit = 50): Promise<Revenue[]> {
    return await db
      .select()
      .from(revenues)
      .where(eq(revenues.tenantId, tenantId))
      .orderBy(desc(revenues.createdAt))
      .limit(limit);
  }

  async getRevenue(id: string, tenantId: string): Promise<Revenue | undefined> {
    const [revenue] = await db
      .select()
      .from(revenues)
      .where(and(eq(revenues.id, id), eq(revenues.tenantId, tenantId)));
    return revenue;
  }

  async createRevenue(revenueData: InsertRevenue): Promise<Revenue> {
    // Generate operation number
    const operationNumber = `REV-${Date.now()}`;
    const [revenue] = await db
      .insert(revenues)
      .values({ ...revenueData, operationNumber })
      .returning();
    return revenue;
  }

  async updateRevenue(id: string, revenueData: Partial<InsertRevenue>): Promise<Revenue> {
    const [revenue] = await db
      .update(revenues)
      .set({ ...revenueData, updatedAt: new Date() })
      .where(eq(revenues.id, id))
      .returning();
    return revenue;
  }

  async deleteRevenue(id: string, tenantId: string): Promise<void> {
    await db
      .delete(revenues)
      .where(and(eq(revenues.id, id), eq(revenues.tenantId, tenantId)));
  }

  async getRevenueStats(tenantId: string, startDate?: Date, endDate?: Date): Promise<any> {
    let query = db
      .select({
        totalAmount: sql<number>`COALESCE(SUM(CAST(${revenues.totalAmount} AS DECIMAL)), 0)`,
        currency: revenues.currency,
        count: sql<number>`COUNT(*)`,
      })
      .from(revenues)
      .where(eq(revenues.tenantId, tenantId));

    if (startDate && endDate) {
      query = db
        .select({
          totalAmount: sql<number>`COALESCE(SUM(CAST(${revenues.totalAmount} AS DECIMAL)), 0)`,
          currency: revenues.currency,
          count: sql<number>`COUNT(*)`,
        })
        .from(revenues)
        .where(
          and(
            eq(revenues.tenantId, tenantId),
            gte(revenues.createdAt, startDate),
            lte(revenues.createdAt, endDate)
          )
        );
    }

    return query.groupBy(revenues.currency);
  }

  // Expense operations
  async getExpenses(tenantId: string, limit = 50): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.tenantId, tenantId))
      .orderBy(desc(expenses.createdAt))
      .limit(limit);
  }

  async getExpense(id: string, tenantId: string): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)));
    return expense;
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    // Generate operation number
    const operationNumber = `EXP-${Date.now()}`;
    const [expense] = await db
      .insert(expenses)
      .values({ ...expenseData, operationNumber })
      .returning();
    return expense;
  }

  async updateExpense(id: string, expenseData: Partial<InsertExpense>): Promise<Expense> {
    const [expense] = await db
      .update(expenses)
      .set({ ...expenseData, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: string, tenantId: string): Promise<void> {
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.tenantId, tenantId)));
  }

  async getExpenseStats(tenantId: string, startDate?: Date, endDate?: Date): Promise<any> {
    let query = db
      .select({
        totalAmount: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
        currency: expenses.currency,
        count: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(eq(expenses.tenantId, tenantId));

    if (startDate && endDate) {
      query = db
        .select({
          totalAmount: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
          currency: expenses.currency,
          count: sql<number>`COUNT(*)`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.tenantId, tenantId),
            gte(expenses.createdAt, startDate),
            lte(expenses.createdAt, endDate)
          )
        );
    }

    return query.groupBy(expenses.currency);
  }

  // Notification operations
  async getNotifications(tenantId: string, limit = 20): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.tenantId, tenantId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: string, tenantId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.tenantId, tenantId)));
  }

  async getUnreadNotificationCount(tenantId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.tenantId, tenantId),
          eq(notifications.isRead, false)
        )
      );
    return result.count;
  }

  // Dashboard operations
  async getDashboardStats(tenantId: string): Promise<any> {
    const [revenueStats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${revenues.totalAmount} AS DECIMAL)), 0)`,
      })
      .from(revenues)
      .where(eq(revenues.tenantId, tenantId));

    const [expenseStats] = await db
      .select({
        totalExpenses: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
      })
      .from(expenses)
      .where(eq(expenses.tenantId, tenantId));

    const [productCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(eq(products.tenantId, tenantId));

    const [lowStockCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          sql`${products.quantity} <= ${products.minStockLevel}`
        )
      );

    return {
      totalRevenue: revenueStats.totalRevenue || 0,
      totalExpenses: expenseStats.totalExpenses || 0,
      netProfit: (revenueStats.totalRevenue || 0) - (expenseStats.totalExpenses || 0),
      productCount: productCount.count,
      lowStockCount: lowStockCount.count,
    };
  }

  async getRecentTransactions(tenantId: string, limit = 10): Promise<any[]> {
    const recentRevenues = await db
      .select({
        id: revenues.id,
        type: sql<string>`'revenue'`,
        description: revenues.productService,
        amount: revenues.totalAmount,
        currency: revenues.currency,
        paymentMethod: revenues.paymentMethod,
        createdAt: revenues.createdAt,
      })
      .from(revenues)
      .where(eq(revenues.tenantId, tenantId))
      .orderBy(desc(revenues.createdAt))
      .limit(limit);

    const recentExpenses = await db
      .select({
        id: expenses.id,
        type: sql<string>`'expense'`,
        description: expenses.description,
        amount: expenses.amount,
        currency: expenses.currency,
        paymentMethod: expenses.paymentMethod,
        createdAt: expenses.createdAt,
      })
      .from(expenses)
      .where(eq(expenses.tenantId, tenantId))
      .orderBy(desc(expenses.createdAt))
      .limit(limit);

    const allTransactions = [...recentRevenues, ...recentExpenses];
    return allTransactions
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async getCurrencyDistribution(tenantId: string): Promise<any> {
    const revenueByCurrency = await db
      .select({
        currency: revenues.currency,
        total: sql<number>`COALESCE(SUM(CAST(${revenues.totalAmount} AS DECIMAL)), 0)`,
      })
      .from(revenues)
      .where(eq(revenues.tenantId, tenantId))
      .groupBy(revenues.currency);

    return revenueByCurrency;
  }

  async getMonthlyRevenueData(tenantId: string, year: number): Promise<any[]> {
    const monthlyData = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${revenues.createdAt})`,
        total: sql<number>`COALESCE(SUM(CAST(${revenues.totalAmount} AS DECIMAL)), 0)`,
      })
      .from(revenues)
      .where(
        and(
          eq(revenues.tenantId, tenantId),
          sql`EXTRACT(YEAR FROM ${revenues.createdAt}) = ${year}`
        )
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${revenues.createdAt})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${revenues.createdAt})`);

    // Fill missing months with 0
    const fullYearData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = monthlyData.find(item => item.month === month);
      return {
        month,
        total: found ? found.total : 0,
      };
    });

    return fullYearData;
  }
}

export const storage = new DatabaseStorage();
