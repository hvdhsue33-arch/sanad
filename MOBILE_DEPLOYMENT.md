# دليل تحويل التطبيق إلى APK للجوال

## المتطلبات الأساسية

### 1. تثبيت Node.js و npm
```bash
# تحقق من الإصدارات
node --version
npm --version
```

### 2. تثبيت Android Studio
- قم بتحميل وتثبيت [Android Studio](https://developer.android.com/studio)
- تأكد من تثبيت Android SDK
- أضف Android SDK إلى متغيرات البيئة (PATH)

### 3. تثبيت Java Development Kit (JDK)
```bash
# تحقق من تثبيت Java
java --version
```

## خطوات التحويل

### 1. تثبيت التبعيات
```bash
# تثبيت جميع التبعيات
npm install

# تثبيت Capacitor CLI عالمياً
npm install -g @capacitor/cli
```

### 2. إضافة منصة Android
```bash
# إضافة منصة Android للمشروع
npm run mobile:add
```

### 3. بناء التطبيق
```bash
# بناء التطبيق للويب
npm run mobile:build
```

### 4. فتح المشروع في Android Studio
```bash
# فتح المشروع في Android Studio
npm run mobile:open
```

### 5. بناء APK
```bash
# بناء APK للتطبيق
npm run mobile:build-apk
```

## أوامر مفيدة

### تشغيل التطبيق على الجهاز المتصل
```bash
# تشغيل التطبيق على الجهاز المتصل
npm run mobile:run
```

### مزامنة التغييرات
```bash
# مزامنة التغييرات مع Android
npx cap sync android
```

### تحديث التطبيق
```bash
# إعادة بناء ومزامنة
npm run build:client
npx cap sync android
```

## إعدادات Android

### تعديل إعدادات التطبيق
1. افتح `android/app/src/main/AndroidManifest.xml`
2. عدّل اسم التطبيق والوصف
3. أضف الأذونات المطلوبة

### تخصيص الأيقونة
1. استبدل الأيقونات في `android/app/src/main/res/`
2. استخدم [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) لإنشاء الأيقونات

### تخصيص شاشة البداية
1. عدّل `android/app/src/main/res/values/styles.xml`
2. غيّر الألوان والتصميم

## حل المشاكل الشائعة

### مشكلة في Gradle
```bash
# تنظيف وإعادة بناء
cd android
./gradlew clean
./gradlew assembleDebug
```

### مشكلة في الأذونات
- تأكد من إضافة الأذونات المطلوبة في `AndroidManifest.xml`
- تحقق من إعدادات الأمان في الجهاز

### مشكلة في الاتصال بالخادم
- تأكد من إعداد عنوان الخادم الصحيح
- تحقق من إعدادات الشبكة

## نشر التطبيق

### بناء APK للإنتاج
```bash
# بناء APK محسن للإنتاج
cd android
./gradlew assembleRelease
```

### توقيع APK
```bash
# إنشاء مفتاح التوقيع
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

# توقيع APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk alias_name
```

## ملاحظات مهمة

1. **الأداء**: التطبيق سيعمل بشكل أبطأ قليلاً على الجوال مقارنة بالويب
2. **التحديثات**: يجب إعادة بناء APK لتطبيق التحديثات
3. **التوافق**: تأكد من اختبار التطبيق على أجهزة مختلفة
4. **الأمان**: استخدم HTTPS للاتصال بالخادم
5. **التخزين**: استخدم التخزين المحلي للبيانات المؤقتة

## دعم الأجهزة

- **Android**: 5.0 (API level 21) وما فوق
- **RAM**: 2GB على الأقل
- **التخزين**: 100MB مساحة خالية

## روابط مفيدة

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [React Native Web](https://necolas.github.io/react-native-web/)
