import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User, LoginData, RegisterData, LoginResponse } from "@/types/models";
import { setCurrentUserId, userAPI } from "@/services/api";
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
  loginMutation: UseMutationResult<LoginResponse, Error, LoginData>;
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
        console.log("useQuery getCurrentUser:", currentUser); // Логування
        if (!currentUser?.id) {
          throw new Error("User ID is missing in response");
        }
        return currentUser;
      } catch (error: any) {
        console.error("useQuery error:", error); // Логування
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
    staleTime: 15 * 60 * 1000, // 15 хвилин
    enabled: initialized,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      return await userAPI.login(credentials);
    },
    onSuccess: (data: LoginResponse) => {
      console.log("Login success:", data); // Логування
      queryClient.setQueryData(["/api/user"], data.user);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast({
        title: "Ласкаво просимо!",
        description: `Ви увійшли як ${data.user.firstName || data.user.login || "Користувач"}`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error); // Логування
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
      console.log("Register success:", user); // Логування
      queryClient.setQueryData(["/api/user"], user);
      const token = `generated-jwt-token-${user.id}`;
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast({
        title: "Обліковий запис створено",
        description: "Ваш обліковий запис успішно створено!",
      });
    },
    onError: (error: Error) => {
      console.error("Register error:", error); // Логування
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
      console.log("Logout success"); // Логування
      queryClient.setQueryData(["/api/user"], null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    },
    onError: (error) => {
      console.error("Logout error:", error); // Логування
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    },
  });

  const clearAuthData = useCallback(() => {
    console.log("Clearing auth data"); // Логування
    queryClient.setQueryData(["/api/user"], null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }, []);

  const initializeAuth = useCallback(async () => {
    console.log("Initializing auth"); // Логування
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    console.log("Token:", token); // Логування
    console.log("Stored user:", storedUser); // Логування

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user:", parsedUser); // Логування
        if (!parsedUser.id) {
          throw new Error("Parsed user has no ID");
        }
        const isValid = await userAPI.verifyToken(token);
        console.log("Token is valid:", isValid); // Логування
        if (isValid) {
          queryClient.setQueryData(["/api/user"], parsedUser);
          setCurrentUserId(parsedUser.id);
        } else {
          console.log("Token invalid, attempting to fetch user"); // Логування
          const currentUser = await userAPI.getCurrentUser();
          if (currentUser?.id) {
            queryClient.setQueryData(["/api/user"], currentUser);
            localStorage.setItem("user", JSON.stringify(currentUser));
            setCurrentUserId(currentUser.id);
          } else {
            clearAuthData();
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error); // Логування
        clearAuthData();
      }
    } else {
      console.log("No token or user in localStorage"); // Логування
      clearAuthData();
    }
    setInitialized(true);
    console.log("Auth initialized"); // Логування
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