import { StaticLayout } from "@/components/StaticLayout";
import { Shield, Eye, Lock, Server, Check } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <StaticLayout
            title="Privacy Policy"
            tag="Legal"
            description="Our commitment to safeguarding your sensitive financial data and business operations."
            lastUpdated="February 15, 2026"
        >
            <div className="space-y-16">
                <section className="p-8 rounded-[2rem] bg-muted/20 border border-border italic text-muted-foreground/90 font-medium leading-relaxed">
                    "FatooraPro is built on a foundation of trust. We handle sensitive VAT and invoice data with military-grade encryption and strict access controls."
                </section>

                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <Eye className="w-8 h-8 text-primary" />
                        <h2 className="text-2xl font-bold tracking-tight">Data Collection</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            "Legal Business Identity & VAT IDs",
                            "Invoicing History & Client Metadata",
                            "Subscription & Payment Details",
                            "Administrative Access Logs"
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                                <span className="text-sm font-bold opacity-80">{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <Server className="w-8 h-8 text-primary" />
                        <h2 className="text-2xl font-bold tracking-tight">Data Usage</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            "Generation of ZATCA-compliant XML & PDF files.",
                            "Calculation of VAT liability and periodic reports.",
                            "Security monitoring and platform optimization.",
                            "Administrative support for subscription management."
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-center p-5 rounded-2xl border border-border bg-muted/10">
                                <Check className="w-5 h-5 text-primary shrink-0 stroke-[3]" />
                                <span className="text-sm font-bold opacity-80">{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-8 bg-slate-100 dark:bg-slate-900/40 p-10 rounded-[2.5rem] border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <Lock className="w-8 h-8 text-primary" />
                        <h2 className="text-2xl font-bold tracking-tight">Security Standards</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground text-sm uppercase tracking-widest">AES-256 Encryption</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">All invoice and financial data is encrypted at rest using industry-standard protocols.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground text-sm uppercase tracking-widest">TLS 1.3 in Transit</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">Secure data transmission between your browser and our servers.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground text-sm uppercase tracking-widest">Isolated Databases</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">Tenant isolation ensures your data is never mixed with other businesses.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground text-sm uppercase tracking-widest">No Shared Access</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">Strict role-based access control (RBAC) enforced across the platform.</p>
                        </div>
                    </div>
                </section>

                <section className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-sm font-bold">Strict Privacy Standard</p>
                        <p className="text-xs text-muted-foreground">We never sell, lease, or share your data with 3rd party advertizers.</p>
                    </div>
                    <a href="mailto:privacy@fatoorapro.sa" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                        Contact DPO
                    </a>
                </section>
            </div>
        </StaticLayout>
    );
}
