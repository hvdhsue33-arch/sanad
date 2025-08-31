#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 بدء عملية بناء التطبيق للجوال...\n');

// التحقق من وجود التبعيات
function checkDependencies() {
  console.log('📦 التحقق من التبعيات...');
  
  try {
    execSync('node --version', { stdio: 'inherit' });
    execSync('npm --version', { stdio: 'inherit' });
    console.log('✅ Node.js و npm مثبتان بنجاح\n');
  } catch (error) {
    console.error('❌ خطأ: تأكد من تثبيت Node.js و npm');
    process.exit(1);
  }
}

// تثبيت التبعيات
function installDependencies() {
  console.log('📥 تثبيت التبعيات...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ تم تثبيت التبعيات بنجاح\n');
  } catch (error) {
    console.error('❌ خطأ في تثبيت التبعيات');
    process.exit(1);
  }
}

// بناء التطبيق
function buildApp() {
  console.log('🔨 بناء التطبيق...');
  
  try {
    execSync('npm run build:client', { stdio: 'inherit' });
    console.log('✅ تم بناء التطبيق بنجاح\n');
  } catch (error) {
    console.error('❌ خطأ في بناء التطبيق');
    process.exit(1);
  }
}

// إضافة منصة Android
function addAndroidPlatform() {
  console.log('🤖 إضافة منصة Android...');
  
  const androidPath = path.join(process.cwd(), 'android');
  
  if (!fs.existsSync(androidPath)) {
    try {
      execSync('npx cap add android', { stdio: 'inherit' });
      console.log('✅ تم إضافة منصة Android بنجاح\n');
    } catch (error) {
      console.error('❌ خطأ في إضافة منصة Android');
      process.exit(1);
    }
  } else {
    console.log('✅ منصة Android موجودة بالفعل\n');
  }
}

// مزامنة التطبيق
function syncApp() {
  console.log('🔄 مزامنة التطبيق...');
  
  try {
    execSync('npx cap sync android', { stdio: 'inherit' });
    console.log('✅ تم مزامنة التطبيق بنجاح\n');
  } catch (error) {
    console.error('❌ خطأ في مزامنة التطبيق');
    process.exit(1);
  }
}

// بناء APK
function buildAPK() {
  console.log('📱 بناء APK...');
  
  try {
    process.chdir('android');
    execSync('./gradlew assembleDebug', { stdio: 'inherit' });
    console.log('✅ تم بناء APK بنجاح\n');
  } catch (error) {
    console.error('❌ خطأ في بناء APK');
    process.exit(1);
  }
}

// عرض معلومات APK
function showAPKInfo() {
  const apkPath = path.join(process.cwd(), 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  
  if (fs.existsSync(apkPath)) {
    const stats = fs.statSync(apkPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('🎉 تم بناء APK بنجاح!');
    console.log(`📁 المسار: ${apkPath}`);
    console.log(`📏 الحجم: ${fileSizeInMB} MB`);
    console.log('\n📋 الخطوات التالية:');
    console.log('1. انسخ ملف APK إلى هاتفك');
    console.log('2. فعّل "مصادر غير معروفة" في إعدادات الأمان');
    console.log('3. قم بتثبيت التطبيق');
  } else {
    console.error('❌ لم يتم العثور على ملف APK');
  }
}

// تشغيل العملية الرئيسية
async function main() {
  try {
    checkDependencies();
    installDependencies();
    buildApp();
    addAndroidPlatform();
    syncApp();
    buildAPK();
    showAPKInfo();
  } catch (error) {
    console.error('❌ حدث خطأ أثناء العملية:', error.message);
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main();
}

module.exports = {
  checkDependencies,
  installDependencies,
  buildApp,
  addAndroidPlatform,
  syncApp,
  buildAPK,
  showAPKInfo
};
