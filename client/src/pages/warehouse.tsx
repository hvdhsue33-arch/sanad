import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Warehouse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: lowStockProducts } = useQuery({
    queryKey: ["/api/products/low-stock"],
  });

  const filteredProducts = Array.isArray(products) ? products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    const isLowStock = product.quantity <= product.minStockLevel;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "low_stock" && isLowStock) ||
                         (statusFilter === "in_stock" && !isLowStock);

    return matchesSearch && matchesCategory && matchesStatus;
  }) : [];

  // Get unique categories
  const categories = Array.isArray(products) ? Array.from(new Set(products.map((p: any) => p.category).filter(Boolean))) : [];

  // Calculate statistics
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const lowStockCount = Array.isArray(lowStockProducts) ? lowStockProducts.length : 0;
  const totalValue = Array.isArray(products) ? products.reduce((sum: number, product: any) => {
    return sum + (parseFloat(product.salePrice) * product.quantity);
  }, 0) : 0;
  const averageProfit = Array.isArray(products) && products.length > 0 ? products.reduce((sum: number, product: any) => {
    return sum + (parseFloat(product.salePrice) - parseFloat(product.purchasePrice));
  }, 0) / products.length : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">المستودع</h1>
        <div className="text-center py-8">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المستودع</h1>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            إجمالي {totalProducts} منتج
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-products">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="total-products-count">
                  {totalProducts}
                </p>
                <p className="text-sm text-muted-foreground">منتج</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">إجمالي المنتجات</h3>
          </CardContent>
        </Card>

        <Card data-testid="card-low-stock">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="low-stock-count">
                  {lowStockCount}
                </p>
                <p className="text-sm text-muted-foreground">منتج</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">نقص في المخزون</h3>
          </CardContent>
        </Card>

        <Card data-testid="card-total-value">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="total-value">
                  {formatCurrency(totalValue, "SYP")}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">قيمة المخزون</h3>
          </CardContent>
        </Card>

        <Card data-testid="card-average-profit">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-amber-600 dark:text-amber-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="average-profit">
                  {formatCurrency(averageProfit, "SYP")}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">متوسط الربح</h3>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في المنتجات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
            data-testid="input-search-warehouse"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48" data-testid="select-category-filter">
            <SelectValue placeholder="تصفية حسب الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="in_stock">متوفر</SelectItem>
            <SelectItem value="low_stock">نقص في المخزون</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground" data-testid="empty-warehouse">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all" 
              ? "لا توجد نتائج للتصفية المحددة" 
              : "لا توجد منتجات في المستودع"
            }
          </div>
        ) : (
          filteredProducts.map((product: any) => {
            const isLowStock = product.quantity <= product.minStockLevel;
            const profit = parseFloat(product.salePrice) - parseFloat(product.purchasePrice);
            
            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow" data-testid={`warehouse-product-${product.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg" data-testid={`warehouse-product-name-${product.id}`}>
                      {product.name}
                    </CardTitle>
                    {isLowStock && (
                      <Badge variant="destructive" className="text-xs">
                        نقص
                      </Badge>
                    )}
                  </div>
                  {product.category && (
                    <p className="text-sm text-muted-foreground" data-testid={`warehouse-product-category-${product.id}`}>
                      {product.category}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">الكمية:</span>
                    <span className={`font-semibold ${isLowStock ? 'text-red-600' : 'text-foreground'}`} data-testid={`warehouse-product-quantity-${product.id}`}>
                      {product.quantity} {product.unit}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">سعر البيع:</span>
                    <span className="font-semibold" data-testid={`warehouse-product-price-${product.id}`}>
                      {formatCurrency(parseFloat(product.salePrice), "SYP")}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">الربح:</span>
                    <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid={`warehouse-product-profit-${product.id}`}>
                      {formatCurrency(profit, "SYP")}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">القيمة الإجمالية:</span>
                    <span className="font-semibold" data-testid={`warehouse-product-total-value-${product.id}`}>
                      {formatCurrency(parseFloat(product.salePrice) * product.quantity, "SYP")}
                    </span>
                  </div>

                  {product.supplier && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">المورد:</span>
                      <span className="text-sm" data-testid={`warehouse-product-supplier-${product.id}`}>
                        {product.supplier}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
