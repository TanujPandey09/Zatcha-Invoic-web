import { StaticLayout } from "@/components/StaticLayout";
import { Users, Zap, Check, Landmark, FileCheck } from "lucide-react";

export default function VatHelpCenter() {
    return (
        <StaticLayout
            title="VAT Help Center"
            tag="Support"
            description="Clear, simplified answers to common Value Added Tax (VAT) questions in Saudi Arabia."
            lastUpdated="February 2026"
        >
            <div className="space-y-16">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
                        <Landmark className="w-8 h-8 text-primary" />
                        <h3 className="text-lg font-bold">What is VAT?</h3>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                            Value Added Tax (VAT) is a 15% indirect tax applied to most goods and services in KSA.
                            It is collected by taxable persons and businesses on behalf of the government through ZATCA.
                        </p>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-accent/5 border border-accent/10 space-y-4">
                        <Users className="w-8 h-8 text-accent" />
                        <h3 className="text-lg font-bold">Registration Thresholds</h3>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                            Businesses with annual taxable supplies exceeding <span className="text-foreground font-bold font-sans">SAR 375,000</span> must register.
                            Voluntary registration is possible for those above SAR 187,500.
                        </p>
                    </div>
                </section>

                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight">Invoice Checklist</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            "Legal Seller Name & VAT Number",
                            "Buyer Name (for tax invoices)",
                            "Sequential Invoice Number",
                            "Issue Date & Time",
                            "15% VAT Amount Breakdown",
                            "Grand Total (including VAT)",
                            "Compliant Phase 2 QR Code"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-sm group hover:border-primary/20 transition-all">
                                <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                                <span className="text-xs font-bold text-foreground/80">{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="p-10 rounded-[2.5rem] bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -mr-10 -mt-20 opacity-30" />
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                        <Zap className="w-8 h-8 text-primary fill-primary/20" />
                    </div>
                    <div className="space-y-2 relative z-10">
                        <h4 className="text-lg font-bold">Zero Manual Effort</h4>
                        <p className="text-sm opacity-70 leading-relaxed font-medium">
                            FatooraPro automatically handles all math, rounding, and ZATCA-compliant formatting.
                            Create an invoice in seconds while remaining 100% compliant with the latest Saudi tax laws.
                        </p>
                    </div>
                </div>
            </div>
        </StaticLayout>
    );
}
