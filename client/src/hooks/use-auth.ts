import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL;

async function fetchUser(): Promise<User | null> {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    return null;
  }

  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);

  const data = await response.json();
  return data.user;
}

async function logout(): Promise<void> {
  localStorage.removeItem('token');
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: [`${API_URL}/api/auth/me`],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData([`${API_URL}/api/auth/me`], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}