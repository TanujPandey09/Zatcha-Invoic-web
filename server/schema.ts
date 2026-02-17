import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRole = pgEnum("user_role", ["admin", "member"]);
export const subscriptionPlan = pgEnum("subscription_plan", ["free", "basic"]);
export const invoiceStatus = pgEnum("invoice_status", ["draft", "submitted", "sent", "paid", "cancelled", "overdue"]);
export const auditAction = pgEnum("audit_action", ["create", "update", "delete", "status_change", "login"]);

// Organizations (Tenants)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  vatNumber: text("vat_number"),
  address: text("address"),
  logoUrl: text("logo_url"), // Added logo URL
  subscriptionPlan: subscriptionPlan("subscription_plan").default("free").notNull(),
  // ZATCA Phase 2 Placeholders
  zatcaUnitId: text("zatca_unit_id"),
  zatcaPrivateKey: text("zatca_private_key"),
  zatcaSecret: text("zatca_secret"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
  microsoftId: text("microsoft_id").unique(),
  appleId: text("apple_id").unique(),
  avatarUrl: text("avatar_url"),
  organizationId: integer("organization_id").references(() => organizations.id),
  role: userRole("role").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clients
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  email: text("email"),
  vatNumber: text("vat_number"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  clientId: integer("client_id").notNull().references(() => clients.id),
  invoiceNumber: text("invoice_number").notNull(),
  status: invoiceStatus("status").default("draft").notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).notNull(), // 15% VAT
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  // ZATCA Phase 2 Fields
  zatcaUuid: text("zatca_uuid"),
  zatcaHash: text("zatca_hash"),
  zatcaPrevHash: text("zatca_prev_hash"),
  zatcaXml: text("zatca_xml"),
  zatcaQr: text("zatca_qr"),
  zatcaStatus: text("zatca_status"),

  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice Items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  userId: integer("user_id").references(() => users.id),
  action: auditAction("action").notNull(),
  entity: text("entity").notNull(), // e.g., "invoice", "client"
  entityId: text("entity_id").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  invoices: many(invoices),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  auditLogs: many(auditLogs),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [invoices.organizationId],
    references: [organizations.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, organizationId: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  organizationId: true,
  zatcaUuid: true,
  zatcaHash: true,
  zatcaPrevHash: true,
  zatcaXml: true,
  zatcaQr: true,
  subtotal: true,
  taxTotal: true,
  total: true,
}).extend({
  issueDate: z.string().transform(v => new Date(v)).or(z.date()).optional(),
  dueDate: z.string().transform(v => new Date(v)).or(z.date()).nullable().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().or(z.string().transform(v => Number(v))),
    unitPrice: z.number().or(z.string().transform(v => Number(v))),
    invoiceNumber: z.string().optional(),
  }))
});
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });

export type Organization = typeof organizations.$inferSelect;
export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
