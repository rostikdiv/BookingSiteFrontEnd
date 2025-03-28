// Модель пользователя
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  login: string;
  password: string;
  housesForRentList?: HouseForRent[]; // Массив домов пользователя
}

// Модель дома для аренды
export interface HouseForRent {
  id: number;
  price: number;
  area: number;
  rooms: number;
  title: string;
  description: string;
  city: string;
  hasWifi: boolean;
  hasParking: boolean;
  hasPool: boolean;
  owner: User; // Владелец дома
  photos?: Photo[]; // Массив фотографий
  reviewsTo?: Review[]; // Массив отзывов
  bookingOffers?: BookingOffer[]; // Массив бронирований
}

// Модель отзыва
export interface Review {
  id: number;
  authorId: number; // ID автора отзыва
  comment: string;
  rating: number;
  createdAt: string; // Дата в формате ISO
  houseForRent: HouseForRent; // Дом, к которому относится отзыв
}

// Модель фотографии
export interface Photo {
  id: number;
  imageUrl: string; // URL изображения
  house: HouseForRent; // Дом, к которому относится фото
}

// Модель предложения бронирования
export interface BookingOffer {
  id: number;
  lessorId: number; // ID арендодателя
  offerFrom: string; // Дата начала бронирования (ISO)
  offerTo: string; // Дата конца бронирования (ISO)
  houseOffer: HouseForRent; // Дом, который бронируют
}

// Модель для фильтрации домов
export interface HouseFilterDTO {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  minArea?: number;
  hasWifi?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  keyword?: string; // Поиск по названию или описанию
}

// Модель для данных при регистрации
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  login: string;
  password: string;
}

// Модель для данных при входе
export interface LoginData {
  login: string;
  password: string;
}

// Модель для создания отзыва
export interface CreateReviewData {
  authorId: number;
  comment: string;
  rating: number;
  houseForRentId: number;
}

// Модель для создания бронирования
export interface CreateBookingData {
  lessorId: number;
  offerFrom: string;
  offerTo: string;
  houseOfferId: number;
}

// Модель для создания дома
export interface CreateHouseData {
  price: number;
  area: number;
  rooms: number;
  title: string;
  description: string;
  city: string;
  hasWifi: boolean;
  hasParking: boolean;
  hasPool: boolean;
  ownerId: number;
}