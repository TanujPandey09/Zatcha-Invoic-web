import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    Shield,
    CheckCircle2,
    XCircle,
    Clock,
    QrCode,
    FileText,
    Download,
    Send,
    AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ZATCACompliancePage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [vatNumberToValidate, setVatNumberToValidate] = useState("");

    // Fetch compliance status
    const { data: complianceStatus, isLoading } = useQuery({
        queryKey: [`${API_URL}/api/zatca/compliance-status`],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/zatca/compliance-status`, {
                credentials: "include",
            });
            return res.json();
        },
    });

    // Fetch invoices
    const { data: invoices } = useQuery({
        queryKey: [`${API_URL}/api/invoices`],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/invoices`, {
                credentials: "include",
            });
            return res.json();
        },
    });

    // Fetch QR code for selected invoice
    const { data: qrData } = useQuery({
        queryKey: [`${API_URL}/api/zatca/qrcode`, selectedInvoiceId],
        queryFn: async () => {
            if (!selectedInvoiceId) return null;
            const res = await fetch(`${API_URL}/api/zatca/qrcode/${selectedInvoiceId}`, {
                credentials: "include",
            });
            return res.json();
        },
        enabled: !!selectedInvoiceId,
    });

    // Process invoice mutation
    const processInvoice = useMutation({
        mutationFn: async (invoiceId: number) => {
            const res = await fetch(`${API_URL}/api/zatca/process/${invoiceId}`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to process invoice");
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Invoice processed for ZATCA compliance",
            });
            queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/zatca/compliance-status`] });
            queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/invoices`] });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Submit to ZATCA mutation
    const submitToZATCA = useMutation({
        mutationFn: async (invoiceId: number) => {
            const res = await fetch(`${API_URL}/api/zatca/submit/${invoiceId}`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to submit to ZATCA");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: data.success ? "Success" : "Submission Failed",
                description: data.success
                    ? "Invoice submitted to ZATCA"
                    : data.errors?.[0] || "ZATCA submission not configured",
                variant: data.success ? "default" : "destructive",
            });
        },
    });

    // Validate VAT number mutation
    const validateVAT = useMutation({
        mutationFn: async (vatNumber: string) => {
            const res = await fetch(`${API_URL}/api/zatca/validate-vat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ vatNumber }),
            });
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: data.isValid ? "Valid VAT Number" : "Invalid VAT Number",
                description: data.format,
                variant: data.isValid ? "default" : "destructive",
            });
        },
    });

    // Download XML
    const handleDownloadXML = (invoiceId: number) => {
        window.open(`${API_URL}/api/zatca/xml/${invoiceId}`, "_blank");
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto p-6">
                    <div className="text-center">Loading...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Shield className="w-8 h-8 text-primary" />
                        ZATCA Compliance
                    </h1>
                    <p className="text-muted-foreground">
                        E-Invoicing compliance status and management
                    </p>
                </div>

                {/* Compliance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Organization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-semibold">{complianceStatus?.organization.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">VAT Number</p>
                                    <p className="font-mono">
                                        {complianceStatus?.organization.vatNumber || "Not set"}
                                    </p>
                                </div>
                                <div>
                                    <Badge
                                        variant={
                                            complianceStatus?.organization.hasZATCACredentials
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {complianceStatus?.organization.hasZATCACredentials
                                            ? "Credentials Configured"
                                            : "Credentials Needed"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Invoice Compliance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm">Processed</span>
                                        <span className="font-semibold">
                                            {complianceStatus?.invoices.processed} /{" "}
                                            {complianceStatus?.invoices.total}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{
                                                width: `${complianceStatus?.invoices.compliancePercentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold">
                                        {complianceStatus?.invoices.compliancePercentage}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">Compliance Rate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Phase Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Current Phase</span>
                                    <Badge>{complianceStatus?.phase.current}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Ready For</span>
                                    <Badge variant="outline">{complianceStatus?.phase.ready}</Badge>
                                </div>
                                <div className="pt-2 space-y-1">
                                    {Object.entries(complianceStatus?.phase.features || {}).map(
                                        ([key, value]) => (
                                            <div key={key} className="flex items-center gap-2 text-xs">
                                                {value ? (
                                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 text-gray-400" />
                                                )}
                                                <span className="capitalize">
                                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* VAT Number Validator */}
                <Card>
                    <CardHeader>
                        <CardTitle>VAT Number Validator</CardTitle>
                        <CardDescription>
                            Validate Saudi Arabia VAT numbers (15 digits, starts with 3)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Label>VAT Number</Label>
                                <Input
                                    placeholder="300123456789012"
                                    value={vatNumberToValidate}
                                    onChange={(e) => setVatNumberToValidate(e.target.value)}
                                    maxLength={15}
                                />
                            </div>
                            <Button
                                onClick={() => validateVAT.mutate(vatNumberToValidate)}
                                disabled={!vatNumberToValidate || validateVAT.isPending}
                                className="self-end"
                            >
                                Validate
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Processing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Process Invoices for ZATCA</CardTitle>
                        <CardDescription>
                            Generate UUID, hash, QR code, and XML for each invoice
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {invoices?.slice(0, 10).map((invoice: any) => (
                                <div
                                    key={invoice.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div>
                                            {invoice.zatcaUuid ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {invoice.client.name} • {invoice.total} SAR
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {invoice.zatcaUuid ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedInvoiceId(invoice.id)}
                                                >
                                                    <QrCode className="w-4 h-4 mr-1" />
                                                    QR Code
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownloadXML(invoice.id)}
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    XML
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => submitToZATCA.mutate(invoice.id)}
                                                    disabled={submitToZATCA.isPending}
                                                >
                                                    <Send className="w-4 h-4 mr-1" />
                                                    Submit
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => processInvoice.mutate(invoice.id)}
                                                disabled={processInvoice.isPending}
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                Process
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code Display */}
                {selectedInvoiceId && qrData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>ZATCA QR Code</CardTitle>
                            <CardDescription>
                                Scan this code to verify invoice authenticity
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <QRCodeSVG value={qrData.qrCode} size={256} level="H" />
                            <p className="text-xs text-muted-foreground mt-4 text-center max-w-md">
                                This QR code contains: Seller name, VAT number, Invoice date, Total
                                amount, and VAT amount (TLV encoded)
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => setSelectedInvoiceId(null)}
                            >
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Phase 2 Requirements */}
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            Phase 2 Integration Requirements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p>To complete Phase 2 integration, you need to:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Register with ZATCA and obtain Unit ID</li>
                                <li>Generate cryptographic certificates (Public/Private keys)</li>
                                <li>Configure organization with ZATCA credentials</li>
                                <li>Test in ZATCA sandbox environment</li>
                                <li>Get compliance certificate from ZATCA</li>
                                <li>Deploy to production with live credentials</li>
                            </ul>
                            <p className="mt-4 font-semibold">
                                All technical features are ready - only credentials needed!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}