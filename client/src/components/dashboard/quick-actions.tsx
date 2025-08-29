import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Package, FileText } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  const actions = [
    {
      title: "إضافة إيراد",
      description: "تسجيل إيراد جديد",
      icon: Plus,
      href: "/revenues?action=add",
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      testId: "button-add-revenue"
    },
    {
      title: "إضافة مصروف", 
      description: "تسجيل مصروف جديد",
      icon: Minus,
      href: "/expenses?action=add",
      iconBg: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      testId: "button-add-expense"
    },
    {
      title: "إضافة منتج",
      description: "إضافة منتج للمخزون", 
      icon: Package,
      href: "/products?action=add",
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      testId: "button-add-product"
    },
    {
      title: "إنشاء تقرير",
      description: "تقرير مالي سريع",
      icon: FileText,
      href: "/reports",
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      testId: "button-generate-report"
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.testId} href={action.href}>
              <Button
                variant="outline"
                className="flex items-center gap-3 p-4 h-auto justify-start hover:bg-accent transition-colors w-full"
                data-testid={action.testId}
              >
                <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${action.iconColor} text-lg`} />
                </div>
                <div className="text-right">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
