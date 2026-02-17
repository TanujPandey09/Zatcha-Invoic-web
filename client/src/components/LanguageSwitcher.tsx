import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/i18n";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
    const { language, setLanguage } = useTranslation();

    return (
        <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary/5 transition-colors h-9"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        >
            <Languages className="w-4 h-4 text-primary" />
            <span className="font-bold text-xs uppercase tracking-wider">
                {language === 'en' ? 'AR' : 'EN'}
            </span>
        </Button>
    );
}
