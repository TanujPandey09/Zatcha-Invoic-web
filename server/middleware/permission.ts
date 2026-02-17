/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Implements permission checking for different user roles
 */

import type { Request, Response, NextFunction } from "express";

// Define roles and their permissions
export enum UserRole {
    ADMIN = "admin",
    ACCOUNTANT = "accountant",
    STAFF = "staff",
    VIEWER = "viewer",
}

// Define permissions
export enum Permission {
    // Organization
    MANAGE_ORGANIZATION = "manage_organization",
    VIEW_ORGANIZATION = "view_organization",

    // Users & Team
    MANAGE_USERS = "manage_users",
    VIEW_USERS = "view_users",

    // Clients
    CREATE_CLIENT = "create_client",
    EDIT_CLIENT = "edit_client",
    DELETE_CLIENT = "delete_client",
    VIEW_CLIENT = "view_client",

    // Invoices
    CREATE_INVOICE = "create_invoice",
    EDIT_INVOICE = "edit_invoice",
    DELETE_INVOICE = "delete_invoice",
    VIEW_INVOICE = "view_invoice",
    SEND_INVOICE = "send_invoice",
    MARK_PAID = "mark_paid",

    // Reports
    VIEW_REPORTS = "view_reports",
    EXPORT_REPORTS = "export_reports",

    // ZATCA
    MANAGE_ZATCA = "manage_zatca",
    SUBMIT_ZATCA = "submit_zatca",
    VIEW_ZATCA = "view_zatca",

    // Settings
    MANAGE_SETTINGS = "manage_settings",
    VIEW_SETTINGS = "view_settings",
}

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
        // Admin has ALL permissions
        Permission.MANAGE_ORGANIZATION,
        Permission.VIEW_ORGANIZATION,
        Permission.MANAGE_USERS,
        Permission.VIEW_USERS,
        Permission.CREATE_CLIENT,
        Permission.EDIT_CLIENT,
        Permission.DELETE_CLIENT,
        Permission.VIEW_CLIENT,
        Permission.CREATE_INVOICE,
        Permission.EDIT_INVOICE,
        Permission.DELETE_INVOICE,
        Permission.VIEW_INVOICE,
        Permission.SEND_INVOICE,
        Permission.MARK_PAID,
        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.MANAGE_ZATCA,
        Permission.SUBMIT_ZATCA,
        Permission.VIEW_ZATCA,
        Permission.MANAGE_SETTINGS,
        Permission.VIEW_SETTINGS,
    ],

    [UserRole.ACCOUNTANT]: [
        // Can manage invoices, clients, and reports
        Permission.VIEW_ORGANIZATION,
        Permission.VIEW_USERS,
        Permission.CREATE_CLIENT,
        Permission.EDIT_CLIENT,
        Permission.VIEW_CLIENT,
        Permission.CREATE_INVOICE,
        Permission.EDIT_INVOICE,
        Permission.VIEW_INVOICE,
        Permission.SEND_INVOICE,
        Permission.MARK_PAID,
        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.SUBMIT_ZATCA,
        Permission.VIEW_ZATCA,
        Permission.VIEW_SETTINGS,
    ],

    [UserRole.STAFF]: [
        // Can create and view invoices and clients
        Permission.VIEW_ORGANIZATION,
        Permission.CREATE_CLIENT,
        Permission.VIEW_CLIENT,
        Permission.CREATE_INVOICE,
        Permission.VIEW_INVOICE,
        Permission.SEND_INVOICE,
        Permission.VIEW_REPORTS,
        Permission.VIEW_ZATCA,
        Permission.VIEW_SETTINGS,
    ],

    [UserRole.VIEWER]: [
        // Read-only access
        Permission.VIEW_ORGANIZATION,
        Permission.VIEW_CLIENT,
        Permission.VIEW_INVOICE,
        Permission.VIEW_REPORTS,
        Permission.VIEW_ZATCA,
        Permission.VIEW_SETTINGS,
    ],
};

/**
 * Check if user has permission
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
    const role = userRole as UserRole;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
    userRole: string,
    permissions: Permission[]
): boolean {
    return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
    userRole: string,
    permissions: Permission[]
): boolean {
    return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Middleware: Require specific permission
 */
export function requirePermission(...permissions: Permission[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.dbUser;

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        // Check if user has ALL required permissions
        const hasAccess = hasAllPermissions(user.role, permissions);

        if (!hasAccess) {
            return res.status(403).json({
                message: "Forbidden: Insufficient permissions",
                required: permissions,
                userRole: user.role,
            });
        }

        next();
    };
}

/**
 * Middleware: Require specific role
 */
export function requireRole(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.dbUser;

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!roles.includes(user.role as UserRole)) {
            return res.status(403).json({
                message: "Forbidden: Insufficient role",
                required: roles,
                userRole: user.role,
            });
        }

        next();
    };
}

/**
 * Middleware: Require admin role
 */
export function requireAdmin() {
    return requireRole(UserRole.ADMIN);
}

/**
 * Helper: Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Helper: Get user's permissions
 */
export function getUserPermissions(user: any): Permission[] {
    return getRolePermissions(user.role as UserRole);
}