import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: authData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user: (authData as any)?.user,
    tenant: (authData as any)?.tenant,
    isLoading,
    isAuthenticated: !!(authData as any)?.user,
  };
}
