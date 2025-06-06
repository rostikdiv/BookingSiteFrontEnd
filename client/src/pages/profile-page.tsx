import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { userAPI, propertyAPI, bookingAPI, reviewAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, HouseForRent, MyBookingOfferDTO, ReceivedBookingOfferDTO, Photo, Review } from "@/types/models";
import PropertyCard from "@/components/property/property-card";
import Modal from "react-modal";
import { format } from "date-fns";

// Прив’язка модального вікна до кореня програми
Modal.setAppElement("#root");

export default function ProfilePage() {
    const { user, logoutMutation, isLoading: authLoading } = useAuth();
    const { toast } = useToast();

    // Стан для редагування профілю
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
    });

    // Стан для активної вкладки
    const [activeTab, setActiveTab] = useState<"houses" | "myOffers" | "receivedOffers" | "comments">("houses");

    // Стан для модального вікна редагування оголошення
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState<HouseForRent | null>(null);
    const [editHouseData, setEditHouseData] = useState<Partial<HouseForRent>>({});
    const [newPhotoUrl, setNewPhotoUrl] = useState<string>("");

    // Стан для модального вікна редагування коментаря
    const [isEditCommentModalOpen, setIsEditCommentModalOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState<Review | null>(null);
    const [editCommentData, setEditCommentData] = useState<Partial<Review>>({});

    // Оновлення formData при зміні user
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
            });
        }
    }, [user]);

    // Логування user для дебагу
    useEffect(() => {
        console.log("User before queries:", user);
    }, [user]);

    // Завантаження будинків користувача
    const { data: houses, refetch: refetchHouses } = useQuery({
        queryKey: ["user-houses", user?.id],
        queryFn: async () => {
            if (!user || !user.id) {
                console.warn("User or user.id is undefined, returning empty array");
                return [];
            }
            return await propertyAPI.getByOwnerId(user.id);
        },
        enabled: !!user && !!user.id,
    });

    // Завантаження пропозицій оренди, створених користувачем
    const { data: myBookingOffers, refetch: refetchMyBookingOffers } = useQuery({
        queryKey: ["my-booking-offers", user?.id],
        queryFn: async () => {
            if (!user || !user.id) {
                console.warn("User or user.id is undefined, returning empty array");
                return [];
            }
            return await bookingAPI.getBookingOffersByUserId(user.id);
        },
        enabled: !!user && !!user.id,
    });

    // Завантаження отриманих пропозицій оренди
    const { data: receivedBookingOffers, refetch: refetchReceivedBookingOffers } = useQuery({
        queryKey: ["received-booking-offers", user?.id],
        queryFn: async () => {
            if (!user || !user.id) {
                console.warn("User or user.id is undefined, returning empty array");
                return [];
            }
            return await bookingAPI.getBookingOffersForOwnerHouses(user.id);
        },
        enabled: !!user && !!user.id,
    });

    // Завантаження коментарів користувача
    const { data: comments, refetch: refetchComments } = useQuery({
        queryKey: ["user-comments", user?.id],
        queryFn: async () => {
            if (!user || !user.id) {
                console.warn("User or user.id is undefined, returning empty array");
                return [];
            }
            return await reviewAPI.getByAuthorId(user.id);
        },
        enabled: !!user && !!user.id,
    });

    // Мутація для оновлення профілю
    const updateMutation = useMutation({
        mutationFn: async (data: Partial<User>) => {
            if (!user || !user.id) throw new Error("Користувач не авторизований");
            return await userAPI.update(user.id, data);
        },
        onSuccess: (updatedUser) => {
            toast({
                title: "Профіль оновлено",
                description: "Ваші дані успішно оновлені.",
            });
            setEditMode(false);
            localStorage.setItem("user", JSON.stringify(updatedUser));
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
            if (!user || !user.id) throw new Error("Користувач не авторизований");
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
            refetchReceivedBookingOffers();
        },
        onError: (err: Error) => {
            toast({
                title: "Помилка видалення",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    // Мутація для редагування будинку
    const updateHouseMutation = useMutation({
        mutationFn: async (data: Partial<HouseForRent>) => {
            if (!selectedHouse) throw new Error("Будинок не вибраний");
            return await propertyAPI.update(selectedHouse.id, data);
        },
        onSuccess: () => {
            toast({
                title: "Помешкання оновлено",
                description: "Дані помешкання успішно оновлені.",
            });
            setIsEditModalOpen(false);
            setNewPhotoUrl("");
            refetchHouses();
        },
        onError: (err: Error) => {
            toast({
                title: "Помилка оновлення",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    // Мутація для видалення пропозиції оренди
    const deleteBookingOfferMutation = useMutation({
        mutationFn: async (offerId: number) => {
            await bookingAPI.delete(offerId);
        },
        onSuccess: () => {
            toast({
                title: "Пропозиція скасована",
                description: "Пропозиція оренди успішно видалена.",
            });
            refetchMyBookingOffers();
            refetchReceivedBookingOffers();
        },
        onError: (err: Error) => {
            toast({
                title: "Помилка скасування",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    // Мутація для редагування коментаря
    const updateCommentMutation = useMutation({
        mutationFn: async (data: Partial<Review>) => {
            if (!selectedComment) throw new Error("Коментар не вибраний");
            return await reviewAPI.update(selectedComment.id, data);
        },
        onSuccess: () => {
            toast({
                title: "Коментар оновлено",
                description: "Ваш коментар успішно оновлено.",
            });
            setIsEditCommentModalOpen(false);
            refetchComments();
        },
        onError: (err: Error) => {
            toast({
                title: "Помилка оновлення",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    // Мутація для видалення коментаря
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: number) => {
            await reviewAPI.delete(commentId);
        },
        onSuccess: () => {
            toast({
                title: "Коментар видалено",
                description: "Ваш коментар успішно видалено.",
            });
            refetchComments();
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

    const handleEditHouse = (houseId: number) => {
        const houseToEdit = houses?.find((house: HouseForRent) => house.id === houseId);
        if (houseToEdit) {
            setSelectedHouse(houseToEdit);
            setEditHouseData({
                title: houseToEdit.title,
                description: houseToEdit.description,
                city: houseToEdit.city,
                rooms: houseToEdit.rooms,
                area: houseToEdit.area,
                price: houseToEdit.price,
                hasWifi: houseToEdit.hasWifi,
                hasParking: houseToEdit.hasParking,
                hasPool: houseToEdit.hasPool,
                photos: houseToEdit.photos,
            });
            setNewPhotoUrl("");
            setIsEditModalOpen(true);
        }
    };

    const handleUpdateHouse = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateHouseMutation.mutate(editHouseData);
    };

    const handleAddPhotoUrl = () => {
        if (!newPhotoUrl.trim()) {
            toast({
                title: "Помилка",
                description: "Введіть URL фотографії.",
                variant: "destructive",
            });
            return;
        }

        const newPhoto: Photo = {
            imageUrl: newPhotoUrl,
        };

        setEditHouseData((prev) => ({
            ...prev,
            photos: [...(prev.photos || []), newPhoto],
        }));
        setNewPhotoUrl("");
    };

    const handleRemovePhoto = (index: number) => {
        setEditHouseData((prev) => ({
            ...prev,
            photos: (prev.photos || []).filter((_, i) => i !== index),
        }));
    };

    const handleEditComment = (commentId: number) => {
        const commentToEdit = comments?.find((comment: Review) => comment.id === commentId);
        if (commentToEdit) {
            setSelectedComment(commentToEdit);
            setEditCommentData({
                comment: commentToEdit.comment,
                rating: commentToEdit.rating,
            });
            setIsEditCommentModalOpen(true);
        }
    };

    const handleUpdateComment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateCommentMutation.mutate(editCommentData);
    };

    if (authLoading) {
        return <div className="text-center py-10">Завантаження...</div>;
    }

    if (!user) {
        return <div className="text-center py-10">Ви не авторизовані. Будь ласка, увійдіть.</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
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
                                            <strong>Ім’я:</strong> {user.firstName || "Не вказано"}
                                        </p>
                                        <p>
                                            <strong>Прізвище:</strong> {user.lastName || "Не вказано"}
                                        </p>
                                        <p>
                                            <strong>Електронна пошта:</strong> {user.email || "Не вказано"}
                                        </p>
                                        <p>
                                            <strong>Номер телефону:</strong> {user.phoneNumber || "Не вказано"}
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

                    {/* Вкладки */}
                    <div className="lg:col-span-2">
                        <div className="flex gap-4 mb-4 flex-wrap">
                            <Button
                                variant={activeTab === "houses" ? "default" : "outline"}
                                onClick={() => setActiveTab("houses")}
                            >
                                Мої оголошення
                            </Button>
                            <Button
                                variant={activeTab === "myOffers" ? "default" : "outline"}
                                onClick={() => setActiveTab("myOffers")}
                            >
                                Мої пропозиції оренди
                            </Button>
                            <Button
                                variant={activeTab === "receivedOffers" ? "default" : "outline"}
                                onClick={() => setActiveTab("receivedOffers")}
                            >
                                Отримані пропозиції оренди
                            </Button>
                            <Button
                                variant={activeTab === "comments" ? "default" : "outline"}
                                onClick={() => setActiveTab("comments")}
                            >
                                Мої коментарі
                            </Button>
                        </div>

                        {/* Вкладка "Мої оголошення" */}
                        {activeTab === "houses" && (
                            <>
                                <h2 className="text-2xl font-semibold mb-4">Мої оголошення</h2>
                                {houses && houses.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {houses.map((house: HouseForRent) => (
                                            <PropertyCard
                                                key={house.id}
                                                house={house}
                                                onDelete={(houseId) => deleteHouseMutation.mutate(houseId)}
                                                onEdit={(houseId) => handleEditHouse(houseId)}
                                                showDeleteButton={true}
                                                showEditButton={true}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">У вас поки немає доданих помешкань.</p>
                                )}
                            </>
                        )}

                        {/* Вкладка "Мої пропозиції оренди" */}
                        {activeTab === "myOffers" && (
                            <>
                                <h2 className="text-2xl font-semibold mb-4">Мої пропозиції оренди</h2>
                                {myBookingOffers && myBookingOffers.length > 0 ? (
                                    <div className="space-y-4">
                                        {myBookingOffers.map((offer: MyBookingOfferDTO) => (
                                            <Card key={offer.id}>
                                                <CardHeader>
                                                    <CardTitle>Пропозиція оренди #{offer.id}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p><strong>Помешкання:</strong> {offer.houseTitle}</p>
                                                    <p><strong>Початок:</strong> {format(new Date(offer.offerFrom), "PPP")}</p>
                                                    <p><strong>Кінець:</strong> {format(new Date(offer.offerTo), "PPP")}</p>
                                                    <Button
                                                        variant="destructive"
                                                        className="mt-4"
                                                        onClick={() => deleteBookingOfferMutation.mutate(offer.id)}
                                                        disabled={deleteBookingOfferMutation.isPending}
                                                    >
                                                        {deleteBookingOfferMutation.isPending ? "Скасування..." : "Скасувати пропозицію"}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">У вас поки немає пропозицій оренди.</p>
                                )}
                            </>
                        )}

                        {/* Вкладка "Отримані пропозиції оренди" */}
                        {activeTab === "receivedOffers" && (
                            <>
                                <h2 className="text-2xl font-semibold mb-4">Отримані пропозиції оренди</h2>
                                {receivedBookingOffers && receivedBookingOffers.length > 0 ? (
                                    <div className="space-y-4">
                                        {receivedBookingOffers.map((offer: ReceivedBookingOfferDTO) => (
                                            <Card key={offer.id}>
                                                <CardHeader>
                                                    <CardTitle>Пропозиція оренди #{offer.id}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p><strong>Від користувача:</strong> {offer.authorLogin}</p>
                                                    <p><strong>Телефон:</strong> {offer.authorPhoneNumber}</p>
                                                    <p><strong>Помешкання:</strong> {offer.houseTitle}</p>
                                                    <p><strong>Початок:</strong> {format(new Date(offer.offerFrom), "PPP")}</p>
                                                    <p><strong>Кінець:</strong> {format(new Date(offer.offerTo), "PPP")}</p>
                                                    <Button
                                                        variant="destructive"
                                                        className="mt-4"
                                                        onClick={() => deleteBookingOfferMutation.mutate(offer.id)}
                                                        disabled={deleteBookingOfferMutation.isPending}
                                                    >
                                                        {deleteBookingOfferMutation.isPending ? "Скасування..." : "Скасувати пропозицію"}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">У вас поки немає отриманих пропозицій оренди.</p>
                                )}
                            </>
                        )}

                        {/* Вкладка "Мої коментарі" */}
                        {activeTab === "comments" && (
                            <>
                                <h2 className="text-2xl font-semibold mb-4">Мої коментарі</h2>
                                {comments && comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {comments.map((comment: Review) => (
                                            <Card key={comment.id}>
                                                <CardHeader>
                                                    <CardTitle>Коментар #{comment.id}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p><strong>Помешкання:</strong> {comment.houseForRentId}</p>
                                                    <p><strong>Рейтинг:</strong> {comment.rating} / 5</p>
                                                    <p><strong>Коментар:</strong> {comment.comment || "Без коментаря"}</p>
                                                    <p><strong>Дата:</strong> {format(new Date(comment.createdAt), "PPP")}</p>
                                                    <div className="flex gap-2 mt-4">
                                                        <Button
                                                            onClick={() => handleEditComment(comment.id)}
                                                            variant="outline"
                                                        >
                                                            Редагувати
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                                                            disabled={deleteCommentMutation.isPending}
                                                        >
                                                            {deleteCommentMutation.isPending ? "Видалення..." : "Видалити"}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">У вас поки немає коментарів.</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Модальне вікно для редагування оголошення */}
                <Modal
                    isOpen={isEditModalOpen}
                    onRequestClose={() => setIsEditModalOpen(false)}
                    className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-auto mt-20"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                >
                    <div className="flex flex-col h-[80vh]">
                        {/* Заголовок */}
                        <h2 className="text-2xl font-bold mb-4">Редагувати помешкання</h2>

                        {/* Форма з прокруткою */}
                        <form
                            id="edit-house-form"
                            onSubmit={handleUpdateHouse}
                            className="flex-1 overflow-y-auto space-y-4 pr-2"
                        >
                            <div>
                                <Label>Заголовок</Label>
                                <Input
                                    value={editHouseData.title || ""}
                                    onChange={(e) => setEditHouseData({ ...editHouseData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Опис</Label>
                                <Input
                                    value={editHouseData.description || ""}
                                    onChange={(e) => setEditHouseData({ ...editHouseData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Місто</Label>
                                <Input
                                    value={editHouseData.city || ""}
                                    onChange={(e) => setEditHouseData({ ...editHouseData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Кількість кімнат</Label>
                                <Input
                                    type="number"
                                    value={editHouseData.rooms || ""}
                                    onChange={(e) => setEditHouseData({ ...editHouseData, rooms: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Площа (м²)</Label>
                                <Input
                                    type="number"
                                    value={editHouseData.area || ""}
                                    onChange={(e) => setEditHouseData({ ...editHouseData, area: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Ціна за ніч ($)</Label>
                                <Input
                                    type="number"
                                    value={editHouseData.price || ""}
                                    onChange={(e) => setEditHouseData({ ...editHouseData, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <Label>Wi-Fi</Label>
                                    <input
                                        type="checkbox"
                                        checked={editHouseData.hasWifi || false}
                                        onChange={(e) => setEditHouseData({ ...editHouseData, hasWifi: e.target.checked })}
                                    />
                                </div>
                                <div>
                                    <Label>Паркінг</Label>
                                    <input
                                        type="checkbox"
                                        checked={editHouseData.hasParking || false}
                                        onChange={(e) => setEditHouseData({ ...editHouseData, hasParking: e.target.checked })}
                                    />
                                </div>
                                <div>
                                    <Label>Басейн</Label>
                                    <input
                                        type="checkbox"
                                        checked={editHouseData.hasPool || false}
                                        onChange={(e) => setEditHouseData({ ...editHouseData, hasPool: e.target.checked })}
                                    />
                                </div>
                            </div>

                            {/* Відображення існуючих фотографій */}
                            <div>
                                <Label>Фотографії</Label>
                                {(editHouseData.photos || []).length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {(editHouseData.photos || []).map((photo, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={photo.imageUrl}
                                                    alt="House photo"
                                                    className="h-32 w-full object-cover rounded"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://placehold.co/400x300";
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => handleRemovePhoto(index)}
                                                >
                                                    Видалити
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 mt-2">Фотографії відсутні.</p>
                                )}
                            </div>

                            {/* Додавання нової фотографії через URL */}
                            <div>
                                <Label>Додати нову фотографію (URL)</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        type="url"
                                        placeholder="Введіть URL фотографії"
                                        value={newPhotoUrl}
                                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                                    />
                                    <Button type="button" onClick={handleAddPhotoUrl}>
                                        Додати
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {/* Кнопки внизу (фіксовані) */}
                        <div className="flex gap-2 mt-4 border-t pt-4">
                            <Button type="submit" form="edit-house-form" disabled={updateHouseMutation.isPending}>
                                {updateHouseMutation.isPending ? "Оновлення..." : "Зберегти"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Скасувати
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Модальне вікно для редагування коментаря */}
                <Modal
                    isOpen={isEditCommentModalOpen}
                    onRequestClose={() => setIsEditCommentModalOpen(false)}
                    className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-auto mt-20"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                >
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold mb-4">Редагувати коментар</h2>
                        <form id="edit-comment-form" onSubmit={handleUpdateComment} className="space-y-4">
                            <div>
                                <Label>Коментар</Label>
                                <Input
                                    value={editCommentData.comment || ""}
                                    onChange={(e) => setEditCommentData({ ...editCommentData, comment: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Рейтинг (1-5)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={editCommentData.rating || ""}
                                    onChange={(e) => setEditCommentData({ ...editCommentData, rating: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button type="submit" disabled={updateCommentMutation.isPending}>
                                    {updateCommentMutation.isPending ? "Оновлення..." : "Зберегти"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsEditCommentModalOpen(false)}>
                                    Скасувати
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </main>
            <Footer />
        </div>
    );
}