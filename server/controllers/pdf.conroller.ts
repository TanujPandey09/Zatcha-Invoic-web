import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/error";
import { storage } from "../storage";
// @ts-ignore
import PDFDocument from "pdfkit";

/**
 * Generate and download invoice PDF
 * GET /api/invoices/:id/pdf
 */
export const downloadPDF = asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = Number(req.params.id);

    // Fetch invoice with client and items
    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice || invoice.organizationId !== req.dbUser.organizationId) {
        return res.status(404).json({ message: "Invoice not found" });
    }

    // Fetch organization
    const org = await storage.getOrganization(req.dbUser.organizationId);
    if (!org) {
        return res.status(404).json({ message: "Organization not found" });
    }

    // ===== CREATE PDF =====
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // ===== COLORS =====
    const PRIMARY = "#16a34a";   // Green
    const DARK = "#111827";
    const GRAY = "#6b7280";
    const LIGHT_GRAY = "#f3f4f6";
    const BLACK = "#000000";

    // ===== HEADER =====
    doc.rect(0, 0, doc.page.width, 80).fill(PRIMARY);

    doc.fillColor("#ffffff")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("TAX INVOICE", 50, 25);

    doc.fontSize(10)
        .font("Helvetica")
        .text("ZATCA Compliant E-Invoice", 50, 55);

    // Invoice number top right
    doc.fontSize(11)
        .font("Helvetica-Bold")
        .text(invoice.invoiceNumber, 0, 30, { align: "right" });

    doc.moveDown(3);

    // ===== FROM / TO SECTION =====
    const topY = 110;

    // FROM box
    doc.rect(50, topY, 230, 100).fill(LIGHT_GRAY);
    doc.fillColor(GRAY).fontSize(9).font("Helvetica-Bold")
        .text("FROM:", 60, topY + 10);
    doc.fillColor(DARK).fontSize(11).font("Helvetica-Bold")
        .text(org.name || "Your Company", 60, topY + 25);
    if (org.vatNumber) {
        doc.fillColor(GRAY).fontSize(9).font("Helvetica")
            .text(`VAT: ${org.vatNumber}`, 60, topY + 43);
    }
    if (org.address) {
        doc.fillColor(GRAY).fontSize(9)
            .text(org.address, 60, topY + 57, { width: 210 });
    }

    // TO box
    doc.rect(310, topY, 230, 100).fill(LIGHT_GRAY);
    doc.fillColor(GRAY).fontSize(9).font("Helvetica-Bold")
        .text("TO:", 320, topY + 10);
    doc.fillColor(DARK).fontSize(11).font("Helvetica-Bold")
        .text(invoice.client.name, 320, topY + 25);
    if (invoice.client.vatNumber) {
        doc.fillColor(GRAY).fontSize(9).font("Helvetica")
            .text(`VAT: ${invoice.client.vatNumber}`, 320, topY + 43);
    }
    if (invoice.client.address) {
        doc.fillColor(GRAY).fontSize(9)
            .text(invoice.client.address, 320, topY + 57, { width: 210 });
    }

    // ===== INVOICE DETAILS =====
    const detailY = 230;
    doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Invoice Number:", 50, detailY)
        .text("Issue Date:", 50, detailY + 16)
        .text("Due Date:", 50, detailY + 32)
        .text("Status:", 50, detailY + 48);

    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold")
        .text(invoice.invoiceNumber, 160, detailY)
        .text(new Date(invoice.issueDate).toLocaleDateString("en-GB"), 160, detailY + 16)
        .text(invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-GB") : "Upon receipt", 160, detailY + 32)
        .text(invoice.status.toUpperCase(), 160, detailY + 48);

    // ZATCA UUID
    if (invoice.zatcaUuid) {
        doc.fillColor(GRAY).fontSize(8).font("Helvetica")
            .text(`UUID: ${invoice.zatcaUuid}`, 50, detailY + 65, { width: 490 });
    }

    // ===== ITEMS TABLE =====
    const tableTop = 320;
    const tableWidth = 490;

    // Table header
    doc.rect(50, tableTop, tableWidth, 24).fill(PRIMARY);
    doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold")
        .text("Description", 60, tableTop + 8)
        .text("Qty", 320, tableTop + 8, { width: 50, align: "right" })
        .text("Unit Price", 370, tableTop + 8, { width: 70, align: "right" })
        .text("Amount", 440, tableTop + 8, { width: 90, align: "right" });

    // Table rows
    let rowY = tableTop + 24;
    const items = invoice.items || [];

    items.forEach((item: any, index: number) => {
        const bgColor = index % 2 === 0 ? "#ffffff" : LIGHT_GRAY;
        doc.rect(50, rowY, tableWidth, 22).fill(bgColor);

        doc.fillColor(DARK).fontSize(9).font("Helvetica")
            .text(item.description, 60, rowY + 7, { width: 250 })
            .text(Number(item.quantity).toString(), 320, rowY + 7, { width: 50, align: "right" })
            .text(`${Number(item.unitPrice).toFixed(2)} SAR`, 370, rowY + 7, { width: 70, align: "right" })
            .text(`${Number(item.amount).toFixed(2)} SAR`, 440, rowY + 7, { width: 90, align: "right" });

        rowY += 22;
    });

    // ===== TOTALS =====
    const totalY = rowY + 15;

    doc.rect(350, totalY, 190, 22).fill(LIGHT_GRAY);
    doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("Subtotal:", 360, totalY + 7)
        .text(`${Number(invoice.subtotal).toFixed(2)} SAR`, 440, totalY + 7, { width: 90, align: "right" });

    doc.rect(350, totalY + 22, 190, 22).fill(LIGHT_GRAY);
    doc.fillColor(GRAY).fontSize(9).font("Helvetica")
        .text("VAT (15%):", 360, totalY + 29)
        .text(`${Number(invoice.taxTotal).toFixed(2)} SAR`, 440, totalY + 29, { width: 90, align: "right" });

    doc.rect(350, totalY + 44, 190, 26).fill(PRIMARY);
    doc.fillColor("#ffffff").fontSize(11).font("Helvetica-Bold")
        .text("TOTAL:", 360, totalY + 51)
        .text(`${Number(invoice.total).toFixed(2)} SAR`, 440, totalY + 51, { width: 90, align: "right" });

    // ===== QR CODE (if available) =====
    if (invoice.zatcaQr) {
        const qrY = totalY + 85;
        doc.fillColor(GRAY).fontSize(9).font("Helvetica")
            .text("ZATCA QR Code:", 50, qrY);
        doc.fillColor(DARK).fontSize(7).font("Helvetica")
            .text(invoice.zatcaQr, 50, qrY + 14, { width: 250, ellipsis: true });
    }

    // ===== FOOTER =====
    const footerY = doc.page.height - 80;
    doc.rect(0, footerY, doc.page.width, 80).fill(LIGHT_GRAY);

    doc.fillColor(GRAY).fontSize(8).font("Helvetica")
        .text(
            "This is a computer-generated invoice and complies with ZATCA e-invoicing requirements.",
            50, footerY + 15, { align: "center", width: tableWidth }
        )
        .text(
            `Generated on ${new Date().toLocaleDateString("en-GB")} | VatFlow`,
            50, footerY + 30, { align: "center", width: tableWidth }
        );

    // Finalize PDF
    doc.end();
});