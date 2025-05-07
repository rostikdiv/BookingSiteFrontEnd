import { Search, ShieldCheck, HeadphonesIcon } from "lucide-react";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
  );
}

export default function FeaturesSection() {
  const features = [
    {
      icon: <Search size={24} />,
      title: "Простій пошук",
      description: "Знайдіть ідеальне помешкання за допомогою наших потужних опцій пошуку та фільтрації."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Перевірені помешкання",
      description: "Кожне оголошення перевіряється нашою командою для забезпечення якості та точності."
    },
    {
      icon: <HeadphonesIcon size={24} />,
      title: "Підтримка 24/7",
      description: "Наша команда підтримки клієнтів доступна цілодобово, щоб допомогти вам."
    }
  ];

  return (
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-gray-900 mb-4">Чому обирають StayEase?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Відкрийте ідеальне помешкання для відпочинку з нашою ретельно підібраною колекцією об’єктів по всьому світу.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
                <FeatureCard
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                />
            ))}
          </div>
        </div>
      </section>
  );
}