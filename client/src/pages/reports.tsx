import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Calendar, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Reports() {
  const [reportType, setReportType] = useState("monthly_financial");
  const [dateRange, setDateRange] = useState("current_month");
  const [currency, setCurrency] = useState("SYP");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: monthlyRevenue } = useQuery({
    queryKey: ["/api/dashboard/monthly-revenue", { year: new Date().getFullYear() }],
  });

  const { data: currencyDistribution } = useQuery({
    queryKey: ["/api/dashboard/currency-distribution"],
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["/api/dashboard/recent-transactions", { limit: 50 }],
  });

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const chartData = Array.isArray(monthlyRevenue) ? monthlyRevenue.map((item: any, index: number) => ({
    month: monthNames[index],
    revenue: item.total,
    expenses: item.total * 0.6, // Mock expenses data
    profit: item.total * 0.4
  })) : [];

  const currencyChartData = Array.isArray(currencyDistribution) ? currencyDistribution.map((item: any) => ({
    name: item.currency === 'SYP' ? 'ليرة سورية' : item.currency === 'USD' ? 'دولار أمريكي' : 'ليرة تركية',
    value: parseFloat(item.total),
    currency: item.currency
  })) : [];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  const reportTypes = [
    { value: "monthly_financial", label: "تقرير مالي شهري" },
    { value: "yearly_financial", label: "تقرير مالي سنوي" },
    { value: "currency_analysis", label: "تحليل العملات" },
    { value: "product_performance", label: "أداء المنتجات" },
    { value: "profit_loss", label: "تقرير الأرباح والخسائر" },
  ];

  const handleGenerateReport = () => {
    // Mock report generation
    alert("سيتم إنشاء التقرير قريباً");
  };

  const handleExportPDF = () => {
    // Mock PDF export
    alert("سيتم تصدير التقرير كـ PDF قريباً");
  };

  const handleExportExcel = () => {
    // Mock Excel export
    alert("سيتم تصدير التقرير كـ Excel قريباً");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">التقارير المالية</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" data-testid="button-export-pdf">
            <FileText className="ml-2 h-4 w-4" />
            تصدير PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" data-testid="button-export-excel">
            <Download className="ml-2 h-4 w-4" />
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            إعدادات التقرير
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الفترة الزمنية</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger data-testid="select-date-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">الشهر الحالي</SelectItem>
                  <SelectItem value="last_month">الشهر الماضي</SelectItem>
                  <SelectItem value="current_year">السنة الحالية</SelectItem>
                  <SelectItem value="last_year">السنة الماضية</SelectItem>
                  <SelectItem value="custom">فترة مخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>العملة</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SYP">ليرة سورية</SelectItem>
                  <SelectItem value="USD">دولار أمريكي</SelectItem>
                  <SelectItem value="TRY">ليرة تركية</SelectItem>
                  <SelectItem value="ALL">جميع العملات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleGenerateReport} className="w-full" data-testid="button-generate-report">
                إنشاء التقرير
              </Button>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>من تاريخ</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label>إلى تاريخ</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-summary-revenue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency((dashboardStats as any)?.totalRevenue || 0, "SYP")}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">إجمالي الإيرادات</h3>
            <p className="text-sm text-green-600">+12% عن الفترة السابقة</p>
          </CardContent>
        </Card>

        <Card data-testid="card-summary-expenses">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency((dashboardStats as any)?.totalExpenses || 0, "SYP")}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">إجمالي المصروفات</h3>
            <p className="text-sm text-red-600">+8% عن الفترة السابقة</p>
          </CardContent>
        </Card>

        <Card data-testid="card-summary-profit">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency((dashboardStats as any)?.netProfit || 0, "SYP")}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">صافي الربح</h3>
            <p className="text-sm text-blue-600">+18% عن الفترة السابقة</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue/Expenses Chart */}
        <Card data-testid="card-revenue-expenses-chart">
          <CardHeader>
            <CardTitle>الإيرادات والمصروفات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                  <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `${value.toLocaleString()} ل.س`,
                      name === 'revenue' ? 'الإيرادات' : name === 'expenses' ? 'المصروفات' : 'الربح'
                    ]}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="expenses" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="profit" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Currency Distribution */}
        <Card data-testid="card-currency-chart">
          <CardHeader>
            <CardTitle>توزيع العملات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsePieChart>
                  <Pie
                    data={currencyChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {currencyChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [
                      `${value.toLocaleString()}`,
                      props.payload.name
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>العمليات الحديثة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-4">التاريخ</th>
                  <th className="text-right p-4">النوع</th>
                  <th className="text-right p-4">الوصف</th>
                  <th className="text-right p-4">المبلغ</th>
                  <th className="text-right p-4">العملة</th>
                  <th className="text-right p-4">طريقة الدفع</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(recentTransactions) ? recentTransactions.slice(0, 10).map((transaction: any) => (
                  <tr key={transaction.id} className="border-b hover:bg-accent" data-testid={`report-transaction-${transaction.id}`}>
                    <td className="p-4" data-testid={`report-transaction-date-${transaction.id}`}>
                      {formatDate(transaction.createdAt!)}
                    </td>
                    <td className="p-4" data-testid={`report-transaction-type-${transaction.id}`}>
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.type === 'revenue' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {transaction.type === 'revenue' ? 'إيراد' : 'مصروف'}
                      </span>
                    </td>
                    <td className="p-4" data-testid={`report-transaction-description-${transaction.id}`}>
                      {transaction.description}
                    </td>
                    <td className="p-4" data-testid={`report-transaction-amount-${transaction.id}`}>
                      <span className={transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'revenue' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount), transaction.currency)}
                      </span>
                    </td>
                    <td className="p-4" data-testid={`report-transaction-currency-${transaction.id}`}>
                      {transaction.currency}
                    </td>
                    <td className="p-4" data-testid={`report-transaction-method-${transaction.id}`}>
                      {transaction.paymentMethod}
                    </td>
                  </tr>
                )) : []}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
