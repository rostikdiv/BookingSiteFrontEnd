import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, LoginData } from "@/types/models";
import { userAPI } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Схемы валидации для форм
export const loginSchema = z.object({
  login: z.string().min(3, "Login must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  login: z.string().min(3, "Login must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Типы данных для форм
export type RegisterData = z.infer<typeof registerSchema>;

// Тип данных контекста авторизации
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

// Создаем контекст авторизации
export const AuthContext = createContext<AuthContextType | null>(null);

// Провайдер авторизации
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Получаем данные пользователя
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        return await userAPI.getCurrentUser();
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        // Если 401 Unauthorized, это нормально для неаутентифицированных пользователей
        if (error.message.includes('Unauthorized') || error?.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Мутация для входа в систему
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      return await userAPI.login(credentials);
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.firstName}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Мутация для регистрации
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await userAPI.register(data);
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Мутация для выхода из системы
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await userAPI.logout();
      queryClient.setQueryData(["/api/user"], null);
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Хук для использования контекста авторизации
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}