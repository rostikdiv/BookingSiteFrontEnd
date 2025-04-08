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
  HouseFilterDTO,
} from "@/types/models";

// Зберігаємо ID поточного користувача (тимчасово, для демонстрації)
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

// Інтерсептор для обробки помилок
api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error.response?.data || error.message);
      return Promise.reject(error.response?.data || error.message);
    }
);


// Сервіс для користувачів
export const userAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/user");
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/user/getById/${id}`);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("Користувач не авторизований");
    }
    const response = await api.get(`/user/getById/${userId}`);
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post("/user", data);
    setCurrentUserId(response.data.id); // Зберігаємо ID після реєстрації
    return response.data;
  },

  login: async (data: LoginData): Promise<User> => {
    const response = await api.get(`/user/login/${encodeURIComponent(data.login)}/${encodeURIComponent(data.password)}`);
    setCurrentUserId(response.data.id); // Зберігаємо ID після логіну
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/user/logout");
    setCurrentUserId(null); // Очищаємо ID при логауті
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/user/edit/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.get(`/user/delete/byId/${id}`);
  },
};

// Сервіс для будинків
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
    await api.get(`/ForRent/delete/byId/${id}`);
  },

  search: async (filters: HouseFilterDTO): Promise<HouseForRent[]> => {
    const response = await api.post("/ForRent/search", filters);
    return response.data;
  },
};

// Сервіс для відгуків
export const reviewAPI = {
  getById: async (id: number): Promise<Review> => {
    const response = await api.get(`/review/${id}`);
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
  getByHouseId: async (houseId: number) => {
    const response = await api.get<Review[]>(`/review/byHouse/${houseId}`);
    return response.data;
  },
  create: async (data: CreateReviewData) => {
    const { houseForRentId, ...reviewData } = data; // Витягуємо houseForRentId
    const adaptedData = {
      authorId: reviewData.authorId,
      comment: reviewData.comment,
      rating: reviewData.rating,
    };
    console.log("Adapted Review Data for POST /toReview:", adaptedData);
    const response = await api.post<HouseForRent>(
        `/review/toReview/${houseForRentId}`, // Використовуємо новий ендпоінт
        adaptedData
    );
    return response.data; // Повертаємо HouseForRent
  },
};
// Сервіс для бронювань
export const bookingAPI = {
  getAll: async (): Promise<BookingOffer[]> => {
    const response = await api.get("/bookOffer");
    return response.data;
  },

  getById: async (id: number): Promise<BookingOffer> => {
    const response = await api.get(`/bookOffer/getById/${id}`);
    return response.data;
  },

  create: async (data: CreateBookingData) => {
    const { houseOfferId, ...bookingData } = data;
    const adaptedData = {
      lessorId: bookingData.lessorId,
      offerFrom: bookingData.offerFrom, // Має бути у форматі YYYY-MM-DD
      offerTo: bookingData.offerTo,     // Має бути у форматі YYYY-MM-DD
    };
    console.log("Adapted Booking Data for POST /toOffer:", adaptedData);
    const response = await api.post<HouseForRent>(
        `/bookOffer/toOffer/${houseOfferId}`,
        adaptedData
    );
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

// Сервіс для фото
export const photoAPI = {
  addToHouse: async (houseId: number, photoData: FormData): Promise<any> => {
    const response = await api.post(`/api/photos/${houseId}`, photoData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/api/photos/${id}`);
    return response.data;
  },
};