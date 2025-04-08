import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { userAPI, propertyAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {CreateHouseData, User} from "@/types/models";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

// Схема валідації для створення будинку
const houseSchema = z.object({
  title: z.string().min(3, "Назва має містити щонайменше 3 символи"),
  description: z.string().min(10, "Опис має містити щонайменше 10 символів"),
  city: z.string().min(2, "Місто має містити щонайменше 2 символи"),
  price: z.number().min(1, "Ціна має бути більше 0"),
  rooms: z.number().min(1, "Кількість кімнат має бути більше 0"),
  area: z.number().min(10, "Площа має бути більше 10 м²"),
  hasWifi: z.boolean(),
  hasParking: z.boolean(),
  hasPool: z.boolean(),
  ownerId: z.number(),
});

type HouseFormValues = z.infer<typeof houseSchema>;

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  // Стан для редагування профілю
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  });

  // Форма для створення будинку
  const houseForm = useForm<HouseFormValues>({
    resolver: zodResolver(houseSchema),
    defaultValues: {
      price: 0,
      area: 0,
      rooms: 0,
      title: "",
      description: "",
      city: "",
      hasWifi: false,
      hasParking: false,
      hasPool: false,
      ownerId: user?.id || 0,
    },
  });

  // Завантаження будинків користувача
  const { data: houses, refetch: refetchHouses } = useQuery({
    queryKey: ["user-houses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const allHouses = await propertyAPI.getAll();
      return allHouses.filter((house) => house.owner.id === user.id);
    },
    enabled: !!user,
  });

  // Мутація для оновлення профілю
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (!user) throw new Error("Користувач не авторизований");
      return await userAPI.update(user.id, data);
    },
    onSuccess: () => {
      toast({
        title: "Профіль оновлено",
        description: "Ваші дані успішно оновлені.",
      });
      setEditMode(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Помилка оновлення",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Мутація для видалення профілю
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Користувач не авторизований");
      await userAPI.delete(user.id);
    },
    onSuccess: () => {
      logoutMutation.mutate();
      toast({
        title: "Профіль видалено",
        description: "Ваш профіль успішно видалено.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Помилка видалення",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Мутація для створення будинку
  const createHouseMutation = useMutation({
    mutationFn: async (data: CreateHouseData) => {
      return await propertyAPI.create(data);
    },
    onSuccess: () => {
      toast({
        title: "Помешкання додано",
        description: "Нове помешкання успішно додано.",
      });
      refetchHouses();
      houseForm.reset();
    },
    onError: (err: Error) => {
      toast({
        title: "Помилка додавання",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Мутація для видалення будинку
  const deleteHouseMutation = useMutation({
    mutationFn: async (houseId: number) => {
      await propertyAPI.delete(houseId);
    },
    onSuccess: () => {
      toast({
        title: "Помешкання видалено",
        description: "Помешкання успішно видалено.",
      });
      refetchHouses();
    },
    onError: (err: Error) => {
      toast({
        title: "Помилка видалення",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCreateHouse = (data: HouseFormValues) => {
    createHouseMutation.mutate(data);
  };

  if (!user) return <div className="text-center py-10">Завантаження...</div>;

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">Ваш профіль</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Інформація про профіль */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Особисті дані</CardTitle>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                          <Label>Ім’я</Label>
                          <Input
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Прізвище</Label>
                          <Input
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Електронна пошта</Label>
                          <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Номер телефону</Label>
                          <Input
                              value={formData.phoneNumber}
                              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Оновлення..." : "Зберегти"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                            Скасувати
                          </Button>
                        </div>
                      </form>
                  ) : (
                      <div className="space-y-2">
                        <p>
                          <strong>Ім’я:</strong> {user.firstName}
                        </p>
                        <p>
                          <strong>Прізвище:</strong> {user.lastName}
                        </p>
                        <p>
                          <strong>Електронна пошта:</strong> {user.email}
                        </p>
                        <p>
                          <strong>Номер телефону:</strong> {user.phoneNumber}
                        </p>
                        <Button onClick={() => setEditMode(true)} className="w-full">
                          Редагувати профіль
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="w-full"
                        >
                          {deleteMutation.isPending ? "Видалення..." : "Видалити профіль"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => logoutMutation.mutate()}
                            disabled={logoutMutation.isPending}
                            className="w-full"
                        >
                          {logoutMutation.isPending ? "Вихід..." : "Вийти"}
                        </Button>
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Список будинків користувача */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Ваші помешкання</h2>
              {houses && houses.length > 0 ? (
                  <div className="space-y-4">
                    {houses.map((house) => (
                        <Card key={house.id}>
                          <CardHeader>
                            <CardTitle>{house.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Місто: {house.city}</p>
                            <p>Ціна: ${house.price}/ніч</p>
                            <p>Кімнати: {house.rooms}</p>
                            <p>Площа: {house.area} м²</p>
                            <Button
                                variant="destructive"
                                onClick={() => deleteHouseMutation.mutate(house.id)}
                                disabled={deleteHouseMutation.isPending}
                                className="mt-2"
                            >
                              {deleteHouseMutation.isPending ? "Видалення..." : "Видалити"}
                            </Button>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
              ) : (
                  <p className="text-gray-500">У вас поки немає доданих помешкань.</p>
              )}

              <Separator className="my-6" />

              {/* Форма для додавання нового будинку */}
              <h2 className="text-2xl font-semibold mb-4">Додати нове помешкання</h2>
              <Form {...houseForm}>
                <form onSubmit={houseForm.handleSubmit(handleCreateHouse)} className="space-y-4">
                  <FormField
                      control={houseForm.control}
                      name="title"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Назва</FormLabel>
                            <FormControl>
                              <Input placeholder="Назва помешкання" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={houseForm.control}
                      name="description"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Опис</FormLabel>
                            <FormControl>
                              <Input placeholder="Опис помешкання" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={houseForm.control}
                      name="city"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Місто</FormLabel>
                            <FormControl>
                              <Input placeholder="Місто" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={houseForm.control}
                      name="price"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ціна за ніч ($)</FormLabel>
                            <FormControl>
                              <Input
                                  type="number"
                                  placeholder="Ціна"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={houseForm.control}
                      name="rooms"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Кількість кімнат</FormLabel>
                            <FormControl>
                              <Input
                                  type="number"
                                  placeholder="Кількість кімнат"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={houseForm.control}
                      name="area"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Площа (м²)</FormLabel>
                            <FormControl>
                              <Input
                                  type="number"
                                  placeholder="Площа"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  <div className="space-y-2">
                    <Label>Зручності</Label>
                    <FormField
                        control={houseForm.control}
                        name="hasWifi"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="cursor-pointer">WiFi</FormLabel>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={houseForm.control}
                        name="hasParking"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Парковка</FormLabel>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={houseForm.control}
                        name="hasPool"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="cursor-pointer">Басейн</FormLabel>
                            </FormItem>
                        )}
                    />
                  </div>
                  <Button type="submit" disabled={createHouseMutation.isPending}>
                    {createHouseMutation.isPending ? "Додавання..." : "Додати помешкання"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
  );
}