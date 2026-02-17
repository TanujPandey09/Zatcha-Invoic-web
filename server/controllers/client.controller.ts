import type { Request, Response } from "express";
import * as clientService from "../services/client.service";
import { asyncHandler } from "../middleware/error";
import { api } from "../api";

/**
 * Get all clients
 * GET /api/clients
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
    const clients = await clientService.getClients(req.dbUser.organizationId);
    res.json(clients);
});

/**
 * Get a single client
 * GET /api/clients/:id
 */
export const get = asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.getClient(
        Number(req.params.id),
        req.dbUser.organizationId
    );
    res.json(client);
});

/**
 * Create a new client
 * POST /api/clients
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
    const input = api.clients.create.input.parse(req.body);

    const client = await clientService.createClient(
        req.dbUser.organizationId,
        input
    );

    res.status(201).json(client);
});

/**
 * Update a client
 * PUT /api/clients/:id
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
    const input = api.clients.update.input.parse(req.body);

    const client = await clientService.updateClient(
        Number(req.params.id),
        req.dbUser.organizationId,
        input
    );

    res.json(client);
});

/**
 * Delete a client
 * DELETE /api/clients/:id
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
    const result = await clientService.deleteClient(
        Number(req.params.id),
        req.dbUser.organizationId
    );

    res.json(result);
});

/**
 * Search clients
 * GET /api/clients/search?q=query
 */
export const search = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;

    if (!query) {
        return res.status(400).json({ message: "Search query required" });
    }

    const clients = await clientService.searchClients(
        req.dbUser.organizationId,
        query
    );

    res.json(clients);
});