import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property/property-card";
import PropertyFilters from "@/components/property/property-filters";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PropertiesPage() {
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
  const filteredProperties = properties?.filter(property => {
    if (!filters.location) return true;
    return property.location.toLowerCase().includes(filters.location.toLowerCase());
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Explore Properties</h1>
          
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
            <>
              <p className="text-gray-600 mb-6">
                {filteredProperties?.length || 0} properties found
                {filters.location && ` in "${filters.location}"`}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProperties?.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
                
                {(filteredProperties?.length === 0) && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500">No properties found matching your criteria</p>
                    <Button 
                      onClick={() => setFilters({
                        location: "",
                        checkIn: "",
                        checkOut: "",
                        guests: 1
                      })}
                      variant="outline"
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
