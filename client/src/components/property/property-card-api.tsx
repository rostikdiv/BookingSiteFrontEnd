import { Link } from "wouter";
import { HouseForRent } from "@/types/models";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, Car, Waves, Home, Star } from "lucide-react";

type PropertyCardProps = {
  property: HouseForRent;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  // Вычисление среднего рейтинга
  const averageRating = property.reviewsTo && property.reviewsTo.length > 0
    ? property.reviewsTo.reduce((sum, review) => sum + review.rating, 0) / property.reviewsTo.length
    : 0;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        {property.photos && property.photos.length > 0 ? (
          <img 
            src={property.photos[0].imageUrl} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-primary font-medium">
            ${property.price} / night
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between">
          <span className="line-clamp-1">{property.title}</span>
          {averageRating > 0 && (
            <span className="flex items-center text-sm font-normal">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              {averageRating.toFixed(1)}
            </span>
          )}
        </CardTitle>
        <p className="text-sm text-gray-500">{property.city}</p>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <div className="flex items-center gap-3 mb-2 text-sm text-gray-600">
          <span>{property.rooms} Rooms</span>
          <span>•</span>
          <span>{property.area}m²</span>
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
          {property.description}
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