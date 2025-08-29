import { Bell, Calculator, Moon, Sun, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useQuery } from "@tanstack/react-query";
import { getRoleDisplayName, calculateDaysUntilExpiry } from "@/lib/utils";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  
  const { data: authData } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    retry: false,
  });

  const notificationCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  const user = (authData as any)?.user;
  const tenant = (authData as any)?.tenant;

  const subscriptionDays = tenant?.subscriptionExpiresAt 
    ? calculateDaysUntilExpiry(tenant.subscriptionExpiresAt)
    : 0;

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleSidebar}
          data-testid="button-sidebar-toggle"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calculator className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold">نظام إبراهيم للمحاسبة</h1>
            <p className="text-sm text-muted-foreground">النسخة 1.0</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -left-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>
        </div>
        
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 pr-4 border-r border-border">
            <div className="text-right">
              <p className="text-sm font-medium" data-testid="text-username">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.username
                }
              </p>
              <p className="text-xs text-muted-foreground" data-testid="text-user-role">
                {getRoleDisplayName(user.role)}
              </p>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="text-primary-foreground text-sm" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
