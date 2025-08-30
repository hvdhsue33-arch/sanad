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
import { apiClient } from "@/lib/queryClient";
import { z } from "zod";
import { CURRENCIES, TRANSACTION_TYPES, PAYMENT_METHODS } from "@/lib/constants";

const revenueFormSchema = z.object({
  customerName: z.string().optional(),
  transactionType: z.enum(['sale', 'service', 'advance_payment', 'other']),
  productService: z.string().min(1, "المنتج/الخدمة مطلوب"),
  quantity: z.number().min(1, "الكمية يجب أن تكون أكبر من صفر"),
  unitPrice: z.number().min(0, "سعر الوحدة يجب أن يكون موجباً"),
  currency: z.enum(['SYP', 'TRY', 'USD']),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'other']),
  notes: z.string().optional(),
});

type RevenueFormData = z.infer<typeof revenueFormSchema>;

interface RevenueFormProps {
  revenue?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RevenueForm({ revenue, onSuccess, onCancel }: RevenueFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RevenueFormData>({
    resolver: zodResolver(revenueFormSchema),
    defaultValues: {
      customerName: revenue?.customerName || "",
      transactionType: revenue?.transactionType || "sale",
      productService: revenue?.productService || "",
      quantity: revenue?.quantity || 1,
      unitPrice: revenue?.unitPrice ? parseFloat(revenue.unitPrice) : 0,
      currency: revenue?.currency || "SYP",
      paymentMethod: revenue?.paymentMethod || "cash",
      notes: revenue?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RevenueFormData) => {
      const totalAmount = data.quantity * data.unitPrice;
      await apiClient.post("/api/revenues", {
        ...data,
        totalAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-transactions"] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة الإيراد بنجاح",
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
    mutationFn: async (data: RevenueFormData) => {
      const totalAmount = data.quantity * data.unitPrice;
      await apiClient.put(`/api/revenues/${revenue.id}`, {
        ...data,
        totalAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-transactions"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث الإيراد بنجاح",
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

  const onSubmit = (data: RevenueFormData) => {
    if (revenue) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-revenue">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم العميل (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="اسم العميل" {...field} data-testid="input-customer-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transactionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع العملية</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-transaction-type">
                      <SelectValue placeholder="اختر نوع العملية" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((type) => (
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
            name="productService"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المنتج/الخدمة *</FormLabel>
                <FormControl>
                  <Input placeholder="اسم المنتج أو الخدمة" {...field} data-testid="input-product-service" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الكمية *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="الكمية"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    data-testid="input-quantity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>سعر الوحدة *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="سعر الوحدة"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-unit-price"
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

        {/* Total Amount Display */}
        <div className="bg-muted p-4 rounded-lg">
          <Label>إجمالي المبلغ</Label>
          <p className="text-2xl font-bold text-green-600" data-testid="text-total-amount">
            {(form.watch("quantity") * form.watch("unitPrice")).toLocaleString()} {
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
            data-testid="button-cancel-revenue"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            data-testid="button-save-revenue"
          >
            {isPending ? "جاري الحفظ..." : revenue ? "تحديث" : "حفظ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
