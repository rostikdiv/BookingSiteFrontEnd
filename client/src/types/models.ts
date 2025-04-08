// Модель користувача
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  login: string;
  password: string;
  housesForRentList?: HouseForRent[];
}

// Модель будинку для оренди
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
  owner: User;
  photos?: Photo[];
  reviewsTo?: Review[];
  bookingOffers?: BookingOffer[];
}

// Модель відгуку
export interface Review {
  id: number;
  authorId: number; // Залишаємо числовий ID
  comment: string;
  rating: number;
  houseForRentId: number;
  createdAt: string;
}
// Модель фотографії
export interface Photo {
  id: number;
  imageUrl: string;
  house: HouseForRent;
}

// Модель пропозиції бронювання
export interface BookingOffer {
  id: number;
  lessorId: number;
  offerFrom: string;
  offerTo: string;
  houseOffer: HouseForRent;
}

// Модель для фільтрації будинків
export interface HouseFilterDTO {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  minArea?: number;
  hasWifi?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  keyword?: string;
}

// Модель для даних при реєстрації
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  login: string;
  password: string;
}

// Модель для даних при вході
export interface LoginData {
  login: string;
  password: string;
}

// Модель для створення відгуку
export interface CreateReviewData {
  authorId: number; // Повертаємо authorId
  comment: string;
  rating: number;
  houseForRentId: number;
}
// Модель для створення бронювання
export interface CreateBookingData {
  lessorId: number;
  offerFrom: string;
  offerTo: string;
  houseOfferId: number;
}

// Модель для створення будинку
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