import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useClients, useCreateClient } from "@/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Mail, MapPin, Building2, Search, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "@/i18n/i18n";

const API_URL = import.meta.env.VITE_API_URL;

const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
});

export default function Clients() {
  const { t, isRTL } = useTranslation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      vatNumber: "",
      address: ""
    }
  });

  const onSubmit = (values: z.infer<typeof clientFormSchema>) => {
    createClient.mutate({
      name: values.name,
      email: values.email || null,
      vatNumber: values.vatNumber || null,
      address: values.address || null,
    } as any, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      }
    });
  };

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
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
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{t("common.create")} Client</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" className="h-11 rounded-lg border-border/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@company.com" className="h-11 rounded-lg border-border/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vatNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">VAT Number</FormLabel>
                      <FormControl>
                        <Input placeholder="300..." className="h-11 rounded-lg border-border/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street, City, Country" className="h-11 rounded-lg border-border/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

      <div className="relative max-w-md w-full mb-8 animate-fade-in group">
        <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors`} />
        <Input
          className={`${isRTL ? 'pr-11' : 'pl-11'} h-12 bg-card/50 border-border/50 rounded-2xl shadow-sm focus:bg-background transition-all`}
          placeholder={t("common.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                </div>
                <Skeleton className="h-7 w-3/4 mb-4" />
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClients?.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={searchTerm ? "search" : "users"}
              title={searchTerm ? "No clients found" : "No clients yet"}
              description={
                searchTerm
                  ? `No clients match "${searchTerm}". Try a different search term.`
                  : "Add your first client to start creating invoices and managing your business."
              }
              action={
                !searchTerm
                  ? {
                    label: t("common.create"),
                    onClick: () => setIsCreateOpen(true),
                  }
                  : undefined
              }
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
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.vatNumber && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>VAT: {client.vatNumber}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 group-hover:bg-muted/50 transition-colors">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="line-clamp-1">{client.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex gap-2">
                  <Button variant="ghost" size="sm" className="w-full font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                    View details
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full font-bold rounded-lg hover:bg-muted/50 transition-all">
                    Edit
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
