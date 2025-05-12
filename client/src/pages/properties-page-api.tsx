import { useState, useEffect } from "react";
import { useFilteredProperties } from "@/services/properties-api";
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
import { Loader2, FilterX, ChevronLeft, ChevronRight } from "lucide-react";

export default function PropertiesPage() {
  const [filters, setFilters] = useState<HouseFilterDTO>({});
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: properties = [], isLoading, error, refetch } = useFilteredProperties(filters);

  useEffect(() => {
    setCurrentPage(1); // Скидаємо сторінку при зміні фільтрів
  }, [filters]);

  const totalItems = properties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);

  const handleFilterChange = (key: keyof HouseFilterDTO, value: any) => {
    setFilters((prev) => {
      if (value === undefined || (["hasWifi", "hasParking", "hasPool"].includes(key) && value === false)) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setFilters((prev) => ({ ...prev, minPrice: value[0], maxPrice: value[1] }));
  };

  const resetFilters = () => {
    setFilters({});
    setPriceRange([0, 1000]);
    setCurrentPage(1);
    refetch();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold">Знайдіть своє ідеальне помешкання</h1>
              <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
              >
                <span>Фільтри</span>
                <svg
                    width="15"
                    height="15"
                    className={`transform transition-transform ${showFilters ? "rotate-180" : ""}`}
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                      fill="currentColor"
                  />
                </svg>
              </Button>
            </div>

            {showFilters && (
                <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Фільтрувати помешкання</h2>
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="flex items-center gap-1">
                      <FilterX className="h-4 w-4" />
                      Скинути
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="city">Місто</Label>
                      <Input
                          id="city"
                          placeholder="Введіть місто"
                          value={filters.city || ""}
                          onChange={(e) => handleFilterChange("city", e.target.value)}
                          className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="keyword">Ключове слово</Label>
                      <Input
                          id="keyword"
                          placeholder="Пошук за ключовим словом"
                          value={filters.keyword || ""}
                          onChange={(e) => handleFilterChange("keyword", e.target.value)}
                          className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-1">
                      <div className="flex justify-between items-center">
                        <Label>Діапазон цін</Label>
                        <span className="text-sm text-gray-500">${priceRange[0]} - ${priceRange[1]}</span>
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

                    <div>
                      <Label>Мінімальна кількість кімнат</Label>
                      <RadioGroup
                          className="flex space-x-4 mt-1"
                          value={filters.minRooms?.toString() || ""}
                          onValueChange={(value) =>
                              handleFilterChange("minRooms", value ? parseInt(value) : undefined)
                          }
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="" id="any-room" />
                          <Label htmlFor="any-room" className="cursor-pointer">
                            Будь-яка
                          </Label>
                        </div>
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="flex items-center space-x-1">
                              <RadioGroupItem value={num.toString()} id={`room-${num}`} />
                              <Label htmlFor={`room-${num}`} className="cursor-pointer">
                                {num}+
                              </Label>
                            </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="area">Мінімальна площа (м²)</Label>
                      <Input
                          id="area"
                          type="number"
                          placeholder="Мін. площа"
                          value={filters.minArea || ""}
                          onChange={(e) =>
                              handleFilterChange("minArea", e.target.value ? parseInt(e.target.value) : undefined)
                          }
                          className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="block mb-2">Зручності</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                              id="wifi"
                              checked={filters.hasWifi || false}
                              onCheckedChange={(checked) => handleFilterChange("hasWifi", checked)}
                          />
                          <Label htmlFor="wifi" className="cursor-pointer">
                            WiFi
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                              id="parking"
                              checked={filters.hasParking || false}
                              onCheckedChange={(checked) => handleFilterChange("hasParking", checked)}
                          />
                          <Label htmlFor="parking" className="cursor-pointer">
                            Парковка
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                              id="pool"
                              checked={filters.hasPool || false}
                              onCheckedChange={(checked) => handleFilterChange("hasPool", checked)}
                          />
                          <Label htmlFor="pool" className="cursor-pointer">
                            Басейн
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center py-20">
                  <p className="text-red-500 font-medium">
                    {error.message.includes("Network Error")
                        ? "Не вдалося підключитися до сервера. Перевірте ваше з’єднання з Інтернетом."
                        : "Не вдалося завантажити помешкання. Спробуйте пізніше."}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Спробувати ще раз
                  </Button>
                </div>
            ) : currentProperties.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                      <div className="mt-8 flex justify-center items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Попередня
                        </Button>

                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                              <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  onClick={() => handlePageClick(page)}
                                  className={`h-8 w-8 p-0 ${currentPage === page ? "bg-primary text-white" : ""}`}
                              >
                                {page}
                              </Button>
                          ))}
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1"
                        >
                          Наступна
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                  )}
                </>
            ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 font-medium">Не знайдено помешкань за вашими критеріями.</p>
                  <Button variant="outline" className="mt-4" onClick={resetFilters}>
                    Очистити фільтри
                  </Button>
                </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
  );
}