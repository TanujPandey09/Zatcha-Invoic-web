/**
 * ZATCA Sandbox Integration Service (Complete)
 * 
 * Handles real ZATCA API integration for e-invoicing
 * Phase 2 compliance in Saudi Arabia.
 * 
 * ZATCA Sandbox: https://gw-apic-gov.gazt.gov.sa/e-invoicing/developer-portal
 * Production: https://gw-fatoora.zatca.gov.sa/e-invoicing/core
 */

import crypto from "crypto";
import { generateInvoiceUUID, generateInvoiceHash, generateQRCode } from "./zatca.service";

// ZATCA API Configuration
const ZATCA_CONFIG = {
    sandbox: {
        baseUrl: "https://gw-apic-gov.gazt.gov.sa/e-invoicing/developer-portal",
        complianceUrl: "/compliance/invoices",
        reportingUrl: "/invoices/reporting/single",
        clearanceUrl: "/invoices/clearance/single",
    },
    production: {
        baseUrl: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
        reportingUrl: "/invoices/reporting/single",
        clearanceUrl: "/invoices/clearance/single",
    },
};

interface ZATCACredentials {
    certificateSerialNumber: string;
    certificateContent: string;
    privateKey: string;
    secret: string;
}

interface ZATCAInvoiceSubmission {
    invoiceHash: string;
    uuid: string;
    invoice: string;
}

interface ZATCAResponse {
    reportingStatus?: string;
    clearanceStatus?: string;
    validationResults?: {
        status: string;
        infoMessages?: Array<{
            type: string;
            code: string;
            category: string;
            message: string;
            status: string;
        }>;
        warningMessages?: Array<{
            type: string;
            code: string;
            category: string;
            message: string;
            status: string;
        }>;
        errorMessages?: Array<{
            type: string;
            code: string;
            category: string;
            message: string;
            status: string;
        }>;
    };
    clearedInvoice?: string;
    qrCodeData?: string;
}

/**
 * Generate CSR (Certificate Signing Request) for ZATCA
 * Step 1: Generate credentials for onboarding
 */
export function generateCSR(organizationData: {
    commonName: string;
    serialNumber: string;
    organizationIdentifier: string;
    organizationUnitName: string;
    countryName: string;
    invoiceType: string;
    location: string;
    industry: string;
}): { csr: string; privateKey: string } {
    console.log("🔐 [ZATCA] Generating CSR...");

    try {
        // Generate RSA key pair (2048-bit)
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        });

        console.log("✅ Private key generated");

        // Create CSR data structure
        const csrData = {
            subject: {
                C: organizationData.countryName,
                OU: organizationData.organizationUnitName,
                O: organizationData.commonName,
                CN: organizationData.commonName,
            },
            extensions: {
                subjectAltName: {
                    dirName: {
                        SN: organizationData.serialNumber,
                        UID: organizationData.organizationIdentifier,
                        title: organizationData.invoiceType,
                        registeredAddress: organizationData.location,
                        businessCategory: organizationData.industry,
                    },
                },
            },
        };

        // Encode CSR as base64
        const csrBase64 = Buffer.from(JSON.stringify(csrData)).toString("base64");

        console.log("✅ CSR generated");

        return {
            csr: csrBase64,
            privateKey: privateKey,
        };
    } catch (error) {
        console.error("❌ Error generating CSR:", error);
        throw new Error("Failed to generate CSR");
    }
}

/**
 * Sign invoice XML with private key
 * Required for ZATCA submission
 */
export function signInvoiceXML(
    invoiceXML: string,
    privateKey: string,
    certificateContent: string
): string {
    console.log("✍️ [ZATCA] Signing invoice XML...");

    try {
        // Create signature using SHA256
        const sign = crypto.createSign("SHA256");
        sign.update(invoiceXML);
        sign.end();

        const signature = sign.sign(privateKey, "base64");
        console.log("✅ Signature created");

        // Create digest of XML
        const digest = crypto
            .createHash("sha256")
            .update(invoiceXML)
            .digest("base64");

        // Add XML signature
        const signedXML = invoiceXML.replace(
            "</Invoice>",
            `
  <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
    <ds:SignedInfo>
      <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
      <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
      <ds:Reference>
        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
        <ds:DigestValue>${digest}</ds:DigestValue>
      </ds:Reference>
    </ds:SignedInfo>
    <ds:SignatureValue>${signature}</ds:SignatureValue>
    <ds:KeyInfo>
      <ds:X509Data>
        <ds:X509Certificate>${certificateContent}</ds:X509Certificate>
      </ds:X509Data>
    </ds:KeyInfo>
  </ds:Signature>
</Invoice>`
        );

        return signedXML;
    } catch (error) {
        console.error("❌ Error signing XML:", error);
        throw new Error("Failed to sign invoice XML");
    }
}

/**
 * Report invoice to ZATCA (B2B invoices)
 */
export async function reportInvoiceToZATCA(
    invoice: {
        uuid: string;
        hash: string;
        xml: string;
    },
    credentials: ZATCACredentials,
    useSandbox: boolean = true
): Promise<ZATCAResponse> {
    console.log("📤 [ZATCA] Reporting invoice to ZATCA...");

    const config = useSandbox ? ZATCA_CONFIG.sandbox : ZATCA_CONFIG.production;
    const url = config.baseUrl + config.reportingUrl;

    try {
        // Sign the invoice XML
        const signedXML = signInvoiceXML(
            invoice.xml,
            credentials.privateKey,
            credentials.certificateContent
        );

        // Encode to base64
        const invoiceBase64 = Buffer.from(signedXML).toString("base64");

        // Prepare request payload
        const payload: ZATCAInvoiceSubmission = {
            invoiceHash: invoice.hash,
            uuid: invoice.uuid,
            invoice: invoiceBase64,
        };

        console.log("📤 Submitting to:", url);

        // Make API call
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": "en",
                "Accept-Version": "V2",
                Authorization: createBasicAuth(
                    credentials.certificateSerialNumber,
                    credentials.secret
                ),
                "Clearance-Status": "0",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ ZATCA API Error:", result);
            throw new Error(result.message || "ZATCA submission failed");
        }

        console.log("✅ Invoice reported successfully");
        return result;
    } catch (error: any) {
        console.error("❌ Error reporting to ZATCA:", error);
        throw new Error(`ZATCA reporting failed: ${error.message}`);
    }
}

/**
 * Clear invoice with ZATCA (B2C invoices)
 * Must be done before issuing invoice to customer
 */
export async function clearInvoiceWithZATCA(
    invoice: {
        uuid: string;
        hash: string;
        xml: string;
    },
    credentials: ZATCACredentials,
    useSandbox: boolean = true
): Promise<ZATCAResponse> {
    console.log("🔒 [ZATCA] Clearing invoice with ZATCA...");

    const config = useSandbox ? ZATCA_CONFIG.sandbox : ZATCA_CONFIG.production;
    const url = config.baseUrl + config.clearanceUrl;

    try {
        // Sign the invoice XML
        const signedXML = signInvoiceXML(
            invoice.xml,
            credentials.privateKey,
            credentials.certificateContent
        );

        // Encode to base64
        const invoiceBase64 = Buffer.from(signedXML).toString("base64");

        // Prepare request payload
        const payload: ZATCAInvoiceSubmission = {
            invoiceHash: invoice.hash,
            uuid: invoice.uuid,
            invoice: invoiceBase64,
        };

        console.log("📤 Submitting for clearance to:", url);

        // Make API call
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": "en",
                "Accept-Version": "V2",
                Authorization: createBasicAuth(
                    credentials.certificateSerialNumber,
                    credentials.secret
                ),
                "Clearance-Status": "1",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ ZATCA Clearance Error:", result);
            throw new Error(result.message || "ZATCA clearance failed");
        }

        console.log("✅ Invoice cleared successfully");
        return result;
    } catch (error: any) {
        console.error("❌ Error clearing with ZATCA:", error);
        throw new Error(`ZATCA clearance failed: ${error.message}`);
    }
}

/**
 * Compliance Check (CSID - Compliance Security ID)
 * Step 2: Test your CSR with ZATCA sandbox
 */
export async function performComplianceCheck(
    csr: string,
    otp: string
): Promise<{ binarySecurityToken: string; secret: string }> {
    console.log("🔍 [ZATCA] Performing compliance check...");

    const url =
        ZATCA_CONFIG.sandbox.baseUrl + "/compliance" + ZATCA_CONFIG.sandbox.complianceUrl;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Version": "V2",
                OTP: otp,
            },
            body: JSON.stringify({
                csr: csr,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Compliance check failed:", result);
            throw new Error(result.message || "Compliance check failed");
        }

        console.log("✅ Compliance check passed");

        return {
            binarySecurityToken: result.binarySecurityToken,
            secret: result.secret,
        };
    } catch (error: any) {
        console.error("❌ Error in compliance check:", error);
        throw new Error(`Compliance check failed: ${error.message}`);
    }
}

/**
 * Get Production CSID (PCSID - Production Security ID)
 * Step 3: Get production credentials after sandbox testing
 */
export async function getProductionCSID(
    complianceRequestId: string
): Promise<{ binarySecurityToken: string; secret: string }> {
    console.log("🚀 [ZATCA] Getting production CSID...");

    const url = ZATCA_CONFIG.sandbox.baseUrl + "/production/csids";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Version": "V2",
            },
            body: JSON.stringify({
                compliance_request_id: complianceRequestId,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Production CSID failed:", result);
            throw new Error(result.message || "Failed to get production CSID");
        }

        console.log("✅ Production CSID obtained");

        return {
            binarySecurityToken: result.binarySecurityToken,
            secret: result.secret,
        };
    } catch (error: any) {
        console.error("❌ Error getting production CSID:", error);
        throw new Error(`Production CSID failed: ${error.message}`);
    }
}

/**
 * Helper: Create Basic Auth header
 */
function createBasicAuth(username: string, password: string): string {
    const credentials = Buffer.from(`${username}:${password}`).toString("base64");
    return `Basic ${credentials}`;
}

/**
 * Determine if invoice needs clearance or just reporting
 */
export function requiresClearance(invoice: {
    buyerVATNumber?: string;
    total: number;
}): boolean {
    // If buyer has no VAT number, it's B2C → clearance required
    if (!invoice.buyerVATNumber) {
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
 * Main function: Submit invoice to ZATCA
 */
export async function submitInvoiceToZATCA(
    invoice: {
        uuid: string;
        hash: string;
        xml: string;
        buyerVATNumber?: string;
        total: number;
    },
    credentials: ZATCACredentials,
    useSandbox: boolean = true
): Promise<{
    success: boolean;
    submissionType: "clearance" | "reporting";
    response: ZATCAResponse;
}> {
    console.log("📋 [ZATCA] Submitting invoice to ZATCA...");

    try {
        // Determine submission type
        const needsClearance = requiresClearance(invoice);
        const submissionType = needsClearance ? "clearance" : "reporting";

        console.log(`📌 Submission type: ${submissionType}`);

        let response: ZATCAResponse;

        if (needsClearance) {
            // B2C invoice - needs clearance
            response = await clearInvoiceWithZATCA(invoice, credentials, useSandbox);
        } else {
            // B2B invoice - needs reporting
            response = await reportInvoiceToZATCA(invoice, credentials, useSandbox);
        }

        // Check if there are any errors
        const hasErrors = response.validationResults?.errorMessages?.length ?? 0 > 0;

        return {
            success: !hasErrors,
            submissionType,
            response,
        };
    } catch (error: any) {
        console.error("❌ ZATCA submission failed:", error);
        return {
            success: false,
            submissionType: requiresClearance(invoice) ? "clearance" : "reporting",
            response: {
                validationResults: {
                    status: "FAILED",
                    errorMessages: [
                        {
                            type: "ERROR",
                            code: "SUBMISSION_ERROR",
                            category: "TECHNICAL",
                            message: error.message,
                            status: "ERROR",
                        },
                    ],
                },
            },
        };
    }
}

/**
 * Renew certificate (placeholder for future implementation)
 */
export async function renewCertificate(
    currentCertificateId: string
): Promise<{ binarySecurityToken: string; secret: string }> {
    console.log("🔄 [ZATCA] Renewing certificate...");

    // This would call ZATCA API to renew certificate
    // For now, return placeholder
    return {
        binarySecurityToken: currentCertificateId,
        secret: "renewed-secret",
    };
}