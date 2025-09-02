import { connectDB, client, localClient, UserRole } from '@shared/schema';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

async function seedTursoData() {
  try {
    console.log('✅ تم الاتصال بقاعدة البيانات');
    
    // Helper function to get active client
    const getActiveClient = () => {
      try {
        return client;
      } catch {
        return localClient;
      }
    };
    
    const db = getActiveClient();
    
    // إنشاء tenant تجريبي
    const tenantId = randomUUID();
    const now = new Date().toISOString();
    const subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    
    await db.execute({
      sql: `INSERT INTO tenants (id, name, subscriptionExpiresAt, isActive, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [tenantId, 'متجر إبراهيم التجاري', subscriptionExpiresAt, 1, now, now]
    });

    console.log('✅ تم إنشاء Tenant: متجر إبراهيم التجاري');

    // إنشاء المستخدمين التجريبيين
    const users = [
      {
        username: 'admin',
        email: 'admin@ibrahim.com',
        password: await bcrypt.hash('Admin123!', 10),
        firstName: 'مدير',
        lastName: 'النظام',
        role: UserRole.SUPER_ADMIN,
        isActive: true
      },
      {
        username: 'owner',
        email: 'owner@ibrahim.com',
        password: await bcrypt.hash('Owner123!', 10),
        firstName: 'مالك',
        lastName: 'المتجر',
        role: UserRole.OWNER,
        isActive: true
      },
      {
        username: 'manager',
        email: 'manager@ibrahim.com',
        password: await bcrypt.hash('Manager123!', 10),
        firstName: 'مدير',
        lastName: 'العمليات',
        role: UserRole.MANAGER,
        isActive: true
      },
      {
        username: 'accountant',
        email: 'accountant@ibrahim.com',
        password: await bcrypt.hash('Accountant123!', 10),
        firstName: 'محاسب',
        lastName: 'المتجر',
        role: UserRole.ACCOUNTANT,
        isActive: true
      },
      {
        username: 'warehouse',
        email: 'warehouse@ibrahim.com',
        password: await bcrypt.hash('Warehouse123!', 10),
        firstName: 'أمين',
        lastName: 'المستودع',
        role: UserRole.WAREHOUSE_KEEPER,
        isActive: true
      },
      {
        username: 'viewer',
        email: 'viewer@ibrahim.com',
        password: await bcrypt.hash('Viewer123!', 10),
        firstName: 'قارئ',
        lastName: 'البيانات',
        role: UserRole.VIEWER,
        isActive: true
      }
    ];

    for (const userData of users) {
      const userId = randomUUID();
      await db.execute({
        sql: `INSERT INTO users (id, username, email, password, firstName, lastName, role, isActive, tenantId, createdAt, updatedAt) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId, userData.username, userData.email, userData.password,
          userData.firstName, userData.lastName, userData.role,
          userData.isActive ? 1 : 0, tenantId, now, now
        ]
      });
      console.log(`✅ تم إنشاء المستخدم: ${userData.username}`);
    }

    console.log('🎉 تم إنشاء جميع البيانات التجريبية بنجاح!');
    console.log('\n📋 بيانات تسجيل الدخول:');
    console.log('👑 مدير النظام: admin / Admin123!');
    console.log('👑 مالك المتجر: owner / Owner123!');
    console.log('📊 مدير العمليات: manager / Manager123!');
    console.log('💰 محاسب: accountant / Accountant123!');
    console.log('📦 أمين المستودع: warehouse / Warehouse123!');
    console.log('👁️ قارئ: viewer / Viewer123!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل السكريبت
seedTursoData();
