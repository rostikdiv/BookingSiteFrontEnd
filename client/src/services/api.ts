import axios from "axios";
import {
  User,
  HouseForRent,
  Review,
  BookingOffer,
  LoginData,
  RegisterData,
  CreateReviewPayload,
  CreateBookingData,
  CreateHouseData,
  HouseFilterDTO,
  MyBookingOfferDTO,
  ReceivedBookingOfferDTO,
} from "@/types/models";

let currentUserId: number | null = null;

export const setCurrentUserId = (id: number | null) => {
  currentUserId = id;
};

export const getCurrentUserId = () => {
  return currentUserId;
};

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Додаємо інтерцептор для автоматичного додавання токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error.response?.data || error.message);
      return Promise.reject(error.response?.data || error.message);
    }
);

export const userAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/user");
    return response.data;
  },
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/user/getById/${id}`);
    return response.data;
  },
  login: async (data: LoginData): Promise<{ user: User; token: string }> => {
    const response = await api.post("/user/login", data);
    console.log("Login response:", response.data);
    if (!response.data.id) {
      console.error("User ID is missing in login response");
      throw new Error("User ID is missing");
    }
    setCurrentUserId(response.data.id);
    return { user: response.data, token: `generated-jwt-token-${response.data.id}` };
  },
  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/user/edit/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.get(`/user/delete/byId/${id}`);
  },
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get("/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      console.log("Get current user response:", response.data); // Логування
      return response.data;
    } catch (error) {
      console.error("Get current user failed:", error);
      return null;
    }
  },
  verifyToken: async (token: string): Promise<boolean> => {
    console.log("Verifying token:", token); // Логування
    try {
      const response = await api.post("/user/verify-token", { token }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Verify token response:", response.data); // Логування
      return response.data;
    } catch (error) {
      console.error("Verify token failed:", error.response?.data || error.message);
      throw error;
    }
  },
  logout: async () => {
    await api.post("/user/logout");
    console.log("Logout request sent"); // Логування
  },
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post("/user", data);
    console.log("Register response:", response.data); // Логування
    return response.data;
  },
};

export const propertyAPI = {
  getAll: async (): Promise<HouseForRent[]> => {
    const response = await api.get("/ForRent");
    return response.data;
  },
  getById: async (id: number): Promise<HouseForRent> => {
    const response = await api.get(`/ForRent/getById/${id}`);
    return response.data;
  },
  getByOwnerId: async (ownerId: number): Promise<HouseForRent[]> => {
    const response = await api.get(`/ForRent/getById/all/${ownerId}`);
    return response.data;
  },
  create: async (data: CreateHouseData, userId: number) => {
    console.log("Adapted House Data for POST /toUser:", data);
    const response = await api.post<HouseForRent>(`/ForRent/toUser/${userId}`, data);
    return response.data;
  },
  update: async (id: number, data: Partial<HouseForRent>): Promise<HouseForRent> => {
    const response = await api.put(`/ForRent/edit/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.get(`/ForRent/delete/byId/${id}`);
  },
  search: async (filters: HouseFilterDTO): Promise<HouseForRent[]> => {
    const response = await api.post("/ForRent/search", filters);
    return response.data;
  },
  addPhoto: async (houseId: number, imageUrl: string) => {
    const photoData = { imageUrl };
    console.log("Photo Data for POST /toPhoto:", photoData);
    const response = await api.post<HouseForRent>(`/api/photos/toPhoto/${houseId}`, photoData);
    return response.data;
  },
};

export const reviewAPI = {
  getById: async (id: number): Promise<Review> => {
    const response = await api.get(`/review/${id}`);
    return response.data;
  },
  getLoginById: async (id: number): Promise<string> => {
    const response = await api.get(`/getLoginById/${id}`);
    return response.data;
  },
  update: async (id: number, data: Partial<Review>): Promise<Review> => {
    const response = await api.put(`/review/edit/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.get(`/review/delete/byId/${id}`);
  },
  getAll: async () => {
    const response = await api.get<Review[]>("/review");
    return response.data;
  },
  getByHouseId: async (houseId: number): Promise<Review[]> => {
    const response = await api.get(`/review/byHouse/${houseId}`);
    console.log("Backend response for /review/byHouse/", houseId, ":", response.data);
    return Array.isArray(response.data) ? response.data : [];
  },
  getByAuthorId: async (authorId: number): Promise<Review[]> => {
    const response = await api.get(`/review/byAuthor/${authorId}`);
    console.log("Backend response for /review/byAuthor/", authorId, ":", response.data);
    return Array.isArray(response.data) ? response.data : [];
  },
  create: async (data: CreateReviewPayload, houseForRentId: number): Promise<Review> => {
    const response = await api.post(`/review/toReview/${houseForRentId}`, data);
    return response.data;
  },
};

export const bookingAPI = {
  getAll: async (): Promise<BookingOffer[]> => {
    const response = await api.get("/bookOffer");
    return response.data;
  },
  getById: async (id: number): Promise<BookingOffer> => {
    const response = await api.get(`/bookOffer/getById/${id}`);
    return response.data;
  },
  getBookingOffersByUserId: async (userId: number): Promise<MyBookingOfferDTO[]> => {
    const response = await api.get(`/bookOffer/getAlBbyUserId/${userId}`);
    return response.data;
  },
  getBookingOffersForOwnerHouses: async (ownerId: number): Promise<ReceivedBookingOfferDTO[]> => {
    const response = await api.get(`/bookOffer/owner/${ownerId}`);
    return response.data;
  },
  create: async (data: CreateBookingData) => {
    const { houseOfferId, ...bookingData } = data;
    const adaptedData = {
      lessorId: bookingData.lessorId,
      offerFrom: bookingData.offerFrom,
      offerTo: bookingData.offerTo,
    };
    console.log("Adapted Booking Data for POST /toOffer:", adaptedData);
    const response = await api.post<HouseForRent>(`/bookOffer/toOffer/${houseOfferId}`, adaptedData);
    return response.data;
  },
  update: async (id: number, data: Partial<BookingOffer>): Promise<BookingOffer> => {
    const response = await api.put(`/bookOffer/edit/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.get(`/bookOffer/delete/byId/${id}`);
  },
};