import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { useInvoices, useCreateInvoice, useUpdateInvoiceStatus, useDeleteInvoice, useUpdateInvoice } from "@/hooks/use-invoices";
import { useClients } from "@/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { TableSkeleton } from "@/components/TableSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Search, Filter, MoreHorizontal, FileDown, Pencil, Trash2, Eye, Download, CheckCircle2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/i18n";

const invoiceFormSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  invoiceNumber: z.string().optional(),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
    unitPrice: z.coerce.number().min(0.01, "Price must be > 0"),
  })).min(1, "At least one item is required"),
});

const API_URL = import.meta.env.VITE_API_URL;

export default function Invoices() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  const { data: invoices, isLoading } = useInvoices({ status: filterStatus });
  const { data: clients } = useClients();
  const createInvoice = useCreateInvoice();
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoiceMutation = useDeleteInvoice();
  const updateInvoice = useUpdateInvoice();

  // ===== CREATE FORM =====
  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      issueDate: new Date().toISOString().split('T')[0],
      items: [{ description: "", quantity: 1, unitPrice: 0 }]
    }
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  // ===== EDIT FORM =====
  const editForm = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: "",
      invoiceNumber: "",
      issueDate: new Date().toISOString().split('T')[0],
      items: [{ description: "", quantity: 1, unitPrice: 0 }]
    }
  });
  const { fields: editFields, append: editAppend, remove: editRemove } = useFieldArray({
    control: editForm.control, name: "items"
  });

  const onSubmit = (values: z.infer<typeof invoiceFormSchema>) => {
    createInvoice.mutate({
      clientId: parseInt(values.clientId),
      ...(values.invoiceNumber ? { invoiceNumber: values.invoiceNumber } : {}),
      issueDate: new Date(values.issueDate),
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
      items: values.items,
      status: "draft"
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset({ invoiceNumber: "", issueDate: new Date().toISOString().split('T')[0], items: [{ description: "", quantity: 1, unitPrice: 0 }] });
      }
    });
  };

  // ===== EDIT OPEN =====
  const handleEditOpen = (invoice: any) => {
    setEditingInvoice(invoice);
    editForm.reset({
      clientId: invoice.client?.id?.toString() || "",
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate?.split('T')[0] || "",
      items: invoice.items?.map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })) || [{ description: "", quantity: 1, unitPrice: 0 }]
    });
    setIsEditOpen(true);
  };

  const onEditSubmit = (values: z.infer<typeof invoiceFormSchema>) => {
    updateInvoice.mutate({
      id: editingInvoice.id,
      data: {
        clientId: parseInt(values.clientId),
        dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        items: values.items,
      }
    }, {
      onSuccess: () => { setIsEditOpen(false); setEditingInvoice(null); }
    });
  };

  // ===== DELETE =====
  const handleDelete = () => {
    if (!deleteInvoiceId) return;
    deleteInvoiceMutation.mutate(deleteInvoiceId, {
      onSuccess: () => setDeleteInvoiceId(null)
    });
  };

  // ===== DOWNLOAD PDF =====
  const handleDownloadPDF = (invoiceId: number) => {
    window.open(`${API_URL}/invoices/${invoiceId}/pdf`, "_blank");
  };

  const handleStatusChange = (id: number, newStatus: "draft" | "sent" | "paid" | "cancelled") => {
    updateStatus.mutate({ id, status: newStatus });
  };

  // ===== SHARED FORM FIELDS =====
  const FormFields = ({ f, flds, appendFn, removeFn }: any) => (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField control={f.control} name="clientId" render={({ field }) => (
          <FormItem>
            <FormLabel>Client</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger></FormControl>
              <SelectContent>
                {clients?.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={f.control} name="invoiceNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>Invoice Number <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
            <FormControl><Input placeholder="Auto-generated" {...field} /></FormControl>
          </FormItem>
        )} />
        <FormField control={f.control} name="issueDate" render={({ field }) => (
          <FormItem><FormLabel>Issue Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={f.control} name="dueDate" render={({ field }) => (
          <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
        )} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Items</h4>
          <Button type="button" variant="ghost" size="sm" onClick={() => appendFn({ description: "", quantity: 1, unitPrice: 0 })}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>
        {flds.map((fld: any, index: number) => (
          <div key={fld.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6">
              <FormField control={f.control} name={`items.${index}.description`} render={({ field }) => (
                <FormItem><FormControl><Input placeholder="Description" {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="col-span-2">
              <FormField control={f.control} name={`items.${index}.quantity`} render={({ field }) => (
                <FormItem><FormControl><Input type="number" placeholder="Qty" min="0.01" step="0.01" {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="col-span-3">
              <FormField control={f.control} name={`items.${index}.unitPrice`} render={({ field }) => (
                <FormItem><FormControl><Input type="number" placeholder="Price" min="0.01" step="0.01" {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="col-span-1">
              <Button type="button" variant="ghost" size="icon" disabled={flds.length === 1} onClick={() => removeFn(index)}>
                <span className="text-destructive text-lg">×</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 bg-card/50 p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight">{t("common.invoices")}</h2>
          <p className="text-muted-foreground font-medium">Manage your invoices and payments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border/50 hover:bg-muted/50 h-11 px-6 rounded-xl font-bold">
            <FileDown className="w-4 h-4" /> Export
          </Button>

          {/* CREATE */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/25 font-bold h-11 px-6 rounded-xl">
                <Plus className="w-4 h-4" /> {t("common.create")} {t("common.invoices")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader><DialogTitle className="text-2xl font-black">{t("common.create")} New Invoice</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormFields f={form} flds={fields} appendFn={append} removeFn={remove} />
                  <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <Button type="button" variant="outline" className="h-11 px-6 rounded-xl border-border/50" onClick={() => setIsCreateOpen(false)}>{t("common.cancel")}</Button>
                    <Button type="submit" className="h-11 px-8 rounded-xl font-bold" disabled={createInvoice.isPending}>
                      {createInvoice.isPending ? t("common.loading") : t("common.create")}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black">{t("common.edit")} Invoice — {editingInvoice?.invoiceNumber}</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
              <FormFields f={editForm} flds={editFields} appendFn={editAppend} removeFn={editRemove} />
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button type="button" variant="outline" className="h-11 px-6 rounded-xl border-border/50" onClick={() => setIsEditOpen(false)}>{t("common.cancel")}</Button>
                <Button type="submit" className="h-11 px-8 rounded-xl font-bold" disabled={updateInvoice.isPending}>
                  {updateInvoice.isPending ? t("common.loading") : t("common.save")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <AlertDialog open={!!deleteInvoiceId} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="h-11 px-6 rounded-xl border-border/50">{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 h-11 px-8 rounded-xl font-bold"
              disabled={deleteInvoiceMutation.isPending}
            >
              {deleteInvoiceMutation.isPending ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* TABLE */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-fade-in">
        <div className="p-4 border-b border-border/30 flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
          <div className="relative max-w-sm w-full group">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors`} />
            <input
              className={`w-full h-10 ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} bg-white border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
              placeholder={t("common.search")}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] h-10 bg-white border-border/50 rounded-xl font-bold"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : invoices?.length === 0 ? (
          <div className="rounded-lg border border-border bg-card">
            <EmptyState
              icon="file"
              title="No invoices found"
              description={filterStatus === 'all' ? "You haven't created any invoices yet." : `No invoices with status "${filterStatus}".`}
              action={{ label: t("common.create"), onClick: () => setIsCreateOpen(true) }}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/10 border-b border-border/30">
                <TableHead className="font-bold py-4">Invoice #</TableHead>
                <TableHead className="font-bold py-4">Client</TableHead>
                <TableHead className="font-bold py-4">Date</TableHead>
                <TableHead className="font-bold py-4">Amount</TableHead>
                <TableHead className="font-bold py-4">Status</TableHead>
                <TableHead className={`text-right font-bold py-4 ${isRTL ? 'text-left' : 'text-right'}`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-primary/[0.02] border-border/40 transition-colors">
                  <TableCell className="font-bold text-primary py-4">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="font-medium">{invoice.client?.name ?? "Unknown"}</TableCell>
                  <TableCell className="text-muted-foreground font-medium">{format(new Date(invoice.issueDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-black font-mono text-sm">
                    {Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[10px] text-muted-foreground font-sans uppercase">SAR</span>
                  </TableCell>
                  <TableCell><StatusBadge status={invoice.status} /></TableCell>
                  <TableCell className={`py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-muted/80 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56 p-2 rounded-2xl shadow-2xl border-border/50 backdrop-blur-xl animate-in fade-in zoom-in duration-200">

                        <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t("common.actions")}</div>

                        <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}`)} className="rounded-xl mb-1 cursor-pointer focus:bg-blue-500/10 focus:text-blue-600 transition-colors py-2.5">
                          <Eye className="w-4 h-4 mr-3 text-blue-500" /> <span className="font-bold">{t("common.view")} Details</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleDownloadPDF(invoice.id)} className="rounded-xl mb-1 cursor-pointer focus:bg-green-500/10 focus:text-green-600 transition-colors py-2.5">
                          <Download className="w-4 h-4 mr-3 text-green-500" /> <span className="font-bold">Download PDF</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2 opacity-50" />

                        {invoice.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'sent')} className="rounded-xl mb-1 cursor-pointer text-primary focus:bg-primary/10 transition-colors py-2.5">
                            <FileDown className="w-4 h-4 mr-3" /> <span className="font-bold">Mark as Sent</span>
                          </DropdownMenuItem>
                        )}
                        {invoice.status === 'sent' && (
                          <>
                            <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-2">{t("common.status")}</div>
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')} className="rounded-xl mb-1 cursor-pointer text-green-600 focus:bg-green-500/10 transition-colors py-2.5">
                              <CheckCircle2 className="w-4 h-4 mr-3" /> <span className="font-bold">Mark as Paid</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'cancelled')} className="rounded-xl mb-1 cursor-pointer text-destructive focus:bg-destructive/10 transition-colors py-2.5">
                              <span className="w-4 h-4 mr-3 flex items-center justify-center font-black">×</span> <span className="font-bold">Mark as Cancelled</span>
                            </DropdownMenuItem>
                          </>
                        )}

                        {/* ✅ Edit & Delete - sirf Draft mein */}
                        {invoice.status === 'draft' && (
                          <>
                            <DropdownMenuSeparator className="my-2 opacity-50" />
                            <DropdownMenuItem onClick={() => handleEditOpen(invoice)} className="rounded-xl mb-1 cursor-pointer focus:bg-amber-500/10 focus:text-amber-600 transition-colors py-2.5">
                              <Pencil className="w-4 h-4 mr-3 text-amber-500" /> <span className="font-bold">{t("common.edit")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteInvoiceId(invoice.id)}
                              className="rounded-xl cursor-pointer text-destructive focus:bg-destructive focus:text-white transition-all py-2.5"
                            >
                              <Trash2 className="w-4 h-4 mr-3" /> <span className="font-bold">{t("common.delete")}</span>
                            </DropdownMenuItem>
                          </>
                        )}

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Layout>
  );
}