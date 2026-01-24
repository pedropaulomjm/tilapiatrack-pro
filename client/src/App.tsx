import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AuditLog from "./pages/AuditLog";
import SpeciesManagement from "./pages/SpeciesManagement";
import AnalyticsComparison from "./pages/AnalyticsComparison";
import { NotificationCenter } from "./components/NotificationCenter";
import { MainLayout } from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import TankManagement from "./pages/TankManagement";
import TankSettings from "./pages/TankSettings";
import Reports from "./pages/Reports";
import WebhookManagement from "./pages/WebhookManagement";
import Insights from "./pages/Insights";
import FeedingControl from "./pages/FeedingControl";
import StockManagement from "./pages/StockManagement";
import FinancialDashboard from "./pages/FinancialDashboard";
import HomeDashboard from "./pages/HomeDashboard";
import SupplierComparison from "./pages/SupplierComparison";
import ModulesPage from "./pages/ModulesPage";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path={"/"} component={Dashboard} />
        <Route path={"/tanks"} component={TankManagement} />
        <Route path={"/tanks/new"} component={TankManagement} />
        <Route path={"/tanks/:id"} component={Dashboard} />
        <Route path={"/tanks/:id/settings"} component={TankSettings} />
        <Route path={"/reports"} component={Reports} />
        <Route path={"/webhooks"} component={WebhookManagement} />
        <Route path={"/insights"} component={Insights} />
        <Route path={"/feeding"} component={FeedingControl} />
        <Route path={"/stock"} component={StockManagement} />
        <Route path={"/financial"} component={FinancialDashboard} />
        <Route path={"/home"} component={HomeDashboard} />
        <Route path={"/suppliers"} component={SupplierComparison} />
        <Route path={"/audit"} component={AuditLog} />
        <Route path={"/modules"} component={ModulesPage} />
        <Route path={"/species"} component={SpeciesManagement} />
        <Route path={"/analytics"} component={AnalyticsComparison} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <NotificationCenter />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
