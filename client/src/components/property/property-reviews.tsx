import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Review, InsertReview, insertReviewSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, StarHalf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { format } from "date-fns";

// Create review form schema with validation
const reviewSchema = insertReviewSchema.extend({
  rating: z.number().min(1).max(5),
  content: z.string().min(5, "Review must be at least 5 characters").max(500, "Review must be less than 500 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

type PropertyReviewsProps = {
  houseForRentId: number;
};

export default function PropertyReviews({ houseForRentId }: PropertyReviewsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  // Fetch reviews for this property
  const { data: reviews, isLoading, error } = useQuery<Review[]>({
    queryKey: [`/api/properties/${houseForRentId}/reviews`],
  });
  
  // Form setup
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      houseForRentId,
      rating: 5,
      content: "",
    },
  });
  
  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      if (!user) {
        throw new Error("You must be logged in to submit a review");
      }
      
      // Convert the 1-5 star rating to 10-50 scale that the backend expects
      const reviewData = {
        ...data,
        houseForRentId,
        authorId: user.id, // Add authorId explicitly from the current user
        userId: user.id, // Keep for backward compatibility
        rating: data.rating * 10 // Convert 1-5 scale to 10-50 scale
      };
      
      const res = await apiRequest("POST", `/api/properties/${houseForRentId}/reviews`, reviewData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${houseForRentId}/reviews`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ReviewFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }
    
    reviewMutation.mutate(data);
  };
  
  // Format rating to stars (rating is 1-5 in our form, but stored as 10-50 in the database)
  const renderStars = (rating: number) => {
    const stars = [];
    const normalizedRating = rating <= 5 ? rating : rating / 10; // Handle both 1-5 and 10-50 scale
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Reviews</span>
          {user && !showForm && (
            <Button onClick={() => setShowForm(true)}>
              Write a review
            </Button>
          )}
        </CardTitle>
        {reviews && reviews.length > 0 && (
          <CardDescription>
            {reviews.length} review{reviews.length > 1 ? "s" : ""}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">Failed to load reviews</div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Guest {review.authorId || review.userId}</p>
                      <p className="text-sm text-gray-500">
                        {review.createdAt ? format(new Date(review.createdAt), "PPP") : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="mt-3 text-gray-700">{review.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this property!
          </div>
        )}
        
        {showForm && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Write a review</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className={`h-6 w-6 cursor-pointer ${
                              field.value >= rating 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"
                            }`}
                            onClick={() => field.onChange(rating)}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your experience with this property..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={reviewMutation.isPending}
                  >
                    {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}