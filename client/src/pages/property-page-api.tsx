import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useProperty, useReviews } from "@/services/properties-api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { bookingAPI, reviewAPI } from "@/services/api";
import { CreateBookingData, CreateReviewData, Review, HouseForRent } from "@/types/models";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PropertyPageApi() {
  const { id } = useParams<{ id: string }>();
  console.log("Property ID:", id);
  const { user } = useAuth();
  const { data: property, isLoading, error } = useProperty(Number(id));
  const { data: reviews, refetch: refetchReviews } = useReviews(Number(id));
  console.log("Filtered Reviews:", reviews);
  const { toast } = useToast();

  // Стан для форми бронювання
  const [offerFrom, setOfferFrom] = useState<string>("");
  const [offerTo, setOfferTo] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [dateError, setDateError] = useState<string | null>(null);

  // Стан для форми відгуку
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  // Перевірка, чи користувач уже залишав відгук
  const hasReviewed = user && reviews?.some((review) => review.authorId === user.id);

  // Обчислення загальної вартості та валідація дат
  useEffect(() => {
    if (property && offerFrom && offerTo) {
      const startDate = new Date(offerFrom);
      const endDate = new Date(offerTo);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        setDateError("Дата заїзду не може бути в минулому.");
        setTotalPrice(0);
        return;
      }

      if (endDate <= startDate) {
        setDateError("Дата виїзду має бути пізніше за дату заїзду.");
        setTotalPrice(0);
        return;
      }

      setDateError(null);
      const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (nights > 0) {
        setTotalPrice(nights * property.price);
      }
    } else {
      setTotalPrice(0);
    }
  }, [offerFrom, offerTo, property]);

  // Мутація для створення бронювання
  const bookingMutation = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      return await bookingAPI.create(data); // Тепер повертає HouseForRent
    },
    onSuccess: (house: HouseForRent) => {
      toast({
        title: "Бронювання створено!",
        description: "Ви успішно забронювали це помешкання.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Помилка бронювання",
        description: err.message || "Виникла помилка під час створення бронювання.",
        variant: "destructive",
      });
    },
  });

  // Мутація для створення відгуку
  const reviewMutation = useMutation({
    mutationFn: async (data: CreateReviewData) => {
      return await reviewAPI.create(data);
    },
    onSuccess: (house: HouseForRent) => {
      toast({
        title: "Відгук додано!",
        description: "Ваш відгук успішно додано.",
      });
      refetchReviews();
      setRating(0);
      setComment("");
    },
    onError: (err: Error) => {
      toast({
        title: "Помилка додавання відгуку",
        description: err.message || "Виникла помилка під час додавання відгуку.",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!user || !property || dateError) return;

    const bookingData: CreateBookingData = {
      lessorId: user.id,
      offerFrom,
      offerTo,
      houseOfferId: property.id,
    };

    console.log("Booking Data before sending:", bookingData); // Додаємо лог

    bookingMutation.mutate(bookingData);
  };

  const handleReviewSubmit = () => {
    if (!user || !property) {
      console.error("User or property is undefined:", { user, property });
      toast({
        title: "Помилка",
        description: "Користувач або помешкання не визначені.",
        variant: "destructive",
      });
      return;
    }

    if (!user.id) {
      console.error("User ID is missing:", user);
      toast({
        title: "Помилка",
        description: "ID користувача не визначено.",
        variant: "destructive",
      });
      return;
    }

    if (!property.id) {
      console.error("Property ID is missing:", property);
      toast({
        title: "Помилка",
        description: "ID помешкання не визначено.",
        variant: "destructive",
      });
      return;
    }

    const reviewData: CreateReviewData = {
      authorId: user.id,
      comment,
      rating,
      houseForRentId: property.id,
    };

    console.log("Review Data before sending:", reviewData);

    reviewMutation.mutate(reviewData);
  };

  if (isLoading) return <div className="text-center py-10">Завантаження...</div>;
  if (error || !property) return <div className="text-center py-10 text-red-500">Помилка завантаження помешкання</div>;

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Основна інформація про помешкання */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-gray-600">{property.city}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{property.rooms} кімнат</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{property.area} м²</span>
              </div>

              {/* Галерея фотографій */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {property.photos && property.photos.length > 0 ? (
                    property.photos.map((photo) => (
                        <img
                            key={photo.id}
                            src={photo.imageUrl}
                            alt="Фото помешкання"
                            className="w-full h-64 object-cover rounded-lg"
                        />
                    ))
                ) : (
                    <img
                        src="https://via.placeholder.com/800x600"
                        alt="Фото помешкання"
                        className="w-full h-64 object-cover rounded-lg"
                    />
                )}
              </div>

              {/* Опис */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Опис</h2>
                <p className="text-gray-700">{property.description}</p>
              </div>

              {/* Зручності */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Зручності</h2>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex items-center gap-2">
                    <span>WiFi:</span>
                    <span className={property.hasWifi ? "text-green-500" : "text-red-500"}>
                    {property.hasWifi ? "Так" : "Ні"}
                  </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>Парковка:</span>
                    <span className={property.hasParking ? "text-green-500" : "text-red-500"}>
                    {property.hasParking ? "Так" : "Ні"}
                  </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>Басейн:</span>
                    <span className={property.hasPool ? "text-green-500" : "text-red-500"}>
                    {property.hasPool ? "Так" : "Ні"}
                  </span>
                  </li>
                </ul>
              </div>

              {/* Відгуки */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Відгуки</h2>
                {reviews && reviews.length > 0 ? (
                    reviews.map((review: Review) => (
                        <Card key={review.id} className="mb-4">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Користувач #{review.authorId}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                            i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                        }`}
                                    />
                                ))}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p>{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-gray-500">Відгуків поки немає.</p>
                )}
              </div>

              {/* Форма для додавання відгуку */}
              {user && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Залишити відгук</h2>
                    {hasReviewed ? (
                        <p className="text-gray-500">Ви вже залишили відгук для цього помешкання.</p>
                    ) : (
                        <div className="space-y-4">
                          <div>
                            <Label>Рейтинг</Label>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                  <Star
                                      key={i}
                                      className={`h-6 w-6 cursor-pointer ${
                                          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                      }`}
                                      onClick={() => setRating(i + 1)}
                                  />
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label>Коментар</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Ваш відгук..."
                            />
                          </div>
                          <Button
                              onClick={handleReviewSubmit}
                              disabled={reviewMutation.isPending || rating === 0 || !comment}
                          >
                            {reviewMutation.isPending ? "Додавання..." : "Додати відгук"}
                          </Button>
                        </div>
                    )}
                  </div>
              )}
            </div>

            {/* Форма бронювання */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>
                    <span className="text-2xl font-bold">${property.price}</span>
                    <span className="text-gray-500">/ніч</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Дата заїзду</Label>
                          <Input
                              type="date"
                              value={offerFrom}
                              onChange={(e) => setOfferFrom(e.target.value)}
                              className="w-full"
                          />
                        </div>
                        <div>
                          <Label>Дата виїзду</Label>
                          <Input
                              type="date"
                              value={offerTo}
                              onChange={(e) => setOfferTo(e.target.value)}
                              className="w-full"
                          />
                        </div>
                        {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
                        <div>
                          <Label>Кількість гостей</Label>
                          <Input
                              type="number"
                              min={1}
                              value={guests}
                              onChange={(e) => setGuests(Number(e.target.value))}
                              className="w-full"
                          />
                        </div>
                        {totalPrice > 0 && (
                            <div className="text-lg font-semibold">
                              Загальна вартість: ${totalPrice}
                            </div>
                        )}
                        <Button
                            onClick={handleBooking}
                            className="w-full"
                            disabled={bookingMutation.isPending || !offerFrom || !offerTo || !!dateError}
                        >
                          {bookingMutation.isPending ? "Бронювання..." : "Забронювати"}
                        </Button>
                      </div>
                  ) : (
                      <p className="text-gray-500">Увійдіть, щоб забронювати це помешкання.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
  );
}