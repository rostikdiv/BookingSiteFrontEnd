import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { format } from "date-fns";
import { reviewAPI } from "@/services/api";
import { Review, CreateReviewPayload } from "@/types/models";

const reviewSchema = z.object({
  rating: z.number().min(1, "Оцінка має бути від 1 до 5").max(5, "Оцінка має бути від 1 до 5"),
  comment: z.string().min(5, "Відгук має бути щонайменше 5 символів").max(500, "Відгук не може перевищувати 500 символів"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function PropertyReviews({ propertyId }: { propertyId: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  const { data: reviews = [], isLoading, error } = useQuery<Review[], Error>({
    queryKey: [`property-${propertyId}-reviews`],
    queryFn: async () => {
      const response = await reviewAPI.getByHouseId(propertyId);
      console.log("Reviews response for propertyId", propertyId, ":", response);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!propertyId,
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      if (!user) {
        throw new Error("You must be logged in to submit a review");
      }
      const reviewData: CreateReviewPayload = {
        comment: data.comment,
        rating: data.rating,
        authorId: user.id,
      };
      return reviewAPI.create(reviewData, propertyId);
    },
    onSuccess: () => {
      toast({ title: "Відгук додано", description: "Дякуємо за ваш відгук!" });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: [`property-${propertyId}-reviews`] });
    },
    onError: (error: Error) => {
      toast({ title: "Помилка", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    if (!user) {
      toast({ title: "Потрібен вхід", description: "Будь ласка, увійдіть", variant: "destructive" });
      return;
    }
    reviewMutation.mutate(data);
  };

  const renderStars = (rating: number) =>
    Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ));

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Відгуки
          {user && !showForm && <Button onClick={() => setShowForm(true)}>Написати відгук</Button>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Завантаження...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Не вдалося завантажити відгуки: {error.message}</div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{review.authorLogin}</p>
                    <p className="text-sm text-gray-500">
                      {review.createdAt ? format(new Date(review.createdAt), "PPP") : "Дата не вказана"}
                    </p>
                  </div>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                <p className="mt-3">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Ще немає відгуків. Будьте першим!</div>
        )}

        {showForm && user && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Написати відгук</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Оцінка</FormLabel>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <Star
                            key={r}
                            className={`h-6 w-6 cursor-pointer ${
    field.value >= r ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
}`}
                            onClick={() => field.onChange(r)}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Відгук</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ваш відгук..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Скасувати
                  </Button>
                  <Button type="submit" disabled={reviewMutation.isPending}>
                    {reviewMutation.isPending ? "Відправка..." : "Відправити"}
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
