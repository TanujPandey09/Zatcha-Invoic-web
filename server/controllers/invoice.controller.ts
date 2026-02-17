import type { Request, Response } from "express";
import * as invoiceService from "../services/invoice.service";
import { asyncHandler } from "../middleware/error";
import { api } from "../api";

/**
 * List invoices with optional filters
 * GET /api/invoices
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
    const { status, clientId, startDate, endDate } = req.query;

    const invoices = await invoiceService.getInvoices(
        req.dbUser.organizationId,
        status as string
    );

    // Apply filters if any (from query params)
    let filtered = invoices;
    if (clientId) {
        filtered = filtered.filter(inv => inv.clientId === Number(clientId));
    }
    if (startDate) {
        filtered = filtered.filter(inv => new Date(inv.issueDate) >= new Date(startDate as string));
    }
    if (endDate) {
        filtered = filtered.filter(inv => new Date(inv.issueDate) <= new Date(endDate as string));
    }

    res.json(filtered);
});

/**
 * Get single invoice
 * GET /api/invoices/:id
 */
export const get = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.getInvoice(
        Number(req.params.id),
        req.dbUser.organizationId
    );
    res.json(invoice);
});

/**
 * Create invoice
 * POST /api/invoices
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
    console.log("📄 [Invoice] Creating invoice for user:", req.dbUser.id);
    const input = api.invoices.create.input.parse(req.body);

    const invoice = await invoiceService.createInvoice(
        req.dbUser.organizationId,
        req.dbUser.id,
        input
    );


    res.status(201).json(invoice);
});


/**
 * Delete Invoice
 * DELETE /api/invoices/:id
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
    await invoiceService.deleteInvoice(
        Number(req.params.id),
        req.dbUser.organizationId,
        req.dbUser.id
    );
    res.json({ message: "Invoice deleted successfully" });
});


// * PUT /api/invoices/:id
//  */

export const update = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.updateInvoiceStatus(
        Number(req.params.id),
        req.dbUser.organizationId,
        req.dbUser.id,
        req.body

    );
    res.json(invoice)

})


/**
 * Update invoice status
 * PATCH /api/invoices/:id/status
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = api.invoices.updateStatus.input.parse(req.body);

    const invoice = await invoiceService.updateInvoiceStatus(
        Number(req.params.id),
        status,
        req.dbUser.id,
        req.dbUser.organizationId
    );

    res.json(invoice);
});

/**
 * Get invoice statistics
 * GET /api/invoices/stats
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await invoiceService.getInvoiceStats(req.dbUser.organizationId);
    res.json(stats);
});

/**
 * Get ZATCA compliance data (Phase 1 QR, Phase 2 XML/Hash)
 * GET /api/invoices/:id/zatca
 */
export const getZATCAData = asyncHandler(async (req: Request, res: Response) => {
    const data = await invoiceService.getZATCAData(
        Number(req.params.id),
        req.dbUser.organizationId
    );
    res.json(data);
});