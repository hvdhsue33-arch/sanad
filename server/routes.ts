import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertRevenueSchema,
  insertExpenseSchema,
  insertProductSchema,
  insertUserSchema,
  insertNotificationSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import { z } from "zod";
import "./types"; // Import session type augmentation

// Session configuration
const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'accounting-system-secret',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'none',
    domain: '.netlify.app',
    path: '/'
  },
});

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Permission check middleware
const requirePermission = (permissions: string[]) => {
  return (req: any, res: any, next: any) => {
    const userRole = req.session?.user?.role;
    if (!userRole) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!permissions.includes(userRole)) {
      console.warn(`Access denied: User ${req.session.user.username} (${userRole}) attempted to access restricted resource`);
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(sessionConfig);

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check tenant subscription
      const tenant = await storage.getTenant(user.tenantId);
      if (!tenant || !tenant.isActive || tenant.subscriptionExpiresAt < new Date()) {
        return res.status(403).json({ message: "Subscription expired or inactive" });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      };

      res.json({ 
        user: req.session.user,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subscriptionExpiresAt: tenant.subscriptionExpiresAt,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", async (req: any, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(req.session.user.id);
      const tenant = await storage.getTenant(req.session.user.tenantId);
      
      res.json({
        user: {
          id: user?.id,
          username: user?.username,
          role: user?.role,
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          isActive: user?.isActive,
          tenantId: user?.tenantId,
        },
        tenant: {
          id: tenant?.id,
          name: tenant?.name,
          subscriptionExpiresAt: tenant?.subscriptionExpiresAt,
        }
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats(req.session.user.tenantId);
      const notifications = await storage.getUnreadNotificationCount(req.session.user.tenantId);
      
      res.json({ ...stats, unreadNotifications: notifications });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  app.get("/api/dashboard/recent-transactions", requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getRecentTransactions(req.session.user.tenantId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Recent transactions error:", error);
      res.status(500).json({ message: "Failed to get recent transactions" });
    }
  });

  app.get("/api/dashboard/currency-distribution", requireAuth, async (req: any, res) => {
    try {
      const distribution = await storage.getCurrencyDistribution(req.session.user.tenantId);
      res.json(distribution);
    } catch (error) {
      console.error("Currency distribution error:", error);
      res.status(500).json({ message: "Failed to get currency distribution" });
    }
  });

  app.get("/api/dashboard/monthly-revenue", requireAuth, async (req: any, res) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const monthlyData = await storage.getMonthlyRevenueData(req.session.user.tenantId, year);
      res.json(monthlyData);
    } catch (error) {
      console.error("Monthly revenue error:", error);
      res.status(500).json({ message: "Failed to get monthly revenue" });
    }
  });

  // Revenue routes
  app.get("/api/revenues", requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const revenues = await storage.getRevenues(req.session.user.tenantId, limit);
      res.json(revenues);
    } catch (error) {
      console.error("Get revenues error:", error);
      res.status(500).json({ message: "Failed to get revenues" });
    }
  });

  app.post("/api/revenues", 
    requireAuth, 
    requirePermission(['super_admin', 'owner', 'manager', 'accountant']),
    async (req: any, res) => {
    try {
      const validatedData = insertRevenueSchema.parse({
        ...req.body,
        tenantId: req.session.user.tenantId,
        createdBy: req.session.user.id,
      });

      const revenue = await storage.createRevenue(validatedData);
      res.status(201).json(revenue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create revenue error:", error);
      res.status(500).json({ message: "Failed to create revenue" });
    }
  });

  app.put("/api/revenues/:id",
    requireAuth,
    requirePermission(['super_admin', 'owner', 'manager', 'accountant']),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertRevenueSchema.partial().parse(req.body);
      
      const revenue = await storage.updateRevenue(id, validatedData);
      res.json(revenue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update revenue error:", error);
      res.status(500).json({ message: "Failed to update revenue" });
    }
  });

  app.delete("/api/revenues/:id",
    requireAuth,
    requirePermission(['super_admin', 'owner', 'manager', 'accountant']),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRevenue(id, req.session.user.tenantId);
      res.json({ message: "Revenue deleted successfully" });
    } catch (error) {
      console.error("Delete revenue error:", error);
      res.status(500).json({ message: "Failed to delete revenue" });
    }
  });

  // Expense routes
  app.get("/api/expenses", requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const expenses = await storage.getExpenses(req.session.user.tenantId, limit);
      res.json(expenses);
    } catch (error) {
      console.error("Get expenses error:", error);
      res.status(500).json({ message: "Failed to get expenses" });
    }
  });

  app.post("/api/expenses",
    requireAuth,
    requirePermission(['super_admin', 'owner', 'manager', 'accountant']),
    async (req: any, res) => {
    try {
      const validatedData = insertExpenseSchema.parse({
        ...req.body,
        tenantId: req.session.user.tenantId,
        createdBy: req.session.user.id,
      });

      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create expense error:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.put("/api/expenses/:id",
    requireAuth,
    requirePermission(['super_admin', 'owner', 'manager', 'accountant']),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      
      const expense = await storage.updateExpense(id, validatedData);
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update expense error:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id",
    requireAuth,
    requirePermission(['super_admin', 'owner', 'manager', 'accountant']),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpense(id, req.session.user.tenantId);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Delete expense error:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Product routes
  app.get("/api/products", requireAuth, async (req: any, res) => {
    try {
      const products = await storage.getProducts(req.session.user.tenantId);
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  app.post("/api/products",
    requireAuth,
    requirePermission(['super_admin', 'owner', 'manager', 'warehouse_keeper']),
    async (req: any, res) => {
    try {
      const validatedData = insertProductSchema.parse({
        ...req.body,
        tenantId: req.session.user.tenantId,
      });

      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id",
    requireAuth,
    requirePermission(['super_admin', 'owner', 'manager', 'warehouse_keeper']),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProductSchema.partial().parse(req.body);
      
      const product = await storage.updateProduct(id, validatedData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update product error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id",
    requireAuth,
    requirePermission(['super_admin', 'owner', 'manager']),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id, req.session.user.tenantId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/products/low-stock", requireAuth, async (req: any, res) => {
    try {
      const products = await storage.getLowStockProducts(req.session.user.tenantId);
      res.json(products);
    } catch (error) {
      console.error("Get low stock products error:", error);
      res.status(500).json({ message: "Failed to get low stock products" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const notifications = await storage.getNotifications(req.session.user.tenantId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.post("/api/notifications",
    requireAuth,
    requirePermission(['super_admin', 'owner', 'manager']),
    async (req: any, res) => {
    try {
      const validatedData = insertNotificationSchema.parse({
        ...req.body,
        tenantId: req.session.user.tenantId,
      });

      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create notification error:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.put("/api/notifications/:id/read",
    requireAuth,
    async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id, req.session.user.tenantId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // User routes
  app.get("/api/users", requireAuth, async (req: any, res) => {
    try {
      const users = await storage.getUsers(req.session.user.tenantId);
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.post("/api/users",
    requireAuth,
    requirePermission(['super_admin', 'owner']),
    async (req: any, res) => {
    try {
      const validatedData = insertUserSchema.parse({
        ...req.body,
        tenantId: req.session.user.tenantId,
      });

      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id",
    requireAuth,
    requirePermission(['super_admin', 'owner']),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertUserSchema.partial().parse(req.body);
      
      const user = await storage.updateUser(id, validatedData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id",
    requireAuth,
    requirePermission(['super_admin', 'owner']),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id, req.session.user.tenantId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
