import { storage } from "../storage";
import { ForbiddenError, NotFoundError } from "../middleware/error";

export interface OrganizationInput {
    name: string;
    vatNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    logo?: string;
    subscriptionPlan?: "free" | "basic";
}

/**
 * Create or update organization
 * If user doesn't have an org, create one and seed demo data
 * Otherwise, update existing organization
 */
export async function createOrUpdateOrganization(
    userId: number,
    organizationId: number | null,
    input: OrganizationInput
) {
    if (!organizationId) {
        // Create new organization
        const org = await storage.createOrganization(input.name);

        // Link user to organization
        await storage.updateUserOrganization(userId, org.id);

        // Update organization details
        await storage.updateOrganization(org.id, input);

        // Seed demo data for new organizations
        await storage.seedDemoData(userId, org.id);

        return storage.getOrganization(org.id);
    } else {
        // Update existing organization
        return storage.updateOrganization(organizationId, input);
    }
}

/**
 * Get organization statistics including usage
 */
export async function getOrganizationStats(organizationId: number) {
    const stats = await storage.getOrganizationStats(organizationId);
    const org = await storage.getOrganization(organizationId);

    if (!org) {
        throw new NotFoundError("Organization");
    }

    return {
        ...stats,
        usage: {
            current: stats.usage,
            limit: org.subscriptionPlan === "free" ? 10 : null,
            plan: org.subscriptionPlan,
        },
    };
}

/**
 * Check if organization can create more invoices based on plan limits
 * @throws ForbiddenError if limit is reached
 */
export async function enforceInvoiceLimit(organizationId: number) {
    const org = await storage.getOrganization(organizationId);

    if (!org) {
        throw new NotFoundError("Organization");
    }

    // Free plan has 10 invoice limit
    if (org.subscriptionPlan === "free") {
        const stats = await storage.getOrganizationStats(organizationId);

        if (stats.usage >= 10) {
            throw new ForbiddenError(
                "Invoice limit reached. Please upgrade to Basic plan for unlimited invoices."
            );
        }
    }

    // Basic plan has no limits
    return true;
}

/**
 * Upgrade organization to Pro plan
 */
export async function upgradeToProPlan(organizationId: number) {
    const org = await storage.getOrganization(organizationId);

    if (!org) {
        throw new NotFoundError("Organization");
    }

    if (org.subscriptionPlan === "basic") {
        return org; // Already on Basic
    }

    return storage.updateOrganization(organizationId, {
        subscriptionPlan: "basic",
    });
}

/**
 * Get organization by ID
 */
export async function getOrganization(organizationId: number) {
    const org = await storage.getOrganization(organizationId);

    if (!org) {
        throw new NotFoundError("Organization");
    }

    return org;
}