# Project Documentation - Saudi SME Invoice & VAT System

## Overview
A comprehensive Multi-tenant SaaS application designed for Saudi SMEs to manage invoices while ensuring compliance with ZATCA (Phase 2 ready) e-invoicing standards.

## Architecture
- **Frontend**: React (Vite) with Tailwind CSS, Shadcn UI, and TanStack Query.
- **Backend**: Node.js/Express.
- **Database**: PostgreSQL with Drizzle ORM.
- **Auth**: Replit Auth (OIDC).
- **Multi-tenancy**: Organization-based isolation (Tenants).

## Key Components
- **Dashboard**: Real-time business metrics and usage tracking.
- **Invoice Manager**: Full lifecycle control (Draft to Paid).
- **Client Manager**: Manage customer details and VAT numbers.
- **Reporting**: Monthly financial summaries and VAT tracking.
- **Settings**: Organization profiles and subscription management.

## ZATCA Compliance
The system implements Phase 1 requirements and is architecturally ready for Phase 2:
- **Phase 1**: Sequential invoice numbering, VAT 15% calculation, and tax invoice headers.
- **Phase 2 Ready**: Database support for UUIDs, hashing, and XML generation.

---

# API Documentation

## Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/login` | Redirects to Replit Auth login |
| GET | `/api/logout` | Logs out the user |
| GET | `/api/auth/me` | Returns current user and organization info |

## Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/organization` | Create or update organization settings |
| GET | `/api/organization/stats` | Get dashboard stats (Revenue, VAT, Usage) |

## Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List all organization clients |
| POST | `/api/clients` | Create a new client |
| PUT | `/api/clients/:id` | Update client details |

## Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices with optional status/client filters |
| GET | `/api/invoices/:id` | Get full details of a specific invoice |
| POST | `/api/invoices` | Create a new invoice (Enforces plan limits) |
| PATCH | `/api/invoices/:id/status` | Transition invoice status (e.g., to SENT or PAID) |

## Reporting & Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/monthly` | Get monthly financial summaries |
| GET | `/api/audit` | List organization audit logs |
