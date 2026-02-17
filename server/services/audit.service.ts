import { storage } from "../storage.js";

export interface AuditLogFilters {
    action?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
}

/**
 * Get audit logs for an organization with optional filters
 */
export async function getAuditLogs(
    organizationId: number,
    filters?: AuditLogFilters
) {
    const logs = await storage.getAuditLogs(organizationId);

    let filtered = logs;

    if (filters?.action) {
        filtered = filtered.filter((log) => log.action === filters.action);
    }

    if (filters?.entity) {
        filtered = filtered.filter((log) => log.entity === filters.entity);
    }

    if (filters?.startDate) {
        const start = new Date(filters.startDate);
        filtered = filtered.filter((log) => log.createdAt && new Date(log.createdAt) >= start);
    }

    if (filters?.endDate) {
        const end = new Date(filters.endDate);
        filtered = filtered.filter((log) => log.createdAt && new Date(log.createdAt) <= end);
    }

    return filtered;
}

/**
 * Create an audit log entry
 * This should be called whenever significant actions occur
 */
export async function createAuditLog(
    organizationId: number,
    userId: number,
    action: string,
    entity: string,
    entityId: number,
    details?: any
) {
    return storage.createAuditLog({
        organizationId,
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
    });
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditHistory(
    organizationId: number,
    entity: string,
    entityId: number
) {
    const logs = await storage.getAuditLogs(organizationId);

    return logs.filter(
        (log) => log.entity === entity && log.entityId === String(entityId)
    );
}

/**
 * Get user activity summary
 */
export async function getUserActivity(
    organizationId: number,
    userId: number,
    days: number = 30
) {
    const logs = await storage.getAuditLogs(organizationId);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const userLogs = logs.filter(
        (log) => log.userId === userId && log.createdAt && new Date(log.createdAt) >= since
    );

    const actionCounts: Record<string, number> = {};
    userLogs.forEach((log) => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    return {
        totalActions: userLogs.length,
        actionBreakdown: actionCounts,
        recentActions: userLogs.slice(0, 10),
    };
}