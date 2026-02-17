import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
import { I18nProvider } from "./i18n/i18n";

import { useAuth } from "./hooks/use-auth";
import { Loader } from "./components/Loader";

import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import Clients from "@/pages/Clients";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import SetupOrganization from "@/pages/SetupOrganization";
import InvoiceDetail from "@/pages/InvoiceDetail";
import ZATCACompliancePage from "@/pages/ZatchCompliance";
import ZatcaRulebook from "@/pages/ZatcaRulebook";
import Phase2Docs from "@/pages/Phase2Docs";
import VatHelpCenter from "@/pages/VatHelpCenter";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import ZATCAIntegrationPage from "./pages/Zatcaintegration";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loader while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for user data to be fully loaded before checking organization
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to setup if no organization and not already there
  if (!user.organizationId && location.pathname !== "/setup-organization") {
    return <Navigate to="/setup-organization" replace />;
  }

  // Redirect to dashboard if organization exists but trying to access setup
  if (user.organizationId && location.pathname === "/setup-organization") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="invoice-sme-theme">
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  path="/setup-organization"
                  element={
                    <ProtectedRoute>
                      <SetupOrganization />
                    </ProtectedRoute>
                  }
                />

                <Route path="/" element={<Landing />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute>
                      <Invoices />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <Clients />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/invoices/:id"
                  element={
                    <ProtectedRoute>
                      <InvoiceDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/zatca"
                  element={
                    <ProtectedRoute>
                      <ZATCACompliancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/zatca-integration"
                  element={
                    <ProtectedRoute>
                      <ZATCAIntegrationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                <Route path="/zatca-rulebook" element={<ZatcaRulebook />} />
                <Route path="/phase-2-docs" element={<Phase2Docs />} />
                <Route path="/vat-help" element={<VatHelpCenter />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
