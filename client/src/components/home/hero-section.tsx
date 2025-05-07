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
    email: z.string().email("Будь ласка, введіть дійсну адресу електронної пошти"),
    name: z.string().min(2, "Ім'я має містити щонайменше 2 символи"),
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
                title: "Помилка",
                description: error instanceof Error ? error.message : "Не вдалося приєднатися до списку очікування",
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
            <div className="relative container mx-auto px-4 py-20 sm:py-24 lg:py-32 text-center">
                <h1 className="font-poppins font-bold text-4xl sm:text-5xl md:text-6xl mb-6">
                    Знайдіть ідеальне місце для проживання
                </h1>
                <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8">
                    Відкривайте дивовижні місця для проживання по всьому світу
                </p>
            </div>
        </section>
    );
}