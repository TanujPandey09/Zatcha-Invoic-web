import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage.js";

// Extend Express Request type to include custom properties
declare global {
    namespace Express {
        interface Request {
            dbUser?: any;
        }
    }
}

/**
 * Middleware to ensure user is authenticated
 * Checks session and loads user from database
 */
export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!(req as any).session.userId) {
        console.log("🔒 [Auth] No session userId found");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUserById((req as any).session.userId);
    if (!user) {
        console.log(`🔒 [Auth] User not found for ID: ${(req as any).session.userId}`);
        return res.status(401).json({ message: "Invalid session" });
    }

    req.dbUser = user;
    next();
}

/**
 * Middleware to ensure user has an organization
 * Must be used after requireAuth
 * Allows organization creation endpoint to pass through
 */
export async function requireOrg(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.dbUser?.organizationId) {
        // Allow organization creation endpoint
        if (req.path === "/api/organization" && req.method === "PUT") {
            return next();
        }
        console.log(`🚫 [Org] User ${req.dbUser?.id} has no organizationId`);
        return res.status(403).json({ message: "No Organization Found." });
    }
    next();
}