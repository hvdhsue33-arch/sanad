import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCIES } from "@/lib/constants";

interface CurrencyDistributionProps {
  data: any;
  loading: boolean;
}

const COLORS = {
  SYP: "hsl(var(--chart-1))",
  USD: "hsl(var(--chart-2))", 
  TRY: "hsl(var(--chart-3))"
};

export default function CurrencyDistribution({ data, loading }: CurrencyDistributionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>توزيع العملات</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map((item: any) => {
    const currency = CURRENCIES.find(c => c.value === item.currency);
    return {
      name: currency?.label || item.currency,
      value: parseFloat(item.total),
      currency: item.currency,
      symbol: currency?.symbol || item.currency
    };
  }) || [];

  const total = chartData.reduce((sum: number, item: any) => sum + item.value, 0);

  return (
    <Card data-testid="card-currency-distribution">
      <CardHeader>
        <CardTitle>توزيع العملات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chartData.map((item: any) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
            return (
              <div key={item.currency} className="flex items-center justify-between" data-testid={`currency-item-${item.currency}`}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[item.currency as keyof typeof COLORS] }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="text-left">
                  <p className="font-medium" data-testid={`currency-amount-${item.currency}`}>
                    {item.value.toLocaleString()} {item.symbol}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`currency-percentage-${item.currency}`}>
                    {percentage}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {chartData.length > 0 && (
          <div className="mt-6 h-48" data-testid="currency-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.currency as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value.toLocaleString()} ${props.payload.symbol}`,
                    props.payload.name
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
