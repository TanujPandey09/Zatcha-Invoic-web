import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    FileText,
    ShieldCheck,
    BarChart3,
    ArrowRight,
    Zap,
    Globe,
    Smartphone,
    Check,
    Lock,
    Shield,
    Store,
    Briefcase,
    HardHat,
    UserCircle,
    Building2,
} from "lucide-react";
import { useTranslation } from "@/i18n/i18n";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PublicNavbar, PublicFooter, GridPattern, Glow } from "@/components/PublicComponents";

export default function Landing() {
    const navigate = useNavigate();
    const { t, isRTL } = useTranslation();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    const features = [
        {
            title: "ZATCA Phase 2 Ready",
            description: "Fully compliant with Saudi Arabia e-invoicing. Simplified Phase 2 integration.",
            icon: ShieldCheck,
            color: "bg-primary/10 text-primary",
        },
        {
            title: "Branded Invoices",
            description: "Create professional, ZATCA-compliant invoices your clients will love.",
            icon: FileText,
            color: "bg-accent/10 text-accent",
        },
        {
            title: "Actionable Insights",
            description: "Deep analytics into business performance with real-time VAT calculation.",
            icon: BarChart3,
            color: "bg-blue-500/10 text-blue-500",
        },
        {
            title: "Anywhere Access",
            description: "Manage business seamlessly via desktop, tablet, or mobile devices.",
            icon: Smartphone,
            color: "bg-purple-500/10 text-purple-500",
        },
        {
            title: "Global Scalability",
            description: "Built for Saudi but scaled for international business excellence.",
            icon: Globe,
            color: "bg-green-500/10 text-green-500",
        },
        {
            title: "Instant Onboarding",
            description: "Get started in minutes with our streamlined setup process.",
            icon: Zap,
            color: "bg-yellow-500/10 text-yellow-500",
        },
    ];

    const plans = [
        {
            name: "FREE",
            price: "0",
            description: "Business Startups",
            features: [
                "5 Invoices / mo",
                "Basic Dashboard",
                "No Logo Upload",
                "Community Support"
            ],
            buttonText: t("landing.getStarted"),
            popular: false,
        },
        {
            name: "BASIC",
            price: "149",
            description: "Standard Saudi SME",
            features: [
                "Unlimited Invoices",
                "VAT Auto Calculation",
                "ZATCA QR Generation",
                "PDF Export",
                "Basic Reporting"
            ],
            buttonText: t("landing.startFree"),
            popular: true,
        },
        {
            name: "PRO",
            price: "299",
            description: "Advanced Operations",
            features: [
                "Multi-user Access",
                "Advanced Reports",
                "Priority Support",
                "Custom Branding",
                "Phase 2 Audit Logs"
            ],
            buttonText: t("landing.startFree"),
            popular: false,
        }
    ];

    const useCases = [
        { icon: Store, title: "Retail" },
        { icon: Briefcase, title: "Services" },
        { icon: HardHat, title: "Contracting" },
        { icon: UserCircle, title: "Freelance" },
        { icon: Building2, title: "Agencies" },
    ];

    const faqs = [
        { q: "Is FatooraPro ZATCA compliant?", a: "Yes, built from ground up to support Phase 1 and Phase 2 e-invoicing in KSA." },
        { q: "Is accounting knowledge needed?", a: "No. Perfect for business owners, not just accountants." },
        { q: "Is VAT auto-calculated?", a: "Yes. Simply input prices, and we handle the tax breakdowns." },
        { q: "Can I export for filing?", a: "Absolutely. Export reports in PDF or CSV for your VAT returns." },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary selection:text-white flex flex-col">
            <PublicNavbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="pt-40 pb-24 px-6 relative overflow-hidden bg-background">
                    <GridPattern />
                    <Glow className="top-0 left-1/4 w-[600px] h-[600px] -translate-x-1/2" />

                    <motion.div
                        className="max-w-7xl mx-auto text-center space-y-8 relative z-10"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="inline-block">
                            <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold tracking-[0.2em] uppercase border border-primary/10 shadow-sm backdrop-blur-sm">
                                🇸🇦 Trusted by 2,000+ Businesses
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl md:text-7xl font-display font-bold tracking-tight max-w-4xl mx-auto leading-[0.95] text-balance"
                        >
                            {t("landing.heroTitle")} <br />
                            <span className="text-primary italic font-serif">{t("landing.heroSubtitle")}</span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed font-medium"
                        >
                            {t("landing.heroDescription")}
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                            <Button size="lg" className="h-12 px-8 text-sm font-bold rounded-xl shadow-lg shadow-primary/20 group transition-all hover:scale-[1.02] active:scale-95" onClick={() => navigate("/login")}>
                                {t("landing.startFree")} <ArrowRight className={`ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-bold rounded-xl border-border hover:bg-muted/50 transition-all bg-background/50">
                                {t("landing.watchDemo")}
                            </Button>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="relative mt-24 max-w-5xl mx-auto aspect-[16/10] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-8 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-border" />
                                    <div className="w-2 h-2 rounded-full bg-border" />
                                    <div className="w-2 h-2 rounded-full bg-border" />
                                </div>
                            </div>
                            <div className="p-8 pt-12 bg-background/40 h-full">
                                <div className="grid grid-cols-12 gap-6 h-full">
                                    <div className="col-span-3 space-y-4">
                                        {[1, 2, 3, 4].map(i => <div key={i} className={`h-6 rounded-md ${i === 1 ? 'bg-primary/10' : 'bg-muted/30'}`} />)}
                                    </div>
                                    <div className="col-span-9 space-y-6">
                                        <div className="grid grid-cols-3 gap-4">
                                            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl border border-border bg-background/50" />)}
                                        </div>
                                        <div className="h-full rounded-xl border border-border bg-background p-6">
                                            <div className="h-4 bg-muted/20 rounded w-1/4 mb-4" />
                                            <div className="space-y-2 opacity-50">
                                                <div className="h-2 bg-muted/10 rounded w-full" />
                                                <div className="h-2 bg-muted/10 rounded w-3/4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Use Case Bar */}
                <section className="py-12 px-6 bg-background border-y border-border relative overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16 opacity-40">
                        {useCases.map((u, i) => (
                            <div key={i} className="flex items-center gap-2 group cursor-default">
                                <u.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{u.title}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Complexity Section */}
                <section className="py-32 px-6 relative overflow-hidden bg-background">
                    <GridPattern />
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                        <div className="lg:w-1/2 space-y-6">
                            <div className="w-8 h-1 bg-primary mb-4" />
                            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight leading-[1.1]">
                                Master the <span className="text-primary italic font-serif">Saudi Compliance</span> without the stress.
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { t: "Automated VAT Calculations", d: "Error-free tax management." },
                                    { t: "Seamless ZATCA Flow", d: "Ready for Phase 1 & Phase 2." },
                                    { t: "Vision 2030 Ready", d: "Align with the digital future." }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 shadow-sm">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{item.t}</p>
                                            <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative bg-card p-10 rounded-[2rem] border border-border shadow-2xl">
                            <div className="absolute inset-0 bg-primary/2 h-1/2 rounded-t-[2rem]" />
                            <div className="relative space-y-6">
                                <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background text-xl shadow-lg">📊</div>
                                <h3 className="text-xl font-bold">The Modern Standard</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                    FatooraPro isn't just an invoicing tool—it's your automated compliance partner. We bridge the gap between business operations and the latest ZATCA technical requirements.
                                </p>
                                <Button className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/10" onClick={() => navigate("/login")}>
                                    Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-32 px-6 bg-muted/5 relative border-y border-border">
                    <GridPattern />
                    <div className="max-w-7xl mx-auto space-y-20 relative z-10">
                        <div className="text-center space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Capabilities</span>
                            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">{t("landing.featuresTitle")}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((f, i) => (
                                <motion.div key={i} className="p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all group">
                                    <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform`}>
                                        <f.icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">{f.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section className="py-32 px-6 relative bg-background">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">{t("landing.pricingTitle")}</h2>
                            <p className="text-sm text-muted-foreground font-medium">Simple, local-friendly pricing with no hidden fees.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {plans.map((p, i) => (
                                <div key={i} className={`p-8 rounded-3xl border ${p.popular ? 'border-primary ring-4 ring-primary/5 shadow-xl md:scale-105 z-10' : 'border-border shadow-sm'} bg-card flex flex-col items-center text-center relative`}>
                                    {p.popular && <div className="absolute -top-3 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-widest">Popular Choice</div>}
                                    <div className="mb-6 space-y-2">
                                        <h3 className="text-xs font-bold text-muted-foreground tracking-widest">{p.name}</h3>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-bold font-sans">{p.price}</span>
                                            <span className="text-[10px] font-bold text-primary">{t("landing.sar")}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-bold tracking-wide uppercase opacity-50">{t("landing.perMonth")}</p>
                                    </div>
                                    <div className="space-y-3 w-full border-t border-border pt-6 mb-8 text-left">
                                        {p.features.map((f, fi) => (
                                            <div key={fi} className="flex items-center gap-3">
                                                <div className="w-4 h-4 bg-primary/10 rounded flex items-center justify-center text-primary"><Check className="w-2.5 h-2.5 stroke-[3]" /></div>
                                                <span className="text-xs font-bold text-muted-foreground/80">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className={`w-full rounded-xl text-xs font-bold py-5 ${p.popular ? 'shadow-lg shadow-primary/20' : 'border-2'}`} variant={p.popular ? 'default' : 'outline'} onClick={() => navigate("/login")}>
                                        {p.buttonText}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-32 px-6 bg-muted/5 border-y border-border">
                    <div className="max-w-2xl mx-auto space-y-10 font-sans">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-center italic leading-tight">FAQ<span className="text-muted-foreground font-sans font-medium">s</span></h2>
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            {faqs.map((f, i) => (
                                <AccordionItem key={i} value={`i-${i}`} className="border border-border rounded-2xl px-6 bg-card hover:border-primary/20 transition-colors shadow-sm">
                                    <AccordionTrigger className="text-sm py-4 font-bold text-left">{f.q}</AccordionTrigger>
                                    <AccordionContent className="text-xs text-muted-foreground font-medium pb-4">{f.a}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
