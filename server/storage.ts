import { 
  client,
  localClient,
  type InsertUser,
  type InsertTenant,
  type InsertProduct,
  type InsertRevenue,
  type InsertExpense,
  type InsertNotification,
  UserRole,
  Currency
} from '@shared/schema';
import { randomUUID } from 'crypto';

// Generate operation number
const generateOperationNumber = (prefix: string) => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Helper function to get active client
const getActiveClient = () => {
  try {
    return client;
  } catch {
    return localClient;
  }
};

export const storage = {
  // User operations
  async getUserByUsername(username: string) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ? AND isActive = 1',
      args: [username]
    });
    return result.rows[0];
  },

  async getUser(id: string) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  async createUser(userData: InsertUser) {
    const db = getActiveClient();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `INSERT INTO users (id, username, email, password, firstName, lastName, role, isActive, tenantId, profileImageUrl, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, userData.username, userData.email, userData.password,
        userData.firstName, userData.lastName, userData.role,
        userData.isActive ? 1 : 0, userData.tenantId,
        userData.profileImageUrl, now, now
      ]
    });
    
    return { id, ...userData, createdAt: now, updatedAt: now };
  },

  async updateUser(id: string, userData: Partial<InsertUser>) {
    const db = getActiveClient();
    const now = new Date().toISOString();
    
    const fields = [];
    const args = [];
    
    if (userData.username) { fields.push('username = ?'); args.push(userData.username); }
    if (userData.email) { fields.push('email = ?'); args.push(userData.email); }
    if (userData.password) { fields.push('password = ?'); args.push(userData.password); }
    if (userData.firstName) { fields.push('firstName = ?'); args.push(userData.firstName); }
    if (userData.lastName) { fields.push('lastName = ?'); args.push(userData.lastName); }
    if (userData.role) { fields.push('role = ?'); args.push(userData.role); }
    if (userData.isActive !== undefined) { fields.push('isActive = ?'); args.push(userData.isActive ? 1 : 0); }
    if (userData.profileImageUrl) { fields.push('profileImageUrl = ?'); args.push(userData.profileImageUrl); }
    
    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);
    
    await db.execute({
      sql: `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      args
    });
    
    return this.getUser(id);
  },

  async deleteUser(id: string) {
    return await this.updateUser(id, { isActive: false });
  },

  async getUsers(tenantId: string) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT id, username, email, firstName, lastName, role, isActive, tenantId, profileImageUrl, createdAt, updatedAt FROM users WHERE tenantId = ? AND isActive = 1',
      args: [tenantId]
    });
    return result.rows;
  },

  // Tenant operations
  async getTenant(id: string) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM tenants WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  async createTenant(tenantData: InsertTenant) {
    const db = getActiveClient();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `INSERT INTO tenants (id, name, subscriptionExpiresAt, isActive, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        id, tenantData.name, tenantData.subscriptionExpiresAt.toISOString(),
        tenantData.isActive ? 1 : 0, now, now
      ]
    });
    
    return { id, ...tenantData, createdAt: now, updatedAt: now };
  },

  async updateTenant(id: string, tenantData: Partial<InsertTenant>) {
    const db = getActiveClient();
    const now = new Date().toISOString();
    
    const fields = [];
    const args = [];
    
    if (tenantData.name) { fields.push('name = ?'); args.push(tenantData.name); }
    if (tenantData.subscriptionExpiresAt) { fields.push('subscriptionExpiresAt = ?'); args.push(tenantData.subscriptionExpiresAt.toISOString()); }
    if (tenantData.isActive !== undefined) { fields.push('isActive = ?'); args.push(tenantData.isActive ? 1 : 0); }
    
    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);
    
    await db.execute({
      sql: `UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`,
      args
    });
    
    return this.getTenant(id);
  },

  // Product operations
  async getProducts(tenantId: string) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM products WHERE tenantId = ? ORDER BY createdAt DESC',
      args: [tenantId]
    });
    return result.rows;
  },

  async createProduct(productData: InsertProduct) {
    const db = getActiveClient();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `INSERT INTO products (id, name, category, unit, quantity, purchasePrice, salePrice, supplier, minStockLevel, tenantId, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, productData.name, productData.category, productData.unit,
        productData.quantity, productData.purchasePrice, productData.salePrice,
        productData.supplier, productData.minStockLevel, productData.tenantId,
        now, now
      ]
    });
    
    return { id, ...productData, createdAt: now, updatedAt: now };
  },

  async updateProduct(id: string, productData: Partial<InsertProduct>) {
    const db = getActiveClient();
    const now = new Date().toISOString();
    
    const fields = [];
    const args = [];
    
    if (productData.name) { fields.push('name = ?'); args.push(productData.name); }
    if (productData.category) { fields.push('category = ?'); args.push(productData.category); }
    if (productData.unit) { fields.push('unit = ?'); args.push(productData.unit); }
    if (productData.quantity !== undefined) { fields.push('quantity = ?'); args.push(productData.quantity); }
    if (productData.purchasePrice) { fields.push('purchasePrice = ?'); args.push(productData.purchasePrice); }
    if (productData.salePrice) { fields.push('salePrice = ?'); args.push(productData.salePrice); }
    if (productData.supplier) { fields.push('supplier = ?'); args.push(productData.supplier); }
    if (productData.minStockLevel !== undefined) { fields.push('minStockLevel = ?'); args.push(productData.minStockLevel); }
    
    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);
    
    await db.execute({
      sql: `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      args
    });
    
    const result = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  async deleteProduct(id: string, tenantId: string) {
    const db = getActiveClient();
    await db.execute({
      sql: 'DELETE FROM products WHERE id = ? AND tenantId = ?',
      args: [id, tenantId]
    });
    return { success: true };
  },

  async getLowStockProducts(tenantId: string) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM products WHERE tenantId = ? AND quantity <= minStockLevel',
      args: [tenantId]
    });
    return result.rows;
  },

  // Revenue operations
  async getRevenues(tenantId: string, limit: number = 50) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM revenues WHERE tenantId = ? ORDER BY createdAt DESC LIMIT ?',
      args: [tenantId, limit]
    });
    return result.rows;
  },

  async createRevenue(revenueData: InsertRevenue) {
    const db = getActiveClient();
    const id = randomUUID();
    const operationNumber = generateOperationNumber('REV');
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `INSERT INTO revenues (id, operationNumber, customerName, transactionType, productService, quantity, unitPrice, totalAmount, currency, paymentMethod, notes, tenantId, createdBy, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, operationNumber, revenueData.customerName, revenueData.transactionType,
        revenueData.productService, revenueData.quantity, revenueData.unitPrice,
        revenueData.totalAmount, revenueData.currency, revenueData.paymentMethod,
        revenueData.notes, revenueData.tenantId, revenueData.createdBy, now, now
      ]
    });
    
    return { id, operationNumber, ...revenueData, createdAt: now, updatedAt: now };
  },

  async updateRevenue(id: string, revenueData: Partial<InsertRevenue>) {
    const db = getActiveClient();
    const now = new Date().toISOString();
    
    const fields = [];
    const args = [];
    
    if (revenueData.customerName) { fields.push('customerName = ?'); args.push(revenueData.customerName); }
    if (revenueData.transactionType) { fields.push('transactionType = ?'); args.push(revenueData.transactionType); }
    if (revenueData.productService) { fields.push('productService = ?'); args.push(revenueData.productService); }
    if (revenueData.quantity !== undefined) { fields.push('quantity = ?'); args.push(revenueData.quantity); }
    if (revenueData.unitPrice) { fields.push('unitPrice = ?'); args.push(revenueData.unitPrice); }
    if (revenueData.totalAmount) { fields.push('totalAmount = ?'); args.push(revenueData.totalAmount); }
    if (revenueData.currency) { fields.push('currency = ?'); args.push(revenueData.currency); }
    if (revenueData.paymentMethod) { fields.push('paymentMethod = ?'); args.push(revenueData.paymentMethod); }
    if (revenueData.notes) { fields.push('notes = ?'); args.push(revenueData.notes); }
    
    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);
    
    await db.execute({
      sql: `UPDATE revenues SET ${fields.join(', ')} WHERE id = ?`,
      args
    });
    
    const result = await db.execute({
      sql: 'SELECT * FROM revenues WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  async deleteRevenue(id: string, tenantId: string) {
    const db = getActiveClient();
    await db.execute({
      sql: 'DELETE FROM revenues WHERE id = ? AND tenantId = ?',
      args: [id, tenantId]
    });
    return { success: true };
  },

  async getRevenueStats(tenantId: string, startDate: Date, endDate: Date) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM revenues WHERE tenantId = ? AND createdAt BETWEEN ? AND ?',
      args: [tenantId, startDate.toISOString(), endDate.toISOString()]
    });
    
    const totalAmount = result.rows.reduce((sum: number, rev: any) => sum + rev.totalAmount, 0);
    const count = result.rows.length;
    
    return { totalAmount, count };
  },

  // Expense operations
  async getExpenses(tenantId: string, limit: number = 50) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM expenses WHERE tenantId = ? ORDER BY createdAt DESC LIMIT ?',
      args: [tenantId, limit]
    });
    return result.rows;
  },

  async createExpense(expenseData: InsertExpense) {
    const db = getActiveClient();
    const id = randomUUID();
    const operationNumber = generateOperationNumber('EXP');
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `INSERT INTO expenses (id, operationNumber, supplierName, expenseType, description, amount, currency, paymentMethod, notes, tenantId, createdBy, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, operationNumber, expenseData.supplierName, expenseData.expenseType,
        expenseData.description, expenseData.amount, expenseData.currency,
        expenseData.paymentMethod, expenseData.notes, expenseData.tenantId,
        expenseData.createdBy, now, now
      ]
    });
    
    return { id, operationNumber, ...expenseData, createdAt: now, updatedAt: now };
  },

  async updateExpense(id: string, expenseData: Partial<InsertExpense>) {
    const db = getActiveClient();
    const now = new Date().toISOString();
    
    const fields = [];
    const args = [];
    
    if (expenseData.supplierName) { fields.push('supplierName = ?'); args.push(expenseData.supplierName); }
    if (expenseData.expenseType) { fields.push('expenseType = ?'); args.push(expenseData.expenseType); }
    if (expenseData.description) { fields.push('description = ?'); args.push(expenseData.description); }
    if (expenseData.amount) { fields.push('amount = ?'); args.push(expenseData.amount); }
    if (expenseData.currency) { fields.push('currency = ?'); args.push(expenseData.currency); }
    if (expenseData.paymentMethod) { fields.push('paymentMethod = ?'); args.push(expenseData.paymentMethod); }
    if (expenseData.notes) { fields.push('notes = ?'); args.push(expenseData.notes); }
    
    fields.push('updatedAt = ?');
    args.push(now);
    args.push(id);
    
    await db.execute({
      sql: `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`,
      args
    });
    
    const result = await db.execute({
      sql: 'SELECT * FROM expenses WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  async deleteExpense(id: string, tenantId: string) {
    const db = getActiveClient();
    await db.execute({
      sql: 'DELETE FROM expenses WHERE id = ? AND tenantId = ?',
      args: [id, tenantId]
    });
    return { success: true };
  },

  async getExpenseStats(tenantId: string, startDate: Date, endDate: Date) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM expenses WHERE tenantId = ? AND createdAt BETWEEN ? AND ?',
      args: [tenantId, startDate.toISOString(), endDate.toISOString()]
    });
    
    const totalAmount = result.rows.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const count = result.rows.length;
    
    return { totalAmount, count };
  },

  // Notification operations
  async getNotifications(tenantId: string, limit: number = 20) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT * FROM notifications WHERE tenantId = ? ORDER BY createdAt DESC LIMIT ?',
      args: [tenantId, limit]
    });
    return result.rows;
  },

  async createNotification(notificationData: InsertNotification) {
    const db = getActiveClient();
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `INSERT INTO notifications (id, title, message, type, isRead, tenantId, createdAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, notificationData.title, notificationData.message,
        notificationData.type, notificationData.isRead ? 1 : 0,
        notificationData.tenantId, now
      ]
    });
    
    return { id, ...notificationData, createdAt: now };
  },

  async markNotificationAsRead(id: string, tenantId: string) {
    const db = getActiveClient();
    await db.execute({
      sql: 'UPDATE notifications SET isRead = 1 WHERE id = ? AND tenantId = ?',
      args: [id, tenantId]
    });
    
    const result = await db.execute({
      sql: 'SELECT * FROM notifications WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  async getUnreadNotificationCount(tenantId: string) {
    const db = getActiveClient();
    const result = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM notifications WHERE tenantId = ? AND isRead = 0',
      args: [tenantId]
    });
    return result.rows[0].count;
  },

  // Dashboard stats
  async getDashboardStats(tenantId: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [revenueStats, expenseStats, lowStockCount, unreadNotifications] = await Promise.all([
      this.getRevenueStats(tenantId, startOfMonth, endOfMonth),
      this.getExpenseStats(tenantId, startOfMonth, endOfMonth),
      this.getLowStockProducts(tenantId).then(products => products.length),
      this.getUnreadNotificationCount(tenantId)
    ]);

    return {
      monthlyRevenue: revenueStats.totalAmount,
      monthlyExpenses: expenseStats.totalAmount,
      lowStockProducts: lowStockCount,
      unreadNotifications
    };
  },

  // Currency conversion helper
  convertCurrency(amount: number, fromCurrency: keyof typeof Currency, toCurrency: keyof typeof Currency) {
    // Simple conversion rates (in real app, use external API)
    const rates = {
      [Currency.SYP]: { [Currency.USD]: 0.0004, [Currency.TRY]: 0.012 },
      [Currency.USD]: { [Currency.SYP]: 2500, [Currency.TRY]: 30 },
      [Currency.TRY]: { [Currency.SYP]: 83, [Currency.USD]: 0.033 }
    };

    if (fromCurrency === toCurrency) return amount;
    
    const rate = rates[fromCurrency]?.[toCurrency];
    return rate ? amount * rate : amount;
  }
};
