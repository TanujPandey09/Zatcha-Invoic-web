import type { Request, Response } from "express";
import * as reportsService from "../services/report.service";
import { asyncHandler } from "../middleware/error";

/**
 * Get monthly reports
 * GET /api/reports/monthly?year=2024&month=1
 */
export const getMonthlyReports = asyncHandler(
    async (req: Request, res: Response) => {
        const year = req.query.year ? Number(req.query.year) : undefined;
        const month = req.query.month ? Number(req.query.month) : undefined;

        const reports = await reportsService.getMonthlyReport(
            req.dbUser.organizationId,
            year,
            month
        );

        res.json(reports);
    }
);

/**
 * Get VAT summary for period
 * GET /api/reports/vat?startDate=2024-01-01&endDate=2024-03-31
 */
export const getVATSummary = asyncHandler(
    async (req: Request, res: Response) => {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "startDate and endDate query parameters are required",
            });
        }

        const summary = await reportsService.getVATSummary(
            req.dbUser.organizationId,
            startDate as string,
            endDate as string
        );

        res.json(summary);
    }
);

/**
 * Get quarterly VAT report
 * GET /api/reports/quarterly?year=2024&quarter=1
 */
export const getQuarterlyReport = asyncHandler(
    async (req: Request, res: Response) => {
        const year = Number(req.query.year);
        const quarter = Number(req.query.quarter) as 1 | 2 | 3 | 4;

        if (!year || !quarter || quarter < 1 || quarter > 4) {
            return res.status(400).json({
                message: "Valid year and quarter (1-4) are required",
            });
        }

        const report = await reportsService.getQuarterlyVATReport(
            req.dbUser.organizationId,
            year,
            quarter
        );

        res.json(report);
    }
);

/**
 * Get annual report
 * GET /api/reports/annual?year=2024
 */
export const getAnnualReport = asyncHandler(
    async (req: Request, res: Response) => {
        const year = req.query.year
            ? Number(req.query.year)
            : new Date().getFullYear();

        const report = await reportsService.getAnnualReport(
            req.dbUser.organizationId,
            year
        );

        res.json(report);
    }
);

/**
 * Get top clients by revenue
 * GET /api/reports/top-clients?limit=10
 */
export const getTopClients = asyncHandler(
    async (req: Request, res: Response) => {
        const limit = req.query.limit ? Number(req.query.limit) : 10;

        const topClients = await reportsService.getTopClients(
            req.dbUser.organizationId,
            limit
        );

        res.json(topClients);
    }
);

/**
 * Get revenue trend
 * GET /api/reports/trend?months=12
 */
export const getRevenueTrend = asyncHandler(
    async (req: Request, res: Response) => {
        const months = req.query.months ? Number(req.query.months) : 12;

        const trend = await reportsService.getRevenueTrend(
            req.dbUser.organizationId,
            months
        );

        res.json(trend);
    }
);

/**
 * Export monthly report as CSV
 * GET /api/reports/export/monthly?year=2024
 */
export const exportMonthlyCSV = asyncHandler(
    async (req: Request, res: Response) => {
        const year = req.query.year ? Number(req.query.year) : undefined;

        const reports = await reportsService.getMonthlyReport(
            req.dbUser.organizationId,
            year
        );

        const csv = reportsService.exportReportAsCSV(reports);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="monthly-report-${year || "all"}.csv"`
        );

        res.send(csv);
    }
);

/**
 * Get dashboard statistics
 * GET /api/reports/dashboard
 */
export const getDashboardStats = asyncHandler(
    async (req: Request, res: Response) => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Get current month report
        const [monthlyReports] = await reportsService.getMonthlyReport(
            req.dbUser.organizationId,
            currentYear,
            currentMonth
        );

        // Get revenue trend
        const trend = await reportsService.getRevenueTrend(
            req.dbUser.organizationId,
            6
        );

        // Get top clients
        const topClients = await reportsService.getTopClients(
            req.dbUser.organizationId,
            5
        );

        res.json({
            currentMonth: monthlyReports || {
                month: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
                totalInvoices: 0,
                totalRevenue: 0,
                vatCollected: 0,
                paidInvoices: 0,
                pendingInvoices: 0,
                overdueInvoices: 0,
                clientCount: 0,
            },
            revenueTrend: trend,
            topClients,
        });
    }
);