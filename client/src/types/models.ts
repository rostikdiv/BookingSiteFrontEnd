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

export interface LoginResponse {
  user: User;
  token: string;
}

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

export interface Review {
  id: number;
  authorLogin: string;
  comment: string;
  rating: number;
  createdAt: string;
  houseForRentId: number;
}

export interface CreateReviewData {
  authorId: number;
  comment: string;
  rating: number;
  houseForRentId: number;
}

export interface CreateReviewPayload {
  authorId: number;
  comment: string;
  rating: number;
}

export interface Photo {
  id?: number;
  imageUrl: string;
  house?: HouseForRent;
}

export interface BookingOffer {
  id: number;
  lessorId: number;
  offerFrom: string;
  offerTo: string;
  houseOffer: HouseForRent;
}

export interface MyBookingOfferDTO {
  id: number;
  houseTitle: string;
  offerFrom: string;
  offerTo: string;
}

export interface ReceivedBookingOfferDTO {
  id: number;
  authorLogin: string;
  authorPhoneNumber: string;
  houseTitle: string;
  offerFrom: string;
  offerTo: string;
}

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

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  login: string;
  password: string;
}

export interface LoginData {
  login: string;
  password: string;
}

export interface CreateBookingData {
  lessorId: number;
  offerFrom: string;
  offerTo: string;
  houseOfferId: number;
}

export interface CreateHouseData {
  title: string;
  description: string;
  city: string;
  rooms: number;
  area: number;
  price: number;
  hasWifi: boolean;
  hasParking: boolean;
  hasPool: boolean;
}