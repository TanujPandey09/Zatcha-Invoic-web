import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border">
            <Sun className="h-4 w-4 text-amber-500" />
            <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-primary"
            />
            <Moon className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium cursor-pointer" onClick={toggleTheme}>
                {isDark ? "Dark" : "Light"} Mode
            </Label>
        </div>
    );
}
