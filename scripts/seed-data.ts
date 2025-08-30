import { connectDB, User, Tenant, Product, Revenue, Expense, Notification, UserRole, Currency, TransactionType, PaymentMethod, ExpenseType } from '../shared/schema';
import bcrypt from 'bcrypt';

async function seedData() {
  try {
    await connectDB();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    const tenant = await Tenant.create({
      name: 'متجر إبراهيم التجاري',
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    });

    const users = [
      {
        username: 'admin',
        password: 'Admin123!',
        firstName: 'إبراهيم',
        lastName: 'أحمد',
        role: UserRole.SUPER_ADMIN,
        email: 'admin@ibrahim.com',
        isActive: true,
        tenantId: tenant.id,
      },
      {
        username: 'owner',
        password: 'Owner123!',
        firstName: 'محمد',
        lastName: 'علي',
        role: UserRole.OWNER,
        email: 'owner@ibrahim.com',
        isActive: true,
        tenantId: tenant.id,
      },
      {
        username: 'manager',
        password: 'Manager123!',
        firstName: 'أحمد',
        lastName: 'حسن',
        role: UserRole.MANAGER,
        email: 'manager@ibrahim.com',
        isActive: true,
        tenantId: tenant.id,
      },
      {
        username: 'accountant',
        password: 'Accountant123!',
        firstName: 'فاطمة',
        lastName: 'محمد',
        role: UserRole.ACCOUNTANT,
        email: 'accountant@ibrahim.com',
        isActive: true,
        tenantId: tenant.id,
      },
      {
        username: 'warehouse',
        password: 'Warehouse123!',
        firstName: 'علي',
        lastName: 'يوسف',
        role: UserRole.WAREHOUSE_KEEPER,
        email: 'warehouse@ibrahim.com',
        isActive: true,
        tenantId: tenant.id,
      },
      {
        username: 'viewer',
        password: 'Viewer123!',
        firstName: 'سارة',
        lastName: 'أحمد',
        role: UserRole.VIEWER,
        email: 'viewer@ibrahim.com',
        isActive: true,
        tenantId: tenant.id,
      },
    ];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      console.log(`✅ تم إنشاء المستخدم: ${user.username} (${user.role})`);
    }

    console.log('\n🎉 تم إنشاء جميع البيانات التجريبية بنجاح!');
    console.log('\n📋 بيانات تسجيل الدخول:');
    console.log('=====================================');
    users.forEach(user => {
      console.log(`👤 ${user.username} (${user.role})`);
      console.log(`   كلمة المرور: ${user.password}`);
      console.log(`   البريد الإلكتروني: ${user.email}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  } finally {
    process.exit(0);
  }
}

seedData();
