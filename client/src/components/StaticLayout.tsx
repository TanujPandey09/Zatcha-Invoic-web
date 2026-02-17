import { motion } from "framer-motion";
import { PublicNavbar, PublicFooter, GridPattern, Glow } from "@/components/PublicComponents";

interface StaticLayoutProps {
    title: string;
    description?: string;
    tag?: string;
    lastUpdated?: string;
    children: React.ReactNode;
}

export function StaticLayout({ title, description, tag, lastUpdated, children }: StaticLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary selection:text-white flex flex-col">
            <PublicNavbar />

            <main className="flex-grow">
                {/* Hero Section for Static Pages */}
                <section className="pt-40 pb-20 px-6 relative overflow-hidden border-b border-border/50">
                    <GridPattern />
                    <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            {tag && (
                                <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold tracking-[0.2em] uppercase border border-primary/10 shadow-sm">
                                    {tag}
                                </span>
                            )}

                            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground leading-tight">
                                {title}
                            </h1>

                            {description && (
                                <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                                    {description}
                                </p>
                            )}

                            {lastUpdated && (
                                <div className="flex items-center gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                    <div className="w-8 h-[1px] bg-border" />
                                    Last Updated: {lastUpdated}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-20 px-6 relative overflow-hidden">
                    <Glow className="top-0 left-1/4 w-[400px] h-[400px] -translate-x-1/2 opacity-5" />
                    <div className="max-w-4xl mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-sm md:prose-base leading-relaxed text-muted-foreground/90">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
