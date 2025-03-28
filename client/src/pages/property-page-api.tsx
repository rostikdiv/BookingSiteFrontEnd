import { useParams, Link } from "wouter";
import { useProperty } from "@/services/properties-api";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { bookingAPI } from "@/services/api";
import { BookingOffer, CreateBookingData } from "@/types/models";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInDays, addDays } from "date-fns";
import PropertyReviews from "@/components/property/property-reviews-api";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  Calendar, 
  Wifi, 
  Car, 
  Waves, 
  Star, 
  Clock, 
  User,
  MapPin,
  Home,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Схема для бронирования
const bookingSchema = z.object({
  offerFrom: z.date({
    required_error: "Check-in date is required",
  }),
  offerTo: z.date({
    required_error: "Check-out date is required",
  }),
}).refine(
  (data) => data.offerTo > data.offerFrom, 
  {
    message: "Check-out date must be after check-in date",
    path: ["offerTo"],
  }
);

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function PropertyPageApi() {
  const { id } = useParams<{ id: string }>();
  const propertyId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [openBookingModal, setOpenBookingModal] = useState(false);
  
  // Запрос данных о доме
  const { data: property, isLoading, error } = useProperty(propertyId);
  
  // Форма бронирования
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      offerFrom: addDays(new Date(), 1),
      offerTo: addDays(new Date(), 8),
    },
  });
  
  // Мутация для создания бронирования
  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      if (!user) {
        throw new Error("You must be logged in to book a property");
      }
      
      // Создаем объект бронирования
      const bookingData: CreateBookingData = {
        lessorId: user.id,
        offerFrom: data.offerFrom.toISOString(),
        offerTo: data.offerTo.toISOString(),
        houseOfferId: propertyId
      };
      
      // Используем метод из API сервиса
      return await bookingAPI.create(bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking successful",
        description: "Your booking has been confirmed!",
      });
      setOpenBookingModal(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Обработчик бронирования
  const handleBooking = (data: BookingFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book this property",
        variant: "destructive",
      });
      return;
    }
    
    bookingMutation.mutate(data);
  };
  
  // Вычисление количества дней
  const days = form.watch('offerFrom') && form.watch('offerTo')
    ? differenceInDays(form.watch('offerTo'), form.watch('offerFrom'))
    : 0;
  
  // Вычисление итоговой стоимости
  const totalPrice = property ? days * property.price : 0;
  
  // Вычисление среднего рейтинга
  const averageRating = property && property.reviewsTo && property.reviewsTo.length > 0
    ? property.reviewsTo.reduce((sum, review) => sum + review.rating, 0) / property.reviewsTo.length
    : 0;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col justify-center items-center p-4">
          <h1 className="text-2xl font-semibold text-red-500 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the property you're looking for.</p>
          <Button asChild>
            <Link to="/properties">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                    Home
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link to="/properties" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                      Properties
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-sm font-medium text-gray-500 truncate max-w-[200px]">
                      {property.title}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          
          {/* Property Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.city}</span>
                  {averageRating > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                        <span>{averageRating.toFixed(1)} ({property.reviewsTo?.length || 0} reviews)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary mr-2">${property.price}</span>
                <span className="text-gray-600">/ night</span>
              </div>
            </div>
          </div>
          
          {/* Property Gallery */}
          <div className="mb-8">
            {property.photos && property.photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl overflow-hidden">
                {property.photos.slice(0, 4).map((photo, index) => (
                  <div key={photo.id} className={`${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} aspect-video`}>
                    <img 
                      src={photo.imageUrl} 
                      alt={`${property.title} - Photo ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
                <Home className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Property Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm">Rooms</span>
                      <span className="font-medium">{property.rooms} Rooms</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm">Area</span>
                      <span className="font-medium">{property.area} m²</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm">Host</span>
                      <span className="font-medium">{property.owner.firstName} {property.owner.lastName}</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-gray-600">
                      {property.description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Amenities</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4">
                      {property.hasWifi && (
                        <div className="flex items-center">
                          <Wifi className="h-5 w-5 mr-2 text-primary" />
                          <span>WiFi</span>
                        </div>
                      )}
                      {property.hasParking && (
                        <div className="flex items-center">
                          <Car className="h-5 w-5 mr-2 text-primary" />
                          <span>Parking</span>
                        </div>
                      )}
                      {property.hasPool && (
                        <div className="flex items-center">
                          <Waves className="h-5 w-5 mr-2 text-primary" />
                          <span>Swimming Pool</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Reviews */}
              <PropertyReviews propertyId={propertyId} />
            </div>
            
            {/* Right Column - Booking */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Book this property</CardTitle>
                  <CardDescription>Select your check-in and check-out dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleBooking)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="offerFrom"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Check-in</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="text-left font-normal"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="offerTo"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Check-out</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="text-left font-normal"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => 
                                      date < new Date() || 
                                      (form.watch('offerFrom') && date <= form.watch('offerFrom'))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {days > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span>${property.price} × {days} night{days > 1 ? 's' : ''}</span>
                            <span>${property.price * days}</span>
                          </div>
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center font-semibold">
                              <span>Total</span>
                              <span>${totalPrice}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-4"
                        disabled={bookingMutation.isPending}
                      >
                        {bookingMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Book Now"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-start pt-0">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>Free cancellation up to 48 hours before check-in</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}