import type { Request, Response } from "express";
import * as authService from "../services/auth.services";
import { asyncHandler } from "../middleware/error";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);

    // Set session
    (req as any).session.userId = user.id;

    res.json({ user });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.login(req.body);

    // Set session
    (req as any).session.userId = user.id;

    res.json({ user });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
    (req as any).session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const me = asyncHandler(async (req: Request, res: Response) => {
    const profile = await authService.getProfile(req.dbUser.id);
    res.json(profile);
});