import type { Request, Response } from "express";
import * as organizationService from "../services/organization.service";
import { asyncHandler } from "../middleware/error";
import { api } from "../api";

/**
 * Create or update organization
 * PUT /api/organization
 */
export const createOrUpdate = asyncHandler(
    async (req: Request, res: Response) => {
        const input = api.organizations.update.input.parse(req.body);

        const organization = await organizationService.createOrUpdateOrganization(
            req.dbUser.id,
            req.dbUser.organizationId,
            input
        );

        res.json(organization);
    }
);

/**
 * Get organization statistics
 * GET /api/organization/stats
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await organizationService.getOrganizationStats(
        req.dbUser.organizationId
    );

    res.json(stats);
});

/**
 * Get organization details
 * GET /api/organization
 */
export const get = asyncHandler(async (req: Request, res: Response) => {
    const organization = await organizationService.getOrganization(
        req.dbUser.organizationId
    );

    res.json(organization);
});

/**
 * Upgrade to Pro plan
 * POST /api/organization/upgrade
 */
export const upgrade = asyncHandler(async (req: Request, res: Response) => {
    const organization = await organizationService.upgradeToProPlan(
        req.dbUser.organizationId
    );

    res.json(organization);
});