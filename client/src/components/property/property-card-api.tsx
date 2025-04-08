import { Link } from "wouter";
import { HouseForRent } from "@/types/models";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, Car, Waves, Star } from "lucide-react";

interface PropertyCardProps {
  property: HouseForRent;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const averageRating = property.reviewsTo?.length
      ? property.reviewsTo.reduce((sum, review) => sum + review.rating, 0) / property.reviewsTo.length
      : 0;

  return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img
              src={property.photos?.[0]?.imageUrl || "https://via.placeholder.com/400x300"}
              alt={property.title}
              className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {property.hasWifi && <Wifi className="h-5 w-5 text-white drop-shadow" />}
            {property.hasParking && <Car className="h-5 w-5 text-white drop-shadow" />}
            {property.hasPool && <Waves className="h-5 w-5 text-white drop-shadow" />}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold truncate">{property.title}</h3>
            {averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm">{averageRating.toFixed(1)}</span>
                </div>
            )}
          </div>
          <p className="text-sm text-gray-500">{property.city}</p>
          <p className="text-sm text-gray-600 mt-1">Кімнати: {property.rooms} | Площа: {property.area} м²</p>
          <p className="text-lg font-bold mt-2">${property.price}/ніч</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Link href={`/properties/${property.id}`}>
            <Button className="w-full">Переглянути деталі</Button>
          </Link>
        </CardFooter>
      </Card>
  );
}