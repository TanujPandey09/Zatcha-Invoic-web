import { Layout } from "@/components/Layout";
import { useOrganizationStats } from "@/hooks/use-organization";
import { useInvoices } from "@/hooks/use-invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, CheckCircle2, TrendingUp, AlertCircle, ArrowRight, Receipt, Users, Plus } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from "@/i18n/i18n";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { t, isRTL } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useOrganizationStats();
  const { data: recentInvoices, isLoading: invoicesLoading } = useInvoices({ status: 'all' });

  // Mock data for chart - in real app would come from history endpoint
  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  const { user } = useAuth();

  if (statsLoading || invoicesLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight text-foreground">{t("common.dashboard")}</h2>
          <p className="text-muted-foreground font-medium mt-1">Overview of your business performance.</p>
        </div>
        <Link to="/invoices">
          <Button className="h-11 px-6 rounded-xl font-bold shadow-xl shadow-primary/20 hover-lift transition-all">
            <Plus className={`mr-2 h-5 w-5 ${isRTL ? 'ml-2 mr-0' : ''}`} />
            {t("common.create")} {t("common.invoices")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title={t("reports.totalRevenue")}
          value={`${stats?.totalRevenue?.toLocaleString() ?? '0'}`}
          icon={DollarSign}
          description="Paid invoices this year"
          className="bg-primary shadow-xl shadow-primary/20 text-primary-foreground border-none"
          iconClassName="text-primary-foreground/80"
          valueClassName="text-white"
          descClassName="text-white/80"
          unit="SAR"
        />
        <StatsCard
          title="Pending Amount"
          value={`${stats?.pendingInvoices ?? 0}`}
          icon={AlertCircle}
          description="Invoices awaiting payment"
          iconBadge="bg-amber-500/10 text-amber-500"
        />
        <StatsCard
          title={t("reports.vatCollected")}
          value={`${stats?.vatCollected?.toLocaleString() ?? '0'}`}
          icon={Receipt}
          description="15% VAT total"
          unit="SAR"
          iconBadge="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          title={t("reports.totalInvoices")}
          value={`${stats?.totalInvoices ?? 0}`}
          icon={FileText}
          description="All time invoices created"
          iconBadge="bg-purple-500/10 text-purple-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart Section */}
        <Card className="lg:col-span-2 shadow-sm border-border/50 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="border-b border-border/30">
            <CardTitle className="text-xl font-bold tracking-tight">Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="600" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight="600" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/30">
            <CardTitle className="text-xl font-bold tracking-tight">Recent Activity</CardTitle>
            <Link to="/invoices">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/5">
                {t("common.view")} All <ArrowRight className={`ml-1 h-3 w-3 ${isRTL ? 'rotate-180 mr-1 ml-0' : ''}`} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {recentInvoices?.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between group p-2 rounded-xl hover:bg-muted/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground">
                      {invoice.client.name.charAt(0)}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors">
                        {invoice.client.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {invoice.invoiceNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-black text-foreground">{Number(invoice.total).toLocaleString()} <span className="text-[10px] text-muted-foreground">SAR</span></p>
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
              ))}
              {!recentInvoices?.length && (
                <div className="text-center py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No activity yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function StatsCard({ title, value, icon: Icon, description, className, iconClassName, valueClassName, descClassName, unit, iconBadge }: any) {
  return (
    <Card className={`rounded-2xl border-border/50 transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-bold uppercase tracking-wider ${descClassName || 'text-muted-foreground'}`}>
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${iconBadge || 'bg-muted'}`}>
          <Icon className={`h-4 w-4 ${iconClassName || 'text-muted-foreground'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className={`text-3xl font-black font-display tracking-tight ${valueClassName}`}>{value}</div>
          {unit && <span className={`text-xs font-bold ${descClassName || 'text-muted-foreground'}`}>{unit}</span>}
        </div>
        <p className={`text-xs ${descClassName || 'text-muted-foreground'} mt-2 font-medium opacity-80`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}


