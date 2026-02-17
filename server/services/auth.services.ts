import bcrypt from "bcrypt";
import { storage } from "../storage.js";
import { ConflictError, UnauthorizedError } from "../middleware/error.js";

export interface RegisterInput {
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

/**
 * Register a new user
 * @throws ConflictError if user already exists
 */
export async function register(input: RegisterInput) {
    const { email, password } = input;

    // Check if user already exists
    const existing = await storage.getUserByEmail(email);
    if (existing) {
        throw new ConflictError("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // Generate username from email part
    const username = email.split("@")[0] + Math.floor(Math.random() * 1000);

    const user = await storage.createUser({
        email,
        password: hashedPassword,
        username,
        role: "admin",
    });

    return user;
}

/**
 * Authenticate user and return user object
 * @throws UnauthorizedError if credentials are invalid
 */
export async function login(input: LoginInput) {
    const { email, password } = input;

    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user || !user.password) {
        throw new UnauthorizedError("Invalid credentials");
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new UnauthorizedError("Invalid credentials");
    }

    return user;
}

/**
 * Get user profile with organization details
 */
export async function getProfile(userId: number) {
    const user = await storage.getUserById(userId);
    if (!user) {
        throw new UnauthorizedError("Invalid session");
    }

    const organization = user.organizationId
        ? await storage.getOrganization(user.organizationId)
        : null;

    return {
        user,
        organization,
    };
}