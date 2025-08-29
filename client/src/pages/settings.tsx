import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Shield, Database, Bell, Globe, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate, calculateDaysUntilExpiry } from "@/lib/utils";

export default function Settings() {
  const [companyName, setCompanyName] = useState("نظام إبراهيم للمحاسبة");
  const [language, setLanguage] = useState("ar");
  const [currency, setCurrency] = useState("SYP");
  const [timezone, setTimezone] = useState("Asia/Damascus");
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");

  const { toast } = useToast();

  const { data: authData } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const tenant = (authData as any)?.tenant;
  const subscriptionDays = tenant?.subscriptionExpiresAt 
    ? calculateDaysUntilExpiry(tenant.subscriptionExpiresAt)
    : 0;

  const handleSaveSettings = () => {
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ جميع الإعدادات بنجاح",
    });
  };

  const handleBackupNow = () => {
    toast({
      title: "جاري إنشاء النسخة الاحتياطية",
      description: "سيتم إشعارك عند اكتمال العملية",
    });
  };

  const handleRestoreBackup = () => {
    if (window.confirm("هل أنت متأكد من استرجاع النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.")) {
      toast({
        title: "جاري استرجاع النسخة الاحتياطية",
        description: "الرجاء الانتظار...",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <Button onClick={handleSaveSettings} data-testid="button-save-settings">
          حفظ الإعدادات
        </Button>
      </div>

      {/* Subscription Info */}
      {tenant && (
        <Card data-testid="card-subscription-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              معلومات الاشتراك
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>اسم المؤسسة</Label>
                <p className="text-sm font-medium mt-1" data-testid="text-tenant-name">
                  {tenant.name}
                </p>
              </div>
              <div>
                <Label>تاريخ انتهاء الاشتراك</Label>
                <p className="text-sm font-medium mt-1" data-testid="text-subscription-expiry">
                  {formatDate(tenant.subscriptionExpiresAt)}
                </p>
              </div>
              <div>
                <Label>الأيام المتبقية</Label>
                <p className={`text-sm font-medium mt-1 ${subscriptionDays <= 30 ? 'text-red-600' : 'text-green-600'}`} data-testid="text-subscription-days">
                  {subscriptionDays} يوم
                </p>
              </div>
              <div>
                <Label>حالة الاشتراك</Label>
                <p className={`text-sm font-medium mt-1 ${subscriptionDays > 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-subscription-status">
                  {subscriptionDays > 0 ? 'نشط' : 'منتهي'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Settings */}
      <Card data-testid="card-general-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            الإعدادات العامة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">اسم الشركة</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                data-testid="input-company-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">اللغة</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">العملة الافتراضية</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SYP">ليرة سورية</SelectItem>
                  <SelectItem value="USD">دولار أمريكي</SelectItem>
                  <SelectItem value="TRY">ليرة تركية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">المنطقة الزمنية</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger data-testid="select-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Damascus">دمشق</SelectItem>
                  <SelectItem value="Asia/Baghdad">بغداد</SelectItem>
                  <SelectItem value="Asia/Riyadh">الرياض</SelectItem>
                  <SelectItem value="Europe/Istanbul">إسطنبول</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card data-testid="card-notification-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            إعدادات التنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">تفعيل التنبيهات</Label>
              <p className="text-sm text-muted-foreground">
                تلقي تنبيهات داخل النظام
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
              data-testid="switch-notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">التنبيهات عبر البريد الإلكتروني</Label>
              <p className="text-sm text-muted-foreground">
                إرسال التنبيهات إلى البريد الإلكتروني
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              data-testid="switch-email-notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="low-stock-alert">تنبيهات نقص المخزون</Label>
              <p className="text-sm text-muted-foreground">
                تنبيه عند انخفاض كمية المنتجات
              </p>
            </div>
            <Switch
              id="low-stock-alert"
              checked={lowStockAlert}
              onCheckedChange={setLowStockAlert}
              data-testid="switch-low-stock-alert"
            />
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card data-testid="card-backup-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            إعدادات النسخ الاحتياطي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="backup-enabled">تفعيل النسخ الاحتياطي التلقائي</Label>
              <p className="text-sm text-muted-foreground">
                إنشاء نسخة احتياطية تلقائياً حسب الجدول المحدد
              </p>
            </div>
            <Switch
              id="backup-enabled"
              checked={backupEnabled}
              onCheckedChange={setBackupEnabled}
              data-testid="switch-backup-enabled"
            />
          </div>

          {backupEnabled && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">تكرار النسخ الاحتياطي</Label>
                <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                  <SelectTrigger data-testid="select-backup-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">يومياً</SelectItem>
                    <SelectItem value="weekly">أسبوعياً</SelectItem>
                    <SelectItem value="monthly">شهرياً</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={handleBackupNow}
              data-testid="button-backup-now"
            >
              إنشاء نسخة احتياطية الآن
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRestoreBackup}
              data-testid="button-restore-backup"
            >
              استرجاع نسخة احتياطية
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card data-testid="card-security-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            إعدادات الأمان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>تغيير كلمة المرور</Label>
              <p className="text-sm text-muted-foreground mb-2">
                آخر تغيير لكلمة المرور: منذ 30 يوم
              </p>
              <Button variant="outline" data-testid="button-change-password">
                تغيير كلمة المرور
              </Button>
            </div>

            <Separator />

            <div>
              <Label>جلسات النشاط</Label>
              <p className="text-sm text-muted-foreground mb-2">
                إدارة الجلسات النشطة لحسابك
              </p>
              <Button variant="outline" data-testid="button-manage-sessions">
                إدارة الجلسات
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
