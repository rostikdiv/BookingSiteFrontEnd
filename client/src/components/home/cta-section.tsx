import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WaitlistModal from "@/components/ui/waitlist-modal";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export default function CTASection() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: WaitlistFormValues) => {
    try {
      await apiRequest("POST", "/api/waitlist", {
        email: data.email,
        name: "Subscriber", // Default name for quick signup
      });
      
      form.reset();
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join waitlist",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="relative py-12 md:py-24 bg-primary-dark text-white">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')" 
        }} 
        className="absolute inset-0 bg-cover bg-center"
      ></div>
      <div className="relative container mx-auto px-4 text-center">
        <h2 className="font-poppins font-semibold text-2xl md:text-3xl lg:text-4xl mb-6">Ready to find your perfect stay?</h2>
        <p className="text-lg max-w-2xl mx-auto mb-8">Sign up for our waitlist today and be the first to access our platform when we launch.</p>
        <div className="max-w-md mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-center gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        {...field} 
                        className="px-4 py-3 rounded-md text-gray-900" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full sm:w-auto whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-md"
                disabled={form.formState.isSubmitting}
              >
                Join Waitlist
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-sm opacity-80">We'll notify you as soon as we launch. No spam, we promise.</p>
        </div>
      </div>
      
      <WaitlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
