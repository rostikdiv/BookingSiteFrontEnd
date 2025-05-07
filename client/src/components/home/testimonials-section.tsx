import { Star } from "lucide-react";

type TestimonialCardProps = {
  rating: number;
  content: string;
  name: string;
  location: string;
};

function TestimonialCard({ rating, content, name, location }: TestimonialCardProps) {
  return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <div className="text-yellow-500 flex">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${i < rating ? "fill-current" : "fill-none"}`}
                />
            ))}
          </div>
        </div>
        <p className="text-gray-600 mb-4">{content}</p>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            <span className="text-gray-600 font-medium">{name.charAt(0)}</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600">{location}</p>
          </div>
        </div>
      </div>
  );
}

export default function TestimonialsSection() {
  const testimonials = [
    {
      rating: 5,
      content: "\"StayEase зробив бронювання сімейної відпустки дуже простим! Помешкання повністю відповідало опису, а процес заїзду був бездоганним.\"",
      name: "Сара Джонсон",
      location: "Нью-Йорк, NY"
    },
    {
      rating: 5,
      content: "\"Опції фільтрації помешкань вражають. Я знайшов саме те, що шукав, за кілька хвилин. Обов’язково скористаюся StayEase знову!\"",
      name: "Майкл Робертсон",
      location: "Чикаго, IL"
    },
    {
      rating: 4.5,
      content: "\"Підтримка клієнтів була чудовою, коли у нас виникли питання щодо бронювання. Помешкання перевершило наші очікування. Дуже рекомендую!\"",
      name: "Дженніфер Лопез",
      location: "Маямі, FL"
    }
  ];

  return (
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-gray-900 mb-4">Що кажуть наші користувачі</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Дізнайтесь відгуки наших задоволених клієнтів про досвід із StayEase.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
                <TestimonialCard
                    key={index}
                    rating={testimonial.rating}
                    content={testimonial.content}
                    name={testimonial.name}
                    location={testimonial.location}
                />
            ))}
          </div>
        </div>
      </section>
  );
}