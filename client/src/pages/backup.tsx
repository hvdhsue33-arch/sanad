import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, RefreshCw, Database, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

export default function Backup() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();

  const backupHistory = [
    {
      id: 1,
      name: "نسخة احتياطية يومية - 31 أغسطس 2025",
      type: "daily",
      size: "2.5 MB",
      createdAt: new Date(),
      status: "completed"
    },
    {
      id: 2,
      name: "نسخة احتياطية يدوية - 30 أغسطس 2025",
      type: "manual",
      size: "2.3 MB",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "completed"
    }
  ];

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء النسخة الاحتياطية بنجاح",
        description: "تم حفظ جميع البيانات في النسخة الاحتياطية",
      });
      setIsCreatingBackup(false);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إنشاء النسخة الاحتياطية",
        description: error.message,
        variant: "destructive",
      });
      setIsCreatingBackup(false);
    },
  });

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    createBackupMutation.mutate();
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'manual':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getBackupTypeLabel = (type: string) => {
    switch (type) {
      case 'daily':
        return 'يومية';
      case 'manual':
        return 'يدوية';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">النسخ الاحتياطي</h1>
          <p className="text-muted-foreground mt-2">
            إدارة النسخ الاحتياطية واسترجاع البيانات
          </p>
        </div>
      </div>

      {/* Backup Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Database className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {backupHistory.length}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">إجمالي النسخ</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {backupHistory.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">النسخ الناجحة</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600 dark:text-amber-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {backupHistory.filter(b => b.type === 'daily').length}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">النسخ اليومية</h3>
          </CardContent>
        </Card>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              إنشاء نسخة احتياطية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              إنشاء نسخة احتياطية يدوية من جميع البيانات الحالية
            </p>
            <Button 
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="w-full"
            >
              {isCreatingBackup ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  جاري إنشاء النسخة...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  إنشاء نسخة احتياطية
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              استيراد نسخة احتياطية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              استيراد نسخة احتياطية من ملف خارجي
            </p>
            <Button variant="outline" className="w-full">
              <Upload className="h-4 w-4 ml-2" />
              اختيار ملف النسخة الاحتياطية
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل النسخ الاحتياطية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backupHistory.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{backup.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getBackupTypeColor(backup.type)}>
                        {getBackupTypeLabel(backup.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {backup.size}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(backup.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 ml-1" />
                    استرجاع
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 ml-1" />
                    تحميل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
