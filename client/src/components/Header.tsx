import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/i18n/i18n";
import { useTheme } from "@/components/theme-provider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogOut, ChevronRight, Home, Sun, Moon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

export function Header() {
    const { user, logout } = useAuth();
    const { t, isRTL } = useTranslation();
    const location = useLocation();

    // Breadcrumbs logic
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40 w-full px-8 flex items-center justify-between">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm font-medium">
                <Link
                    to="/dashboard"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                    <Home className="w-4 h-4" />
                </Link>
                {pathnames.length > 0 && (
                    <ChevronRight className={cn("w-4 h-4 mx-2 text-muted-foreground/40", isRTL && "rotate-180")} />
                )}
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join("/")}`;

                    // Handle dynamic IDs (numeric)
                    const isId = !isNaN(Number(value));

                    let label = value;
                    if (isId) {
                        label = `#${value}`;
                    } else {
                        const translationKey = `common.${value.toLowerCase()}`;
                        const tLabel = t(translationKey);
                        label = tLabel !== translationKey ? tLabel : value.charAt(0).toUpperCase() + value.slice(1);
                    }

                    return last ? (
                        <span key={to} className="text-foreground font-black tracking-tight">
                            {label}
                        </span>
                    ) : (
                        <div key={to} className="flex items-center">
                            <Link
                                to={to}
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                {label}
                            </Link>
                            <ChevronRight className={cn("w-4 h-4 mx-2 text-muted-foreground/40", isRTL && "rotate-180")} />
                        </div>
                    );
                })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                <div className="hidden lg:flex flex-col items-end border-r border-border/30 pr-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">
                        {isRTL ? 'مرحباً بك مجدداً' : 'Welcome Back'}
                    </span>
                    <span className="text-sm font-black text-foreground tracking-tight italic">
                        {user?.username}
                    </span>
                </div>

                <div className="flex items-center gap-1 border-r border-border/50 pr-4">
                    <LanguageSwitcher />
                    <div className="h-4 w-[1px] bg-border/20 mx-1" />
                    <ThemeToggleCompact />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-foreground leading-none group-hover:text-primary transition-colors">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-bold opacity-70 mt-1 uppercase tracking-widest">
                                    {user?.role || 'Member'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-background transition-transform group-hover:scale-105 overflow-hidden">
                                {user?.username?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-border/50 backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                        <DropdownMenuLabel className="px-3 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black">
                                    {user?.username?.charAt(0) || 'U'}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-black text-sm truncate">{user?.username}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium truncate">{user?.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-2 opacity-50" />
                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 font-bold focus:bg-primary/5 focus:text-primary transition-colors">
                            <Link to="/settings" className="flex items-center w-full">
                                <Settings className="w-4 h-4 mr-3" /> {t("common.settings")}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 opacity-50" />
                        <DropdownMenuItem
                            onClick={() => logout()}
                            className="rounded-xl cursor-pointer text-destructive focus:bg-destructive focus:text-white transition-all py-2.5 font-bold"
                        >
                            <LogOut className="w-4 h-4 mr-3" /> {t("common.logout")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

function ThemeToggleCompact() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-primary/10 transition-colors w-9 h-9"
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? (
                <Sun className="h-4 w-4 text-amber-500" />
            ) : (
                <Moon className="h-4 w-4 text-primary" />
            )}
        </Button>
    );
}
