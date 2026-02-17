import { StaticLayout } from "@/components/StaticLayout";

export default function Phase2Docs() {
    return (
        <StaticLayout
            title="Phase 2: Integration Phase"
            tag="Technical Information"
            description="A technical roadmap for real-time invoice clearance and reporting integration with the ZATCA Fatoora portal."
            lastUpdated="February 2026"
        >
            <div className="space-y-12">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">What is Phase 2?</h2>
                    <p>
                        Unlike Phase 1, which focused on generation and local storage, Phase 2 introduces the <strong>Integration Phase</strong>.
                        In this stage, your invoicing system must communicate in real-time with ZATCA’s platform for clearance (B2B) or reporting (B2C) purposes.
                    </p>
                </section>

                <section className="space-y-6">
                    <h3 className="text-xl font-bold text-primary italic">Technical Requirements</h3>
                    <div className="flex flex-col gap-3">
                        {[
                            { t: "Invoice UUID", d: "A Universally Unique Identifier for every invoice generated." },
                            { t: "Cryptographic Hashing", d: "SHA-256 hash generation of the invoice XML." },
                            { t: "Invoice Chaining", d: "Linking current invoices to the previous invoice's hash." },
                            { t: "Digital Signature", d: "XAdES-compliant digital signatures for authenticity." },
                            { t: "UBL 2.1 XML", d: "Standardized machine-readable format for cross-platform compatibility." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-card border border-border group hover:border-primary/20 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                    {i + 1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground">{item.t}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-8 p-10 rounded-[2.5rem] bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
                    <h3 className="text-xl font-bold text-primary">Standard Integration SDK</h3>
                    <div className="space-y-6">
                        <p className="text-sm opacity-80 leading-relaxed font-medium">
                            FatooraPro developers have built an abstraction layer that handles the entire handshake protocol:
                        </p>
                        <div className="space-y-4 border-l-2 border-primary/20 ml-2 pl-8">
                            {[
                                "CSR Generation & Cryptographic Key Pair creation",
                                "API Authentication via CSID (Compliance/Production)",
                                "Asynchronous XML batch processing",
                                "Real-time clearance response parsing"
                            ].map((step, i) => (
                                <div key={i} className="relative group">
                                    <div className="absolute -left-[37px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                                    <p className="text-xs font-bold opacity-90">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="p-6 rounded-2xl bg-muted/30 border border-border text-xs font-bold text-center leading-relaxed">
                    Note: Phase 2 is mandatory for large enterprises first, followed by smaller waves for SMEs.
                    Contact our support team to see when your business is scheduled for integration.
                </div>
            </div>
        </StaticLayout>
    );
}
