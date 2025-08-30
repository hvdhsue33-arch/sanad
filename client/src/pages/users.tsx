import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, User, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getRoleDisplayName, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/queryClient";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock users data since there's no users API endpoint in the backend
  const mockUsers = [
    {
      id: "1",
      username: "admin",
      firstName: "أحمد",
      lastName: "المحمد",
      email: "admin@example.com",
      role: "super_admin",
      isActive: true,
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "2", 
      username: "manager1",
      firstName: "سارة",
      lastName: "أحمد",
      email: "sara@example.com",
      role: "manager",
      isActive: true,
      createdAt: "2024-01-20T14:15:00Z"
    },
    {
      id: "3",
      username: "accountant1", 
      firstName: "محمد",
      lastName: "علي",
      email: "mohammed@example.com",
      role: "accountant",
      isActive: true,
      createdAt: "2024-02-01T09:00:00Z"
    },
    {
      id: "4",
      username: "warehouse1",
      firstName: "فاطمة",
      lastName: "حسن",
      email: "fatima@example.com", 
      role: "warehouse_keeper",
      isActive: false,
      createdAt: "2024-02-10T16:45:00Z"
    }
  ];

  const filteredUsers = mockUsers.filter((user: any) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'accountant':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warehouse_keeper':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleAddUser = () => {
    toast({
      title: "قريباً",
      description: "إضافة المستخدمين ستكون متاحة قريباً",
    });
  };

  const handleEditUser = (user: any) => {
    toast({
      title: "قريباً", 
      description: "تعديل المستخدمين سيكون متاحاً قريباً",
    });
  };

  const handleToggleUser = (userId: string, isActive: boolean) => {
    toast({
      title: isActive ? "تم إلغاء التفعيل" : "تم التفعيل",
      description: `تم ${isActive ? 'إلغاء تفعيل' : 'تفعيل'} المستخدم بنجاح`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <Button onClick={handleAddUser} data-testid="button-add-user">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مستخدم
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="البحث في المستخدمين..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          data-testid="input-search-users"
        />
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card data-testid="card-total-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <User className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockUsers.length}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">إجمالي المستخدمين</h3>
          </CardContent>
        </Card>

        <Card data-testid="card-active-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Shield className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {mockUsers.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">المستخدمين النشطين</h3>
          </CardContent>
        </Card>

        <Card data-testid="card-admins">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Shield className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {mockUsers.filter(u => u.role === 'super_admin' || u.role === 'owner').length}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">المدراء</h3>
          </CardContent>
        </Card>

        <Card data-testid="card-inactive-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
                <User className="text-gray-600 dark:text-gray-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {mockUsers.filter(u => !u.isActive).length}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">المستخدمين المعطلين</h3>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-users">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مستخدمين"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4">المستخدم</th>
                    <th className="text-right p-4">اسم المستخدم</th>
                    <th className="text-right p-4">البريد الإلكتروني</th>
                    <th className="text-right p-4">الدور</th>
                    <th className="text-right p-4">الحالة</th>
                    <th className="text-right p-4">تاريخ الإنشاء</th>
                    <th className="text-right p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-accent" data-testid={`user-row-${user.id}`}>
                      <td className="p-4" data-testid={`user-name-${user.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <User className="text-primary-foreground text-sm" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.username
                              }
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4" data-testid={`user-username-${user.id}`}>
                        {user.username}
                      </td>
                      <td className="p-4" data-testid={`user-email-${user.id}`}>
                        {user.email || "-"}
                      </td>
                      <td className="p-4" data-testid={`user-role-${user.id}`}>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </td>
                      <td className="p-4" data-testid={`user-status-${user.id}`}>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "نشط" : "معطل"}
                        </Badge>
                      </td>
                      <td className="p-4" data-testid={`user-created-${user.id}`}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={user.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleUser(user.id, user.isActive)}
                            data-testid={`button-toggle-user-${user.id}`}
                          >
                            {user.isActive ? "إلغاء التفعيل" : "تفعيل"}
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
    </div>
  );
}
