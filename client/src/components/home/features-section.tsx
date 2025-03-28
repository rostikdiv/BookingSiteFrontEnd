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
      title: "Easy Search",
      description: "Find the perfect property with our powerful search and filtering options."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Verified Properties",
      description: "Every listing is verified by our team to ensure quality and accuracy."
    },
    {
      icon: <HeadphonesIcon size={24} />,
      title: "24/7 Support",
      description: "Our customer support team is available around the clock to assist you."
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-gray-900 mb-4">Why choose StayEase?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover the perfect vacation rental with our curated selection of properties worldwide.</p>
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
