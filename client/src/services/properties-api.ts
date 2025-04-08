import { useQuery } from "@tanstack/react-query";
import { propertyAPI, reviewAPI } from "@/services/api";
import { HouseForRent, Review, HouseFilterDTO } from "@/types/models";

export const useProperty = (id: number) => {
  return useQuery<HouseForRent, Error>({
    queryKey: ["property", id],
    queryFn: () => propertyAPI.getById(id),
    enabled: !!id,
  });
};

export const useProperties = () => {
  return useQuery<HouseForRent[], Error>({
    queryKey: ["properties"],
    queryFn: () => propertyAPI.getAll(),
  });
};

export const useFilteredProperties = (filters: HouseFilterDTO) => {
  return useQuery<HouseForRent[], Error>({
    queryKey: ["properties", filters],
    queryFn: () => propertyAPI.search(filters),
    enabled: !!filters,
  });
};

// Новий хук для отримання відгуків за houseForRentId
export const useReviews = (houseForRentId: number) => {
  return useQuery<Review[], Error>({
    queryKey: ["reviews", houseForRentId],
    queryFn: async () => {
      const reviews = await reviewAPI.getByHouseId(houseForRentId);
      console.log("Reviews for house:", reviews);
      return reviews;
    },
    enabled: !!houseForRentId,
  });
};