import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { propertyAPI } from "@/services/api";
import { CreateHouseData, User } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddHousePage() {
    const { user } = useAuth();
    const { toast } = useToast();

    // Стан для форми
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [rooms, setRooms] = useState<number>(1);
    const [area, setArea] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [hasWifi, setHasWifi] = useState<boolean>(false);
    const [hasParking, setHasParking] = useState<boolean>(false);
    const [hasPool, setHasPool] = useState<boolean>(false);

    // Мутація для створення помешкання
    const houseMutation = useMutation({
        mutationFn: async (data: CreateHouseData) => {
            if (!user || !user.id) {
                throw new Error("User is not authenticated or user ID is missing");
            }
            const houseData: CreateHouseData = {
                title: data.title,
                description: data.description,
                city: data.city,
                rooms: data.rooms,
                area: data.area,
                price: data.price,
                hasWifi: data.hasWifi,
                hasParking: data.hasParking,
                hasPool: data.hasPool,
            };
            return await propertyAPI.create(houseData, user.id); // Передаємо userId як окремий параметр
        },
        onSuccess: (user: User) => {
            toast({
                title: "Помешкання додано!",
                description: "Ваше помешкання успішно додано.",
            });
            // Очищаємо форму
            setTitle("");
            setDescription("");
            setCity("");
            setRooms(1);
            setArea(0);
            setPrice(0);
            setHasWifi(false);
            setHasParking(false);
            setHasPool(false);
        },
        onError: (err: Error) => {
            toast({
                title: "Помилка додавання помешкання",
                description: err.message || "Виникла помилка під час додавання помешкання.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = () => {
        if (!user) {
            toast({
                title: "Помилка",
                description: "Ви повинні увійти в систему, щоб додати помешкання.",
                variant: "destructive",
            });
            return;
        }

        const houseData: CreateHouseData = {
            title,
            description,
            city,
            rooms,
            area,
            price,
            hasWifi,
            hasParking,
            hasPool,
        };

        console.log("House Data before sending:", houseData);

        houseMutation.mutate(houseData);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow container mx-auto p-4">
                    <p className="text-red-500">Увійдіть, щоб додати нове помешкання.</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Додати нове помешкання</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label>Назва</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Назва помешкання"
                                />
                            </div>
                            <div>
                                <Label>Опис</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Опис помешкання"
                                />
                            </div>
                            <div>
                                <Label>Місто</Label>
                                <Input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Місто"
                                />
                            </div>
                            <div>
                                <Label>Кількість кімнат</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={rooms}
                                    onChange={(e) => setRooms(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label>Площа (м²)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={area}
                                    onChange={(e) => setArea(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label>Ціна за ніч ($)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={hasWifi}
                                    onCheckedChange={(checked) => setHasWifi(checked as boolean)}
                                />
                                <Label>WiFi</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={hasParking}
                                    onCheckedChange={(checked) => setHasParking(checked as boolean)}
                                />
                                <Label>Парковка</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={hasPool}
                                    onCheckedChange={(checked) => setHasPool(checked as boolean)}
                                />
                                <Label>Басейн</Label>
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={houseMutation.isPending || !title || !description || !city || rooms < 1 || area <= 0 || price <= 0}
                            >
                                {houseMutation.isPending ? "Додавання..." : "Додати помешкання"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}