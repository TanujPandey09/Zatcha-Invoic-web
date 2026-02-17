import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useOrganizationStats } from "@/hooks/use-organization";
import { useTranslation } from "@/i18n/i18n";

export function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { data: stats } = useOrganizationStats();
  const { t, isRTL } = useTranslation();

  const navItems = [
    { label: t("common.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("common.invoices"), href: "/invoices", icon: FileText },
    { label: t("common.clients"), href: "/clients", icon: Users },
    { label: t("reports.title"), href: "/reports", icon: BarChart3 },
    { label: "Zatca", href: "/zatca", icon: ShieldCheck },
    { label: "Zatca-Integration", href: "/zatca-integration", icon: ShieldCheck },

    { label: t("Settings"), href: "/settings", icon: Settings },
  ];

  const usagePercent = stats ? (stats.usage.current / (stats.usage.limit || 1)) * 100 : 0;
  const isFree = stats?.usage.plan === 'free';

  return (
    <aside className={cn(
      "w-64 bg-card border-border min-h-screen flex flex-col fixed top-0 z-50 transition-all duration-300",
      isRTL ? "right-0 border-l" : "left-0 border-r"
    )}>
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
            F
          </div>
          <div>
            <h1 className="font-display font-black text-xl tracking-tighter leading-none">Fatoora<span className="text-primary">Pro</span></h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Saudi E-Invoicing</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 mt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group font-bold text-sm",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-4 bg-muted/20">
        {stats && (
          <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {stats.usage.plan} {t("landing.pricingTitle")}
              </span>
              {isFree && (
                <Link to="/settings">
                  <div className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-black cursor-pointer hover:bg-primary/20 transition-all hover:scale-105 active:scale-95">
                    UPGRADE
                  </div>
                </Link>
              )}
            </div>

            <div className="flex justify-between text-xs mb-2 font-bold text-foreground">
              <span>Usage</span>
              <span>{stats.usage.current} / {stats.usage.limit || '∞'}</span>
            </div>

            {stats.usage.limit && (
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    usagePercent > 90 ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  )}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

      </div>
    </aside>
  );
}
