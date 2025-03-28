import { useState } from "react";
import { Link } from "wouter";
import { Property } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Hotel, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";

type PropertyCardProps = {
  property: Property;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Format rating to show as 4.9 instead of 49
  const formattedRating = property.rating ? (property.rating / 10).toFixed(1) : null;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 bg-white rounded-full ${
            isFavorite ? "text-red-500" : "text-gray-600"
          } hover:bg-white/90`}
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-poppins font-medium text-lg text-gray-900">
              {property.title}
            </h3>
            <p className="text-gray-600 text-sm">{property.location}</p>
          </div>
          {formattedRating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="ml-1 text-sm font-medium">{formattedRating}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <Hotel className="h-4 w-4 text-gray-500 mr-1" />
          <span>{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
          <span className="mx-2">•</span>
          <Bath className="h-4 w-4 text-gray-500 mr-1" />
          <span>{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="font-medium text-lg text-gray-900">${property.price}</span>
            <span className="text-gray-600 text-sm">/night</span>
          </div>
          <Link href={`/properties/${property.id}`}>
            <Button variant="link" className="text-primary hover:text-primary-dark p-0">
              View details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
