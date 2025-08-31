import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, getTransactionTypeDisplayName, getPaymentMethodDisplayName } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/queryClient";
import RevenueForm from "@/components/forms/revenue-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Revenues() {
  const [showForm, setShowForm] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: revenues, isLoading } = useQuery({
    queryKey: ["revenues"],
    queryFn: () => apiClient.get("/api/revenues"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/revenues/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenues"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الإيراد بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredRevenues = Array.isArray(revenues) ? revenues.filter((revenue: any) =>
    revenue.productService.toLowerCase().includes(searchTerm.toLowerCase()) ||
    revenue.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleEdit = (revenue: any) => {
    setEditingRevenue(revenue);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الإيراد؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRevenue(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الإيرادات</h1>
        <Button onClick={() => setShowForm(true)} data-testid="button-add-revenue">
          <Plus className="ml-2 h-4 w-4" />
          إضافة إيراد
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="البحث في الإيرادات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          data-testid="input-search-revenues"
        />
      </div>

      {/* Revenues List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الإيرادات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredRevenues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-revenues">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد إيرادات"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4">رقم العملية</th>
                    <th className="text-right p-4">التاريخ</th>
                    <th className="text-right p-4">العميل</th>
                    <th className="text-right p-4">المنتج/الخدمة</th>
                    <th className="text-right p-4">النوع</th>
                    <th className="text-right p-4">المبلغ</th>
                    <th className="text-right p-4">طريقة الدفع</th>
                    <th className="text-right p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRevenues.map((revenue: any) => (
                    <tr key={revenue.id} className="border-b hover:bg-accent" data-testid={`revenue-row-${revenue.id}`}>
                      <td className="p-4" data-testid={`revenue-operation-${revenue.id}`}>
                        {revenue.operationNumber}
                      </td>
                      <td className="p-4" data-testid={`revenue-date-${revenue.id}`}>
                        {formatDate(revenue.createdAt!)}
                      </td>
                      <td className="p-4" data-testid={`revenue-customer-${revenue.id}`}>
                        {revenue.customerName || "-"}
                      </td>
                      <td className="p-4" data-testid={`revenue-product-${revenue.id}`}>
                        {revenue.productService}
                      </td>
                      <td className="p-4" data-testid={`revenue-type-${revenue.id}`}>
                        {getTransactionTypeDisplayName(revenue.transactionType)}
                      </td>
                      <td className="p-4 font-semibold text-green-600" data-testid={`revenue-amount-${revenue.id}`}>
                        {formatCurrency(parseFloat(revenue.totalAmount), revenue.currency)}
                      </td>
                      <td className="p-4" data-testid={`revenue-payment-${revenue.id}`}>
                        {getPaymentMethodDisplayName(revenue.paymentMethod)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(revenue)}
                            data-testid={`button-edit-revenue-${revenue.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(revenue.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-revenue-${revenue.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl" data-testid="dialog-revenue-form">
          <DialogHeader>
            <DialogTitle>
              {editingRevenue ? "تعديل الإيراد" : "إضافة إيراد جديد"}
            </DialogTitle>
          </DialogHeader>
          <RevenueForm
            revenue={editingRevenue}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
