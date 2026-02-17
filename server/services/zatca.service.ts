import crypto from "crypto";
import { storage } from "../storage";

/**
 * ZATCA (Zakat, Tax and Customs Authority) E-Invoicing Service
 * 
 * Phase 1: Generation Phase (IMPLEMENTED)
 * - Sequential invoice numbering
 * - Standard tax invoice format
 * - Simplified tax invoice format
 * - 15% VAT calculation
 * 
 * Phase 2: Integration Phase (IMPLEMENTATION READY)
 * - Cryptographic stamp generation
 * - QR code generation
 * - Invoice hash and chaining
 * - XML generation (UBL 2.1)
 * - Digital signature
 * - ZATCA API integration
 */

// ZATCA Constants
export const ZATCA_VAT_RATE = 0.15; // 15% VAT in Saudi Arabia

export const ZATCA_INVOICE_TYPES = {
    STANDARD: "0100000", // B2B Standard Tax Invoice
    SIMPLIFIED: "0200000", // B2C Simplified Tax Invoice
    STANDARD_DEBIT: "0100100", // B2B Standard Debit Note
    STANDARD_CREDIT: "0100200", // B2B Standard Credit Note
    SIMPLIFIED_DEBIT: "0200100", // B2C Simplified Debit Note
    SIMPLIFIED_CREDIT: "0200200", // B2C Simplified Credit Note
} as const;

/**
 * Generate UUID for invoice (Phase 2)
 */
export function generateInvoiceUUID(): string {
    return crypto.randomUUID();
}

/**
 * Generate SHA-256 hash of invoice data (Phase 2)
 * Used for invoice integrity and blockchain-like verification
 */
export function generateInvoiceHash(invoiceData: {
    invoiceNumber: string;
    issueDate: string;
    total: number;
    vatAmount: number;
    sellerVAT: string;
    buyerVAT?: string;
}): string {
    // Canonical string for hashing
    const canonicalString = [
        invoiceData.invoiceNumber,
        invoiceData.issueDate,
        invoiceData.total.toFixed(2),
        invoiceData.vatAmount.toFixed(2),
        invoiceData.sellerVAT,
        invoiceData.buyerVAT || "",
    ].join("|");

    return crypto.createHash("sha256").update(canonicalString).digest("hex");
}

export function generateQRCode(invoice: {
    sellerName: string;
    sellerVAT: string;
    issueDate: string;
    total: number;
    vatAmount: number;
}): string {
    // Ensure date is in strict ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) 
    // without milliseconds which can cause validation issues with some ZATCA readers
    const dateStr = invoice.issueDate.includes('.')
        ? invoice.issueDate.split('.')[0] + 'Z'
        : invoice.issueDate;

    // TLV encoding as per ZATCA specifications
    const fields = [
        { tag: 1, value: invoice.sellerName }, // Seller name
        { tag: 2, value: invoice.sellerVAT }, // VAT registration number
        { tag: 3, value: dateStr }, // Invoice date (ISO format)
        { tag: 4, value: invoice.total.toFixed(2) }, // Total with VAT
        { tag: 5, value: invoice.vatAmount.toFixed(2) }, // VAT amount
    ];

    const buffers: Buffer[] = [];

    for (const field of fields) {
        const valueBuffer = Buffer.from(field.value, "utf8");
        const tagBuffer = Buffer.from([field.tag]);
        const lengthBuffer = Buffer.from([valueBuffer.length]);

        buffers.push(tagBuffer, lengthBuffer, valueBuffer);
    }

    // Base64 encode the concatenated buffer
    return Buffer.concat(buffers).toString("base64");
}

/**
 * Generate UBL 2.1 XML invoice (Phase 2)
 * Required format for ZATCA submission
 */
export function generateUBLXML(invoice: {
    uuid: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate?: string;
    invoiceType: string;
    seller: {
        name: string;
        vatNumber: string;
        address: string;
        city: string;
        country: string;
    };
    buyer: {
        name: string;
        vatNumber?: string;
        address?: string;
    };
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        amount: number;
    }>;
    subtotal: number;
    vatAmount: number;
    total: number;
    previousInvoiceHash?: string;
}): string {
    // Simplified UBL 2.1 XML structure
    // In production, use proper XML library like xmlbuilder2

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:UUID>${invoice.uuid}</cbc:UUID>
  <cbc:IssueDate>${invoice.issueDate}</cbc:IssueDate>
  ${invoice.dueDate ? `<cbc:DueDate>${invoice.dueDate}</cbc:DueDate>` : ""}
  <cbc:InvoiceTypeCode name="0100000">${invoice.invoiceType}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  
  <!-- Previous Invoice Hash for Chaining -->
  ${invoice.previousInvoiceHash
            ? `<cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${invoice.previousInvoiceHash}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>`
            : ""
        }
  
  <!-- Seller (Supplier) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="TIN">${invoice.seller.vatNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${invoice.seller.name}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${invoice.seller.address}</cbc:StreetName>
        <cbc:CityName>${invoice.seller.city}</cbc:CityName>
        <cac:Country>
          <cbc:IdentificationCode>${invoice.seller.country}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <!-- Buyer (Customer) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${invoice.buyer.vatNumber
            ? `<cac:PartyIdentification>
        <cbc:ID schemeID="TIN">${invoice.buyer.vatNumber}</cbc:ID>
      </cac:PartyIdentification>`
            : ""
        }
      <cac:PartyName>
        <cbc:Name>${invoice.buyer.name}</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <!-- Invoice Lines -->
  ${invoice.items
            .map(
                (item, index) => `
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SAR">${item.amount.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${item.description}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="SAR">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="SAR">${(item.amount * item.taxRate).toFixed(2)}</cbc:TaxAmount>
    </cac:TaxTotal>
  </cac:InvoiceLine>`
            )
            .join("")}
  
  <!-- Tax Total -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${invoice.vatAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${invoice.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  
  <!-- Monetary Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${invoice.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${invoice.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">${invoice.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
</Invoice>`;

    return xml;
}

/**
 * Generate cryptographic stamp (Digital Signature) for invoice (Phase 2)
 */
export function generateCryptographicStamp(
    invoiceXML: string,
    privateKey: string
): string {
    // In production, use proper RSA/ECDSA signing
    // This is a placeholder implementation

    const sign = crypto.createSign("SHA256");
    sign.update(invoiceXML);
    sign.end();

    // Sign with organization's private key
    const signature = sign.sign(privateKey, "base64");

    return signature;
}

/**
 * Verify cryptographic stamp (Phase 2)
 */
export function verifyCryptographicStamp(
    invoiceXML: string,
    signature: string,
    publicKey: string
): boolean {
    const verify = crypto.createVerify("SHA256");
    verify.update(invoiceXML);
    verify.end();

    return verify.verify(publicKey, signature, "base64");
}

/**
 * Submit invoice to ZATCA platform (Phase 2)
 */
export async function submitToZATCA(
    invoice: any,
    organizationId: number
): Promise<{
    success: boolean;
    clearanceStatus: "CLEARED" | "REJECTED" | "REPORTED";
    zatcaInvoiceId?: string;
    warnings?: string[];
    errors?: string[];
}> {
    // Get organization ZATCA credentials
    const org = await storage.getOrganization(organizationId);

    if (!org?.zatcaUnitId || !org?.zatcaPrivateKey) {
        throw new Error("ZATCA credentials not configured for organization");
    }

    // TODO: Implement actual ZATCA API integration
    // Endpoints:
    // - Production: https://gw-fatoora.zatca.gov.sa/e-invoicing/core/invoices/reporting/single
    // - Sandbox: https://gw-apic-gov.gazt.gov.sa/e-invoicing/developer-portal

    // For now, return mock response
    return {
        success: false,
        clearanceStatus: "REJECTED",
        errors: ["ZATCA API integration not yet implemented"],
    };
}

/**
 * Determine if invoice requires clearance or just reporting
 */
export function requiresClearance(invoice: {
    total: number;
    buyerVAT?: string;
}): boolean {
    // Simplified invoices (B2C) require clearance
    // Standard invoices (B2B) require reporting only

    // If buyer has no VAT number, it's B2C → clearance required
    if (!invoice.buyerVAT) {
        return true;
    }

    // If total less than 1000 SAR → clearance required
    if (invoice.total < 1000) {
        return true;
    }

    // Otherwise, reporting only
    return false;
}

/**
 * Generate invoice counter value (ICV)
 * Sequential counter for invoice chaining
 */
export async function generateICV(organizationId: number): Promise<number> {
    const invoices = await storage.getInvoices(organizationId);
    return invoices.length + 1;
}

/**
 * Complete ZATCA Phase 2 invoice processing
 */
export async function processZATCAInvoice(
    invoiceId: number,
    organizationId: number
) {
    const invoice = await storage.getInvoice(invoiceId);
    const org = await storage.getOrganization(organizationId);

    if (!invoice || !org) {
        throw new Error("Invoice or organization not found");
    }

    const client = await storage.getClientById(invoice.clientId);

    if (!client) {
        throw new Error("Client not found");
    }

    // Step 1: Generate UUID
    const uuid = generateInvoiceUUID();

    // Step 2: Get previous invoice hash for chaining
    const invoices = await storage.getInvoices(organizationId);
    const previousInvoice = invoices
        .filter((inv) => inv.id !== invoiceId)
        .sort((a, b) => b.id - a.id)[0];

    const previousHash = previousInvoice?.zatcaHash || "FIRST_INVOICE";

    // Step 3: Generate invoice hash
    const hash = generateInvoiceHash({
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate.toISOString(),
        total: Number(invoice.total),
        vatAmount: Number(invoice.taxTotal),
        sellerVAT: org.vatNumber || "",
        buyerVAT: client.vatNumber || undefined,
    });

    // Step 4: Generate QR code
    const qrCode = generateQRCode({
        sellerName: org.name,
        sellerVAT: org.vatNumber || "",
        issueDate: invoice.issueDate.toISOString(),
        total: Number(invoice.total),
        vatAmount: Number(invoice.taxTotal),
    });

    // Step 5: Get invoice items
    const items = await storage.getInvoiceItems(invoiceId);

    // Step 6: Generate UBL XML
    const xml = generateUBLXML({
        uuid,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate.toISOString().split("T")[0],
        dueDate: invoice.dueDate?.toISOString().split("T")[0],
        invoiceType: client.vatNumber
            ? ZATCA_INVOICE_TYPES.STANDARD
            : ZATCA_INVOICE_TYPES.SIMPLIFIED,
        seller: {
            name: org.name,
            vatNumber: org.vatNumber || "",
            address: org.address || "",
            city: "Riyadh", // TODO: Get from org
            country: "SA",
        },
        buyer: {
            name: client.name,
            vatNumber: client.vatNumber || undefined,
            address: client.address || undefined,
        },
        items: items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            taxRate: ZATCA_VAT_RATE,
            amount: Number(item.amount),
        })),
        subtotal: Number(invoice.subtotal),
        vatAmount: Number(invoice.taxTotal),
        total: Number(invoice.total),
        previousInvoiceHash: previousHash,
    });

    // Step 7: Update invoice with ZATCA data
    await storage.updateInvoice(invoiceId, {
        zatcaUuid: uuid,
        zatcaHash: hash,
        zatcaPrevHash: previousHash,
        zatcaXml: xml,
    });

    // Step 8: Generate cryptographic stamp (if keys configured)
    // Step 9: Submit to ZATCA (optional, based on invoice type)

    return {
        uuid,
        hash,
        qrCode,
        xml,
        requiresClearance: requiresClearance({
            total: Number(invoice.total),
            buyerVAT: client.vatNumber || undefined,
        }),
    };
}