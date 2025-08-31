import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, getExpenseTypeDisplayName, getPaymentMethodDisplayName } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/queryClient";
import ExpenseForm from "@/components/forms/expense-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => apiClient.get("/api/expenses"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المصروف بنجاح",
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

  const filteredExpenses = Array.isArray(expenses) ? expenses.filter((expense: any) =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المصروفات</h1>
        <Button onClick={() => setShowForm(true)} data-testid="button-add-expense">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مصروف
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="البحث في المصروفات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          data-testid="input-search-expenses"
        />
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-expenses">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مصروفات"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4">رقم العملية</th>
                    <th className="text-right p-4">التاريخ</th>
                    <th className="text-right p-4">المورد</th>
                    <th className="text-right p-4">الوصف</th>
                    <th className="text-right p-4">النوع</th>
                    <th className="text-right p-4">المبلغ</th>
                    <th className="text-right p-4">طريقة الدفع</th>
                    <th className="text-right p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense: any) => (
                    <tr key={expense.id} className="border-b hover:bg-accent" data-testid={`expense-row-${expense.id}`}>
                      <td className="p-4" data-testid={`expense-operation-${expense.id}`}>
                        {expense.operationNumber}
                      </td>
                      <td className="p-4" data-testid={`expense-date-${expense.id}`}>
                        {formatDate(expense.createdAt!)}
                      </td>
                      <td className="p-4" data-testid={`expense-supplier-${expense.id}`}>
                        {expense.supplierName || "-"}
                      </td>
                      <td className="p-4" data-testid={`expense-description-${expense.id}`}>
                        {expense.description}
                      </td>
                      <td className="p-4" data-testid={`expense-type-${expense.id}`}>
                        {getExpenseTypeDisplayName(expense.expenseType)}
                      </td>
                      <td className="p-4 font-semibold text-red-600" data-testid={`expense-amount-${expense.id}`}>
                        {formatCurrency(parseFloat(expense.amount), expense.currency)}
                      </td>
                      <td className="p-4" data-testid={`expense-payment-${expense.id}`}>
                        {getPaymentMethodDisplayName(expense.paymentMethod)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                            data-testid={`button-edit-expense-${expense.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-expense-${expense.id}`}
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

      {/* Expense Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl" data-testid="dialog-expense-form">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "تعديل المصروف" : "إضافة مصروف جديد"}
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            expense={editingExpense}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
