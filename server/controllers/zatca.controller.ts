import type { Request, Response } from "express";
import * as zatcaService from "../services/zatca.service.js";
import { asyncHandler } from "../middleware/error.js";
import { storage } from "../storage.js";

/**
 * Process invoice for ZATCA compliance
 * POST /api/zatca/process/:invoiceId
 */
export const processInvoice = asyncHandler(
    async (req: Request, res: Response) => {
        const invoiceId = Number(req.params.invoiceId);

        console.log("🔐 Processing ZATCA for invoice:", invoiceId);

        const result = await zatcaService.processZATCAInvoice(
            invoiceId,
            req.dbUser.organizationId
        );

        console.log("✅ ZATCA processing complete");

        res.json(result);
    }
);

/**
 * Generate QR code for invoice
 * GET /api/zatca/qrcode/:invoiceId
 */
export const generateQRCode = asyncHandler(
    async (req: Request, res: Response) => {
        const invoiceId = Number(req.params.invoiceId);

        // Get invoice details
        const invoice = await storage.getInvoice(invoiceId);
        const org = await storage.getOrganization(req.dbUser.organizationId);

        if (!invoice || invoice.organizationId !== req.dbUser.organizationId) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Return stored QR code if available
        if (invoice.zatcaQr) {
            return res.json({ qrCode: invoice.zatcaQr });
        }

        // Otherwise generate on the fly (Phase 1 compliant)
        const dateStr = invoice.issueDate instanceof Date
            ? invoice.issueDate.toISOString()
            : String(invoice.issueDate);

        const qrCode = zatcaService.generateQRCode({
            sellerName: org!.name,
            sellerVAT: org!.vatNumber || "300000000000003",
            issueDate: dateStr,
            total: Number(invoice.total),
            vatAmount: Number(invoice.taxTotal),
        });

        res.json({ qrCode });
    }
);

/**
 * Get UBL XML for invoice
 * GET /api/zatca/xml/:invoiceId
 */
export const getInvoiceXML = asyncHandler(
    async (req: Request, res: Response) => {
        const invoiceId = Number(req.params.invoiceId);

        const invoice = await storage.getInvoice(invoiceId);

        if (!invoice || invoice.organizationId !== req.dbUser.organizationId) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (!invoice.zatcaXml) {
            return res.status(400).json({
                message: "Invoice not processed for ZATCA yet",
            });
        }

        res.setHeader("Content-Type", "application/xml");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="invoice-${invoice.invoiceNumber}.xml"`
        );

        res.send(invoice.zatcaXml);
    }
);

/**
 * Submit invoice to ZATCA
 * POST /api/zatca/submit/:invoiceId
 */
export const submitInvoice = asyncHandler(
    async (req: Request, res: Response) => {
        const invoiceId = Number(req.params.invoiceId);

        console.log("📤 Submitting invoice to ZATCA:", invoiceId);

        const invoice = await storage.getInvoice(invoiceId);

        if (!invoice || invoice.organizationId !== req.dbUser.organizationId) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Process invoice first if not already done
        if (!invoice.zatcaUuid) {
            await zatcaService.processZATCAInvoice(
                invoiceId,
                req.dbUser.organizationId
            );
        }

        // Submit to ZATCA
        const result = await zatcaService.submitToZATCA(
            invoice,
            req.dbUser.organizationId
        );

        console.log("📥 ZATCA response:", result);

        res.json(result);
    }
);

/**
 * Validate Saudi VAT number
 * POST /api/zatca/validate-vat
 */
export const validateVATNumber = asyncHandler(
    async (req: Request, res: Response) => {
        const { vatNumber } = req.body;

        if (!vatNumber) {
            return res.status(400).json({ message: "VAT number is required" });
        }

        // Saudi VAT format: 15 digits starting with 3
        const isValid = /^3\d{14}$/.test(vatNumber);

        res.json({
            vatNumber,
            isValid,
            country: "SA",
            format: "Saudi Arabia VAT format (15 digits, starts with 3)",
        });
    }
);

/**
 * Get ZATCA compliance status for organization
 * GET /api/zatca/compliance-status
 */
export const getComplianceStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const org = await storage.getOrganization(req.dbUser.organizationId);
        const invoices = await storage.getInvoices(req.dbUser.organizationId);

        const totalInvoices = invoices.length;
        const processedInvoices = invoices.filter((inv) => inv.zatcaUuid).length;
        const pendingInvoices = totalInvoices - processedInvoices;

        const compliancePercentage =
            totalInvoices > 0 ? (processedInvoices / totalInvoices) * 100 : 0;

        res.json({
            organization: {
                name: org!.name,
                vatNumber: org!.vatNumber,
                hasZATCACredentials: !!(org!.zatcaUnitId && org!.zatcaPrivateKey),
            },
            invoices: {
                total: totalInvoices,
                processed: processedInvoices,
                pending: pendingInvoices,
                compliancePercentage: compliancePercentage.toFixed(2),
            },
            phase: {
                current: "Phase 1",
                ready: "Phase 2",
                features: {
                    sequentialNumbering: true,
                    vatCalculation: true,
                    invoiceFormat: true,
                    qrCodeGeneration: true,
                    xmlGeneration: true,
                    digitalSignature: false, // Needs keys
                    zatcaIntegration: false, // Needs implementation
                },
            },
        });
    }
);

