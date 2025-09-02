import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@libsql/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

// Turso Database Configuration from environment (set these in Netlify UI)
const client = createClient({
  url: process.env.TURSO_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
});

// Open CORS headers - allows all origins
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}

// Helper to always return CORS headers in every response
function withCors(res) {
  return { ...res, headers: { ...getCorsHeaders(), ...(res.headers || {}) } };
}

// Generate operation number
const generateOperationNumber = (prefix: string) => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return withCors({
      statusCode: 200,
      body: ''
    });
  }

  const { path, httpMethod, body } = event;
  const pathSegments = path.replace('/.netlify/functions/api', '').split('/').filter(Boolean);

  try {
    // Use withCors for all responses
    // Auth routes
    if (pathSegments[0] === 'auth') {
      if (pathSegments[1] === 'login' && httpMethod === 'POST') {
        const { username, password } = JSON.parse(body || '{}');
        if (!username || !password) {
          return withCors({
            statusCode: 400,
            body: JSON.stringify({ message: "Username and password required" })
          });
        }
        const result = await client.execute({
          sql: 'SELECT * FROM users WHERE username = ? AND isActive = 1',
          args: [username]
        });
        const user = result.rows[0];
        if (!user) {
          return withCors({
            statusCode: 401,
            body: JSON.stringify({ message: "Invalid credentials" })
          });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return withCors({
            statusCode: 401,
            body: JSON.stringify({ message: "Invalid credentials" })
          });
        }
        // Get tenant info
        const tenantResult = await client.execute({
          sql: 'SELECT * FROM tenants WHERE id = ?',
          args: [user.tenantId]
        });
        const tenant = tenantResult.rows[0];
        return withCors({
          statusCode: 200,
          body: JSON.stringify({
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              tenantId: user.tenantId,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            tenant: {
              id: tenant.id,
              name: tenant.name,
              subscriptionExpiresAt: tenant.subscriptionExpiresAt,
            }
          })
        });
      }
      if (pathSegments[1] === 'user' && httpMethod === 'GET') {
        // Get user from session/token (simplified for demo)
        return withCors({
          statusCode: 401,
          body: JSON.stringify({ message: "Authentication required" })
        });
      }
    }
    // Users routes
    if (pathSegments[0] === 'users') {
      if (httpMethod === 'GET') {
        const result = await client.execute({
          sql: 'SELECT id, username, email, firstName, lastName, role, isActive, tenantId, profileImageUrl, createdAt, updatedAt FROM users WHERE isActive = 1',
          args: []
        });
        return withCors({
          statusCode: 200,
          body: JSON.stringify(result.rows)
        });
      }
      if (httpMethod === 'POST') {
        const userData = JSON.parse(body || '{}');
        const id = randomUUID();
        const now = new Date().toISOString();
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await client.execute({
          sql: `INSERT INTO users (id, username, email, password, firstName, lastName, role, isActive, tenantId, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            id, userData.username, userData.email, hashedPassword,
            userData.firstName, userData.lastName, userData.role,
            userData.isActive ? 1 : 0, userData.tenantId, now, now
          ]
        });
        return withCors({
          statusCode: 201,
          body: JSON.stringify({ id, ...userData, createdAt: now, updatedAt: now })
        });
      }
    }
    // Products routes
    if (pathSegments[0] === 'products') {
      if (httpMethod === 'GET') {
        const result = await client.execute({
          sql: 'SELECT * FROM products ORDER BY createdAt DESC',
          args: []
        });
        return withCors({
          statusCode: 200,
          body: JSON.stringify(result.rows)
        });
      }
      if (httpMethod === 'POST') {
        const productData = JSON.parse(body || '{}');
        const id = randomUUID();
        const now = new Date().toISOString();
        await client.execute({
          sql: `INSERT INTO products (id, name, category, unit, quantity, purchasePrice, salePrice, supplier, minStockLevel, tenantId, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            id, productData.name, productData.category, productData.unit,
            productData.quantity, productData.purchasePrice, productData.salePrice,
            productData.supplier, productData.minStockLevel, productData.tenantId,
            now, now
          ]
        });
        return withCors({
          statusCode: 201,
          body: JSON.stringify({ id, ...productData, createdAt: now, updatedAt: now })
        });
      }
    }
    // Revenues routes
    if (pathSegments[0] === 'revenues') {
      if (httpMethod === 'GET') {
        const result = await client.execute({
          sql: 'SELECT * FROM revenues ORDER BY createdAt DESC LIMIT 50',
          args: []
        });
        return withCors({
          statusCode: 200,
          body: JSON.stringify(result.rows)
        });
      }
      if (httpMethod === 'POST') {
        const revenueData = JSON.parse(body || '{}');
        const id = randomUUID();
        const operationNumber = generateOperationNumber('REV');
        const now = new Date().toISOString();
        await client.execute({
          sql: `INSERT INTO revenues (id, operationNumber, customerName, transactionType, productService, quantity, unitPrice, totalAmount, currency, paymentMethod, notes, tenantId, createdBy, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            id, operationNumber, revenueData.customerName, revenueData.transactionType,
            revenueData.productService, revenueData.quantity, revenueData.unitPrice,
            revenueData.totalAmount, revenueData.currency, revenueData.paymentMethod,
            revenueData.notes, revenueData.tenantId, revenueData.createdBy, now, now
          ]
        });
        return withCors({
          statusCode: 201,
          body: JSON.stringify({ id, operationNumber, ...revenueData, createdAt: now, updatedAt: now })
        });
      }
    }
    // Expenses routes
    if (pathSegments[0] === 'expenses') {
      if (httpMethod === 'GET') {
        const result = await client.execute({
          sql: 'SELECT * FROM expenses ORDER BY createdAt DESC LIMIT 50',
          args: []
        });
        return withCors({
          statusCode: 200,
          body: JSON.stringify(result.rows)
        });
      }
      if (httpMethod === 'POST') {
        const expenseData = JSON.parse(body || '{}');
        const id = randomUUID();
        const operationNumber = generateOperationNumber('EXP');
        const now = new Date().toISOString();
        await client.execute({
          sql: `INSERT INTO expenses (id, operationNumber, supplierName, expenseType, description, amount, currency, paymentMethod, notes, tenantId, createdBy, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            id, operationNumber, expenseData.supplierName, expenseData.expenseType,
            expenseData.description, expenseData.amount, expenseData.currency,
            expenseData.paymentMethod, expenseData.notes, expenseData.tenantId,
            expenseData.createdBy, now, now
          ]
        });
        return withCors({
          statusCode: 201,
          body: JSON.stringify({ id, operationNumber, ...expenseData, createdAt: now, updatedAt: now })
        });
      }
    }
    // Dashboard stats
    if (pathSegments[0] === 'dashboard' && pathSegments[1] === 'stats') {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const [revenueResult, expenseResult, lowStockResult, notificationsResult] = await Promise.all([
        client.execute({
          sql: 'SELECT * FROM revenues WHERE createdAt BETWEEN ? AND ?',
          args: [startOfMonth.toISOString(), endOfMonth.toISOString()]
        }),
        client.execute({
          sql: 'SELECT * FROM expenses WHERE createdAt BETWEEN ? AND ?',
          args: [startOfMonth.toISOString(), endOfMonth.toISOString()]
        }),
        client.execute({
          sql: 'SELECT * FROM products WHERE quantity <= minStockLevel',
          args: []
        }),
        client.execute({
          sql: 'SELECT COUNT(*) as count FROM notifications WHERE isRead = 0',
          args: []
        })
      ]);
      const monthlyRevenue = revenueResult.rows.reduce((sum: number, rev: any) => sum + rev.totalAmount, 0);
      const monthlyExpenses = expenseResult.rows.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      const lowStockProducts = lowStockResult.rows.length;
      const unreadNotifications = notificationsResult.rows[0].count;
      return withCors({
        statusCode: 200,
        body: JSON.stringify({
          monthlyRevenue,
          monthlyExpenses,
          lowStockProducts,
          unreadNotifications
        })
      });
    }
    // Default response
    return withCors({
      statusCode: 404,
      body: JSON.stringify({ message: "Endpoint not found" })
    });
  } catch (error) {
    console.error('API Error:', error);
    return withCors({
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    });
  }
};
