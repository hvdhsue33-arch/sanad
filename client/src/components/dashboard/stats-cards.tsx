import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react";
import { formatCurrency, calculateDaysUntilExpiry } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats: any;
  loading: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "إجمالي الإيرادات",
      value: formatCurrency(stats?.totalRevenue || 0, "SYP"),
      change: "+12% عن الشهر الماضي",
      icon: TrendingUp,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      valueColor: "text-green-600 dark:text-green-400",
      changeColor: "text-green-600 dark:text-green-400",
      testId: "card-total-revenue"
    },
    {
      title: "إجمالي المصروفات", 
      value: formatCurrency(stats?.totalExpenses || 0, "SYP"),
      change: "+8% عن الشهر الماضي",
      icon: TrendingDown,
      iconBg: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      valueColor: "text-red-600 dark:text-red-400",
      changeColor: "text-red-600 dark:text-red-400",
      testId: "card-total-expenses"
    },
    {
      title: "صافي الربح",
      value: formatCurrency(stats?.netProfit || 0, "SYP"),
      change: "+18% عن الشهر الماضي",
      icon: BarChart3,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-blue-600 dark:text-blue-400",
      changeColor: "text-blue-600 dark:text-blue-400",
      testId: "card-net-profit"
    },
    {
      title: "حالة الاشتراك",
      value: `${stats?.subscriptionDays || 45} يوم متبقي`,
      change: "ينتهي في 15/02/2024",
      icon: Calendar,
      iconBg: "bg-amber-100 dark:bg-amber-900/20", 
      iconColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-amber-600 dark:text-amber-400",
      changeColor: "text-amber-600 dark:text-amber-400",
      testId: "card-subscription"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.testId} className="fade-in" data-testid={card.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} text-xl`} />
                </div>
                <div className="text-left">
                  <p className={`text-2xl font-bold ${card.valueColor}`} data-testid={`${card.testId}-value`}>
                    {card.value}
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
              <p className={`text-sm ${card.changeColor} flex items-center gap-1`}>
                <TrendingUp className="text-xs" />
                {card.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
