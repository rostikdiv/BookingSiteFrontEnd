import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Property } from "@shared/schema";
import PropertyCard from "@/components/property/property-card";
import PropertyFilters from "@/components/property/property-filters";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

export default function PropertyShowcase() {
  const [filters, setFilters] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1
  });

  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Filter properties based on location
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    if (!filters.location) return properties;
    
    return properties.filter(property => 
      property.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }, [properties, filters.location]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-gray-900">Featured Properties</h2>
          <Link href="/properties" className="text-primary hover:text-primary-dark flex items-center text-sm font-medium">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <PropertyFilters onFilterChange={handleFilterChange} />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Error loading properties</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
            
            {filteredProperties.length === 0 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-10">
                <p className="text-gray-500">No properties found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
