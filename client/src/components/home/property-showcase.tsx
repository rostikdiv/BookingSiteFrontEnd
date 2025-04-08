import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertyFiltersProps {
  onFilterChange: (filters: { city: string; checkIn: string; checkOut: string; guests: number }) => void;
}

export default function PropertyFilters({ onFilterChange }: PropertyFiltersProps) {
  const handleChange = (city: string) => {
    const newFilters = { city, checkIn: "", checkOut: "", guests: 1 };
    onFilterChange(newFilters);
  };

  return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="max-w-md">
          <Label htmlFor="city">Місто</Label>
          <Input
              id="city"
              placeholder="Введіть місто"
              onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      </div>
  );
}