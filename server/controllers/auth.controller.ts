import type { Request, Response } from "express";
import * as authService from "../services/auth.services.js";
import { asyncHandler } from "../middleware/error.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);

    (req as any).session.userId = user.id;


    await new Promise<void>((resolve, reject) => {
        (req as any).session.save((err: any) => {
            if (err) reject(err);
            else resolve();
        });
    });

    res.json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.login(req.body);

    (req as any).session.userId = user.id;


    await new Promise<void>((resolve, reject) => {
        (req as any).session.save((err: any) => {
            if (err) reject(err);
            else resolve();
        });
    });

    res.json({ user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    (req as any).session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
    const profile = await authService.getProfile(req.dbUser.id);
    res.json(profile);
});