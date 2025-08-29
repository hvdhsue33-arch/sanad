import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { UNITS } from "@/lib/constants";

const productFormSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  category: z.string().optional(),
  unit: z.string().min(1, "وحدة القياس مطلوبة"),
  quantity: z.number().min(0, "الكمية يجب أن تكون موجبة"),
  purchasePrice: z.number().min(0, "سعر الشراء يجب أن يكون موجباً"),
  salePrice: z.number().min(0, "سعر البيع يجب أن يكون موجباً"),
  supplier: z.string().optional(),
  minStockLevel: z.number().min(0, "الحد الأدنى للمخزون يجب أن يكون موجباً"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      category: product?.category || "",
      unit: product?.unit || "piece",
      quantity: product?.quantity || 0,
      purchasePrice: product?.purchasePrice ? parseFloat(product.purchasePrice) : 0,
      salePrice: product?.salePrice ? parseFloat(product.salePrice) : 0,
      supplier: product?.supplier || "",
      minStockLevel: product?.minStockLevel || 5,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/low-stock"] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة المنتج بنجاح",
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
    mutationFn: async (data: ProductFormData) => {
      await apiRequest("PUT", `/api/products/${product.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/low-stock"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث المنتج بنجاح",
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

  const onSubmit = (data: ProductFormData) => {
    if (product) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const profit = form.watch("salePrice") - form.watch("purchasePrice");
  const profitMargin = form.watch("purchasePrice") > 0 
    ? ((profit / form.watch("purchasePrice")) * 100).toFixed(1)
    : "0";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-product">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المنتج *</FormLabel>
                <FormControl>
                  <Input placeholder="اسم المنتج" {...field} data-testid="input-product-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الفئة</FormLabel>
                <FormControl>
                  <Input placeholder="فئة المنتج" {...field} data-testid="input-category" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وحدة القياس *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-unit">
                      <SelectValue placeholder="اختر وحدة القياس" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الكمية الحالية</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="الكمية"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-quantity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>سعر الشراء *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="سعر الشراء"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-purchase-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>سعر البيع *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="سعر البيع"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-sale-price"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المورد</FormLabel>
                <FormControl>
                  <Input placeholder="اسم المورد" {...field} data-testid="input-supplier" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحد الأدنى للمخزون</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="الحد الأدنى"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-min-stock"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Profit Calculation */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <Label>الربح لكل وحدة:</Label>
            <span className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-profit-per-unit">
              {profit.toLocaleString()} ل.س
            </span>
          </div>
          <div className="flex justify-between items-center">
            <Label>هامش الربح:</Label>
            <span className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-profit-margin">
              {profitMargin}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <Label>القيمة الإجمالية:</Label>
            <span className="text-lg font-semibold" data-testid="text-total-value">
              {(form.watch("salePrice") * form.watch("quantity")).toLocaleString()} ل.س
            </span>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            data-testid="button-cancel-product"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            data-testid="button-save-product"
          >
            {isPending ? "جاري الحفظ..." : product ? "تحديث" : "حفظ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
