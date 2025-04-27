import { useState, useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth, loginSchema, registerSchema } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Home, User, Mail, Phone, Key } from "lucide-react";

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<string>("login");
    const [location, navigate] = useLocation();
    const { user, loginMutation, registerMutation, isLoading } = useAuth();

    const loginForm = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { login: "", password: "" },
    });

    const registerForm = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            login: "",
            password: "",
        },
    });

    useEffect(() => {
        if (user && !isLoading) navigate("/profile");
    }, [user, isLoading, navigate]);

    const onLoginSubmit = (data: LoginValues) => {
        loginMutation.mutate(data, {
            onSuccess: () => navigate("/profile"),
            onError: (error) => console.error("Помилка входу:", error),
        });
    };

    const onRegisterSubmit = (data: RegisterValues) => {
        registerMutation.mutate(data, {
            onSuccess: () => navigate("/profile"),
            onError: (error) => console.error("Помилка реєстрації:", error),
        });
    };

    if (isLoading) {
        return <div className="text-center py-10">Завантаження...</div>;
    }

    if (user) return <Redirect to="/profile" />;

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex flex-col justify-center p-4 sm:p-6 lg:p-8 order-2 lg:order-1">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Ласкаво просимо до StayEase</h1>
                        <p className="text-gray-600 text-center">Знайдіть ідеальне житло по всьому світу</p>
                    </div>

                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Увійти</TabsTrigger>
                            <TabsTrigger value="register">Створити акаунт</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Увійти</CardTitle>
                                    <CardDescription>Введіть ваші дані для доступу до акаунту</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...loginForm}>
                                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                            <FormField
                                                control={loginForm.control}
                                                name="login"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Логін</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                                <Input placeholder="вашлогін" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={loginForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Пароль</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                                <Input type="password" placeholder="********" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                                                {loginMutation.isPending ? "Вхід..." : "Увійти"}
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                                <CardFooter>
                                    <div className="text-sm text-center">
                                        Немає акаунта?{" "}
                                        <button onClick={() => setActiveTab("register")} className="text-primary underline-offset-4 hover:underline">
                                            Створити акаунт
                                        </button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="register">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Створити акаунт</CardTitle>
                                    <CardDescription>Введіть ваші дані для створення нового акаунта</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...registerForm}>
                                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={registerForm.control}
                                                    name="firstName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Ім’я</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Іван" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={registerForm.control}
                                                    name="lastName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Прізвище</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Петренко" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={registerForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Електронна пошта</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                                <Input type="email" placeholder="ivan@example.com" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={registerForm.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Номер телефону</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                                <Input placeholder="+380123456789" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={registerForm.control}
                                                name="login"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Логін</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                                <Input placeholder="вашлогін" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={registerForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Пароль</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                                <Input type="password" placeholder="********" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                                                {registerMutation.isPending ? "Створення..." : "Створити акаунт"}
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                                <CardFooter>
                                    <div className="text-sm text-center">
                                        Вже маєте акаунт?{" "}
                                        <button onClick={() => setActiveTab("login")} className="text-primary underline-offset-4 hover:underline">
                                            Увійти
                                        </button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="bg-gradient-to-br from-primary/80 to-primary/50 flex flex-col justify-center p-6 lg:p-12 order-1 lg:order-2">
                <div className="max-w-md mx-auto text-white">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-4">Знайдіть свій ідеальний дім подалі від дому</h2>
                        <p className="text-white/90">
                            Приєднуйтесь до тисяч задоволених мандрівників, які бронюють чудові помешкання по всьому світу з StayEase.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-white/20 p-3 rounded-lg">
                                <Home className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Преміум нерухомість</h3>
                                <p className="text-white/80 text-sm">
                                    Доступ до тисяч ретельно підібраних будинків, квартир та унікальних помешкань.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}