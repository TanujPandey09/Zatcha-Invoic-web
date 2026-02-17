import crypto from "crypto";

/**
 * ZATCA (Zakat, Tax and Customs Authority) Compliance Utilities
 * 
 * Phase 1: Basic Requirements (IMPLEMENTED)
 * - Sequential invoice numbering
 * - VAT calculation (15%)
 * - Tax invoice headers
 * 
 * Phase 2: E-Invoicing Integration (READY TO IMPLEMENT)
 * - UUID generation
 * - Cryptographic hashing
 * - Digital signatures
 * - QR code generation
 * - XML format (UBL 2.1)
 * - Integration with ZATCA platform
 */

export const ZATCA_VAT_RATE = 0.15; // 15% VAT in Saudi Arabia

/**
 * Generate UUID for invoice (Phase 2)
 * Format: RFC 4122 compliant UUID
 */
export function generateInvoiceUUID(): string {
    return crypto.randomUUID();
}

/**
 * Generate SHA-256 hash of invoice data (Phase 2)
 * Used for tamper detection and blockchain-like verification
 */
export function generateInvoiceHash(invoiceData: any): string {
    const dataString = JSON.stringify(invoiceData);
    return crypto.createHash("sha256").update(dataString).digest("hex");
}

/**
 * Generate QR code data for invoice (Phase 2)
 * QR code should contain: Seller name, VAT number, Invoice date, Total, VAT amount
 */
export function generateQRCodeData(invoice: {
    sellerName: string;
    sellerVAT: string;
    date: string;
    total: number;
    vatAmount: number;
}): string {
    // TLV (Tag-Length-Value) encoding as per ZATCA specs
    const fields = [
        { tag: 1, value: invoice.sellerName },
        { tag: 2, value: invoice.sellerVAT },
        { tag: 3, value: invoice.date },
        { tag: 4, value: invoice.total.toFixed(2) },
        { tag: 5, value: invoice.vatAmount.toFixed(2) },
    ];

    let qrString = "";
    for (const field of fields) {
        const valueBytes = Buffer.from(field.value, "utf8");
        qrString += String.fromCharCode(field.tag);
        qrString += String.fromCharCode(valueBytes.length);
        qrString += field.value;
    }

    // Base64 encode
    return Buffer.from(qrString, "binary").toString("base64");
}

/**
 * Generate XML invoice in UBL 2.1 format (Phase 2)
 * This is a placeholder - full implementation requires XML library
 */
export function generateUBLXML(invoice: any): string {
    // TODO: Implement full UBL 2.1 XML generation
    // Libraries to consider: xmlbuilder2, xml-js

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <!-- Full UBL 2.1 implementation needed for Phase 2 -->
  <ID>${invoice.invoiceNumber}</ID>
  <IssueDate>${invoice.issueDate}</IssueDate>
  <InvoiceTypeCode>388</InvoiceTypeCode>
  <!-- Additional fields required by ZATCA -->
</Invoice>`;
}

/**
 * Validate VAT number format (Saudi Arabia)
 * Format: 15 digits, starts with 3
 */
export function validateSaudiVATNumber(vatNumber: string): boolean {
    const regex = /^3\d{14}$/;
    return regex.test(vatNumber);
}

/**
 * Calculate invoice totals with VAT
 */
export function calculateInvoiceTotals(
    subtotal: number,
    vatRate: number = ZATCA_VAT_RATE
) {
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
    };
}

/**
 * Generate invoice reference number (IRN)
 * Sequential number that never resets
 */
export function generateInvoiceReference(
    organizationId: number,
    sequenceNumber: number
): string {
    const year = new Date().getFullYear();
    return `INV-${organizationId}-${year}-${String(sequenceNumber).padStart(
        6,
        "0"
    )}`;
}

/**
 * Verify invoice signature (Phase 2)
 * Placeholder for digital signature verification
 */
export function verifyInvoiceSignature(
    invoice: any,
    signature: string,
    publicKey: string
): boolean {
    // TODO: Implement cryptographic signature verification
    // This will require:
    // 1. Public/Private key pair generation
    // 2. X.509 certificate handling
    // 3. RSA or ECDSA signature verification

    return false; // Placeholder
}

/**
 * Submit invoice to ZATCA platform (Phase 2)
 * Placeholder for API integration
 */
export async function submitToZATCA(invoice: any): Promise<{
    success: boolean;
    clearanceStatus: string;
    zatcaInvoiceId?: string;
    errors?: string[];
}> {
    // TODO: Implement ZATCA API integration
    // Endpoints:
    // - Compliance CSID (Certificate Signing ID)
    // - Production CSID
    // - Invoice reporting
    // - Invoice clearance

    return {
        success: false,
        clearanceStatus: "pending",
        errors: ["ZATCA integration not yet implemented"],
    };
}

/**
 * Check if invoice requires clearance vs reporting
 * B2B invoices: Reporting only
 * B2C invoices: Clearance required
 */
export function requiresClearance(invoice: {
    clientType: "business" | "individual";
    total: number;
}): boolean {
    // Simplified logic - actual ZATCA rules may be more complex
    return invoice.clientType === "individual" || invoice.total < 1000;
}

/**
 * Generate cryptographic stamp for invoice (Phase 2)
 */
export function generateCryptographicStamp(
    invoice: any,
    privateKey: string
): string {
    // TODO: Implement cryptographic stamp generation
    // This involves:
    // 1. Creating a canonical representation of invoice data
    // 2. Signing with organization's private key
    // 3. Base64 encoding the signature

    return ""; // Placeholder
}

/**
 * ZATCA Invoice Types
 */
export const ZATCA_INVOICE_TYPES = {
    STANDARD: "388", // Standard invoice
    SIMPLIFIED: "388", // Simplified tax invoice
    DEBIT_NOTE: "383", // Debit note
    CREDIT_NOTE: "381", // Credit note
} as const;

/**
 * ZATCA Transaction Types
 */
export const ZATCA_TRANSACTION_TYPES = {
    REPORTING: "reporting", // B2B - Report only
    CLEARANCE: "clearance", // B2C - Requires clearance
} as const;