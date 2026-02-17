import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Shield,
    CheckCircle2,
    Clock,
    AlertCircle,
    Copy,
    FileText,
    Key,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_URL = import.meta.env.VITE_API_URL;

export default function ZATCAIntegrationPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1);
    const [csr, setCSR] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [otp, setOTP] = useState("");
    const [complianceRequestId, setComplianceRequestId] = useState("");
    const [binarySecurityToken, setBinarySecurityToken] = useState("");
    const [secret, setSecret] = useState("");

    // ✅ Fixed: Changed from useQuery to useMutation and correct endpoint
    const testConnection = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/api/zatca/integration/test`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to test connection");
            return res.json();
        },
    });

    // Get integration status
    const { data: integrationStatus } = useQuery({
        queryKey: [`${API_URL}/api/zatca/integration/status`],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/zatca/integration/status`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                credentials: "include",
            });
            return res.json();
        },
    });

    // Generate CSR
    const generateCSRMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`${API_URL}/api/zatca/integration/generate-csr`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                method: "POST",
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to generate CSR");
            return res.json();
        },
        onSuccess: (data) => {
            setCSR(data.csr);
            setPrivateKey(data.privateKey);
            setStep(2);
            toast({
                title: "✅ CSR Generated",
                description: "Save your private key securely!",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Compliance check
    const complianceCheckMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/api/zatca/integration/compliance-check`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ csr, otp }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: (data) => {
            setBinarySecurityToken(data.binarySecurityToken);
            setSecret(data.secret);
            setComplianceRequestId(data.binarySecurityToken); // Use token as request ID for now
            setStep(4); // ✅ Fixed: Now goes to production CSID step
            toast({
                title: "✅ Compliance Check Passed!",
                description: "Next: Get Production CSID",
            });
            queryClient.invalidateQueries({
                queryKey: [`${API_URL}/api/zatca/integration/status`],

            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Compliance Check Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // ✅ NEW: Get Production CSID
    const getProductionCSIDMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/api/zatca/integration/production-csid`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                credentials: "include",
                body: JSON.stringify({ complianceRequestId }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: (data) => {
            setBinarySecurityToken(data.binarySecurityToken);
            setSecret(data.secret);
            setStep(5); // ✅ Fixed: Now goes to final step
            toast({
                title: "✅ Production CSID Obtained!",
                description: "You can now submit invoices to ZATCA",
            });
            queryClient.invalidateQueries({
                queryKey: [`${API_URL}/api/zatca/integration/status`],
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Production CSID Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "✅ Copied!",
            description: "Content copied to clipboard",
        });
    };

    return (
        <Layout>
            <div className="container mx-auto p-6 max-w-5xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="w-8 h-8 text-primary" />
                        ZATCA Integration Setup
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Complete ZATCA Phase 2 onboarding to submit invoices for clearance/reporting
                    </p>
                </div>

                {/* Status Card */}
                {integrationStatus && (
                    <Card
                        className={
                            integrationStatus.isConfigured
                                ? "border-green-200 bg-green-50"
                                : "border-yellow-200 bg-yellow-50"
                        }
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                {integrationStatus.isConfigured ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                                )}
                                <div>
                                    <p className="font-semibold">
                                        {integrationStatus.isConfigured
                                            ? "✅ ZATCA Ready for Production"
                                            : "⚠️ ZATCA Setup Required"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Status: {integrationStatus.status}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Onboarding Steps */}
                <Tabs value={`step${step}`} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="step1">1. Generate CSR</TabsTrigger>
                        <TabsTrigger value="step2">2. Submit CSR</TabsTrigger>
                        <TabsTrigger value="step3">3. Compliance</TabsTrigger>
                        <TabsTrigger value="step4">4. Production CSID</TabsTrigger>
                        <TabsTrigger value="step5">5. Ready!</TabsTrigger>
                    </TabsList>

                    {/* Step 1: Generate CSR */}
                    <TabsContent value="step1" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Generate Certificate Signing Request (CSR)</CardTitle>
                                <CardDescription>
                                    Step 1: Create your digital certificate request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <FileText className="w-4 h-4" />
                                    <AlertTitle>What is CSR?</AlertTitle>
                                    <AlertDescription>
                                        A CSR (Certificate Signing Request) is required to obtain a digital
                                        certificate from ZATCA for signing your invoices securely.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Organization Unit</Label>
                                        <Input
                                            id="orgUnit"
                                            placeholder="Main Branch"
                                            defaultValue="Main Branch"
                                        />
                                    </div>
                                    <div>
                                        <Label>Invoice Type</Label>
                                        <select
                                            id="invoiceType"
                                            className="w-full border rounded-md p-2"
                                            defaultValue="TSCZ"
                                        >
                                            <option value="TSCZ">Standard Tax Invoice (B2B)</option>
                                            <option value="TSTZ">Simplified Tax Invoice (B2C)</option>
                                        </select>
                                    </div>
                                </div>

                                <Button
                                    onClick={() =>
                                        generateCSRMutation.mutate({
                                            organizationUnitName:
                                                (document.getElementById("orgUnit") as HTMLInputElement)
                                                    ?.value || "Main Branch",
                                            invoiceType:
                                                (
                                                    document.getElementById(
                                                        "invoiceType"
                                                    ) as HTMLSelectElement
                                                )?.value || "TSCZ",
                                        })
                                    }
                                    disabled={generateCSRMutation.isPending}
                                    className="w-full"
                                >
                                    {generateCSRMutation.isPending ? "Generating..." : "Generate CSR"}
                                </Button>

                                {csr && (
                                    <div className="space-y-4 mt-4 pt-4 border-t">
                                        <div>
                                            <Label>CSR (Copy this to ZATCA)</Label>
                                            <div className="relative">
                                                <Textarea
                                                    value={csr}
                                                    readOnly
                                                    className="font-mono text-xs bg-gray-100"
                                                    rows={6}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => copyToClipboard(csr)}
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <Alert variant="destructive">
                                            <Key className="w-4 h-4" />
                                            <AlertTitle>🔴 CRITICAL: Save Private Key!</AlertTitle>
                                            <AlertDescription>
                                                <p className="text-sm mb-2">
                                                    You will never see this key again. Save it in a secure location.
                                                </p>
                                                <Textarea
                                                    value={privateKey}
                                                    readOnly
                                                    className="font-mono text-xs mt-2 bg-red-50"
                                                    rows={8}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-2"
                                                    onClick={() => copyToClipboard(privateKey)}
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy Private Key
                                                </Button>
                                            </AlertDescription>
                                        </Alert>

                                        <Button onClick={() => setStep(2)} className="w-full">
                                            Next: Submit to ZATCA →
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 2: Submit to ZATCA */}
                    <TabsContent value="step2" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit CSR to ZATCA Portal</CardTitle>
                                <CardDescription>
                                    Go to ZATCA portal and complete registration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <AlertCircle className="w-4 h-4" />
                                    <AlertTitle>⏱️ Manual Step Required</AlertTitle>
                                    <AlertDescription>
                                        You need to complete this step manually on the ZATCA portal
                                    </AlertDescription>
                                </Alert>

                                <ol className="list-decimal list-inside space-y-3 text-sm">
                                    <li>
                                        Go to{" "}
                                        <a
                                            href="https://fatoora.zatca.gov.sa"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline font-semibold"
                                        >
                                            ZATCA Portal
                                        </a>
                                    </li>
                                    <li>Login or create your account</li>
                                    <li>Navigate to E-Invoicing → Integration section</li>
                                    <li>Submit the CSR you just generated</li>
                                    <li>ZATCA will send you an OTP (One-Time Password) via email/SMS</li>
                                    <li>Copy the OTP and return here</li>
                                </ol>

                                <Alert className="border-blue-200 bg-blue-50">
                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                    <AlertTitle className="text-blue-900">Estimated Time</AlertTitle>
                                    <AlertDescription className="text-blue-800">
                                        Usually takes 5-10 minutes to receive OTP from ZATCA
                                    </AlertDescription>
                                </Alert>

                                <div className="pt-4 border-t">
                                    <Button
                                        onClick={() => setStep(3)}
                                        className="w-full"
                                    >
                                        I have OTP - Next Step →
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 3: Compliance Check */}
                    <TabsContent value="step3" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance Check (Sandbox Testing)</CardTitle>
                                <CardDescription>
                                    Enter OTP from ZATCA to verify your registration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                    <AlertTitle>Sandbox Credentials</AlertTitle>
                                    <AlertDescription>
                                        After compliance check, you'll get sandbox credentials to test
                                        invoice submission
                                    </AlertDescription>
                                </Alert>

                                <div>
                                    <Label>OTP from ZATCA</Label>
                                    <Input
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOTP(e.target.value)}
                                        maxLength={6}
                                        type="text"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        6-digit code sent to your email/SMS
                                    </p>
                                </div>

                                <Button
                                    onClick={() => complianceCheckMutation.mutate()}
                                    disabled={!otp || otp.length !== 6 || complianceCheckMutation.isPending}
                                    className="w-full"
                                >
                                    {complianceCheckMutation.isPending ? "Verifying..." : "Verify OTP & Proceed"}
                                </Button>

                                {binarySecurityToken && (
                                    <Alert className="border-green-200 bg-green-50 mt-4">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <AlertTitle className="text-green-900">
                                            ✅ Compliance Check Passed!
                                        </AlertTitle>
                                        <AlertDescription className="text-green-800">
                                            Sandbox credentials configured. Next: Request Production CSID
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 4: Get Production CSID */}
                    <TabsContent value="step4" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Request Production CSID</CardTitle>
                                <CardDescription>
                                    After testing, upgrade to production credentials
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <Clock className="w-4 h-4" />
                                    <AlertTitle>Optional Step</AlertTitle>
                                    <AlertDescription>
                                        You can test with sandbox credentials first. Request production
                                        credentials when ready to go live.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Before requesting production:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>Test invoice submission in sandbox</li>
                                        <li>Ensure all validation passes</li>
                                        <li>Test with different invoice types (B2B, B2C)</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={() => getProductionCSIDMutation.mutate()}
                                    disabled={!binarySecurityToken || getProductionCSIDMutation.isPending}
                                    className="w-full"
                                >
                                    {getProductionCSIDMutation.isPending
                                        ? "Requesting..."
                                        : "Request Production CSID"}
                                </Button>

                                {getProductionCSIDMutation.isSuccess && (
                                    <Alert className="border-green-200 bg-green-50 mt-4">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <AlertTitle className="text-green-900">
                                            ✅ Production CSID Obtained!
                                        </AlertTitle>
                                        <AlertDescription className="text-green-800">
                                            Your system is now ready for production invoice submission
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 5: Ready to Use */}
                    <TabsContent value="step5" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>🎉 Setup Complete!</CardTitle>
                                <CardDescription>
                                    Your ZATCA integration is ready
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <AlertTitle className="text-green-900">
                                        ✅ ZATCA Integration Complete!
                                    </AlertTitle>
                                    <AlertDescription className="text-green-800">
                                        You can now submit invoices to ZATCA for clearance/reporting. Your
                                        system is {binarySecurityToken ? "production-ready" : "sandbox-ready"}.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2 pt-4 border-t">
                                    <h4 className="font-semibold">Next Steps:</h4>
                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>Go to Invoices section</li>
                                        <li>Create or select an invoice</li>
                                        <li>Click "Process for ZATCA" to prepare it</li>
                                        <li>Click "Submit to ZATCA"</li>
                                        <li>Monitor submission status and QR code</li>
                                    </ol>
                                </div>

                                <Button
                                    onClick={() => (window.location.href = "/invoices")}
                                    className="w-full mt-4"
                                    size="lg"
                                >
                                    Go to Invoices →
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Help Card */}
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-900">📚 Help & Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li>
                                • <strong>ZATCA Portal:</strong>{" "}
                                <a
                                    href="https://fatoora.zatca.gov.sa"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    https://fatoora.zatca.gov.sa
                                </a>
                            </li>
                            <li>
                                • <strong>Documentation:</strong>{" "}
                                <a
                                    href="https://zatca.gov.sa"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    https://zatca.gov.sa
                                </a>
                            </li>
                            <li>• <strong>Support:</strong> support@yourcompany.com</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}