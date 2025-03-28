import axios from "axios";
import { 
  User, 
  HouseForRent, 
  Review, 
  BookingOffer,
  LoginData,
  RegisterData,
  CreateReviewData,
  CreateBookingData,
  CreateHouseData,
  HouseFilterDTO
} from "@/types/models";

// Создаем базовый инстанс Axios
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// API для работы с пользователями
export const userAPI = {
  // Получить текущего пользователя
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/user");
    return response.data;
  },
  
  // Регистрация нового пользователя
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post("/register", data);
    return response.data;
  },
  
  // Вход пользователя
  login: async (data: LoginData): Promise<User> => {
    const response = await api.post("/login", data);
    return response.data;
  },
  
  // Выход пользователя
  logout: async (): Promise<void> => {
    await api.post("/logout");
  },
  
  // Обновление данных пользователя
  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
};

// API для работы с домами
export const houseAPI = {
  // Получить все дома
  getAll: async (): Promise<HouseForRent[]> => {
    const response = await api.get("/houses");
    return response.data;
  },
  
  // Получить дом по ID
  getById: async (id: number): Promise<HouseForRent> => {
    const response = await api.get(`/houses/${id}`);
    return response.data;
  },
  
  // Создать новый дом
  create: async (data: CreateHouseData): Promise<HouseForRent> => {
    const response = await api.post("/houses", data);
    return response.data;
  },
  
  // Обновить информацию о доме
  update: async (id: number, data: Partial<HouseForRent>): Promise<HouseForRent> => {
    const response = await api.put(`/houses/${id}`, data);
    return response.data;
  },
  
  // Удалить дом
  delete: async (id: number): Promise<void> => {
    await api.delete(`/houses/${id}`);
  },
  
  // Поиск домов с фильтрами
  search: async (filters: HouseFilterDTO): Promise<HouseForRent[]> => {
    const response = await api.get("/houses/search", { params: filters });
    return response.data;
  },
};

// API для работы с отзывами
export const reviewAPI = {
  // Получить все отзывы к дому
  getByHouseId: async (houseId: number): Promise<Review[]> => {
    const response = await api.get(`/reviews/house/${houseId}`);
    return response.data;
  },
  
  // Получить отзывы пользователя
  getByUserId: async (userId: number): Promise<Review[]> => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },
  
  // Создать новый отзыв
  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post("/reviews", data);
    return response.data;
  },
  
  // Обновить отзыв
  update: async (id: number, data: Partial<Review>): Promise<Review> => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },
  
  // Удалить отзыв
  delete: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};

// API для работы с фотографиями
export const photoAPI = {
  // Загрузить фото для дома
  addToHouse: async (houseId: number, photoData: FormData) => {
    const response = await api.post(`/photos/house/${houseId}`, photoData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  
  // Удалить фото
  delete: async (id: number): Promise<void> => {
    await api.delete(`/photos/${id}`);
  },
};

// API для работы с бронированиями
export const bookingAPI = {
  // Получить все бронирования пользователя
  getByUserId: async (userId: number): Promise<BookingOffer[]> => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  },
  
  // Получить все бронирования для дома
  getByHouseId: async (houseId: number): Promise<BookingOffer[]> => {
    const response = await api.get(`/bookings/house/${houseId}`);
    return response.data;
  },
  
  // Создать новое бронирование
  create: async (data: CreateBookingData): Promise<BookingOffer> => {
    const response = await api.post("/bookings", data);
    return response.data;
  },
  
  // Обновить бронирование
  update: async (id: number, data: Partial<BookingOffer>): Promise<BookingOffer> => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },
  
  // Удалить бронирование
  delete: async (id: number): Promise<void> => {
    await api.delete(`/bookings/${id}`);
  },
};

// Интерцепторы для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Логирование ошибок
    console.error("API Error:", error.response || error);
    
    // Преобразование ошибок API для лучшего отображения пользователю
    const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
    return Promise.reject(new Error(errorMessage));
  }
);