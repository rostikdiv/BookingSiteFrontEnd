import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Property, User, insertBookingSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Loader2, Calendar, Users, Star, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, differenceInDays, addDays } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import PropertyReviews from "@/components/property/property-reviews";

// Create booking form schema
const bookingSchema = z.object({
  checkInDate: z.date({
    required_error: "Check-in date is required",
  }),
  checkOutDate: z.date({
    required_error: "Check-out date is required",
  }),
  guests: z.number({
    required_error: "Number of guests is required",
  }).min(1),
}).refine(data => {
  return data.checkOutDate > data.checkInDate;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function PropertyPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [match, params] = useRoute<{ id: string }>("/properties/:id");
  
  if (!match) {
    return <div>Property not found</div>;
  }
  
  const propertyId = parseInt(params.id);
  
  // Fetch property details
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
  });
  
  // Form setup
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: 1,
    },
  });
  
  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const totalDays = differenceInDays(data.checkOutDate, data.checkInDate);
      const totalPrice = property!.price * totalDays;
      
      const bookingData = insertBookingSchema.parse({
        propertyId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        guests: data.guests,
        totalPrice,
        userId: user!.id,
        status: "pending"
      });
      
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking successful",
        description: "Your booking has been confirmed!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBooking = (data: BookingFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book this property",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    bookingMutation.mutate(data);
  };
  
  // Calculate total price based on selected dates
  const calculateTotal = () => {
    const checkIn = form.watch("checkInDate");
    const checkOut = form.watch("checkOutDate");
    
    if (checkIn && checkOut) {
      const days = differenceInDays(checkOut, checkIn);
      return days > 0 ? days * (property?.price || 0) : 0;
    }
    
    return 0;
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Format rating to show as 4.9 instead of 49
  const formattedRating = property?.rating ? (property.rating / 10).toFixed(1) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Failed to load property details</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate("/properties")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to listings
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          {/* Back button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/properties")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listings
          </Button>
          
          {/* Property Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex items-center mt-2">
                <p className="text-gray-600">{property.location}</p>
                {formattedRating && (
                  <div className="flex items-center ml-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 font-medium">{formattedRating}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className={isFavorite ? "text-red-500" : "text-gray-600"}
              onClick={toggleFavorite}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
          
          {/* Property Image */}
          <div className="rounded-lg overflow-hidden mb-8 max-h-[500px]">
            <img 
              src={property.imageUrl} 
              alt={property.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {/* Property Details and Booking Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About this property</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-8 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{property.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{property.bathrooms} Bathrooms</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="prose prose-sm max-w-none">
                    <p>{property.description}</p>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">What this place offers</h3>
                    <ul className="grid grid-cols-2 gap-2">
                      <li className="flex items-center">
                        <span className="mr-2">✓</span>
                        <span>Wifi</span>
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span>
                        <span>Kitchen</span>
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span>
                        <span>Free parking</span>
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span>
                        <span>Air conditioning</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              {/* Property Reviews */}
              <PropertyReviews propertyId={propertyId} />
            </div>
            
            {/* Booking Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>${property.price}</span>
                    <span className="text-sm font-normal text-gray-600">per night</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleBooking)} className="space-y-4">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="checkInDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Check in</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
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
                          name="checkOutDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Check out</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
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
                                    disabled={(date) => {
                                      const checkIn = form.getValues("checkInDate");
                                      return !checkIn || date <= checkIn;
                                    }}
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
                          name="guests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Guests</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select number of guests" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 guest</SelectItem>
                                  <SelectItem value="2">2 guests</SelectItem>
                                  <SelectItem value="3">3 guests</SelectItem>
                                  <SelectItem value="4">4 guests</SelectItem>
                                  <SelectItem value="5">5 guests</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Price calculation */}
                      {form.watch("checkInDate") && form.watch("checkOutDate") && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex justify-between mb-2">
                            <span>{property.price} x {differenceInDays(form.watch("checkOutDate"), form.watch("checkInDate"))} nights</span>
                            <span>${calculateTotal()}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t border-gray-200 pt-4 mt-4">
                            <span>Total</span>
                            <span>${calculateTotal()}</span>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary-dark"
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
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
