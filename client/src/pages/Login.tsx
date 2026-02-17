import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Apple, Mail, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const API_URL = import.meta.env.VITE_API_URL;

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, isRTL } = useTranslation();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      toast({
        title: t("common.error"),
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const endpoint = isRegister
        ? `${API_URL}/api/auth/register`
        : `${API_URL}/api/auth/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username: email.split('@')[0] }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Authentication failed");
      }

      const data = await res.json();
      localStorage.setItem('token', data.token); // ← ADD KARO

      await queryClient.refetchQueries({ queryKey: [`${API_URL}/api/auth/me`] });

      setTimeout(() => {
        navigate("/dashboard");
      }, 100);


      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Authentication failed");
      }

      toast({
        title: isRegister ? "Account Created 🎉" : "Welcome Back 👋",
        description: isRegister
          ? "Your account has been created successfully."
          : "Successfully signed in to your dashboard.",
      });

      await queryClient.refetchQueries({ queryKey: [`${API_URL}/api/auth/me`] });

      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (err: any) {
      toast({
        title: t("common.error"),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = (provider: string) => {
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className={`absolute top-8 ${isRTL ? 'right-8' : 'left-8'}`}>
        <Button variant="ghost" className="gap-2 font-bold" onClick={() => navigate("/")}>
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Button>
      </div>

      <div className={`absolute top-8 ${isRTL ? 'left-8 flex gap-4' : 'right-8 flex gap-4'}`}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary mx-auto flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl shadow-primary/20 mb-4">
            V
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight">
            {isRegister ? t("auth.register") : t("auth.welcome")}
          </h1>
          <p className="text-muted-foreground font-medium">
            {isRegister
              ? "Join thousands of Saudi businesses today"
              : "Enter your credentials to access your account"}
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl glass-panel overflow-hidden rounded-2xl">
          <CardContent className="pt-8 space-y-5">
            <div className="space-y-3">
              <Input
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
              />
              <Input
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-12 font-black rounded-xl shadow-lg shadow-primary/20 text-lg hover-lift"
              disabled={loading}
            >
              {loading ? t("common.loading") : isRegister ? t("auth.register") : t("auth.signIn")}
            </Button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                <span className="bg-card px-3 text-muted-foreground">{t("auth.socialLogin")}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-12 rounded-xl hover:bg-muted/50 transition-all hover:border-primary/50" onClick={() => handleSSO('google')}>
                <GoogleIcon />
              </Button>
              <Button variant="outline" className="h-12 rounded-xl hover:bg-muted/50 transition-all hover:border-primary/50" onClick={() => handleSSO('microsoft')}>
                <MicrosoftIcon />
              </Button>
              <Button variant="outline" className="h-12 rounded-xl hover:bg-muted/50 transition-all hover:border-primary/50" onClick={() => handleSSO('apple')}>
                <Apple className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-sm text-center text-muted-foreground pt-3 font-medium">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                className="text-primary font-black hover:underline"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? t("auth.signIn") : t("auth.register")}
              </button>
            </p>
          </CardContent>
        </Card>

        {!isRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs text-primary/80 font-bold leading-relaxed">
              VatFlow is now fully ZATCA Phase 2 compliant. Your data is secured with enterprise-grade encryption and stored locally in Saudi Arabia.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);
