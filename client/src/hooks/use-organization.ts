import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, authFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useOrganization() {
  return useQuery({
    queryKey: ["/api/organization"],
    queryFn: async () => {
      const res = await authFetch("/api/organization");
      if (!res.ok) throw new Error("Failed to fetch organization");
      return res.json();
    },
  });
}

export function useOrganizationStats() {
  return useQuery({
    queryKey: ["/api/organization/stats"],
    queryFn: async () => {
      const res = await authFetch("/api/organization/stats");
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
      const res = await authFetch("/api/organization", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update organization");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organization/stats"] });
      toast({ title: "Success", description: "Organization settings updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useMonthlyReport(year?: number, month?: number) {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (month) params.append("month", month.toString());

  return useQuery({
    queryKey: ["/api/reports/monthly", year, month],
    queryFn: async () => {
      const res = await authFetch(`/api/reports/monthly?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
  });
}