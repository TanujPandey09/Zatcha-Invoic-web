import { storage } from "../storage";
import { NotFoundError } from "../middleware/error";

export interface MonthlyReport {
    month: string; // Format: "2024-01" (YYYY-MM)
    year: number;
    monthName: string; // "January", "February", etc.
    totalInvoices: number;
    totalRevenue: number;
    vatCollected: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    clientCount: number;
}

export interface VATSummary {
    period: string;
    totalSales: number;
    vatRate: number; // 0.15 for Saudi Arabia
    vatAmount: number;
    netSales: number;
    invoiceCount: number;
}

/**
 * Generate monthly financial report for organization
 */
export async function getMonthlyReport(
    organizationId: number,
    year?: number,
    month?: number
): Promise<MonthlyReport[]> {
    const invoices = await storage.getInvoices(organizationId);
    const clients = await storage.getClients(organizationId);

    // Group invoices by month
    const monthlyData: Record<string, any> = {};

    invoices.forEach((invoice) => {
        const date = new Date(invoice.issueDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                month: monthKey,
                year: date.getFullYear(),
                monthName: date.toLocaleString("en-US", { month: "long" }),
                totalInvoices: 0,
                totalRevenue: 0,
                vatCollected: 0,
                paidInvoices: 0,
                pendingInvoices: 0,
                overdueInvoices: 0,
                clientCount: new Set(),
            };
        }

        const data = monthlyData[monthKey];
        data.totalInvoices++;
        data.clientCount.add(invoice.clientId);

        const total = Number(invoice.total);
        const vat = Number(invoice.taxTotal);

        if (invoice.status === "paid") {
            data.paidInvoices++;
            data.totalRevenue += total;
            data.vatCollected += vat;
        } else if (invoice.status === "sent") {
            data.pendingInvoices++;
        } else if (invoice.status === "overdue") {
            data.overdueInvoices++;
        }
    });

    // Convert to array and format
    const reports = Object.values(monthlyData).map((data: any) => ({
        ...data,
        clientCount: data.clientCount.size,
    }));

    // Sort by date (newest first)
    reports.sort((a, b) => b.month.localeCompare(a.month));

    // Filter by year/month if specified
    if (year && month) {
        const targetMonth = `${year}-${String(month).padStart(2, "0")}`;
        return reports.filter((r) => r.month === targetMonth);
    } else if (year) {
        return reports.filter((r) => r.year === year);
    }

    return reports;
}

/**
 * Get VAT summary for a specific period
 * Used for ZATCA VAT return filing
 */
export async function getVATSummary(
    organizationId: number,
    startDate: string,
    endDate: string
): Promise<VATSummary> {
    const invoices = await storage.getInvoices(organizationId);

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter invoices in date range
    const periodInvoices = invoices.filter((invoice) => {
        const issueDate = new Date(invoice.issueDate);
        return issueDate >= start && issueDate <= end && invoice.status === "paid";
    });

    let totalSales = 0;
    let vatAmount = 0;

    periodInvoices.forEach((invoice) => {
        totalSales += Number(invoice.total);
        vatAmount += Number(invoice.taxTotal);
    });

    const netSales = totalSales - vatAmount;

    return {
        period: `${startDate} to ${endDate}`,
        totalSales,
        vatRate: 0.15, // 15% VAT in Saudi Arabia
        vatAmount,
        netSales,
        invoiceCount: periodInvoices.length,
    };
}

/**
 * Get quarterly VAT report (for ZATCA filing)
 * Saudi Arabia requires quarterly VAT returns
 */
export async function getQuarterlyVATReport(
    organizationId: number,
    year: number,
    quarter: 1 | 2 | 3 | 4
) {
    const quarterMonths: Record<number, [number, number, number]> = {
        1: [1, 2, 3],     // Q1: Jan-Mar
        2: [4, 5, 6],     // Q2: Apr-Jun
        3: [7, 8, 9],     // Q3: Jul-Sep
        4: [10, 11, 12],  // Q4: Oct-Dec
    };

    const months = quarterMonths[quarter];
    const startDate = new Date(year, months[0] - 1, 1);
    const endDate = new Date(year, months[2], 0); // Last day of last month

    return getVATSummary(
        organizationId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
    );
}

/**
 * Get annual report with ZATCA compliance summary
 */
export async function getAnnualReport(organizationId: number, year: number) {
    const invoices = await storage.getInvoices(organizationId);

    // Filter invoices for the year
    const yearInvoices = invoices.filter((invoice) => {
        const date = new Date(invoice.issueDate);
        return date.getFullYear() === year;
    });

    let totalRevenue = 0;
    let totalVAT = 0;
    let paidCount = 0;

    const statusBreakdown = {
        draft: 0,
        sent: 0,
        paid: 0,
        overdue: 0,
        cancelled: 0,
    };

    yearInvoices.forEach((invoice) => {
        statusBreakdown[invoice.status as keyof typeof statusBreakdown]++;

        if (invoice.status === "paid") {
            paidCount++;
            totalRevenue += Number(invoice.total);
            totalVAT += Number(invoice.taxTotal);
        }
    });

    // Get quarterly breakdown
    const quarters = await Promise.all([
        getQuarterlyVATReport(organizationId, year, 1),
        getQuarterlyVATReport(organizationId, year, 2),
        getQuarterlyVATReport(organizationId, year, 3),
        getQuarterlyVATReport(organizationId, year, 4),
    ]);

    return {
        year,
        totalInvoices: yearInvoices.length,
        totalRevenue,
        totalVAT,
        netRevenue: totalRevenue - totalVAT,
        averageInvoiceValue: paidCount > 0 ? totalRevenue / paidCount : 0,
        statusBreakdown,
        quarters,
    };
}

/**
 * Get top clients by revenue
 */
export async function getTopClients(
    organizationId: number,
    limit: number = 10
) {
    const invoices = await storage.getInvoices(organizationId);
    const clients = await storage.getClients(organizationId);

    // Calculate revenue per client
    const clientRevenue: Record<number, number> = {};

    invoices
        .filter((inv) => inv.status === "paid")
        .forEach((invoice) => {
            if (!clientRevenue[invoice.clientId]) {
                clientRevenue[invoice.clientId] = 0;
            }
            clientRevenue[invoice.clientId] += Number(invoice.total);
        });

    // Sort and get top clients
    const topClients = Object.entries(clientRevenue)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([clientId, revenue]) => {
            const client = clients.find((c) => c.id === Number(clientId));
            return {
                clientId: Number(clientId),
                clientName: client?.name || "Unknown",
                revenue,
                invoiceCount: invoices.filter(
                    (inv) => inv.clientId === Number(clientId) && inv.status === "paid"
                ).length,
            };
        });

    return topClients;
}

/**
 * Get revenue trend (monthly growth)
 */
export async function getRevenueTrend(
    organizationId: number,
    months: number = 12
) {
    const reports = await getMonthlyReport(organizationId);

    return reports.slice(0, months).reverse().map((report) => ({
        month: report.monthName,
        year: report.year,
        revenue: report.totalRevenue,
        vat: report.vatCollected,
        invoices: report.paidInvoices,
    }));
}

/**
 * Export report as CSV data
 */
export function exportReportAsCSV(report: MonthlyReport[]): string {
    const headers = [
        "Month",
        "Year",
        "Total Invoices",
        "Total Revenue",
        "VAT Collected",
        "Paid",
        "Pending",
        "Overdue",
        "Clients",
    ];

    const rows = report.map((r) => [
        r.monthName,
        r.year,
        r.totalInvoices,
        r.totalRevenue.toFixed(2),
        r.vatCollected.toFixed(2),
        r.paidInvoices,
        r.pendingInvoices,
        r.overdueInvoices,
        r.clientCount,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    return csv;
}