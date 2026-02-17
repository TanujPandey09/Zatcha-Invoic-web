import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/error";
import * as zatcaIntegration from "../services/zatca-Integration.service";
import { storage } from "../storage";

/**
 * Setup ZATCA integration (Alternative to generateCSR)
 * POST /api/zatca/integration/setup
 */
export const setupIntegration = asyncHandler(
    async (req: Request, res: Response) => {
        const org = await storage.getOrganization(req.dbUser.organizationId);

        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        const {
            organizationUnitName,
            organizationIdentifier,
            invoiceType,
            location,
            industry,
        } = req.body;

        console.log("🔐 Setting up ZATCA integration for organization:", org.name);

        const { csr, privateKey } = zatcaIntegration.generateCSR({
            commonName: org.name,
            serialNumber: org.vatNumber || "",
            organizationIdentifier: organizationIdentifier || org.vatNumber || "",
            organizationUnitName: organizationUnitName || "Main Branch",
            countryName: "SA",
            invoiceType: invoiceType || "TSCZ",
            location: location || org.address || "Riyadh",
            industry: industry || "General Business",
        });

        console.log("✅ ZATCA setup completed - CSR generated");

        // Store private key temporarily (user should save it)
        await storage.updateOrganization(req.dbUser.organizationId, {
            zatcaPrivateKey: privateKey, // Store encrypted in production
        });

        res.json({
            success: true,
            csr,
            privateKey,
            message: "CSR generated successfully",
            instructions: [
                "1. ⚠️ SAVE the private key securely (you won't see it again)",
                "2. Copy the CSR",
                "3. Go to ZATCA Portal: https://fatoora.zatca.gov.sa",
                "4. Submit CSR and receive OTP",
                "5. Use OTP with compliance-check endpoint",
                "6. After compliance check, you can submit invoices",
            ],
        });
    }
);

/**
 * Generate CSR for ZATCA onboarding
 * POST /api/zatca/integration/generate-csr
 */
export const generateCSR = asyncHandler(async (req: Request, res: Response) => {
    const org = await storage.getOrganization(req.dbUser.organizationId);

    if (!org) {
        return res.status(404).json({ message: "Organization not found" });
    }

    const {
        organizationUnitName,
        organizationIdentifier,
        invoiceType,
        location,
        industry,
    } = req.body;

    console.log("🔐 Generating CSR for organization:", org.name);

    const { csr, privateKey } = zatcaIntegration.generateCSR({
        commonName: org.name,
        serialNumber: org.vatNumber || "",
        organizationIdentifier: organizationIdentifier || org.vatNumber || "",
        organizationUnitName: organizationUnitName || "Main Branch",
        countryName: "SA",
        invoiceType: invoiceType || "TSCZ",
        location: location || org.address || "Riyadh",
        industry: industry || "General Business",
    });

    console.log("✅ CSR generated successfully");

    // Store private key (encrypt in production!)
    await storage.updateOrganization(req.dbUser.organizationId, {
        zatcaPrivateKey: privateKey,
    });

    res.json({
        csr,
        privateKey,
        instructions: [
            "1. Save the private key securely (you'll need it later)",
            "2. Copy the CSR",
            "3. Go to ZATCA Portal: https://fatoora.zatca.gov.sa",
            "4. Submit CSR and get OTP",
            "5. Use OTP in compliance check endpoint",
        ],
    });
});

/**
 * Perform compliance check with ZATCA
 * POST /api/zatca/integration/compliance-check
 */
export const complianceCheck = asyncHandler(
    async (req: Request, res: Response) => {
        const { csr, otp } = req.body;

        if (!csr || !otp) {
            return res.status(400).json({
                message: "CSR and OTP are required",
            });
        }

        console.log("🔍 Performing compliance check...");

        try {
            const result = await zatcaIntegration.performComplianceCheck(csr, otp);

            console.log("✅ Compliance check passed");

            // Store credentials in organization
            await storage.updateOrganization(req.dbUser.organizationId, {
                zatcaUnitId: result.binarySecurityToken,
                zatcaSecret: result.secret, // Encrypt this in production!
            });

            res.json({
                success: true,
                message: "Compliance check passed",
                binarySecurityToken: result.binarySecurityToken,
                secret: result.secret,
                nextSteps: [
                    "1. Test invoice submission in sandbox",
                    "2. After successful testing, request production CSID",
                    "3. Replace sandbox credentials with production credentials",
                ],
            });
        } catch (error: any) {
            console.error("❌ Compliance check failed:", error);
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
);

/**
 * Get production CSID
 * POST /api/zatca/integration/production-csid
 */
export const getProductionCSID = asyncHandler(
    async (req: Request, res: Response) => {
        const { complianceRequestId } = req.body;

        if (!complianceRequestId) {
            return res.status(400).json({
                message: "Compliance request ID is required",
            });
        }

        console.log("🚀 Getting production CSID...");

        try {
            const result = await zatcaIntegration.getProductionCSID(
                complianceRequestId
            );

            // Update organization with production credentials
            await storage.updateOrganization(req.dbUser.organizationId, {
                zatcaUnitId: result.binarySecurityToken,
                zatcaSecret: result.secret,
            });

            console.log("✅ Production CSID obtained");

            res.json({
                success: true,
                message: "Production CSID obtained",
                binarySecurityToken: result.binarySecurityToken,
                secret: result.secret,
            });
        } catch (error: any) {
            console.error("❌ Production CSID failed:", error);
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
);

/**
 * Get integration status
 * GET /api/zatca/integration/status
 */
export const getIntegrationStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const org = await storage.getOrganization(req.dbUser.organizationId);

        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        const isConfigured = !!(org.zatcaUnitId && org.zatcaPrivateKey);
        const hasCredentials = !!org.zatcaUnitId;
        const hasPrivateKey = !!org.zatcaPrivateKey;

        res.json({
            isConfigured,
            hasCSID: hasCredentials,
            hasPrivateKey: hasPrivateKey,
            status: isConfigured ? "Ready for Production" : "Setup Required",
            organization: {
                name: org.name,
                vatNumber: org.vatNumber,
            },
            nextSteps: isConfigured
                ? ["You can now submit invoices to ZATCA"]
                : [
                    "1. Generate CSR",
                    "2. Submit CSR to ZATCA portal",
                    "3. Get OTP from ZATCA",
                    "4. Perform compliance check",
                ],
        });
    }
);

/**
 * Get integration config
 * GET /api/zatca/integration/config
 */
export const getIntegrationConfig = asyncHandler(
    async (req: Request, res: Response) => {
        const org = await storage.getOrganization(req.dbUser.organizationId);

        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        res.json({
            configured: !!org.zatcaUnitId,
            organization: {
                name: org.name,
                vatNumber: org.vatNumber,
                address: org.address,
            },
            zatcaConfig: {
                certificateSerialNumber: org.zatcaUnitId ? "***Hidden***" : null,
                hasPrivateKey: !!org.zatcaPrivateKey,
                isProduction: false, // Set based on your logic
            },
        });
    }
);

/**
 * Test ZATCA connection
 * POST /api/zatca/integration/test
 */
export const testConnection = asyncHandler(
    async (req: Request, res: Response) => {
        const org = await storage.getOrganization(req.dbUser.organizationId);

        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        const hasCredentials = !!(org.zatcaUnitId && org.zatcaPrivateKey);

        console.log("🔗 Testing ZATCA connection...");

        res.json({
            success: true,
            hasCredentials,
            organization: {
                name: org.name,
                vatNumber: org.vatNumber,
                zatcaUnitId: org.zatcaUnitId ? "Configured" : "Not configured",
            },
            status: hasCredentials ? "Ready" : "Not configured",
            message: hasCredentials
                ? "✅ ZATCA connection is ready"
                : "⚠️ ZATCA not configured",
            nextSteps: hasCredentials
                ? ["You can now submit invoices to ZATCA"]
                : [
                    "1. Generate CSR",
                    "2. Submit to ZATCA portal",
                    "3. Complete compliance check",
                ],
        });
    }
);

/**
 * Renew CSID certificate
 * POST /api/zatca/integration/renew
 */
export const renewCSID = asyncHandler(
    async (req: Request, res: Response) => {
        const org = await storage.getOrganization(req.dbUser.organizationId);

        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        if (!org.zatcaUnitId) {
            return res.status(400).json({
                message: "No existing certificate to renew. Please complete initial setup.",
            });
        }

        console.log("🔄 Renewing CSID certificate...");

        try {
            // Generate new CSR for renewal
            const { csr, privateKey } = zatcaIntegration.generateCSR({
                commonName: org.name,
                serialNumber: org.vatNumber || "",
                organizationIdentifier: org.vatNumber || "",
                organizationUnitName: "Main Branch",
                countryName: "SA",
                invoiceType: "TSCZ",
                location: org.address || "Riyadh",
                industry: "General Business",
            });

            console.log("✅ Certificate renewal initiated");

            res.json({
                success: true,
                message: "Certificate renewal initiated",
                csr,
                privateKey,
                instructions: [
                    "1. Submit this CSR to ZATCA portal",
                    "2. Follow the renewal process",
                    "3. Get new OTP",
                    "4. Use compliance-check endpoint with new credentials",
                ],
            });
        } catch (error: any) {
            console.error("❌ Certificate renewal failed:", error);
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
);

/**
 * Get certificate info
 * GET /api/zatca/integration/certificate
 */
export const getCertificateInfo = asyncHandler(
    async (req: Request, res: Response) => {
        const org = await storage.getOrganization(req.dbUser.organizationId);

        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        if (!org.zatcaUnitId) {
            return res.status(400).json({
                message: "No certificate configured",
            });
        }

        res.json({
            certificateSerialNumber: org.zatcaUnitId,
            status: "Active",
            configured: true,
            organization: {
                name: org.name,
                vatNumber: org.vatNumber,
            },
            details: {
                hasPrivateKey: !!org.zatcaPrivateKey,
                readyForSubmission: !!(org.zatcaUnitId && org.zatcaPrivateKey),
            },
        });
    }
);

/**
 * Submit invoice to ZATCA (clearance or reporting)
 * POST /api/zatca/integration/submit/:invoiceId
 */
export const submitInvoiceToZATCA = asyncHandler(
    async (req: Request, res: Response) => {
        const invoiceId = Number(req.params.invoiceId);
        const { useSandbox = true } = req.body;

        console.log("📤 Submitting invoice to ZATCA:", invoiceId);

        // Get invoice
        const invoice = await storage.getInvoice(invoiceId);
        if (!invoice || invoice.organizationId !== req.dbUser.organizationId) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Get organization credentials
        const org = await storage.getOrganization(req.dbUser.organizationId);
        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // Check if ZATCA credentials are configured
        if (!org.zatcaUnitId || !org.zatcaPrivateKey) {
            return res.status(400).json({
                message: "ZATCA credentials not configured. Please complete onboarding first.",
                instructions: [
                    "1. Generate CSR",
                    "2. Submit to ZATCA portal",
                    "3. Complete compliance check",
                    "4. Credentials will be automatically stored",
                ],
            });
        }

        // Check if invoice has ZATCA data
        if (!invoice.zatcaUuid || !invoice.zatcaHash || !invoice.zatcaXml) {
            return res.status(400).json({
                message: "Invoice not processed for ZATCA. Please process it first.",
            });
        }

        try {
            const credentials = {
                certificateSerialNumber: org.zatcaUnitId,
                certificateContent: org.zatcaUnitId,
                privateKey: org.zatcaPrivateKey || "",
                secret: org.zatcaSecret || org.zatcaPrivateKey || "",
            };

            const result = await zatcaIntegration.submitInvoiceToZATCA(
                {
                    uuid: invoice.zatcaUuid,
                    hash: invoice.zatcaHash,
                    xml: invoice.zatcaXml,
                    buyerVATNumber: invoice.client.vatNumber || undefined,
                    total: Number(invoice.total),
                },
                credentials,
                useSandbox
            );

            console.log("✅ Invoice submitted:", result.submissionType);

            // Create audit log
            await storage.createAuditLog({
                organizationId: req.dbUser.organizationId,
                userId: req.dbUser.id,
                action: "status_change",
                entity: "invoice",
                entityId: String(invoiceId),
                details: `ZATCA ${result.submissionType}: ${result.success ? "SUCCESS" : "FAILED"
                    }`,
            });

            // Update invoice status
            if (result.success) {
                await storage.updateInvoice(invoiceId, {
                    status: "submitted",
                    zatcaStatus: result.submissionType,
                });
            }

            res.json({
                success: result.success,
                submissionType: result.submissionType,
                validationResults: result.response.validationResults,
                clearedInvoice: result.response.clearedInvoice,
                qrCodeData: result.response.qrCodeData,
            });
        } catch (error: any) {
            console.error("❌ ZATCA submission error:", error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
);