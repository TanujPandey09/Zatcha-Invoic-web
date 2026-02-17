import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

declare global {
    namespace Express {
        interface Request {
            dbUser?: any;
        }
    }
}

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.log("🔒 [Auth] No token found");
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await storage.getUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.dbUser = user;
        next();
    } catch {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

export async function requireOrg(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.dbUser?.organizationId) {
        if (req.path === "/api/organization" && req.method === "PUT") {
            return next();
        }
        return res.status(403).json({ message: "No Organization Found." });
    }
    next();
}