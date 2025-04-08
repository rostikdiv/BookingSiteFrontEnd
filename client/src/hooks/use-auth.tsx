import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User, LoginData, RegisterData } from "@/types/models";
import { userAPI } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(3, "Логін має містити щонайменше 3 символи"),
  password: z.string().min(6, "Пароль має містити щонайменше 6 символів"),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "Ім’я має містити щонайменше 2 символи"),
  lastName: z.string().min(2, "Прізвище має містити щонайменше 2 символи"),
  email: z.string().email("Введіть дійсну адресу електронної пошти"),
  phoneNumber: z.string().min(10, "Номер телефону має містити щонайменше 10 символів"),
  login: z.string().min(3, "Логін має містити щонайменше 3 символи"),
  password: z.string().min(6, "Пароль має містити щонайменше 6 символів"),
});

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  clearAuthData: () => void;
  initializeAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  const { data: user, error, isLoading } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const currentUser = await userAPI.getCurrentUser();
        if (!currentUser?.id) {
          throw new Error("User ID is missing in response");
        }
        return currentUser;
      } catch (error: any) {
        if (
            error.message.includes("Користувач не авторизований") ||
            error?.response?.status === 401 ||
            error?.response?.status === 403
        ) {
          userAPI.logout();
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      return await userAPI.login(credentials);
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Ласкаво просимо!",
        description: `Ви увійшли як ${user.firstName}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка входу",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await userAPI.register(data);
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Обліковий запис створено",
        description: "Ваш обліковий запис успішно створено!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка реєстрації",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await userAPI.logout();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/auth";
    },
    onError: (error) => {
      console.error("Помилка виходу:", error);
      window.location.href = "/auth";
    },
  });

  const clearAuthData = useCallback(() => {
    queryClient.setQueryData(["/api/user"], null);
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const user = await userAPI.getCurrentUser();
      queryClient.setQueryData(["/api/user"], user);
    } catch (error) {
      clearAuthData();
    } finally {
      setInitialized(true);
    }
  }, [clearAuthData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!initialized) {
    return <div>Завантаження...</div>;
  }

  return (
      <AuthContext.Provider
          value={{
            user: user ?? null,
            isLoading,
            error,
            loginMutation,
            logoutMutation,
            registerMutation,
            clearAuthData,
            initializeAuth,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth має використовуватися в межах AuthProvider");
  }
  return context;
}