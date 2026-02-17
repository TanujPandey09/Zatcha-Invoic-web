import { z } from 'zod';
import { insertClientSchema, insertInvoiceSchema, clients, invoices, organizations, auditLogs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.object({
          user: z.object({
            id: z.number(),
            username: z.string(),
            organizationId: z.number().nullable(),
          }),
          organization: z.custom<typeof organizations.$inferSelect>().nullable(),
        }).nullable(),
      }
    }
  },
  organizations: {
    update: {
      method: 'PUT' as const,
      path: '/api/organization' as const,
      input: z.object({
        name: z.string(),
        vatNumber: z.string().optional(),
        address: z.string().optional(),
        logoUrl: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof organizations.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    stats: {
      method: 'GET' as const,
      path: '/api/organization/stats' as const,
      responses: {
        200: z.object({
          totalRevenue: z.number(),
          pendingInvoices: z.number(),
          totalInvoices: z.number(),
          vatCollected: z.number(),
          usage: z.object({
            current: z.number(),
            limit: z.number().nullable(), // Null for unlimited
            plan: z.enum(['free', 'basic']),
          })
        })
      }
    }
  },
  clients: {
    list: {
      method: 'GET' as const,
      path: '/api/clients' as const,
      responses: {
        200: z.array(z.custom<typeof clients.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/clients' as const,
      input: insertClientSchema,
      responses: {
        201: z.custom<typeof clients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/clients/:id' as const,
      input: insertClientSchema.partial(),
      responses: {
        200: z.custom<typeof clients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices' as const,
      input: z.object({
        status: z.enum(['draft', 'sent', 'paid', 'cancelled', 'overdue']).optional(),
        clientId: z.coerce.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect & { client: typeof clients.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/invoices/:id' as const,
      responses: {
        200: z.custom<typeof invoices.$inferSelect & { client: typeof clients.$inferSelect, items: any[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices' as const,
      input: insertInvoiceSchema,
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden, // Limit exceeded
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/invoices/:id/status' as const,
      input: z.object({
        status: z.enum(['draft', 'sent', 'paid', 'cancelled', 'overdue']),
      }),
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  reports: {
    monthly: {
      method: 'GET' as const,
      path: '/api/reports/monthly' as const,
      input: z.object({
        year: z.coerce.number().optional(),
        month: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.object({
          summary: z.array(z.object({
            date: z.string(),
            revenue: z.number(),
            vat: z.number(),
            count: z.number(),
          })),
          totals: z.object({
            revenue: z.number(),
            vat: z.number(),
            invoices: z.number(),
          })
        })
      }
    }
  },
  audit: {
    list: {
      method: 'GET' as const,
      path: '/api/audit' as const,
      responses: {
        200: z.array(z.custom<typeof auditLogs.$inferSelect>()),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
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
