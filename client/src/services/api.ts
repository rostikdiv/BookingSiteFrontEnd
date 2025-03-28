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
  // Получить пользователя по ID
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/user/getById/${id}`);
    return response.data;
  },
  
  // Регистрация нового пользователя
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post("/user", data);
    return response.data;
  },
  
  // Вход пользователя
  login: async (data: LoginData): Promise<User> => {
    const { login, password } = data;
    const response = await api.get(`/user/login/${login}/${password}`);
    return response.data;
  },
  
  // Обновление данных пользователя
  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/user/edit/${id}`, data);
    return response.data;
  },
  
  // Удаление аккаунта пользователя
  delete: async (id: number): Promise<void> => {
    await api.delete(`/user/delete/byId/${id}`);
  },
};

// API для работы с недвижимостью
export const propertyAPI = {
  // Получить все объекты недвижимости
  getAll: async (): Promise<HouseForRent[]> => {
    const response = await api.get("/ForRent");
    return response.data;
  },
  
  // Получить объект недвижимости по ID
  getById: async (id: number): Promise<HouseForRent> => {
    const response = await api.get(`/ForRent/getById/${id}`);
    return response.data;
  },
  
  // Создать новый объект недвижимости
  create: async (data: CreateHouseData): Promise<HouseForRent> => {
    const response = await api.post("/ForRent", data);
    return response.data;
  },
  
  // Обновить информацию о недвижимости
  update: async (id: number, data: Partial<HouseForRent>): Promise<HouseForRent> => {
    const response = await api.put(`/ForRent/edit/${id}`, data);
    return response.data;
  },
  
  // Удалить объект недвижимости
  delete: async (id: number): Promise<void> => {
    await api.delete(`/ForRent/delete/byId/${id}`);
  },
  
  // Поиск недвижимости с фильтрами
  search: async (filters: HouseFilterDTO): Promise<HouseForRent[]> => {
    const response = await api.post("/ForRent/search", filters);
    return response.data;
  },
};

// API для работы с отзывами
export const reviewAPI = {
  // Получить отзыв по ID
  getById: async (id: number): Promise<Review> => {
    const response = await api.get(`/review/${id}`);
    return response.data;
  },
  
  // Создать новый отзыв
  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post("/review", data);
    return response.data;
  },
  
  // Удалить отзыв
  delete: async (id: number): Promise<void> => {
    await api.delete(`/review/delete/byId/${id}`);
  },
};

// API для работы с фотографиями
export const photoAPI = {
  // Загрузить фото для дома
  addToHouse: async (houseId: number, photoData: FormData) => {
    const response = await api.post(`/api/photos/${houseId}`, photoData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  
  // Получить фото по ID
  getById: async (id: number) => {
    const response = await api.get(`/api/photos/${id}`);
    return response.data;
  },
};

// API для работы с бронированиями
export const bookingAPI = {
  // Создать новое бронирование
  create: async (data: CreateBookingData): Promise<BookingOffer> => {
    const response = await api.post("/bookOffer", data);
    return response.data;
  },
  
  // Получить бронирование по ID
  getById: async (id: number): Promise<BookingOffer> => {
    const response = await api.get(`/bookOffer/getById/${id}`);
    return response.data;
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