import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ✅ Organization data fetch karo - Settings form pre-fill ke liye
export function useOrganization() {
  return useQuery({
    queryKey: ["/api/organization"],
    queryFn: async () => {
      const res = await fetch("/api/organization", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch organization");
      return res.json();
    },
  });
}

export function useOrganizationStats() {
  return useQuery({
    queryKey: [api.organizations.stats.path],
    queryFn: async () => {
      const res = await fetch(api.organizations.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      vatNumber?: string;
      address?: string;
      zatcaUnitId?: string;
      zatcaPrivateKey?: string;
    }) => {
      const res = await fetch("/api/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update organization");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization"] });
      // ✅ FIX: api.auth.me.path ki jagah hardcoded string
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: [api.organizations.stats.path] });
      toast({
        title: "Success",
        description: "Organization settings updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMonthlyReport(year?: number, month?: number) {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  return useQuery({
    queryKey: [api?.reports?.monthly?.path, year, month],
    queryFn: async () => {
      const url = `${api?.reports?.monthly?.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
  });
}