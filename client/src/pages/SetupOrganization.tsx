import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, FileText, MapPin, Hash, Phone, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function OrganizationSetup() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t, isRTL } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        vatNumber: "",
        address: "",
        city: "",
        country: "Saudi Arabia",
        phone: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            console.log("🏢 Creating organization:", formData);

            const res = await fetch("/api/organization", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to create organization");
            }

            const data = await res.json();
            console.log("✅ Organization created:", data);

            toast({
                title: "Organization Created! 🎉",
                description: "Your organization has been set up successfully.",
            });

            // Refresh auth state to get updated organization
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

            // Redirect to dashboard
            navigate("/dashboard");
        } catch (err: any) {
            console.error("❌ Organization creation error:", err);
            toast({
                title: t("common.error"),
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-8 right-8">
                <LanguageSwitcher />
            </div>

            <div className="max-w-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Card className="border-border/50 shadow-2xl rounded-3xl overflow-hidden glass-panel">
                    <div className="h-2 w-full bg-primary" />
                    <CardHeader className="text-center space-y-3 pt-10">
                        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 shadow-inner group transition-all duration-500 hover:rotate-6">
                            <Building2 className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                        </div>

                        <CardTitle className="text-4xl font-display font-black tracking-tight">{isRTL ? 'إعداد المنظمة' : 'Setup Your Organization'}</CardTitle>

                        <CardDescription className="text-lg font-medium text-muted-foreground max-w-md mx-auto">
                            {isRTL ? 'أدخل تفاصيل شركتك لبدء إدارة الفواتير' : 'Enter your company details to get started with invoice management'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-10 pb-10">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Company Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2 font-bold text-sm">
                                    <Building2 className="w-4 h-4 text-primary" />
                                    {isRTL ? 'اسم الشركة *' : 'Company Name *'}
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="ABC Trading Company"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* VAT Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="vatNumber" className="flex items-center gap-2 font-bold text-sm">
                                        <Hash className="w-4 h-4 text-primary" />
                                        {isRTL ? 'الرقم الضريبي (اختياري)' : 'VAT Number (Optional)'}
                                    </Label>
                                    <Input
                                        id="vatNumber"
                                        name="vatNumber"
                                        placeholder="300123456789012"
                                        value={formData.vatNumber}
                                        onChange={handleChange}
                                        maxLength={15}
                                        className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                                    />
                                    <p className="text-[10px] text-muted-foreground font-medium">
                                        {isRTL ? 'الرقم الضريبي السعودي يبدأ بـ 3 (15 رقماً)' : 'Saudi VAT number starts with 3 (15 digits)'}
                                    </p>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2 font-bold text-sm">
                                        <Phone className="w-4 h-4 text-primary" />
                                        {isRTL ? 'رقم الهاتف (اختياري)' : 'Phone (Optional)'}
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="+966 XX XXX XXXX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address" className="flex items-center gap-2 font-bold text-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {isRTL ? 'العنوان (اختياري)' : 'Address (Optional)'}
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    placeholder="Street address, District"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                                />
                            </div>

                            {/* City & Country */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="font-bold text-sm">{isRTL ? 'المدينة' : 'City'}</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        placeholder="Riyadh"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="h-12 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country" className="font-bold text-sm">{isRTL ? 'الدولة' : 'Country'}</Label>
                                    <Input
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        disabled
                                        className="h-12 rounded-xl bg-muted/30 border-border/50 opacity-100"
                                    />
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4 transition-all hover:bg-primary/[0.08]">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-primary uppercase tracking-wider">{isRTL ? 'لماذا نحتاج هذه المعلومات؟' : 'Why do we need this?'}</p>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                        {isRTL ? 'ستظهر هذه المعلومات في فواتيرك وهي مطلوبة للامتثال لمتطلبات زاتكا للفوترة الإلكترونية في المملكة العربية السعودية.' : 'This information will appear on your invoices and is required for ZATCA e-invoicing compliance in Saudi Arabia.'}
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover-lift transition-all"
                                    disabled={loading || !formData.name}
                                >
                                    {loading ? t("common.loading") : isRTL ? 'إنشاء المنظمة' : 'Create Organization'}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
