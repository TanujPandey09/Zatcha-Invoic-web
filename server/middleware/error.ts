import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/**
 * Global error handler middleware
 * Formats errors consistently across the application
 */
export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation error",
            errors: err.errors.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            })),
        });
    }

    // Custom application errors
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    // Log unexpected errors
    console.error("Unexpected error:", err);

    // Generic error response
    res.status(500).json({
        message: "Internal server error",
    });
}

/**
 * Async handler wrapper to catch promise rejections
 * Usage: asyncHandler(async (req, res) => { ... })
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Custom error classes
 */
export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = "Resource") {
        super(`${resource} not found`, 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, 403);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = "Validation failed") {
        super(message, 400);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Resource conflict") {
        super(message, 409);
    }
}