import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WaitlistModal from "@/components/ui/waitlist-modal";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export default function HeroSection() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const onSubmit = async (data: WaitlistFormValues) => {
    try {
      await apiRequest("POST", "/api/waitlist", {
        email: data.email,
        name: data.name,
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
    <section className="relative bg-primary-dark text-white">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-transparent opacity-60"></div>
      <div 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')" 
        }} 
        className="absolute inset-0 bg-cover bg-center"
      ></div>
      <div className="relative container mx-auto px-4 py-20 sm:py-24 lg:py-32">
        <h1 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl mb-4">
          Find your perfect stay
        </h1>
        <p className="text-lg md:text-xl max-w-xl mb-8">
          Discover amazing places to stay around the world. Join our exclusive waitlist for early access.
        </p>
        <div className="max-w-md bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-primary-dark font-poppins font-medium text-xl mb-4">Join our waitlist</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-darker">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@example.com" 
                        {...field} 
                        className="border-neutral-light focus:ring-primary" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-darker">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        className="border-neutral-light focus:ring-primary" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-dark text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Processing..." : "Join Waitlist"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      
      <WaitlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
