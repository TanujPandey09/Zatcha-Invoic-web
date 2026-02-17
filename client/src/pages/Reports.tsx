import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/i18n/i18n";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  Download,
  Calendar,
  FileText,
  PieChart,
  BarChart4,
  LineChart
} from "lucide-react";

export default function ReportsPage() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(1);

  // Fetch monthly reports
  const { data: monthlyReports, isLoading: monthlyLoading } = useQuery({
    queryKey: ["/api/reports/monthly", selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/reports/monthly?year=${selectedYear}`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/reports/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/reports/dashboard", {
        credentials: "include",
      });
      return res.json();
    },
  });

  // Fetch quarterly VAT report
  const { data: quarterlyVAT } = useQuery({
    queryKey: ["/api/reports/quarterly", selectedYear, selectedQuarter],
    queryFn: async () => {
      const res = await fetch(
        `/api/reports/quarterly?year=${selectedYear}&quarter=${selectedQuarter}`,
        { credentials: "include" }
      );
      return res.json();
    },
  });

  // Fetch annual report
  const { data: annualReport } = useQuery({
    queryKey: ["/api/reports/annual", selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/reports/annual?year=${selectedYear}`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  // Fetch top clients
  const { data: topClients } = useQuery({
    queryKey: ["/api/reports/top-clients"],
    queryFn: async () => {
      const res = await fetch("/api/reports/top-clients?limit=10", {
        credentials: "include",
      });
      return res.json();
    },
  });

  // Export CSV
  const handleExportCSV = () => {
    window.open(
      `/api/reports/export/monthly?year=${selectedYear}`,
      "_blank"
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8 max-w-7xl animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm">
          <div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight">{t("reports.title")}</h1>
            <p className="text-muted-foreground font-medium">
              {t("reports.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-32 bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleExportCSV} variant="outline" className="border-border/50 hover:bg-primary/5 hover:text-primary transition-all duration-300">
              <Download className="w-4 h-4 mr-2" />
              {t("reports.export")}
            </Button>
          </div>
        </div>

        {/* Current Month Overview */}
        {dashboardStats?.currentMonth && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-sm border-border/50 bg-gradient-to-br from-card to-primary/5 hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("reports.totalRevenue")}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-black">
                  {dashboardStats.currentMonth.totalRevenue.toLocaleString()} <span className="text-sm font-bold text-muted-foreground uppercase ml-1">SAR</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {dashboardStats.currentMonth.monthName} {dashboardStats.currentMonth.year}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50 bg-gradient-to-br from-card to-accent/5 hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("reports.vatCollected")}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Receipt className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-black">
                  {dashboardStats.currentMonth.vatCollected.toLocaleString()} <span className="text-sm font-bold text-muted-foreground uppercase ml-1">SAR</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground mt-2">
                  15% VAT Rate
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50 hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("reports.totalInvoices")}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <FileText className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-black">
                  {dashboardStats.currentMonth.totalInvoices}
                </div>
                <p className="text-xs font-semibold text-green-600 mt-2 bg-green-500/10 px-2 py-0.5 rounded-full inline-block">
                  {dashboardStats.currentMonth.paidInvoices} paid
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50 hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("reports.activeClients")}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Users className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-black">
                  {dashboardStats.currentMonth.clientCount}
                </div>
                <p className="text-xs font-semibold text-muted-foreground mt-2">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for different reports */}
        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl glass-panel grid grid-cols-2 md:grid-cols-4 h-auto gap-1 border border-border/50">
            <TabsTrigger value="monthly" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2">
              <BarChart4 className="w-4 h-4" />
              <span className="font-bold whitespace-nowrap">{t("reports.monthly")}</span>
            </TabsTrigger>
            <TabsTrigger value="vat" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span className="font-bold whitespace-nowrap">{t("reports.vat")}</span>
            </TabsTrigger>
            <TabsTrigger value="annual" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              <span className="font-bold whitespace-nowrap">{t("reports.annual")}</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-bold whitespace-nowrap">{t("reports.topClients")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Monthly Reports Tab */}
          <TabsContent value="monthly" className="space-y-4">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50">
                <CardTitle>Monthly Performance - {selectedYear}</CardTitle>
                <CardDescription>
                  Revenue and VAT breakdown by month
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {monthlyLoading ? (
                  <div className="text-center py-12 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading monthly reports...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {monthlyReports?.map((report: any) => (
                      <div
                        key={report.month}
                        className="flex items-center justify-between p-5 border border-border/50 rounded-2xl hover:bg-muted/30 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Calendar className="w-7 h-7 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {report.monthName} {report.year}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium">
                              {report.totalInvoices} invoices • {report.clientCount} clients
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <div className="font-black text-xl">
                              {report.totalRevenue.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">SAR</span>
                            </div>
                            <div className="text-sm font-bold text-primary">
                              VAT: {report.vatCollected.toLocaleString()} SAR
                            </div>
                          </div>

                          <div className="hidden sm:flex gap-2">
                            <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold ring-1 ring-green-500/20">
                              {report.paidInvoices} paid
                            </div>
                            {report.overdueInvoices > 0 && (
                              <div className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-bold ring-1 ring-destructive/20">
                                {report.overdueInvoices} overdue
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* VAT Reports Tab */}
          <TabsContent value="vat" className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Select
                value={String(selectedQuarter)}
                onValueChange={(v) => setSelectedQuarter(Number(v) as 1 | 2 | 3 | 4)}
              >
                <SelectTrigger className="w-48 bg-card border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                  <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                  <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                  <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50">
                <CardTitle>Quarterly VAT Report - Q{selectedQuarter} {selectedYear}</CardTitle>
                <CardDescription>
                  For ZATCA VAT return filing
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {quarterlyVAT && (
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Period</p>
                        <p className="text-2xl font-black">{quarterlyVAT.period}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Invoices</p>
                        <p className="text-2xl font-black">{quarterlyVAT.invoiceCount}</p>
                      </div>
                    </div>

                    <div className="space-y-4 bg-muted/30 p-8 rounded-3xl border border-border/50 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-bold">Net Sales</span>
                        <span className="font-black text-xl">
                          {quarterlyVAT.netSales.toLocaleString()} <span className="text-xs uppercase">SAR</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-bold">VAT (15%)</span>
                        <span className="font-black text-xl text-primary">
                          {quarterlyVAT.vatAmount.toLocaleString()} <span className="text-xs uppercase">SAR</span>
                        </span>
                      </div>
                      <div className="pt-6 mt-2 border-t border-border/50 flex justify-between items-center">
                        <span className="font-black text-lg">Total Sales</span>
                        <div className="text-right">
                          <span className="font-black text-3xl text-gradient">
                            {quarterlyVAT.totalSales.toLocaleString()}
                          </span>
                          <span className="text-sm font-black ml-1">SAR</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex gap-4 text-sm font-medium text-primary">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      <p>This report is generated based on ZATCA requirements for Phase 1 & 2 e-invoicing compliance.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Annual Summary Tab */}
          <TabsContent value="annual" className="space-y-4">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50">
                <CardTitle>Annual Report - {selectedYear}</CardTitle>
                <CardDescription>
                  Complete year performance summary
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {annualReport && (
                  <div className="space-y-10">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 border border-border/50 rounded-3xl bg-gradient-to-br from-card to-muted/30">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-3xl font-black">
                          {annualReport.totalRevenue.toLocaleString()} <span className="text-xs">SAR</span>
                        </p>
                      </div>
                      <div className="p-6 border border-primary/20 rounded-3xl bg-primary/5 ring-1 ring-primary/10">
                        <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total VAT</p>
                        <p className="text-3xl font-black text-primary">
                          {annualReport.totalVAT.toLocaleString()} <span className="text-xs">SAR</span>
                        </p>
                      </div>
                      <div className="p-6 border border-border/50 rounded-3xl bg-gradient-to-br from-card to-muted/30">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Net Revenue</p>
                        <p className="text-3xl font-black">
                          {annualReport.netRevenue.toLocaleString()} <span className="text-xs">SAR</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="space-y-6">
                      <h3 className="font-black text-xl flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        Invoice Status Breakdown
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="p-4 bg-muted/30 rounded-2xl text-center border border-border/50 hover-lift">
                          <p className="text-3xl font-black">{annualReport.statusBreakdown.draft}</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Draft</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-2xl text-center border border-blue-500/20 hover-lift">
                          <p className="text-3xl font-black text-blue-500">{annualReport.statusBreakdown.sent}</p>
                          <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Sent</p>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-2xl text-center border border-green-500/20 hover-lift">
                          <p className="text-3xl font-black text-green-600">{annualReport.statusBreakdown.paid}</p>
                          <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Paid</p>
                        </div>
                        <div className="p-4 bg-destructive/10 rounded-2xl text-center border border-destructive/20 hover-lift">
                          <p className="text-3xl font-black text-destructive">{annualReport.statusBreakdown.overdue}</p>
                          <p className="text-xs font-bold text-destructive uppercase tracking-wider">Overdue</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-2xl text-center border border-border/50 hover-lift">
                          <p className="text-3xl font-black">{annualReport.statusBreakdown.cancelled}</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cancelled</p>
                        </div>
                      </div>
                    </div>

                    {/* Quarterly Comparison */}
                    <div className="space-y-6">
                      <h3 className="font-black text-xl flex items-center gap-2">
                        <BarChart4 className="w-5 h-5 text-primary" />
                        Quarterly Performance
                      </h3>
                      <div className="grid gap-3">
                        {annualReport.quarters.map((q: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-5 border border-border/50 rounded-2xl bg-card hover:bg-muted/30 transition-all duration-300">
                            <div className="flex items-center gap-6">
                              <span className="font-black text-2xl text-muted-foreground/30 italic">0{i + 1}</span>
                              <span className="font-black text-lg">Quarter {i + 1}</span>
                            </div>
                            <div className="flex items-baseline gap-8">
                              <span className="font-black text-xl">{q.totalSales.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">SAR</span></span>
                              <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                                VAT: {q.vatAmount.toLocaleString()} SAR
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50">
                <CardTitle>Top 10 Clients by Revenue</CardTitle>
                <CardDescription>
                  Your most valuable customers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {topClients?.map((client: any, index: number) => (
                    <div
                      key={client.clientId}
                      className="flex items-center justify-between p-5 border border-border/50 rounded-2xl hover:bg-primary/5 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50' : index === 1 ? 'bg-gray-300 text-gray-700 shadow-md' : index === 2 ? 'bg-amber-600 text-white shadow-md' : 'bg-muted text-muted-foreground'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-black text-xl tracking-tight">{client.clientName}</h3>
                          <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                            {client.invoiceCount} invoices generated
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-2xl text-primary">
                          {client.revenue.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">SAR</span>
                        </div>
                        <div className="flex items-center justify-end text-sm font-black text-green-600 mt-1">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Top Ranked
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);