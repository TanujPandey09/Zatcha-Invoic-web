import type { Request, Response } from "express";
import * as auditService from "../services/audit.service";
import { asyncHandler } from "../middleware/error";

/**
 * Get audit logs with optional filters
 * GET /api/audit?action=create&entityType=invoice&startDate=2024-01-01
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
        action: req.query.action as string,
        entityType: req.query.entityType as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
    };

    const logs = await auditService.getAuditLogs(
        req.dbUser.organizationId,
        filters
    );

    res.json(logs);
});

/**
 * Get audit history for a specific entity
 * GET /api/audit/:entityType/:entityId
 */
export const getEntityHistory = asyncHandler(
    async (req: Request, res: Response) => {
        const { entityType, entityId } = req.params;

        const history = await auditService.getEntityAuditHistory(
            req.dbUser.organizationId,
            entityType as string,
            Number(entityId)
        );

        res.json(history);
    }
);

/**
 * Get user activity summary
 * GET /api/audit/user/:userId?days=30
 */
export const getUserActivity = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = Number(req.params.userId);
        const days = req.query.days ? Number(req.query.days) : 30;

        const activity = await auditService.getUserActivity(
            req.dbUser.organizationId,
            userId,
            days
        );

        res.json(activity);
    }
);