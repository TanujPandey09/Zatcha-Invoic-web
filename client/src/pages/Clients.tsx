import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useClients, useCreateClient } from "@/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Mail, MapPin, Building2, Search, Briefcase, Eye, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "@/i18n/i18n";
import { authFetch, api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
});

export default function Clients() {
  const { t, isRTL } = useTranslation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { name: "", email: "", vatNumber: "", address: "" }
  });

  const editForm = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { name: "", email: "", vatNumber: "", address: "" }
  });

  const onSubmit = (values: z.infer<typeof clientFormSchema>) => {
    createClient.mutate({
      name: values.name,
      email: values.email || null,
      vatNumber: values.vatNumber || null,
      address: values.address || null,
    } as any, {
      onSuccess: () => { setIsCreateOpen(false); form.reset(); }
    });
  };

  const handleViewOpen = (client: any) => { setSelectedClient(client); setIsViewOpen(true); };

  const handleEditOpen = (client: any) => {
    setSelectedClient(client);
    editForm.reset({
      name: client.name || "",
      email: client.email || "",
      vatNumber: client.vatNumber || "",
      address: client.address || "",
    });
    setIsEditOpen(true);
  };

  const onEditSubmit = async (values: z.infer<typeof clientFormSchema>) => {
    setIsEditLoading(true);
    try {
      const res = await authFetch(`/api/clients/${selectedClient.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: values.name,
          email: values.email || null,
          vatNumber: values.vatNumber || null,
          address: values.address || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update client");
      queryClient.invalidateQueries({ queryKey: [api.clients.list.path] });
      toast({ title: "Success", description: "Client updated successfully" });
      setIsEditOpen(false);
      setSelectedClient(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsEditLoading(false);
    }
  };

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ClientFormFields = ({ f }: { f: any }) => (
    <>
      <FormField control={f.control} name="name" render={({ field }) => (
        <FormItem><FormLabel className="font-bold">Client Name</FormLabel>
          <FormControl><Input placeholder="Company name" className="h-11 rounded-lg border-border/50" {...field} /></FormControl>
          <FormMessage /></FormItem>
      )} />
      <FormField control={f.control} name="email" render={({ field }) => (
        <FormItem><FormLabel className="font-bold">Email</FormLabel>
          <FormControl><Input type="email" placeholder="contact@company.com" className="h-11 rounded-lg border-border/50" {...field} /></FormControl>
          <FormMessage /></FormItem>
      )} />
      <FormField control={f.control} name="vatNumber" render={({ field }) => (
        <FormItem><FormLabel className="font-bold">VAT Number</FormLabel>
          <FormControl><Input placeholder="300..." className="h-11 rounded-lg border-border/50" {...field} /></FormControl>
          <FormMessage /></FormItem>
      )} />
      <FormField control={f.control} name="address" render={({ field }) => (
        <FormItem><FormLabel className="font-bold">Address</FormLabel>
          <FormControl><Input placeholder="Street, City, Country" className="h-11 rounded-lg border-border/50" {...field} /></FormControl>
          <FormMessage /></FormItem>
      )} />
    </>
  );

  return (
    <Layout>
      {/* HEADER + CREATE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 bg-card/50 p-6 rounded-2xl border border-border/50 shadow-sm animate-fade-in">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight">{t("common.clients")}</h2>
          <p className="text-muted-foreground font-medium">Manage your client database and relationships.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25 font-bold h-11 px-6 rounded-xl">
              <Plus className="w-5 h-5" /> {t("common.create")}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle className="text-2xl font-black">{t("common.create")} Client</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                <ClientFormFields f={form} />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" className="h-11 px-6 rounded-xl border-border/50" onClick={() => setIsCreateOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" className="h-11 px-8 rounded-xl font-bold" disabled={createClient.isPending}>
                    {createClient.isPending ? t("common.loading") : t("common.create")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black">Edit Client</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5 pt-4">
              <ClientFormFields f={editForm} />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" className="h-11 px-6 rounded-xl border-border/50" onClick={() => setIsEditOpen(false)}>{t("common.cancel")}</Button>
                <Button type="submit" className="h-11 px-8 rounded-xl font-bold" disabled={isEditLoading}>
                  {isEditLoading ? t("common.loading") : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black">Client Details</DialogTitle></DialogHeader>
          {selectedClient && (
            <div className="pt-4 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-3xl shadow-inner">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-2xl">{selectedClient.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full mt-1 w-fit">
                    <Briefcase className="w-3 h-3" /> Client
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {selectedClient.email && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">Email</p>
                      <p className="font-semibold">{selectedClient.email}</p>
                    </div>
                  </div>
                )}
                {selectedClient.vatNumber && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <Building2 className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">VAT Number</p>
                      <p className="font-semibold">{selectedClient.vatNumber}</p>
                    </div>
                  </div>
                )}
                {selectedClient.address && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">Address</p>
                      <p className="font-semibold">{selectedClient.address}</p>
                    </div>
                  </div>
                )}
                {!selectedClient.email && !selectedClient.vatNumber && !selectedClient.address && (
                  <p className="text-muted-foreground text-center py-6 font-medium">No additional details available.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-11 rounded-xl border-border/50" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button className="flex-1 h-11 rounded-xl font-bold" onClick={() => { setIsViewOpen(false); handleEditOpen(selectedClient); }}>
                  <Pencil className="w-4 h-4 mr-2" /> Edit Client
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SEARCH */}
      <div className="relative max-w-md w-full mb-8 animate-fade-in group">
        <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors`} />
        <Input
          className={`${isRTL ? 'pr-11' : 'pl-11'} h-12 bg-card/50 border-border/50 rounded-2xl shadow-sm focus:bg-background transition-all`}
          placeholder={t("common.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border-border/50">
              <CardContent className="pt-6">
                <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                <Skeleton className="h-7 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full rounded-md mb-2" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </CardContent>
            </Card>
          ))
        ) : filteredClients?.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={searchTerm ? "search" : "users"}
              title={searchTerm ? "No clients found" : "No clients yet"}
              description={searchTerm ? `No clients match "${searchTerm}".` : "Add your first client to start creating invoices."}
              action={!searchTerm ? { label: t("common.create"), onClick: () => setIsCreateOpen(true) } : undefined}
            />
          </div>
        ) : (
          filteredClients?.map((client) => (
            <Card key={client.id} className="rounded-2xl border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group overflow-hidden">
              <div className="h-1.5 w-full bg-primary/10 group-hover:bg-primary/30 transition-colors" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight leading-tight">{client.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full mt-1 w-fit">
                      <Briefcase className="w-3 h-3" /> Client
                    </div>
                  </div>
                </div>
                <div className="space-y-3 pt-2 text-sm font-medium text-muted-foreground">
                  {client.email && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                      <Mail className="w-4 h-4 text-primary" /><span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.vatNumber && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                      <Building2 className="w-4 h-4 text-primary" /><span>VAT: {client.vatNumber}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                      <MapPin className="w-4 h-4 text-primary" /><span className="line-clamp-1">{client.address}</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 flex gap-2">
                  <Button variant="ghost" size="sm" className="w-full font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all gap-1.5" onClick={() => handleViewOpen(client)}>
                    <Eye className="w-4 h-4" /> View details
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full font-bold rounded-lg hover:bg-muted/50 transition-all gap-1.5" onClick={() => handleEditOpen(client)}>
                    <Pencil className="w-4 h-4" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}