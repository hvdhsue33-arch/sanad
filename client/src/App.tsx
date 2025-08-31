import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Capacitor } from '@capacitor/core';

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Revenues from "@/pages/revenues";
import Expenses from "@/pages/expenses";
import Products from "@/pages/products";
import Warehouse from "@/pages/warehouse";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import Backup from "@/pages/backup";
import NotFound from "@/pages/not-found";

// Layout
import Layout from "@/components/layout/layout";
import MobileLayout from "@/components/layout/mobile-layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}

function Router() {
  // Check if running on mobile
  const isMobile = Capacitor.isNativePlatform();
  const LayoutComponent = isMobile ? MobileLayout : Layout;

  return (
    <ProtectedRoute>
      <LayoutComponent>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/revenues" component={Revenues} />
          <Route path="/expenses" component={Expenses} />
          <Route path="/products" component={Products} />
          <Route path="/warehouse" component={Warehouse} />
          <Route path="/reports" component={Reports} />
          <Route path="/users" component={Users} />
          <Route path="/settings" component={Settings} />
          <Route path="/backup" component={Backup} />
          <Route component={NotFound} />
        </Switch>
      </LayoutComponent>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="accounting-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
