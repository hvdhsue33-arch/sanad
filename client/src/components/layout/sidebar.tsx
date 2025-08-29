import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Warehouse, 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  Shield 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    title: "لوحة التحكم",
    href: "/",
    icon: Home,
    category: "main"
  },
  {
    title: "العمليات المالية",
    category: "finance",
    items: [
      {
        title: "الإيرادات",
        href: "/revenues",
        icon: TrendingUp,
        iconColor: "text-green-500"
      },
      {
        title: "المصروفات", 
        href: "/expenses",
        icon: TrendingDown,
        iconColor: "text-red-500"
      }
    ]
  },
  {
    title: "إدارة المخزون",
    category: "inventory",
    items: [
      {
        title: "المنتجات",
        href: "/products",
        icon: Package
      },
      {
        title: "المستودع",
        href: "/warehouse", 
        icon: Warehouse
      }
    ]
  },
  {
    title: "التقارير والإحصائيات",
    category: "reports",
    items: [
      {
        title: "التقارير المالية",
        href: "/reports",
        icon: BarChart3
      },
      {
        title: "تصدير التقارير",
        href: "/reports/export",
        icon: FileText
      }
    ]
  },
  {
    title: "إدارة النظام",
    category: "system",
    items: [
      {
        title: "المستخدمين",
        href: "/users",
        icon: Users
      },
      {
        title: "الإعدادات",
        href: "/settings",
        icon: Settings
      },
      {
        title: "النسخ الاحتياطي",
        href: "/backup",
        icon: Shield
      }
    ]
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <aside 
      className={cn(
        "w-64 bg-sidebar border-l border-sidebar-border overflow-y-auto sidebar-transition lg:translate-x-0 fixed lg:static inset-y-0 right-0 z-40",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="p-6 space-y-2">
        {navigationItems.map((section) => {
          // Single item (like Dashboard)
          if (section.href) {
            const Icon = section.icon!;
            return (
              <Link
                key={section.href}
                href={section.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActiveRoute(section.href)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                )}
                data-testid={`link-${section.href.replace('/', '') || 'dashboard'}`}
              >
                <Icon className="text-lg" />
                <span>{section.title}</span>
              </Link>
            );
          }

          // Category with items
          return (
            <div key={section.category} className="space-y-1">
              <p className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider px-4 py-2">
                {section.title}
              </p>
              
              {section.items?.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActiveRoute(item.href)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                    )}
                    data-testid={`link-${item.href.replace('/', '').replace('/', '-')}`}
                  >
                    <Icon className={cn("text-lg", (item as any).iconColor)} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
