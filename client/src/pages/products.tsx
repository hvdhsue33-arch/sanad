import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/queryClient";
import ProductForm from "@/components/forms/product-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Products() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.get("/api/products"),
  });

  const { data: lowStockProducts } = useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: () => apiClient.get("/api/products/low-stock"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "low-stock"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المنتج بنجاح",
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

  const filteredProducts = Array.isArray(products) ? products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const isLowStock = (product: any) => {
    return product.quantity <= product.minStockLevel;
  };

  const calculateProfit = (product: any) => {
    const profit = parseFloat(product.salePrice) - parseFloat(product.purchasePrice);
    return profit;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المنتجات</h1>
          {Array.isArray(lowStockProducts) && lowStockProducts.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-600">
                {lowStockProducts.length} منتج بحاجة لإعادة تخزين
              </span>
            </div>
          )}
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="button-add-product">
          <Plus className="ml-2 h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="البحث في المنتجات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          data-testid="input-search-products"
        />
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-products">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد منتجات"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4">اسم المنتج</th>
                    <th className="text-right p-4">الفئة</th>
                    <th className="text-right p-4">الوحدة</th>
                    <th className="text-right p-4">الكمية</th>
                    <th className="text-right p-4">سعر الشراء</th>
                    <th className="text-right p-4">سعر البيع</th>
                    <th className="text-right p-4">الربح</th>
                    <th className="text-right p-4">المورد</th>
                    <th className="text-right p-4">الحالة</th>
                    <th className="text-right p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: any) => (
                    <tr key={product.id} className="border-b hover:bg-accent" data-testid={`product-row-${product.id}`}>
                      <td className="p-4 font-medium" data-testid={`product-name-${product.id}`}>
                        {product.name}
                      </td>
                      <td className="p-4" data-testid={`product-category-${product.id}`}>
                        {product.category || "-"}
                      </td>
                      <td className="p-4" data-testid={`product-unit-${product.id}`}>
                        {product.unit}
                      </td>
                      <td className="p-4" data-testid={`product-quantity-${product.id}`}>
                        <span className={isLowStock(product) ? "text-red-600 font-semibold" : ""}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="p-4" data-testid={`product-purchase-price-${product.id}`}>
                        {formatCurrency(parseFloat(product.purchasePrice), "SYP")}
                      </td>
                      <td className="p-4" data-testid={`product-sale-price-${product.id}`}>
                        {formatCurrency(parseFloat(product.salePrice), "SYP")}
                      </td>
                      <td className="p-4" data-testid={`product-profit-${product.id}`}>
                        <span className={calculateProfit(product) >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(calculateProfit(product), "SYP")}
                        </span>
                      </td>
                      <td className="p-4" data-testid={`product-supplier-${product.id}`}>
                        {product.supplier || "-"}
                      </td>
                      <td className="p-4" data-testid={`product-status-${product.id}`}>
                        {isLowStock(product) ? (
                          <Badge variant="destructive">نقص في المخزون</Badge>
                        ) : (
                          <Badge variant="secondary">متوفر</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            data-testid={`button-edit-product-${product.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-product-${product.id}`}
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

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl" data-testid="dialog-product-form">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
