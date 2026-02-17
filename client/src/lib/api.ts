import { z } from "zod";

/* ================= COMMON SCHEMAS ================= */

export const ClientSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  vatNumber: z.string().nullable(),
  address: z.string().nullable(),
});

export type Client = z.infer<typeof ClientSchema>;

export const InvoiceItemSchema = z.object({
  id: z.number(),
  description: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
  amount: z.string(),
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

export const InvoiceSchema = z.object({
  id: z.number(),
  invoiceNumber: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "cancelled"]),
  subtotal: z.string(),
  taxTotal: z.string(),
  total: z.string(),
  issueDate: z.string(),
  dueDate: z.string().nullable(),
  client: ClientSchema,
  items: z.array(InvoiceItemSchema).optional(),
  zatcaUuid: z.string().nullable().optional(),
  zatcaHash: z.string().nullable().optional(),
  zatcaQr: z.string().nullable().optional(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;


export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().nullable(),
  organizationId: z.number().nullable(),
  role: z.enum(["admin", "member"]),
  googleId: z.string().nullable().optional(),
  microsoftId: z.string().nullable().optional(),
  appleId: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const OrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  vatNumber: z.string().nullable(),
  address: z.string().nullable(),
  subscriptionPlan: z.enum(["free", "basic"]),
});

export type Organization = z.infer<typeof OrganizationSchema>;

/* ================= INPUT TYPES ================= */

export const InsertClientSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
});

export type InsertClient = z.infer<typeof InsertClientSchema>;

export const InsertInvoiceSchema = z.object({
  clientId: z.number(),
  invoiceNumber: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "cancelled"]).optional(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    })
  ),
});

export type InsertInvoice = z.infer<typeof InsertInvoiceSchema>;

/* ================= API CONTRACT ================= */

export const api = {
  organizations: {
    stats: {
      method: "GET",
      path: "/api/organization/stats",
      responses: {
        200: z.object({
          totalRevenue: z.number(),
          pendingInvoices: z.number(),
          totalInvoices: z.number(),
          vatCollected: z.number(),
          usage: z.object({
            current: z.number(),
            limit: z.number().nullable(),
            plan: z.enum(["free", "basic"]),
          }),
        }),
      },
    },
  },

  clients: {
    list: {
      method: "GET",
      path: "/api/clients",
      responses: {
        200: z.array(ClientSchema),
      },
    },
    create: {
      method: "POST",
      path: "/api/clients",
      responses: {
        201: ClientSchema,
      },
    },
  },

  invoices: {
    list: {
      method: "GET",
      path: "/api/invoices",
      responses: {
        200: z.array(InvoiceSchema),
      },
    },
    create: {
      method: "POST",
      path: "/api/invoices",
      responses: {
        201: InvoiceSchema,
      },
    },
    get: {
      method: "GET",
      path: "/api/invoices/:id",
      responses: {
        200: InvoiceSchema,
      },
    },
    updateStatus: {
      method: "PATCH",
      path: "/api/invoices/:id/status",
      responses: {
        200: InvoiceSchema,
      },
    },
  },
};

/* ================= UTIL ================= */

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
