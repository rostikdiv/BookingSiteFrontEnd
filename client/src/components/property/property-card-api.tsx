import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, Car, Waves, Home, Star } from "lucide-react";

type PropertyCardProps = {
  property: any;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  // Адаптируем к разным форматам API
  const getPropertyDetails = () => {
    // Выбор подходящих свойств в зависимости от формата данных API
    const title = property.title;
    const description = property.description;
    const location = property.location || property.city;
    const price = property.price;
    const rooms = property.rooms || property.bedrooms || 0;
    const area = property.area || property.price; // Если нет area, используем price как примерное значение
    const imageUrl = property.imageUrl || 
                    (property.photos && property.photos.length > 0 ? property.photos[0].imageUrl : null);
    
    // Для рейтинга можно использовать либо готовый рейтинг, либо вычислить из отзывов
    let rating = property.rating ? property.rating / 10 : 0; // Если rating хранится как 49 (4.9 звезд)
    if (!rating && property.reviewsTo && property.reviewsTo.length > 0) {
      rating = property.reviewsTo.reduce((sum: number, review: any) => sum + review.rating, 0) 
              / property.reviewsTo.length;
    }
    
    return { title, description, location, price, rooms, area, imageUrl, rating };
  };
  
  const { title, description, location, price, rooms, area, imageUrl, rating } = getPropertyDetails();

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-primary font-medium">
            ${price} / night
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between">
          <span className="line-clamp-1">{title}</span>
          {rating > 0 && (
            <span className="flex items-center text-sm font-normal">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-gray-500">{location}</p>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="flex items-center gap-3 mb-2 text-sm text-gray-600">
          <span>{rooms} Rooms</span>
          <span>•</span>
          <span>{area}m²</span>
        </div>
        
        <div className="flex flex-wrap gap-2 my-2">
          {property.hasWifi && (
            <Badge variant="outline" className="flex items-center gap-1 font-normal">
              <Wifi className="h-3 w-3" /> WiFi
            </Badge>
          )}
          {property.hasParking && (
            <Badge variant="outline" className="flex items-center gap-1 font-normal">
              <Car className="h-3 w-3" /> Parking
            </Badge>
          )}
          {property.hasPool && (
            <Badge variant="outline" className="flex items-center gap-1 font-normal">
              <Waves className="h-3 w-3" /> Pool
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
          {description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button asChild className="w-full">
          <Link to={`/properties/${property.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}