import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useTranslation } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isRTL } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isRTL ? "mr-64" : "ml-64"
      )}>
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
