import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, HandHeart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getPaymentMethodDisplayName } from "@/lib/utils";
import { Link } from "wouter";

interface RecentTransactionsProps {
  data: any;
  loading: boolean;
}

export default function RecentTransactions({ data, loading }: RecentTransactionsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>العمليات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const transactions = data || [];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return TrendingUp;
      case 'expense':
        return TrendingDown;
      default:
        return HandHeart;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'revenue':
        return {
          bg: "bg-green-100 dark:bg-green-900/20",
          icon: "text-green-600 dark:text-green-400",
          amount: "text-green-600 dark:text-green-400"
        };
      case 'expense':
        return {
          bg: "bg-red-100 dark:bg-red-900/20", 
          icon: "text-red-600 dark:text-red-400",
          amount: "text-red-600 dark:text-red-400"
        };
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/20",
          icon: "text-blue-600 dark:text-blue-400", 
          amount: "text-blue-600 dark:text-blue-400"
        };
    }
  };

  return (
    <Card data-testid="card-recent-transactions">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>العمليات الأخيرة</CardTitle>
          <Link href="/revenues">
            <Button variant="ghost" size="sm" data-testid="button-view-all-transactions">
              عرض الكل
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="empty-transactions">
            لا توجد عمليات حديثة
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction: any) => {
              const Icon = getTransactionIcon(transaction.type);
              const colors = getTransactionColor(transaction.type);
              const isRevenue = transaction.type === 'revenue';
              
              return (
                <div 
                  key={transaction.id} 
                  className="py-4 flex items-center justify-between hover:bg-accent transition-colors rounded-lg px-2"
                  data-testid={`transaction-item-${transaction.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`${colors.icon} text-lg`} />
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`transaction-description-${transaction.id}`}>
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`transaction-date-${transaction.id}`}>
                        {formatDate(transaction.createdAt!)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${colors.amount}`} data-testid={`transaction-amount-${transaction.id}`}>
                      {isRevenue ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount), transaction.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`transaction-method-${transaction.id}`}>
                      {getPaymentMethodDisplayName(transaction.paymentMethod)}
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
