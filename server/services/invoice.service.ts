import { storage } from "../storage.js";
import { enforceInvoiceLimit } from "./organization.service.js";
import { NotFoundError, ForbiddenError, ValidationError } from "../middleware/error.js";
import {
    generateInvoiceUUID,
    generateInvoiceHash,
    generateQRCode,
    generateUBLXML,
} from "./zatca.service.js";

export async function createInvoice(orgId: number, userId: number, input: any) {
    await enforceInvoiceLimit(orgId);

    const org = await storage.getOrganization(orgId);
    if (!org) {
        console.error("❌ Organization not found:", orgId);
        throw new NotFoundError("Organization");
    }


    // 3. Fetch client for ZATCA data
    const client = await storage.getClientById(input.clientId);
    if (!client) {
        console.error("❌ Client not found:", input.clientId);
        throw new NotFoundError("Client");
    }

    // ✅ FIX: Verify client belongs to this organization
    if (client.organizationId !== orgId) {
        throw new ForbiddenError("Client does not belong to this organization");
    }
    console.log("✅ Client found:", client.name);

    // 4. ✅ FIX: Generate unique invoice number using timestamp to avoid duplicates
    if (!input.invoiceNumber) {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-4);
        const invoices = await storage.getInvoices(orgId);
        const count = invoices.length + 1;
        input.invoiceNumber = `INV-${year}-${String(count).padStart(3, "0")}-${timestamp}`;
    } else {
        // ✅ FIX: Check for duplicate invoice number within the same organization
        const existingInvoices = await storage.getInvoices(orgId);
        const isDuplicate = existingInvoices.some(
            (inv: any) => inv.invoiceNumber === input.invoiceNumber
        );
        if (isDuplicate) {
            const year = new Date().getFullYear();
            const count = existingInvoices.length + 1;
            const timestamp = Date.now().toString().slice(-4);
            input.invoiceNumber = `INV-${year}-${String(count).padStart(3, "0")}-${timestamp}`;
            console.warn("⚠️ Duplicate invoice number detected, generated new:", input.invoiceNumber);
        }
    }


    // 5. Calculate totals
    let subtotal = 0;
    const items = input.items || [];

    if (items.length === 0) {
        throw new ValidationError("At least one item is required");
    }

    items.forEach((item: any) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        item.amount = qty * price;
        subtotal += item.amount;
    });

    const taxTotal = subtotal * 0.15; // 15% VAT
    const total = subtotal + taxTotal;

    console.log("💰 Totals calculated:", { subtotal, taxTotal, total });

    // 6. ✅ FIX: Generate ZATCA compliance data INCLUDING QR code
    console.log("🔐 Generating ZATCA compliance data...");

    const issueDateStr =
        input.issueDate instanceof Date
            ? input.issueDate.toISOString()
            : new Date(input.issueDate || Date.now()).toISOString();

    const zatcaData = generateZATCACompliance(
        {
            ...input,
            issueDate: issueDateStr,
            subtotal,
            taxTotal,
            total,
        },
        org,
        client
    );

    console.log("✅ ZATCA data generated:", {
        uuid: zatcaData.zatcaUuid?.substring(0, 8) + "...",
        hasQR: !!zatcaData.zatcaQr,
        hasXML: !!zatcaData.zatcaXml,
        hasHash: !!zatcaData.zatcaHash,
    });

    // 7. Persist to database
    const enrichedInput = {
        ...input,
        subtotal,
        taxTotal,
        total,
        ...zatcaData,
    };

    const invoice = await storage.createInvoice(orgId, userId, enrichedInput);
    console.log("✅ Invoice saved to database:", invoice.id);

    // ✅ FIX: Return invoice WITH client object attached
    return {
        ...invoice,
        client,
    };
}

export async function getInvoices(orgId: number, status?: string) {
    return storage.getInvoices(orgId, status);
}

export async function getInvoice(id: number, orgId: number) {
    const invoice = await storage.getInvoice(id);

    if (!invoice) {
        throw new NotFoundError("Invoice");
    }

    if (invoice.organizationId !== orgId) {
        throw new ForbiddenError("Access denied");
    }

    return invoice;
}

export async function updateInvoiceStatus(
    id: number,
    status: string,
    userId: number,
    orgId: number
) {
    // Validate ownership first
    await getInvoice(id, orgId);

    // ✅ FIX: updateInvoiceStatus ab client ke saath return karega
    return storage.updateInvoiceStatus(id, status as any, userId);
}

export async function getInvoiceStats(orgId: number) {
    const invoices = await storage.getInvoices(orgId);

    const totalRevenue = invoices
        .filter(
            (inv: any) => inv.status !== "cancelled" && inv.status !== "draft"
        )
        .reduce((sum: number, inv: any) => sum + Number(inv.total), 0);

    const pendingInvoices = invoices.filter(
        (inv: any) => inv.status === "sent"
    ).length;
    const totalCount = invoices.length;

    const vatCollected = invoices
        .filter(
            (inv: any) => inv.status !== "cancelled" && inv.status !== "draft"
        )
        .reduce((sum: number, inv: any) => sum + Number(inv.taxTotal), 0);

    return {
        totalRevenue,
        pendingInvoices,
        totalInvoices: totalCount,
        vatCollected,
    };
}

export async function deleteInvoice(id: number, orgId: number, usrId: number) {
    const invoice = await getInvoice(id, orgId);
    if (invoice.status !== "draft") {
        throw new ValidationError("Only draft invoices can be deleted");
    }

    return storage.deleteInvoice(id, orgId, usrId);
}

export async function updateInvoice(
    id: number,
    orgId: number,
    userId: number,
    input: any
) {
    const invoice = await getInvoice(id, orgId);

    // ✅ Sirf draft invoices edit ho sakti hain
    if (invoice.status !== "draft") {
        throw new ValidationError("Only draft invoices can be edited");
    }

    return storage.updateInvoiceData(id, orgId, userId, input);
}

// ✅ FIX: Generate QR code HERE during creation, not just on fetch
function generateZATCACompliance(input: any, org: any, client: any) {
    try {
        console.log("🔐 [ZATCA] Generating compliance data...");

        const uuid = generateInvoiceUUID();
        console.log("✅ UUID:", uuid.substring(0, 8) + "...");

        const issueDateStr =
            input.issueDate instanceof Date
                ? input.issueDate.toISOString()
                : new Date(input.issueDate || Date.now()).toISOString();

        const hash = generateInvoiceHash({
            invoiceNumber: input.invoiceNumber,
            issueDate: issueDateStr,
            total: Number(input.total),
            vatAmount: Number(input.taxTotal),
            sellerVAT: org.vatNumber || "300000000000003",
            buyerVAT: client.vatNumber || undefined,
        });
        console.log("✅ Hash:", hash.substring(0, 16) + "...");

        // ✅ FIX: Generate QR code during creation so it's stored in DB
        const qrCode = generateQRCode({
            sellerName: org.name || "Unknown Organization",
            sellerVAT: org.vatNumber || "300000000000003",
            issueDate: issueDateStr,
            total: Number(input.total),
            vatAmount: Number(input.taxTotal),
        });
        console.log("✅ QR Code generated, length:", qrCode.length);

        const xml = generateUBLXML({
            uuid,
            invoiceNumber: input.invoiceNumber,
            issueDate: issueDateStr.split("T")[0],
            dueDate: input.dueDate
                ? new Date(input.dueDate).toISOString().split("T")[0]
                : undefined,
            invoiceType: client.vatNumber ? "0100000" : "0200000",
            seller: {
                name: org.name,
                vatNumber: org.vatNumber || "300000000000003",
                address: org.address || "Riyadh",
                city: "Riyadh",
                country: "SA",
            },
            buyer: {
                name: client.name,
                vatNumber: client.vatNumber || undefined,
                address: client.address || undefined,
            },
            items: input.items.map((item: any) => ({
                description: item.description,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                taxRate: 0.15,
                amount: Number(item.amount),
            })),
            subtotal: Number(input.subtotal),
            vatAmount: Number(input.taxTotal),
            total: Number(input.total),
            previousInvoiceHash: "00000000",
        });
        console.log("✅ XML generated, length:", xml.length);

        return {
            zatcaUuid: uuid,
            zatcaHash: hash,
            zatcaPrevHash: "00000000",
            zatcaXml: xml,
            zatcaQr: qrCode, // ✅ FIXED: Now stored in DB
        };
    } catch (error) {
        console.error("❌ [ZATCA] Error:", error);
        return {
            zatcaUuid: null,
            zatcaHash: null,
            zatcaPrevHash: null,
            zatcaXml: null,
            zatcaQr: null,
        };
    }
}

export async function getZATCAData(id: number, orgId: number) {
    console.log("🔍 [ZATCA] Fetching ZATCA data for invoice:", id);

    const invoice = await getInvoice(id, orgId);
    const org = await storage.getOrganization(orgId);

    if (!org) {
        throw new NotFoundError("Organization");
    }

    const dateStr =
        invoice.issueDate instanceof Date
            ? invoice.issueDate.toISOString()
            : String(invoice.issueDate);

    // ✅ Use stored QR if available, otherwise generate fresh
    let qrCode = invoice.zatcaQr;
    if (!qrCode) {
        console.log("⚠️ No stored QR, generating fresh...");
        qrCode = generateQRCode({
            sellerName: org.name || "Unknown Organization",
            sellerVAT: org.vatNumber || "300000000000003",
            issueDate: dateStr,
            total: Number(invoice.total),
            vatAmount: Number(invoice.taxTotal),
        });
    }
    console.log("✅ QR Code ready, length:", qrCode.length);

    return {
        uuid: invoice.zatcaUuid || "Not generated",
        hash: invoice.zatcaHash,
        xml: invoice.zatcaXml,
        qrCode,
        isCompliant: !!invoice.zatcaUuid,
        phase: invoice.zatcaUuid ? "Phase 2 Ready" : "Phase 1",
    };
}