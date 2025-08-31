import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Warehouse, 
  BarChart3, 
  Users, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/revenues', icon: TrendingUp, label: 'الإيرادات' },
  { path: '/expenses', icon: TrendingDown, label: 'المصروفات' },
  { path: '/products', icon: Package, label: 'المنتجات' },
  { path: '/warehouse', icon: Warehouse, label: 'المستودع' },
  { path: '/reports', icon: BarChart3, label: 'التقارير' },
  { path: '/users', icon: Users, label: 'المستخدمين' },
  { path: '/settings', icon: Settings, label: 'الإعدادات' },
];

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-900">
            نظام المحاسبة
          </h1>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleSidebar}>
          <div 
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">القائمة</h2>
            </div>
            
            <nav className="p-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start mb-1"
                    onClick={() => {
                      setLocation(item.path);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <Icon size={18} className="ml-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4">
        <Card className="p-4">
          {children}
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center p-2"
                onClick={() => setLocation(item.path)}
              >
                <Icon 
                  size={20} 
                  className={isActive ? "text-blue-600" : "text-gray-500"} 
                />
                <span className={`text-xs mt-1 ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding for content */}
      <div className="h-20" />
    </div>
  );
}
