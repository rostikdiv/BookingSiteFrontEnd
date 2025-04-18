// pages/properties-page.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { propertyAPI } from "@/services/api";
import PropertyCard from "@/components/property/property-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {HouseFilterDTO, HouseForRent} from "@/types/models";

export default function PropertiesPage() {
  const [filters, setFilters] = useState<HouseFilterDTO>({});

  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ["properties", filters],
    queryFn: () => {
      if (Object.keys(filters).length > 0) {
        return propertyAPI.search(filters);
      }
      return propertyAPI.getAll();
    },
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const applyFilters = () => {
    refetch();
  };

  return (
      <div className="min-h-screen p-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Фільтри</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                    name="city"
                    placeholder="Місто"
                    onChange={handleFilterChange}
                    value={filters.city || ""}
                />
                <Input
                    name="minPrice"
                    type="number"
                    placeholder="Мін. ціна"
                    onChange={handleFilterChange}
                    value={filters.minPrice || ""}
                />
                <Input
                    name="maxPrice"
                    type="number"
                    placeholder="Макс. ціна"
                    onChange={handleFilterChange}
                    value={filters.maxPrice || ""}
                />
              </div>
              <Button onClick={applyFilters} className="mt-4">Застосувати фільтри</Button>
            </CardContent>
          </Card>

          {isLoading ? (
              <div>Завантаження...</div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties?.map((property: HouseForRent) => (
                    <PropertyCard key={property.id} house={property} />
                ))}
              </div>
          )}
        </div>
      </div>
  );
}