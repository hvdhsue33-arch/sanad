import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";

// Pages
import Dashboard from "@/pages/dashboard";
import Revenues from "@/pages/revenues";
import Expenses from "@/pages/expenses";
import Products from "@/pages/products";
import Warehouse from "@/pages/warehouse";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Layout
import Layout from "@/components/layout/layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/revenues" component={Revenues} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/products" component={Products} />
        <Route path="/warehouse" component={Warehouse} />
        <Route path="/reports" component={Reports} />
        <Route path="/users" component={Users} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="accounting-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
