import { useState } from "react";
import { useProperties } from "@/services/properties-api";
import PropertyCard from "@/components/property/property-card-api";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { HouseFilterDTO } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, FilterX } from "lucide-react";

// Тип для свойств, чтобы TypeScript не выдавал ошибку
type AnyProperty = any;

export default function PropertiesPage() {
  const { data: properties, isLoading, error } = useProperties();
  const [filters, setFilters] = useState<HouseFilterDTO>({});
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Проверяем формат данных и применяем фильтры
  const applyFilters = (data: any[]): any[] => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter(property => {
      let isMatch = true;
      
      // Фильтр по городу
      if (filters.city && property.location && 
          property.location.toLowerCase().indexOf(filters.city.toLowerCase()) === -1) {
        isMatch = false;
      }
      
      // Фильтр по цене
      if ((filters.minPrice && property.price < filters.minPrice) ||
          (filters.maxPrice && property.price > filters.maxPrice)) {
        isMatch = false;
      }
      
      // Фильтр по количеству комнат
      // Проверяем, есть ли свойство rooms или bedrooms
      const rooms = property.rooms || property.bedrooms;
      if (filters.minRooms && rooms < filters.minRooms) {
        isMatch = false;
      }
      
      // Фильтр по площади (используем price если area отсутствует)
      const area = property.area || property.price;
      if (filters.minArea && area < filters.minArea) {
        isMatch = false;
      }
      
      // Фильтр по ключевому слову (поиск по названию и описанию)
      if (filters.keyword && !(
        property.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        property.description.toLowerCase().includes(filters.keyword.toLowerCase())
      )) {
        isMatch = false;
      }
      
      return isMatch;
    });
  };
  
  const filteredProperties = applyFilters(properties || []);
  
  // Обработчик фильтрации
  const handleFilterChange = (key: keyof HouseFilterDTO, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Обработчик изменения диапазона цен
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setFilters(prev => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1]
    }));
  };
  
  // Сброс фильтров
  const resetFilters = () => {
    setFilters({});
    setPriceRange([0, 1000]);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Find Your Perfect Stay</h1>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>Filters</span>
              <svg 
                width="15" 
                height="15" 
                className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
                viewBox="0 0 15 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" />
              </svg>
            </Button>
          </div>
          
          {/* Filters section */}
          {showFilters && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filter Properties</h2>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="flex items-center gap-1">
                  <FilterX className="h-4 w-4" />
                  Reset
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Location filter */}
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="Enter city"
                    value={filters.city || ''}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                {/* Keyword search */}
                <div>
                  <Label htmlFor="keyword">Keyword</Label>
                  <Input 
                    id="keyword" 
                    placeholder="Search by keyword"
                    value={filters.keyword || ''}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                {/* Price range slider */}
                <div className="md:col-span-2 lg:col-span-1">
                  <div className="flex justify-between items-center">
                    <Label>Price Range</Label>
                    <span className="text-sm text-gray-500">
                      ${priceRange[0]} - ${priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[0, 1000]}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    className="mt-3"
                  />
                </div>
                
                {/* Rooms filter */}
                <div>
                  <Label>Minimum Rooms</Label>
                  <RadioGroup 
                    className="flex space-x-4 mt-1"
                    value={filters.minRooms?.toString() || ''}
                    onValueChange={(value) => handleFilterChange('minRooms', value ? parseInt(value) : undefined)}
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="" id="any-room" />
                      <Label htmlFor="any-room" className="cursor-pointer">Any</Label>
                    </div>
                    {[1, 2, 3, 4].map(num => (
                      <div key={num} className="flex items-center space-x-1">
                        <RadioGroupItem value={num.toString()} id={`room-${num}`} />
                        <Label htmlFor={`room-${num}`} className="cursor-pointer">{num}+</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {/* Area filter */}
                <div>
                  <Label htmlFor="area">Minimum Area (m²)</Label>
                  <Input 
                    id="area" 
                    type="number"
                    placeholder="Min area"
                    value={filters.minArea || ''}
                    onChange={(e) => handleFilterChange('minArea', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
                
                {/* Amenities filter */}
                <div>
                  <Label className="block mb-2">Amenities</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="wifi" 
                        checked={filters.hasWifi || false}
                        onCheckedChange={(checked) => handleFilterChange('hasWifi', checked)}
                      />
                      <Label htmlFor="wifi" className="cursor-pointer">WiFi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="parking" 
                        checked={filters.hasParking || false}
                        onCheckedChange={(checked) => handleFilterChange('hasParking', checked)}
                      />
                      <Label htmlFor="parking" className="cursor-pointer">Parking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pool" 
                        checked={filters.hasPool || false}
                        onCheckedChange={(checked) => handleFilterChange('hasPool', checked)}
                      />
                      <Label htmlFor="pool" className="cursor-pointer">Pool</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Properties list */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-medium">Failed to load properties. Please try again later.</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 font-medium">No properties found with your current filters.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={resetFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}