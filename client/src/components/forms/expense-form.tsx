import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { CURRENCIES, EXPENSE_TYPES, PAYMENT_METHODS } from "@/lib/constants";

const expenseFormSchema = z.object({
  supplierName: z.string().optional(),
  expenseType: z.enum(['rent', 'salaries', 'services', 'purchase', 'utilities', 'maintenance', 'other']),
  description: z.string().min(1, "الوصف مطلوب"),
  amount: z.number().min(0, "المبلغ يجب أن يكون موجباً"),
  currency: z.enum(['SYP', 'TRY', 'USD']),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'other']),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  expense?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      supplierName: expense?.supplierName || "",
      expenseType: expense?.expenseType || "other",
      description: expense?.description || "",
      amount: expense?.amount ? parseFloat(expense.amount) : 0,
      currency: expense?.currency || "SYP",
      paymentMethod: expense?.paymentMethod || "cash",
      notes: expense?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      await apiRequest("POST", "/api/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-transactions"] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة المصروف بنجاح",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      await apiRequest("PUT", `/api/expenses/${expense.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-transactions"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث المصروف بنجاح",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    if (expense) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-expense">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="supplierName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المورد (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="اسم المورد" {...field} data-testid="input-supplier-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expenseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع المصروف</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-expense-type">
                      <SelectValue placeholder="اختر نوع المصروف" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXPENSE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف *</FormLabel>
                <FormControl>
                  <Input placeholder="وصف المصروف" {...field} data-testid="input-description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المبلغ *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="المبلغ"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-amount"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العملة</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>طريقة الدفع</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-payment-method">
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Amount Display */}
        <div className="bg-muted p-4 rounded-lg">
          <Label>المبلغ</Label>
          <p className="text-2xl font-bold text-red-600" data-testid="text-expense-amount">
            {form.watch("amount").toLocaleString()} {
              CURRENCIES.find(c => c.value === form.watch("currency"))?.symbol || form.watch("currency")
            }
          </p>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ملاحظات إضافية..."
                  {...field}
                  data-testid="textarea-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            data-testid="button-cancel-expense"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            data-testid="button-save-expense"
          >
            {isPending ? "جاري الحفظ..." : expense ? "تحديث" : "حفظ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
