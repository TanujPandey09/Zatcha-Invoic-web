import { StaticLayout } from "@/components/StaticLayout";

export default function ZatcaRulebook() {
    return (
        <StaticLayout
            title="ZATCA Rulebook"
            tag="Documentation"
            description="The definitive guide to electronic invoicing regulations and technical standards in the Kingdom of Saudi Arabia."
            lastUpdated="February 2026"
        >
            <div className="space-y-12">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Overview</h2>
                    <p>
                        The ZATCA E-Invoicing Rulebook defines the official requirements for electronic invoicing in the Kingdom of Saudi Arabia.
                        As part of Saudi Vision 2030, all taxable businesses must comply with the regulations issued by the Zakat, Tax and Customs Authority (ZATCA).
                    </p>
                </section>

                <section className="space-y-6">
                    <h3 className="text-xl font-bold text-primary italic">Core Compliance Pillars</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { t: "Sequential Numbering", d: "Invoices must follow a strictly chronological and sequential order." },
                            { t: "Mandatory VAT Fields", d: "Exact VAT rates, amounts, and breakdown are required for legal validity." },
                            { t: "Phase 1: Generation", d: "Storage and generation of electronic invoices via compliant systems." },
                            { t: "Phase 2: Integration", d: "Live API synchronization with ZATCA's platforms." },
                            { t: "Digital Security", d: "Cryptographic hashing and UUID generation for every transaction." },
                            { t: "XML/UBL Format", d: "Invoices must be queryable and structured for automated tax audits." }
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-card border border-border shadow-sm">
                                <span className="font-bold text-sm text-foreground block mb-1">{item.t}</span>
                                <span className="text-xs text-muted-foreground">{item.d}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <p className="text-foreground font-medium italic relative z-10 leading-relaxed">
                        "FatooraPro is engineered to abstract these complexities. Our engine handles the hashing, sequential numbering, and XML generation in the background so you can focus on building your business."
                    </p>
                </section>

                <section className="space-y-4 pt-8">
                    <h3 className="text-xl font-bold">Official Resources</h3>
                    <p>
                        For technical deep-dives into the e-invoicing SDK and formal legal specifications, refer to the official ZATCA portal:
                    </p>
                    <a
                        href="https://zatca.gov.sa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-bold underline underline-offset-4 decoration-2 hover:opacity-80 transition-all"
                    >
                        Visit ZATCA Official Website
                    </a>
                </section>
            </div>
        </StaticLayout>
    );
}
