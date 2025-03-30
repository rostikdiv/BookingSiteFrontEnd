import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, LoginData } from "@/types/models";
import { userAPI} from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Має бути true
  headers: {
    "Content-Type": "application/json",
  },
});


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
  clearAuthData: () => void; // Нова функція
  initializeAuth: () => Promise<void>; // Нова функція
};

// Создаем контекст авторизации
export const AuthContext = createContext<AuthContextType | null>(null);

// Провайдер авторизации
export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
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
  // use-auth.tsx
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/user/logout');
      return response.data;
    },
    onSuccess: () => {
      queryClient.clear();
      localStorage.clear();
      window.location.href = '/auth';
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Насильно очищаємо дані навіть при помилці
      localStorage.clear();
      window.location.href = '/auth';
    }
  });

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.setQueryData(["/api/user"], null);
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        clearAuthData();
        return;
      }

      const user = await userAPI.getCurrentUser();
      queryClient.setQueryData(["/api/user"], user);
    } catch (error) {
      clearAuthData();
    } finally {
      setInitialized(true);
    }
  }, [clearAuthData]);

  // Оновлений ефект ініціалізації
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Блокуємо рендер додатку до завершення ініціалізації
  if (!initialized) {
    return <div>Loading...</div>;
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

// Хук для использования контекста авторизации
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}