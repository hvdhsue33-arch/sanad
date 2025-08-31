import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/queryClient';
import { API_ENDPOINTS } from '@/lib/constants';

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  profileImageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Check authentication status
  const { data: user, isLoading, error: authError } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.USER);
        return response.user;
      } catch (error) {
        // If 401, user is not authenticated - this is expected
        if (error instanceof Error && error.message.includes('401')) {
          return null;
        }
        // For other errors, return null but don't throw
        console.error('Auth check error:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
    },
    onSuccess: (data) => {
      // Update user data in cache
      queryClient.setQueryData(['auth', 'user'], data.user);
      setError(null);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'فشل في تسجيل الدخول';
      setError(typeof errorMessage === 'string' ? errorMessage : 'فشل في تسجيل الدخول');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    },
  });

  const login = async (username: string, password: string) => {
    setError(null);
    await loginMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Even if logout fails, clear local data
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    }
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error: error || (authError instanceof Error ? authError.message : (typeof authError === 'string' ? authError : null)) || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
