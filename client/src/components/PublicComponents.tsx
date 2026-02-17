import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ShieldCheck,
    ArrowRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/i18n/i18n";

export function PublicNavbar() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-border shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] bg-background/60 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                        F
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-bold text-xl tracking-tight leading-none text-foreground">Fatoora<span className="text-primary font-black">Pro</span></span>
                    </div>
                </Link>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden md:flex items-center gap-1">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                    <Button variant="ghost" className="hidden sm:flex font-semibold text-sm" onClick={() => navigate("/login")}>
                        Login
                    </Button>
                    <Button className="font-bold px-5 h-9 text-sm shadow-sm" onClick={() => navigate("/login")}>
                        {t("landing.getStarted")}
                    </Button>
                </div>
            </div>
        </nav>
    );
}

export function PublicFooter() {
    return (
        <footer className="py-20 px-6 border-t border-border bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-border">
                    <div className="md:col-span-6 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
                                F
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight">Fatoora<span className="text-primary font-black">Pro</span></span>
                        </div>
                        <p className="text-muted-foreground max-w-sm text-sm font-medium leading-relaxed">
                            Building the digital standard for Saudi SME operations.
                            Secure, automated, and compliant by design. Supporting Saudi Vision 2030.
                        </p>
                    </div>
                    <div className="md:col-span-3 space-y-6">
                        <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-primary">Resources</h4>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                            <li><Link to="/zatca-rulebook" className="hover:text-primary transition-colors">ZATCA Rulebook</Link></li>
                            <li><Link to="/phase-2-docs" className="hover:text-primary transition-colors">Phase 2 Documentation</Link></li>
                            <li><Link to="/vat-help" className="hover:text-primary transition-colors">VAT Help Center</Link></li>
                        </ul>
                    </div>
                    <div className="md:col-span-3 space-y-6">
                        <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-primary">Platform</h4>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact Sales</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60">
                        © 2026 FatooraPro Saudi Arabia. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
                        <span>MADE FOR VISION 2030</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                        <span>PHASE 2 READY</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export function GridPattern() {
    return (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
    );
}

export function Glow({ className }: { className?: string }) {
    return (
        <div className={`absolute pointer-events-none blur-[120px] rounded-full opacity-20 bg-primary ${className}`} />
    );
}
