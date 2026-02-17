import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useInvoice } from "@/hooks/use-invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    Printer,
    QrCode,
    FileText,
    CheckCircle2,
    Clock,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL;
export default function InvoiceDetail() {
    const { id } = useParams();

    // Fetch invoice details
    const { data: invoice, isLoading } = useInvoice(Number(id));

    // ✅ FIX: Sirf tab API call karo jab invoice mein QR stored nahi hai

    const { data: qrData } = useQuery({
        queryKey: [`/api/zatca/qrcode/${id}`],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/zatca/qrcode/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                credentials: "include",
            });
            return res.json();
        },
        enabled: !!invoice?.zatcaUuid && !invoice?.zatcaQr,
    });

    // ✅ FIX: Pehle stored QR use karo (fast), phir API wala (fallback)
    const qrValue = invoice?.zatcaQr || qrData?.qrCode;

    if (isLoading) {
        return <div className="container mx-auto p-6">Loading...</div>;
    }

    if (!invoice) {
        return <div className="container mx-auto p-6">Invoice not found</div>;
    }

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadXML = () => {
        window.open(`${API_URL}/api/zatca/xml/${id}`, "_blank");
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6 no-print">
                <div>
                    <h1 className="text-2xl font-bold">Invoice Details</h1>
                    <p className="text-muted-foreground">#{invoice.invoiceNumber}</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    {invoice.zatcaUuid && (
                        <Button variant="outline" onClick={handleDownloadXML}>
                            <FileText className="w-4 h-4 mr-2" />
                            Download XML
                        </Button>
                    )}
                </div>
            </div>

            {/* ZATCA Status Banner */}
            {invoice.zatcaUuid && (
                <Card className="mb-6 border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-900">
                                    ZATCA Compliant Invoice
                                </p>
                                <p className="text-sm text-green-700">
                                    This invoice has been processed and is ready for e-invoicing
                                    submission
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Invoice Content */}
            <Card className="print:shadow-none">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-3xl mb-2">TAX INVOICE</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Invoice Number: {invoice.invoiceNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Issue Date:{" "}
                                {new Date(invoice.issueDate).toLocaleDateString("en-GB")}
                            </p>
                            {invoice.dueDate && (
                                <p className="text-sm text-muted-foreground">
                                    Due Date:{" "}
                                    {new Date(invoice.dueDate).toLocaleDateString("en-GB")}
                                </p>
                            )}
                        </div>

                        <Badge
                            variant={
                                invoice.status === "paid"
                                    ? "default"
                                    : invoice.status === "overdue"
                                        ? "destructive"
                                        : "secondary"
                            }
                            className="text-lg px-4 py-2"
                        >
                            {invoice.status.toUpperCase()}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* From */}
                        <div>
                            <h3 className="font-semibold mb-2">From:</h3>
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold">
                                    {invoice.organization?.name || "Your Company"}
                                </p>
                                {invoice.organization?.vatNumber && (
                                    <p className="text-muted-foreground">
                                        VAT: {invoice.organization.vatNumber}
                                    </p>
                                )}
                                {invoice.organization?.address && (
                                    <p className="text-muted-foreground">
                                        {invoice.organization.address}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* To */}
                        <div>
                            <h3 className="font-semibold mb-2">To:</h3>
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold">{invoice.client.name}</p>
                                {invoice.client.vatNumber && (
                                    <p className="text-muted-foreground">
                                        VAT: {invoice.client.vatNumber}
                                    </p>
                                )}
                                {invoice.client.address && (
                                    <p className="text-muted-foreground">
                                        {invoice.client.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="pb-2">Description</th>
                                    <th className="pb-2 text-right">Qty</th>
                                    <th className="pb-2 text-right">Unit Price</th>
                                    <th className="pb-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items?.map((item: any, index: number) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-3">{item.description}</td>
                                        <td className="py-3 text-right">{item.quantity}</td>
                                        <td className="py-3 text-right">
                                            {Number(item.unitPrice).toFixed(2)} SAR
                                        </td>
                                        <td className="py-3 text-right">
                                            {Number(item.amount).toFixed(2)} SAR
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>{Number(invoice.subtotal).toFixed(2)} SAR</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">VAT (15%):</span>
                                <span>{Number(invoice.taxTotal).toFixed(2)} SAR</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total:</span>
                                <span>{Number(invoice.total).toFixed(2)} SAR</span>
                            </div>
                        </div>
                    </div>

                    {/* ZATCA Information + QR Code */}
                    {invoice.zatcaUuid && (
                        <div className="border-t pt-6">
                            <h3 className="font-semibold mb-4">
                                ZATCA E-Invoicing Information
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Invoice UUID:</p>
                                        <p className="font-mono text-xs break-all">
                                            {invoice.zatcaUuid}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Invoice Hash:</p>
                                        <p className="font-mono text-xs break-all">
                                            {invoice.zatcaHash?.substring(0, 32)}...
                                        </p>
                                    </div>
                                </div>

                                {/* ✅ FIX: qrValue use karo - stored ya API fallback */}
                                <div className="flex flex-col items-center">
                                    {qrValue ? (
                                        <>
                                            <QRCodeSVG
                                                value={qrValue}
                                                size={120}
                                                level="H"
                                            />
                                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                                Scan to verify invoice
                                            </p>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-[120px] h-[120px] border-2 border-dashed border-muted-foreground/30 rounded-lg">
                                            <QrCode className="w-8 h-8 text-muted-foreground/40" />
                                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                                QR generating...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Note */}
                    <div className="border-t pt-6 text-sm text-muted-foreground">
                        <p>
                            This is a computer-generated invoice and complies with ZATCA
                            e-invoicing requirements.
                        </p>
                        <p className="mt-1">
                            Thank you for your business. Payment terms:{" "}
                            {invoice.dueDate
                                ? "Due by " + new Date(invoice.dueDate).toLocaleDateString("en-GB")
                                : "Upon receipt"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Print Styles */}
            <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
        </div>
    );
}