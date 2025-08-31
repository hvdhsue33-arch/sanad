import { 
  User, 
  Tenant, 
  Product, 
  Revenue, 
  Expense, 
  Notification,
  type InsertUser,
  type InsertTenant,
  type InsertProduct,
  type InsertRevenue,
  type InsertExpense,
  type InsertNotification,
  UserRole,
  Currency
} from '@shared/schema';

// Generate operation number
const generateOperationNumber = (prefix: string) => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export const storage = {
  // User operations
  async getUserByUsername(username: string) {
    return await User.findOne({ username, isActive: true });
  },

  async getUser(id: string) {
    return await User.findById(id);
  },

  async createUser(userData: InsertUser) {
    const user = new User(userData);
    return await user.save();
  },

  async updateUser(id: string, userData: Partial<InsertUser>) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  },

  async deleteUser(id: string) {
    return await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  },

  async getUsers(tenantId: string) {
    return await User.find({ tenantId, isActive: true }).select('-password');
  },

  // Tenant operations
  async getTenant(id: string) {
    return await Tenant.findById(id);
  },

  async createTenant(tenantData: InsertTenant) {
    const tenant = new Tenant(tenantData);
    return await tenant.save();
  },

  async updateTenant(id: string, tenantData: Partial<InsertTenant>) {
    return await Tenant.findByIdAndUpdate(id, tenantData, { new: true });
  },

  // Product operations
  async getProducts(tenantId: string) {
    return await Product.find({ tenantId }).sort({ createdAt: -1 });
  },

  async createProduct(productData: InsertProduct) {
    const product = new Product(productData);
    return await product.save();
  },

  async updateProduct(id: string, productData: Partial<InsertProduct>) {
    return await Product.findByIdAndUpdate(id, productData, { new: true });
  },

  async deleteProduct(id: string, tenantId: string) {
    return await Product.findOneAndDelete({ _id: id, tenantId });
  },

  async getLowStockProducts(tenantId: string) {
    return await Product.find({
      tenantId,
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    });
  },

  // Revenue operations
  async getRevenues(tenantId: string, limit: number = 50) {
    return await Revenue.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  async createRevenue(revenueData: InsertRevenue) {
    const operationNumber = generateOperationNumber('REV');
    const revenue = new Revenue({ ...revenueData, operationNumber });
    return await revenue.save();
  },

  async updateRevenue(id: string, revenueData: Partial<InsertRevenue>) {
    return await Revenue.findByIdAndUpdate(id, revenueData, { new: true });
  },

  async deleteRevenue(id: string, tenantId: string) {
    return await Revenue.findOneAndDelete({ _id: id, tenantId });
  },

  // Expense operations
  async getExpenses(tenantId: string, limit: number = 50) {
    return await Expense.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  async createExpense(expenseData: InsertExpense) {
    const operationNumber = generateOperationNumber('EXP');
    const expense = new Expense({ ...expenseData, operationNumber });
    return await expense.save();
  },

  async updateExpense(id: string, expenseData: Partial<InsertExpense>) {
    return await Expense.findByIdAndUpdate(id, expenseData, { new: true });
  },

  async deleteExpense(id: string, tenantId: string) {
    return await Expense.findOneAndDelete({ _id: id, tenantId });
  },

  // Notification operations
  async getNotifications(tenantId: string, limit: number = 20) {
    return await Notification.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  async createNotification(notificationData: InsertNotification) {
    const notification = new Notification(notificationData);
    return await notification.save();
  },

  async markNotificationAsRead(id: string, tenantId: string) {
    return await Notification.findOneAndUpdate(
      { _id: id, tenantId },
      { isRead: true },
      { new: true }
    );
  },

  async getUnreadNotificationCount(tenantId: string) {
    return await Notification.countDocuments({ tenantId, isRead: false });
  },

  // Dashboard operations
  async getDashboardStats(tenantId: string) {
    const [revenues, expenses] = await Promise.all([
      Revenue.aggregate([
        { $match: { tenantId } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Expense.aggregate([
        { $match: { tenantId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalRevenue = revenues[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalProducts: await Product.countDocuments({ tenantId }),
      lowStockProducts: await Product.countDocuments({
        tenantId,
        $expr: { $lte: ['$quantity', '$minStockLevel'] }
      })
    };
  },

  async getRecentTransactions(tenantId: string, limit: number = 10) {
    const [revenues, expenses] = await Promise.all([
      Revenue.find({ tenantId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Expense.find({ tenantId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    ]);

    const transactions = [
      ...revenues.map(r => ({ ...r, type: 'revenue' })),
      ...expenses.map(e => ({ ...e, type: 'expense' }))
    ];

    return transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  async getCurrencyDistribution(tenantId: string) {
    const [revenueDistribution, expenseDistribution] = await Promise.all([
      Revenue.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$currency', total: { $sum: '$totalAmount' } } }
      ]),
      Expense.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$currency', total: { $sum: '$amount' } } }
      ])
    ]);

    const currencies = Object.values(Currency);
    const distribution = currencies.map(currency => {
      const revenue = revenueDistribution.find(r => r._id === currency)?.total || 0;
      const expense = expenseDistribution.find(e => e._id === currency)?.total || 0;
      return {
        currency,
        revenue,
        expense,
        net: revenue - expense
      };
    });

    return distribution;
  },

  async getMonthlyRevenueData(tenantId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const monthlyData = await Revenue.aggregate([
      {
        $match: {
          tenantId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing months with zero
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map(month => {
      const data = monthlyData.find(d => d._id === month);
      return {
        month,
        total: data?.total || 0,
        count: data?.count || 0
      };
    });
  }
};
