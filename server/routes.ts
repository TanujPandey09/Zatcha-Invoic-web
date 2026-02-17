
import type { Express } from "express";
import type { Server } from "http";
import passport from "./config/passport.js";

import { requireAuth, requireOrg } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";
import { api } from "./api.js";

// Controllers
import * as authController from "./controllers/auth.controller.js";
import * as organizationController from "./controllers/organization.controller.js";
import * as clientController from "./controllers/client.controller.js";
import * as invoiceController from "./controllers/invoice.controller.js";
import * as auditController from "./controllers/audit.controller.js";
import * as reportsController from "./controllers/report.controller.js";
import * as zatcaController from "./controllers/zatca.controller.js";
import * as pdfController from "./controllers/pdf.conroller.js";
import * as zatcaIntegrationController from "./controllers/zatca-Integration.contoller.js";

/**
 * Register all application routes
 */
export async function registerRoutes(
    httpServer: Server,
    app: Express
): Promise<Server> {
    // ================= PUBLIC ROUTES =================

    // Authentication (no auth required)
    app.post("/api/auth/register", authController.register);
    app.post("/api/auth/login", authController.login);
    app.post("/api/auth/logout", authController.logout);

    // SSO Routes
    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get("/api/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
        (req.session as any).userId = (req.user as any).id;
        res.redirect("/dashboard");
    });

    app.get("/api/auth/microsoft", passport.authenticate("microsoft", { prompt: "select_account" }));
    app.get("/api/auth/microsoft/callback", passport.authenticate("microsoft", { failureRedirect: "/login" }), (req, res) => {
        (req.session as any).userId = (req.user as any).id;
        res.redirect("/dashboard");
    });

    // ================= PROTECTED ROUTES =================

    // Apply authentication middleware to all /api routes
    app.use("/api", requireAuth);

    // ---------- Auth / User ----------
    app.get(api.auth.me.path, authController.me);

    // ---------- Organization ----------
    app.put(api.organizations.update.path, organizationController.createOrUpdate);
    app.get(api.organizations.stats.path, requireOrg, organizationController.getStats);
    app.get("/api/organization", requireOrg, organizationController.get);
    app.post("/api/organization/upgrade", requireOrg, organizationController.upgrade);

    // ---------- Clients ----------
    app.get(api.clients.list.path, requireOrg, clientController.list);
    app.get("/api/clients/search", requireOrg, clientController.search);
    app.get("/api/clients/:id", requireOrg, clientController.get);
    app.post(api.clients.create.path, requireOrg, clientController.create);
    app.put(api.clients.update.path, requireOrg, clientController.update);
    app.delete("/api/clients/:id", requireOrg, clientController.remove);

    // ---------- Invoices ----------
    app.get(api.invoices.list.path, requireOrg, invoiceController.list);
    app.get("/api/invoices/stats", requireOrg, invoiceController.getStats);
    app.get(api.invoices.get.path, requireOrg, invoiceController.get);
    app.post(api.invoices.create.path, requireOrg, invoiceController.create);
    app.get("/api/invoices/:id/pdf", requireOrg, pdfController.downloadPDF);
    app.patch(
        api.invoices.updateStatus.path,
        requireOrg,
        invoiceController.updateStatus
    );
    app.get("/api/invoices/:id/zatca", requireOrg, invoiceController.getZATCAData);
    app.put("/api/invoices/:id", requireOrg, invoiceController.update);
    app.delete("/api/invoices/:id", requireOrg, invoiceController.remove);

    // ---------- Reports ----------

    // ---------- Audit Logs ----------
    app.get(api.audit.list.path, requireOrg, auditController.list);
    app.get(
        "/api/audit/:entityType/:entityId",
        requireOrg,
        auditController.getEntityHistory
    );
    app.get(
        "/api/audit/user/:userId",
        requireOrg,
        auditController.getUserActivity
    );


    // ================= REPORTS ENDPOINTS =================

    app.get("/api/reports/monthly", requireAuth, requireOrg, reportsController.getMonthlyReports);
    app.get("/api/reports/vat", requireAuth, requireOrg, reportsController.getVATSummary);
    app.get("/api/reports/quarterly", requireAuth, requireOrg, reportsController.getQuarterlyReport);
    app.get("/api/reports/annual", requireAuth, requireOrg, reportsController.getAnnualReport);
    app.get("/api/reports/top-clients", requireAuth, requireOrg, reportsController.getTopClients);
    app.get("/api/reports/trend", requireAuth, requireOrg, reportsController.getRevenueTrend);
    app.get("/api/reports/dashboard", requireAuth, requireOrg, reportsController.getDashboardStats);
    app.get("/api/reports/export/monthly", requireAuth, requireOrg, reportsController.exportMonthlyCSV);

    // ================= ZATCA COMPLIANCE ENDPOINTS =================
    // Step 1: Generate CSR
    app.post(
        "/api/zatca/integration/generate-csr",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.generateCSR  // ← Add this
    );

    // Step 2: Compliance Check
    app.post(
        "/api/zatca/integration/compliance-check",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.complianceCheck  // ← Add this
    );

    // Step 3: Get Production CSID
    app.post(
        "/api/zatca/integration/production-csid",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.getProductionCSID  // ← Add this
    );
    app.post("/api/zatca/process/:invoiceId", requireAuth, requireOrg, zatcaController.processInvoice);
    app.get("/api/zatca/qrcode/:invoiceId", requireAuth, requireOrg, zatcaController.generateQRCode);
    app.get("/api/zatca/xml/:invoiceId", requireAuth, requireOrg, zatcaController.getInvoiceXML);
    app.post("/api/zatca/submit/:invoiceId", requireAuth, requireOrg, zatcaController.submitInvoice);
    app.post("/api/zatca/validate-vat", requireAuth, zatcaController.validateVATNumber);
    app.get("/api/zatca/compliance-status", requireAuth, requireOrg, zatcaController.getComplianceStatus);

    // ================= ZATCA Integration ENDPOINTS =================
    // ================= ZATCA INTEGRATION ENDPOINTS =================

    // Step 1: Setup / Generate CSR
    app.post(
        "/api/zatca/integration/setup",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.setupIntegration
    );

    app.post(
        "/api/zatca/integration/generate-csr",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.generateCSR
    );

    // Step 2: Compliance Check
    app.post(
        "/api/zatca/integration/compliance-check",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.complianceCheck
    );

    // Step 3: Get Production CSID
    app.post(
        "/api/zatca/integration/production-csid",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.getProductionCSID
    );

    // Get integration status
    app.get(
        "/api/zatca/integration/status",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.getIntegrationStatus
    );

    // Get integration config
    app.get(
        "/api/zatca/integration/config",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.getIntegrationConfig
    );

    // Test ZATCA connection
    app.post(
        "/api/zatca/integration/test",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.testConnection
    );

    // Renew CSID certificate
    app.post(
        "/api/zatca/integration/renew",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.renewCSID
    );

    // Get certificate info
    app.get(
        "/api/zatca/integration/certificate",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.getCertificateInfo
    );

    // Submit invoice to ZATCA
    app.post(
        "/api/zatca/integration/submit/:invoiceId",
        requireAuth,
        requireOrg,
        zatcaIntegrationController.submitInvoiceToZATCA
    );


    // ================= ERROR HANDLING =================

    // Global error handler (must be last)
    app.use(errorHandler);

    return httpServer;
}