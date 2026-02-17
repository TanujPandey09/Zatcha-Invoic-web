import { Layout } from "@/components/Layout";
import { useOrganizationStats, useUpdateOrganization, useOrganization } from "@/hooks/use-organization";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, CheckCircle2, Shield, Key, Mail, Apple } from "lucide-react";
import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const orgFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
});

const zatcaFormSchema = z.object({
  zatcaUnitId: z.string().optional(),
  zatcaPrivateKey: z.string().optional(),
});

export default function Settings() {
  const { user } = useAuth();
  const { data: stats } = useOrganizationStats();
  // ✅ FIX: Organization data fetch karo pre-fill ke liye
  const { data: org } = useOrganization();
  const updateOrg = useUpdateOrganization();

  const form = useForm({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
      name: "",
      vatNumber: "",
      address: "",
    }
  });

  const zatcaForm = useForm({
    resolver: zodResolver(zatcaFormSchema),
    defaultValues: {
      zatcaUnitId: "",
      zatcaPrivateKey: "",
    }
  });

  // ✅ FIX: Jab org data aaye toh form pre-fill karo
  useEffect(() => {
    if (org) {
      form.reset({
        name: org.name || "",
        vatNumber: org.vatNumber || "",
        address: org.address || "",
      });
      zatcaForm.reset({
        zatcaUnitId: org.zatcaUnitId || "",
        zatcaPrivateKey: org.zatcaPrivateKey || "",
      });
    }
  }, [org]);

  const onSubmit = (values: z.infer<typeof orgFormSchema>) => {
    updateOrg.mutate({
      name: org?.name || "",
      vatNumber: org?.vatNumber,
      address: values.address,
    });
  };

  const onZatcaSubmit = (values: z.infer<typeof zatcaFormSchema>) => {
    updateOrg.mutate({
      name: org?.name || "",
      ...values,
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage organization profile and preferences.</p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="organization" className="rounded-lg">Organization</TabsTrigger>
          <TabsTrigger value="zatca" className="rounded-lg">ZATCA Phase 2</TabsTrigger>
          <TabsTrigger value="subscription" className="rounded-lg">Subscription</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
        </TabsList>

        {/* ===== ORGANIZATION TAB ===== */}
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Update your company information for invoices and ZATCA compliance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium mb-1">Organization Name</p>
                      <div className="px-3 py-2 rounded-md border bg-muted text-muted-foreground">
                        {org?.name || "—"}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">VAT Number</p>
                      <div className="px-3 py-2 rounded-md border bg-muted text-muted-foreground font-mono">
                        {org?.vatNumber || "Not set"}
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street, City, Building No." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateOrg.isPending}>
                      {updateOrg.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ZATCA PHASE 2 TAB ===== */}
        <TabsContent value="zatca">
          <div className="space-y-6">
            {/* Status Card */}
            <Card className={org?.zatcaUnitId ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {org?.zatcaUnitId ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-green-900">ZATCA Phase 2 Active</p>
                        <p className="text-sm text-green-700">Your credentials are configured. Invoices will be submitted automatically.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-yellow-900">ZATCA Phase 2 Not Configured</p>
                        <p className="text-sm text-yellow-700">Register on zatca.gov.sa to get your credentials, then enter them below.</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Credentials Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  ZATCA Credentials
                </CardTitle>
                <CardDescription>
                  Enter your ZATCA Unit ID and Private Key obtained from zatca.gov.sa registration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...zatcaForm}>
                  <form onSubmit={zatcaForm.handleSubmit(onZatcaSubmit)} className="space-y-6">
                    <FormField
                      control={zatcaForm.control}
                      name="zatcaUnitId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            ZATCA Unit ID
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your ZATCA Unit ID" {...field} />
                          </FormControl>
                          <FormDescription>
                            Obtained from ZATCA portal after business registration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={zatcaForm.control}
                      name="zatcaPrivateKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            ZATCA Private Key / Certificate
                          </FormLabel>
                          <FormControl>
                            <textarea
                              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            PEM format private key from ZATCA certificate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">How to get ZATCA credentials:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Visit <span className="font-mono text-primary">zatca.gov.sa</span></li>
                        <li>Register your business for e-invoicing</li>
                        <li>Complete compliance testing</li>
                        <li>Receive Unit ID and Certificate</li>
                        <li>Enter them above and save</li>
                      </ol>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={updateOrg.isPending}>
                        {updateOrg.isPending ? "Saving..." : "Save ZATCA Credentials"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== SUBSCRIPTION TAB ===== */}
        <TabsContent value="subscription">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className={stats?.usage.plan === 'free' ? "border-primary ring-1 ring-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Free Plan
                  {stats?.usage.plan === 'free' && <CheckCircle2 className="text-primary w-5 h-5" />}
                </CardTitle>
                <CardDescription>Perfect for small businesses starting out.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 10 Invoices / month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Basic Reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Email Support</li>
                </ul>
                <Button className="w-full" variant="outline" disabled={stats?.usage.plan === 'free'}>
                  {stats?.usage.plan === 'free' ? "Current Plan" : "Downgrade"}
                </Button>
              </CardContent>
            </Card>

            <Card className={stats?.usage.plan === 'basic' ? "border-primary ring-1 ring-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Basic Plan
                  {stats?.usage.plan === 'basic' && <CheckCircle2 className="text-primary w-5 h-5" />}
                </CardTitle>
                <CardDescription>Scale your business without limits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Unlimited Invoices</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Advanced Analytics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Priority Support</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> ZATCA Phase 2</li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90" disabled={stats?.usage.plan === 'basic'}>
                  {stats?.usage.plan === 'basic' ? "Current Plan" : "Upgrade Now"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== PROFILE TAB ===== */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 shadow-sm border-border/50">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 border-4 border-background shadow-lg flex items-center justify-center text-primary font-bold text-4xl mb-4 overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <CardTitle className="text-xl">{user?.username}</CardTitle>
                <CardDescription className="font-medium text-primary/80">{user?.role?.toUpperCase()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Connected Accounts</CardTitle>
                  <CardDescription>Manage your social login connections for easier access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Google Account</p>
                        <p className="text-xs text-muted-foreground">{user?.googleId ? "Connected" : "Not connected"}</p>
                      </div>
                    </div>
                    {user?.googleId ? (
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Linked
                      </span>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => window.location.href = `${API_URL}/auth/google`}>Connect</Button>
                    )
                    }
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 23 23">
                          <path fill="#f35325" d="M1 1h10v10H1z" />
                          <path fill="#81bc06" d="M12 1h10v10H12z" />
                          <path fill="#05a6f0" d="M1 12h10v10H1z" />
                          <path fill="#ffba08" d="M12 12h10v10H12z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Microsoft Account</p>
                        <p className="text-xs text-muted-foreground">{user?.microsoftId ? "Connected" : "Not connected"}</p>
                      </div>
                    </div>
                    {user?.microsoftId ? (
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Linked
                      </span>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => window.location.href = `${API_URL}/auth/microsoft`}>Connect</Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center">
                        <Apple className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Apple ID</p>
                        <p className="text-xs text-muted-foreground">{user?.appleId ? "Connected" : "Not connected"}</p>
                      </div>
                    </div>
                    {user?.appleId ? (
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Linked
                      </span>
                    ) : (
                      <Button variant="outline" size="sm" disabled>Connect</Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50/50 shadow-none">
                <CardContent className="pt-6 flex gap-4 text-sm text-yellow-800">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Connecting your social accounts allows you to sign in with one click. We only request basic profile information like your name and email.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}