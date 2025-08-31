import { useQuery } from "@tanstack/react-query";
import StatsCards from "@/components/dashboard/stats-cards";
import RevenueChart from "@/components/dashboard/revenue-chart";
import CurrencyDistribution from "@/components/dashboard/currency-distribution";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import NotificationsPanel from "@/components/dashboard/notifications-panel";
import QuickActions from "@/components/dashboard/quick-actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiClient.get("/api/dashboard/stats"),
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["dashboard", "recent-transactions"],
    queryFn: () => apiClient.get("/api/dashboard/recent-transactions"),
  });

  const { data: currencyData, isLoading: currencyLoading } = useQuery({
    queryKey: ["dashboard", "currency-distribution"],
    queryFn: () => apiClient.get("/api/dashboard/currency-distribution"),
  });

  const { data: monthlyRevenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["dashboard", "monthly-revenue", { year: new Date().getFullYear() }],
    queryFn: () => apiClient.get("/api/dashboard/monthly-revenue"),
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.get("/api/notifications"),
  });

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Stats Cards */}
      <StatsCards 
        stats={dashboardStats} 
        loading={statsLoading} 
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart 
          data={monthlyRevenue} 
          loading={revenueLoading} 
        />
        <CurrencyDistribution 
          data={currencyData} 
          loading={currencyLoading} 
        />
      </div>

      {/* Recent Transactions and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions 
            data={recentTransactions} 
            loading={transactionsLoading} 
          />
        </div>
        <NotificationsPanel 
          data={notifications} 
          loading={notificationsLoading} 
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
