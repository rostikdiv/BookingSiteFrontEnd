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
import {queryClient} from "@/lib/queryClient.ts";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Має бути true
  headers: {
    "Content-Type": "application/json",
  },
});



// Додаємо інтерсептор для обробки помилок
api.interceptors.response.use(
    response => response,
    error => {
      console.error("API Error:", error.response?.data || error.message);
      return Promise.reject(error.response?.data || error.message);
    }
);

export const userAPI = {
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/user/getById/${id}`);
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post("/user", data); // Виправлений шлях
    return response.data;
  },

  login: async (data: LoginData): Promise<User> => {
    // Використовуємо GET з параметрами в URL (як у вашому контролері)
    const response = await api.get(
        `/user/login/${encodeURIComponent(data.login)}/${encodeURIComponent(data.password)}`
    );
    return response.data;
  },

  // api.ts
  logout: async (): Promise<void> => {
    try {
      // Використовуємо абсолютний URL
      await api.post('http://localhost:8080/user/logout');

      // Очищаємо всі дані
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();

      // Примусове оновлення сторінки
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
      // Навіть при помилці очищаємо клієнтські дані
      localStorage.clear();
      window.location.href = '/auth';
    }
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/user');
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/user/edit/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/user/delete/byId/${id}`);
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

  create: async (data: CreateHouseData): Promise<HouseForRent> => {
    const response = await api.post("/ForRent", data);
    return response.data;
  },

  update: async (id: number, data: Partial<HouseForRent>): Promise<HouseForRent> => {
    const response = await api.put(`/ForRent/edit/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ForRent/delete/byId/${id}`);
  },

  search: async (filters: HouseFilterDTO): Promise<HouseForRent[]> => {
    const response = await api.post("/ForRent/search", filters);
    return response.data;
  },
};

export const reviewAPI = {
  getById: async (id: number): Promise<Review> => {
    const response = await api.get(`/review/${id}`);
    return response.data;
  },

  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post("/review", data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/review/delete/byId/${id}`);
  },
};

export const photoAPI = {
  addToHouse: async (houseId: number, photoData: FormData) => {
    const response = await api.post(`/api/photos/${houseId}`, photoData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/photos/${id}`);
    return response.data;
  },
};

export const bookingAPI = {
  create: async (data: CreateBookingData): Promise<BookingOffer> => {
    const response = await api.post("/bookOffer", data);
    return response.data;
  },

  getById: async (id: number): Promise<BookingOffer> => {
    const response = await api.get(`/bookOffer/getById/${id}`);
    return response.data;
  },
};