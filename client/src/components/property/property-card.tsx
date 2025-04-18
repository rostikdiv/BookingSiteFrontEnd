import {HouseForRent} from "@/types/models";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Link} from "wouter";

interface PropertyCardProps {
    house: HouseForRent;
    onDelete?: (houseId: number) => void;
    onEdit?: (houseId: number) => void; // Додаємо пропс для редагування
    showDeleteButton?: boolean;
    showEditButton?: boolean; // Додаємо пропс для показу кнопки редагування
}

export default function PropertyCard({
                                         house,
                                         onDelete,
                                         onEdit,
                                         showDeleteButton = false,
                                         showEditButton = false,
                                     }: PropertyCardProps) {
    return (
        <Card className="w-full max-w-sm shadow-lg hover:shadow-xl transition-shadow">
            {/* Фото */}
            <div className="h-48 w-full">
                {house.photos && house.photos.length > 0 ? (
                    <img
                        src={house.photos[0].imageUrl}
                        alt={house.title}
                        className="h-full w-full object-cover rounded-t-lg"
                    />
                ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                        <img
                            src="https://placehold.co/400x300"
                            alt="Placeholder"
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
            </div>

            {/* Контент */}
            <CardHeader>
                <CardTitle className="text-lg truncate">{house.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600">Місто: {house.city}</p>
                <p className="text-sm text-gray-600">Кімнати: {house.rooms}</p>
                <p className="text-sm text-gray-600">Площа: {house.area} м²</p>
                <p className="text-lg font-semibold text-green-600 mt-2">
                    ${house.price}/ніч
                </p>
            </CardContent>

            {/* Кнопки */}
            <CardFooter className="flex justify-between">
                <Link to={`/properties/${house.id}`}>
                    <Button variant="outline">Деталі</Button>
                </Link>
                <div className="flex gap-2">
                    {showEditButton && onEdit && (
                        <Button variant="secondary" onClick={() => onEdit(house.id)}>
                            Редагувати
                        </Button>
                    )}
                    {showDeleteButton && onDelete && (
                        <Button variant="destructive" onClick={() => onDelete(house.id)}>
                            Видалити
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}