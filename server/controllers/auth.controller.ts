import type { Request, Response } from "express";
import * as authService from "../services/auth.services.js";
import { asyncHandler } from "../middleware/error.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";


export const register = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.login(req.body);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
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