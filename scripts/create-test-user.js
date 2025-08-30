import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://sehx0190_db_user:Sanad$sa19971997@cluster0.yselhek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, maxlength: 50 },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  firstName: { type: String, maxlength: 50 },
  lastName: { type: String, maxlength: 50 },
  role: { 
    type: String, 
    required: true, 
    enum: ['super_admin', 'owner', 'manager', 'accountant', 'warehouse_keeper', 'viewer'],
    default: 'viewer' 
  },
  isActive: { type: Boolean, required: true, default: true },
  tenantId: { type: String, required: true },
  profileImageUrl: String,
}, {
  timestamps: true
});

// Tenant Schema
const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  subscriptionExpiresAt: { type: Date, required: true },
  isActive: { type: Boolean, required: true, default: true },
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
const Tenant = mongoose.model('Tenant', tenantSchema);

async function createTestUser() {
  try {
    await connectDB();

    // إنشاء مستأجر تجريبي
    const tenant = await Tenant.create({
      name: 'متجر إبراهيم التجاري',
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // سنة من الآن
      isActive: true,
    });
    console.log('✅ تم إنشاء المستأجر:', tenant.name);

    // إنشاء مستخدم تجريبي
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const user = await User.create({
      username: 'admin',
      password: hashedPassword,
      firstName: 'إبراهيم',
      lastName: 'أحمد',
      role: 'super_admin',
      email: 'admin@ibrahim.com',
      isActive: true,
      tenantId: tenant.id,
    });

    console.log('✅ تم إنشاء المستخدم التجريبي بنجاح!');
    console.log('\n📋 بيانات تسجيل الدخول:');
    console.log('=====================================');
    console.log('👤 اسم المستخدم: admin');
    console.log('🔐 كلمة المرور: Admin123!');
    console.log('📧 البريد الإلكتروني: admin@ibrahim.com');
    console.log('🎯 الدور: Super Admin');
    console.log('=====================================');
    console.log('\n💡 يمكنك الآن تشغيل المشروع وتسجيل الدخول بهذه البيانات');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم التجريبي:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

createTestUser();
