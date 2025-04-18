import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { propertyAPI } from "@/services/api"; // Змінено з houseAPI на propertyApi
import { CreateHouseData, User, HouseForRent } from "@/types/models";
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

    // Стан для форми створення помешкання
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [rooms, setRooms] = useState<number>(1);
    const [area, setArea] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [hasWifi, setHasWifi] = useState<boolean>(false);
    const [hasParking, setHasParking] = useState<boolean>(false);
    const [hasPool, setHasPool] = useState<boolean>(false);

    // Стан для фотографій
    const [imageUrl, setImageUrl] = useState<string>("");
    const [createdHouse, setCreatedHouse] = useState<HouseForRent | null>(null);

    // Функція для скидання стану
    const resetForm = () => {
        setCreatedHouse(null);
        setTitle("");
        setDescription("");
        setCity("");
        setRooms(1);
        setArea(0);
        setPrice(0);
        setHasWifi(false);
        setHasParking(false);
        setHasPool(false);
        setImageUrl("");
    };

    // Логування для перевірки оновлення createdHouse
    useEffect(() => {
        if (createdHouse) {
            console.log("Updated createdHouse:", createdHouse);
        }
    }, [createdHouse]);

    // Мутація для створення помешкання
    const propertyMutation = useMutation<HouseForRent, Error, CreateHouseData>({
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
            return await propertyAPI.create(houseData, user.id);
        },
        onSuccess: (house: HouseForRent) => {
            console.log("Created House:", house);
            toast({
                title: "Помешкання додано!",
                description: "Ваше помешкання успішно додано. Тепер ви можете додати фотографії.",
            });
            setCreatedHouse(house);
        },
        onError: (err: Error) => {
            toast({
                title: "Помилка додавання помешкання",
                description: err.message || "Виникла помилка під час додавання помешкання.",
                variant: "destructive",
            });
        },
    });

    // Мутація для додавання фотографії
    const photoMutation = useMutation<HouseForRent, Error, string>({
        mutationFn: async (imageUrl: string) => {
            if (!createdHouse || !createdHouse.id) {
                throw new Error("House ID is missing");
            }
            console.log("Adding photo to house with ID:", createdHouse.id);
            return await propertyAPI.addPhoto(createdHouse.id, imageUrl);
        },
        onSuccess: (house: HouseForRent) => {
            toast({
                title: "Фотографію додано!",
                description: "Фотографія успішно додана до помешкання.",
            });
            setCreatedHouse(house);
            setImageUrl("");
        },
        onError: (err: Error) => {
            toast({
                title: "Помилка додавання фотографії",
                description: err.message || "Виникла помилка під час додавання фотографії.",
                variant: "destructive",
            });
        },
        retry: 0,
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

        propertyMutation.mutate(houseData);
    };

    const handleAddPhoto = () => {
        if (!imageUrl) {
            toast({
                title: "Помилка",
                description: "Введіть URL фотографії.",
                variant: "destructive",
            });
            return;
        }

        if (photoMutation.isPending) {
            toast({
                title: "Зачекайте",
                description: "Фотографія вже додається.",
                variant: "default",
            });
            return;
        }

        photoMutation.mutate(imageUrl);
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
                                    disabled={!!createdHouse}
                                />
                            </div>
                            <div>
                                <Label>Опис</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Опис помешкання"
                                    disabled={!!createdHouse}
                                />
                            </div>
                            <div>
                                <Label>Місто</Label>
                                <Input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Місто"
                                    disabled={!!createdHouse}
                                />
                            </div>
                            <div>
                                <Label>Кількість кімнат</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={rooms}
                                    onChange={(e) => setRooms(Number(e.target.value))}
                                    disabled={!!createdHouse}
                                />
                            </div>
                            <div>
                                <Label>Площа (м²)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={area}
                                    onChange={(e) => setArea(Number(e.target.value))}
                                    disabled={!!createdHouse}
                                />
                            </div>
                            <div>
                                <Label>Ціна за ніч ($)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    disabled={!!createdHouse}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={hasWifi}
                                    onCheckedChange={(checked) => setHasWifi(checked as boolean)}
                                    disabled={!!createdHouse}
                                />
                                <Label>WiFi</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={hasParking}
                                    onCheckedChange={(checked) => setHasParking(checked as boolean)}
                                    disabled={!!createdHouse}
                                />
                                <Label>Парковка</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={hasPool}
                                    onCheckedChange={(checked) => setHasPool(checked as boolean)}
                                    disabled={!!createdHouse}
                                />
                                <Label>Басейн</Label>
                            </div>
                            {!createdHouse && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={propertyMutation.isPending || !title || !description || !city || rooms < 1 || area <= 0 || price <= 0}
                                >
                                    {propertyMutation.isPending ? "Додавання..." : "Додати помешкання"}
                                </Button>
                            )}
                        </div>

                        {/* Секція для додавання фотографій */}
                        {createdHouse && (
                            <div className="mt-6 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Додати фотографії до помешкання</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>URL фотографії</Label>
                                                <Input
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    placeholder="Введіть URL фотографії"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleAddPhoto}
                                                disabled={photoMutation.isPending || !imageUrl}
                                            >
                                                {photoMutation.isPending ? "Додавання..." : "Додати фотографію"}
                                            </Button>

                                            {/* Відображення доданих фотографій */}
                                            {createdHouse.photos && createdHouse.photos.length > 0 && (
                                                <div className="mt-4">
                                                    <h3 className="text-lg font-medium">Додані фотографії:</h3>
                                                    <ul className="mt-2 space-y-2">
                                                        {createdHouse.photos.map((photo) => (
                                                            <li key={photo.id} className="flex items-center space-x-2">
                                                                <img
                                                                    src={photo.imageUrl}
                                                                    alt="House photo"
                                                                    className="w-16 h-16 object-cover rounded"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = "https://placehold.co/150x150";
                                                                    }}
                                                                />
                                                                <span>{photo.imageUrl}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Кнопка для створення нового оголошення */}
                                            <Button
                                                onClick={resetForm}
                                                variant="outline"
                                                className="mt-4"
                                            >
                                                Створити нове оголошення
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}