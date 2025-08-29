import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CalendarX, TrendingUp, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NotificationsPanelProps {
  data: any;
  loading: boolean;
}

const notificationIcons = {
  low_stock: AlertTriangle,
  subscription_expiry: CalendarX,
  high_spending: TrendingUp,
  backup_success: Shield
};

const notificationColors = {
  low_stock: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-800 dark:text-amber-200",
    message: "text-amber-700 dark:text-amber-300"
  },
  subscription_expiry: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800", 
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-800 dark:text-red-200",
    message: "text-red-700 dark:text-red-300"
  },
  high_spending: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400", 
    title: "text-blue-800 dark:text-blue-200",
    message: "text-blue-700 dark:text-blue-300"
  },
  backup_success: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    title: "text-green-800 dark:text-green-200", 
    message: "text-green-700 dark:text-green-300"
  }
};

export default function NotificationsPanel({ data, loading }: NotificationsPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>التنبيهات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const notifications = data?.slice(0, 5) || [];

  return (
    <Card data-testid="card-notifications">
      <CardHeader>
        <CardTitle>التنبيهات</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="empty-notifications">
            لا توجد تنبيهات جديدة
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => {
              const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || AlertTriangle;
              const colors = notificationColors[notification.type as keyof typeof notificationColors] || notificationColors.low_stock;
              
              return (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border notification-slide",
                    colors.bg,
                    colors.border
                  )}
                  data-testid={`notification-${notification.id}`}
                >
                  <Icon className={cn("text-lg mt-1", colors.icon)} />
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", colors.title)} data-testid={`notification-title-${notification.id}`}>
                      {notification.title}
                    </p>
                    <p className={cn("text-xs mt-1", colors.message)} data-testid={`notification-message-${notification.id}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
