// components/property/property-card.tsx
import { Link } from "wouter";
import { HouseForRent } from "@/types/models";
import { Card, CardContent } from "@/components/ui/card";

export default function PropertyCard({ property }: { property: HouseForRent }) {
  return (
      <Link to={`/properties/${property.id}`}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">{property.title}</h3>
            <p className="text-sm text-gray-600">{property.description}</p>
            <p className="mt-2">Ціна: {property.price} грн</p>
            <p>Місто: {property.city}</p>
            <div className="mt-2 text-sm">
              <p>Кімнати: {property.rooms}</p>
              <p>Площа: {property.area} м²</p>
              <p>Wi-Fi: {property.hasWifi ? "Так" : "Ні"}</p>
              <p>Паркінг: {property.hasParking ? "Так" : "Ні"}</p>
              <p>Басейн: {property.hasPool ? "Так" : "Ні"}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
  );
}