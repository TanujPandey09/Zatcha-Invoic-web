import { StaticLayout } from "@/components/StaticLayout";
import { FileText, Gavel, Calendar, ShieldAlert, Cpu } from "lucide-react";

export default function TermsOfService() {
    return (
        <StaticLayout
            title="Terms of Service"
            tag="Legal"
            description="The rules and guidelines for using the FatooraPro platform for your business operations."
            lastUpdated="February 15, 2026"
        >
            <div className="space-y-16">
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">1. Acceptable Use</h2>
                    </div>
                    <p className="text-sm text-muted-foreground/90 font-medium leading-relaxed">
                        FatooraPro provides invoicing and VAT automation services designed specifically for Saudi Arabian SMEs.
                        By accessing our platform, you agree to provide accurate business information and use the services solely for lawful invoicing purposes in compliance with ZATCA regulations.
                    </p>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                            <Gavel className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">2. Compliance & Ethics</h2>
                    </div>
                    <p className="text-sm text-muted-foreground/90 font-medium leading-relaxed">
                        While we provide advanced tools for ZATCA Phase 1 & 2 compliance, the business owner remains legally responsible for the truthfulness of the reporting and the correctness of the final tax declarations to the authorities.
                    </p>
                </section>

                <section className="p-10 rounded-[2.5rem] bg-muted/10 border border-border space-y-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">3. Billing & Subscriptions</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { t: "Billing Cycle", d: "Subscriptions are billed monthly or annually in advance." },
                            { t: "SAR Payments", d: "All fees are denominated in Saudi Riyals (SAR)." },
                            { t: "Cancellation", d: "You may cancel your plan at any time; no refunds for partial months." },
                            { t: "Tier Limits", d: "Free and Basic plans have specific invoice and user caps." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold opacity-90">{item.t}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">4. Security & Liability</h2>
                    </div>
                    <p className="text-sm text-muted-foreground/90 font-medium leading-relaxed">
                        Users are responsible for maintaining the confidentiality of their credentials. FatooraPro shall not be liable for any loss resulting from unauthorized access caused by user negligence.
                    </p>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">5. Availability (SLA)</h2>
                    </div>
                    <p className="text-sm text-muted-foreground/90 font-medium leading-relaxed">
                        We strive for 99.9% availability for Pro tiers. Maintenance schedules are communicated via email 24 hours in advance whenever possible.
                    </p>
                </section>
            </div>
        </StaticLayout>
    );
}
