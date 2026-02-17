import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL;

export function useOrganization() {
  return useQuery({
    queryKey: [`${API_URL}/api/organization`],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/organization`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch organization");
      return res.json();
    },
  });
}

export function useOrganizationStats() {
  return useQuery({
    queryKey: [`${API_URL}/api/organizations/stats`],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/organizations/stats`, { credentials: "include" });
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
      const res = await fetch(`${API_URL}/api/organization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update organization");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/organization`] });
      // ✅ FIX: api.auth.me.path ki jagah hardcoded string
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/auth/me`] });
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/organizations/stats`] });
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
    queryKey: [`${API_URL}/reports/monthly`, year, month],
    queryFn: async () => {
      const url = `${API_URL}/reports/monthly?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
  });
}