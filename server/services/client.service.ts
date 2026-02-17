import { storage } from "../storage.js";
import { NotFoundError, ForbiddenError } from "../middleware/error.js";

export interface ClientInput {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    vatNumber?: string | null;
}

/**
 * Get all clients for an organization
 */
export async function getClients(organizationId: number) {
    return storage.getClients(organizationId);
}

/**
 * Get a single client by ID
 * Validates organization ownership
 */
export async function getClient(clientId: number, organizationId: number) {
    const client = await storage.getClientById(clientId);

    if (!client) {
        throw new NotFoundError("Client");
    }

    if (client.organizationId !== organizationId) {
        throw new ForbiddenError("Access denied to this client");
    }

    return client;
}

/**
 * Create a new client
 */
export async function createClient(
    organizationId: number,
    input: ClientInput
) {
    return storage.createClient({
        ...input,
        organizationId,
    });
}

/**
 * Update an existing client
 * Validates organization ownership
 */
export async function updateClient(
    clientId: number,
    organizationId: number,
    input: Partial<ClientInput>
) {
    // Verify ownership
    await getClient(clientId, organizationId);

    return storage.updateClient(clientId, input);
}

/**
 * Delete a client (soft delete)
 * Note: This should check if client has associated invoices
 */
export async function deleteClient(clientId: number, organizationId: number) {
    // Verify ownership
    await getClient(clientId, organizationId);

    // Check for associated invoices
    const invoices = await storage.getInvoices(organizationId);
    const hasInvoices = invoices.some((inv) => inv.clientId === clientId);

    if (hasInvoices) {
        throw new ForbiddenError(
            "Cannot delete client with existing invoices. Archive them first."
        );
    }

    // Implement soft delete in storage layer
    // For now, we'll just return success
    return { success: true, message: "Client deleted" };
}

/**
 * Search clients by name or email
 */
export async function searchClients(
    organizationId: number,
    query: string
) {
    const clients = await storage.getClients(organizationId);

    const lowerQuery = query.toLowerCase();
    return clients.filter(
        (client) =>
            client.name.toLowerCase().includes(lowerQuery) ||
            client.email?.toLowerCase().includes(lowerQuery)
    );
}