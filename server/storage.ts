import {
  users,
  organizations,
  clients,
  invoices,
  invoiceItems,
  auditLogs,
  type User,
  type Organization,
  type Client,
  type Invoice,
  type InvoiceItem,
  type AuditLog,
  type InsertUser,
  type InsertInvoice,
} from "./schema.js";

export type CreateInvoiceData = InsertInvoice & {
  zatcaUuid?: string;
  zatcaHash?: string;
  zatcaPrevHash?: string;
  zatcaXml?: string;
  zatcaQr?: string;
};

import { db } from "./db.js";
import { eq, and, sql, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByMicrosoftId(microsoftId: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  // Organization
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(name: string): Promise<Organization>;
  updateOrganization(id: number, data: Partial<Organization>): Promise<Organization>;
  updateUserOrganization(userId: number, orgId: number): Promise<User>;
  getOrganizationStats(id: number): Promise<any>;

  // Clients
  getClients(orgId: number): Promise<Client[]>;
  createClient(data: any): Promise<Client>;
  updateClient(id: number, data: any): Promise<Client>;

  // Invoices
  getInvoices(orgId: number, status?: string): Promise<(Invoice & { client: Client })[]>;
  getInvoice(id: number): Promise<(Invoice & { client: Client; items: InvoiceItem[] }) | undefined>;
  createInvoice(orgId: number, userId: number, data: CreateInvoiceData): Promise<Invoice & { client: Client }>;
  updateInvoiceStatus(id: number, status: string, userId: number): Promise<Invoice & { client: Client }>;
  updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice>;

  // Helpers
  getClientById(id: number): Promise<Client | undefined>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;

  // Audit
  createAuditLog(data: any): Promise<void>;
  getAuditLogs(orgId: number): Promise<AuditLog[]>;

  // Demo
  seedDemoData(userId: number, orgId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {

  // ================= USERS =================

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByMicrosoftId(microsoftId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.microsoftId, microsoftId));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // ================= ORGANIZATION =================

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async createOrganization(name: string): Promise<Organization> {
    const [org] = await db.insert(organizations).values({ name }).returning();
    return org;
  }

  async updateOrganization(id: number, data: Partial<Organization>): Promise<Organization> {
    const [org] = await db
      .update(organizations)
      .set(data)
      .where(eq(organizations.id, id))
      .returning();
    return org;
  }

  async updateUserOrganization(userId: number, orgId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ organizationId: orgId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // ================= CLIENTS =================

  async getClients(orgId: number): Promise<Client[]> {
    return db.select().from(clients).where(eq(clients.organizationId, orgId));
  }

  async createClient(data: any): Promise<Client> {
    const [client] = await db.insert(clients).values(data).returning();
    return client;
  }

  async updateClient(id: number, data: any): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set(data)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async getClientById(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  // ================= INVOICES =================

  async getInvoices(orgId: number, status?: string): Promise<(Invoice & { client: Client })[]> {
    const query = db
      .select({ invoice: invoices, client: clients })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(
        status
          ? and(eq(invoices.organizationId, orgId), eq(invoices.status, status as any))
          : eq(invoices.organizationId, orgId)
      )
      .orderBy(desc(invoices.issueDate));

    const results = await query;
    return results.map(r => ({ ...r.invoice, client: r.client }));
  }

  async getInvoice(id: number) {
    const [invoiceData] = await db
      .select({ invoice: invoices, client: clients })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.id, id));

    if (!invoiceData) return undefined;

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    return { ...invoiceData.invoice, client: invoiceData.client, items };
  }

  async createInvoice(
    orgId: number,
    userId: number,
    data: CreateInvoiceData
  ): Promise<Invoice & { client: Client }> {
    return db.transaction(async (tx) => {

      const itemsData = data.items || [];
      const subtotal = itemsData.reduce((acc, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        return acc + qty * price;
      }, 0);
      const taxTotal = subtotal * 0.15;
      const total = subtotal + taxTotal;

      const [invoice] = await tx
        .insert(invoices)
        .values({
          organizationId: orgId,
          clientId: data.clientId,
          invoiceNumber: data.invoiceNumber ?? `INV-${Date.now()}`,
          issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          status: data.status || "draft",
          subtotal: subtotal.toString(),
          taxTotal: taxTotal.toString(),
          total: total.toString(),
          zatcaUuid: data.zatcaUuid || randomUUID(),
          zatcaHash: data.zatcaHash,
          zatcaPrevHash: data.zatcaPrevHash,
          zatcaXml: data.zatcaXml,
          zatcaQr: data.zatcaQr ?? null,
        })
        .returning();

      console.log("✅ Invoice inserted with ID:", invoice.id);

      if (itemsData.length > 0) {
        await tx.insert(invoiceItems).values(
          itemsData.map((item) => ({
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
            amount: (Number(item.quantity) * Number(item.unitPrice)).toString(),
          }))
        );
        console.log("✅ Inserted", itemsData.length, "invoice items");
      }

      await tx.insert(auditLogs).values({
        organizationId: orgId,
        userId,
        action: "create",
        entity: "invoice",
        entityId: String(invoice.id),
        details: `Created invoice ${invoice.invoiceNumber}`,
      });

      console.log("✅ Audit log created");


      const [clientData] = await tx
        .select()
        .from(clients)
        .where(eq(clients.id, data.clientId));

      console.log("✅ Client fetched:", clientData?.name);

      return { ...invoice, client: clientData };
    });
  }

  async updateInvoiceStatus(
    id: number,
    status: string,
    userId: number
  ): Promise<Invoice & { client: Client }> {
    return db.transaction(async (tx) => {
      const [invoice] = await tx
        .update(invoices)
        .set({ status: status as any })
        .where(eq(invoices.id, id))
        .returning();

      await tx.insert(auditLogs).values({
        organizationId: invoice.organizationId,
        userId,
        action: "status_change",
        entity: "invoice",
        entityId: String(invoice.id),
        details: `Updated status to ${status}`,
      });

      // ✅ FIX: Client fetch karo same transaction mein
      const [clientData] = await tx
        .select()
        .from(clients)
        .where(eq(clients.id, invoice.clientId));

      console.log("✅ Status updated, client fetched:", clientData?.name);

      return { ...invoice, client: clientData };
    });
  }

  async updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set(data as any)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async deleteInvoice(id: number, orgId: number, userId: number): Promise<void> {
    return db.transaction(async (tx) => {

      await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));


      await tx.delete(invoices).where(
        and(eq(invoices.id, id), eq(invoices.organizationId, orgId))
      );


      await tx.insert(auditLogs).values({
        organizationId: orgId,
        userId,
        action: "delete",
        entity: "invoice",
        entityId: String(id),
        details: `Deleted invoice #${id}`,
      });
    });
  }


  async updateInvoiceData(
    id: number,
    orgId: number,
    userId: number,
    data: any
  ): Promise<Invoice & { client: Client }> {
    return db.transaction(async (tx) => {
      const items = data.items || [];
      const subtotal = items.reduce((acc: number, item: any) => {
        return acc + (Number(item.quantity) * Number(item.unitPrice));
      }, 0);
      const taxTotal = subtotal * 0.15;
      const total = subtotal + taxTotal;


      const [invoice] = await tx
        .update(invoices)
        .set({
          clientId: data.clientId,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          subtotal: subtotal.toString(),
          taxTotal: taxTotal.toString(),
          total: total.toString(),
        })
        .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)))
        .returning();


      await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      if (items.length > 0) {
        await tx.insert(invoiceItems).values(
          items.map((item: any) => ({
            invoiceId: id,
            description: item.description,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
            amount: (Number(item.quantity) * Number(item.unitPrice)).toString(),
          }))
        );
      }


      await tx.insert(auditLogs).values({
        organizationId: orgId,
        userId,
        action: "update",
        entity: "invoice",
        entityId: String(id),
        details: `Updated invoice ${invoice.invoiceNumber}`,
      });


      const [clientData] = await tx
        .select()
        .from(clients)
        .where(eq(clients.id, invoice.clientId));

      return { ...invoice, client: clientData };
    });
  }

  // ================= STATS =================

  async getOrganizationStats(orgId: number) {
    const [totalInvoices] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.organizationId, orgId));

    return {
      usage: Number(totalInvoices?.count || 0),
    };
  }

  // ================= AUDIT =================

  async createAuditLog(data: any): Promise<void> {
    await db.insert(auditLogs).values(data);
  }

  async getAuditLogs(orgId: number): Promise<AuditLog[]> {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.organizationId, orgId))
      .orderBy(desc(auditLogs.createdAt));
  }

  // ================= DEMO =================

  async seedDemoData(userId: number, orgId: number) {
    const [existing] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(eq(clients.organizationId, orgId));

    if (Number(existing?.count) > 0) return;

    const [client] = await db
      .insert(clients)
      .values({
        organizationId: orgId,
        name: "Acme Corp",
        email: "billing@acme.com",
      })
      .returning();

    await this.createInvoice(orgId, userId, {
      clientId: client.id,
      invoiceNumber: "INV-001",
      issueDate: new Date(),
      status: "paid",
      items: [{ description: "Consulting", quantity: 5, unitPrice: 500 }],
    });
  }
}

export const storage = new DatabaseStorage();