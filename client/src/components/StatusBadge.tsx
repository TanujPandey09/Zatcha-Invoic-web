import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/i18n";

interface StatusBadgeProps {
  status: "draft" | "sent" | "paid" | "cancelled";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();

  const styles = {
    draft: "bg-gray-100 text-gray-600 border-gray-200 shadow-sm",
    sent: "bg-blue-50 text-blue-600 border-blue-200 shadow-sm",
    paid: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm",
    cancelled: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-[10px] font-black border inline-flex items-center gap-1.5 uppercase tracking-wider transition-all duration-300",
        styles[status],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
        status === 'draft' && "bg-gray-500",
        status === 'sent' && "bg-blue-500",
        status === 'paid' && "bg-emerald-500",
        status === 'cancelled' && "bg-rose-500",
      )} />
      {t(`common.status.${status}`)}
    </span>
  );
}
