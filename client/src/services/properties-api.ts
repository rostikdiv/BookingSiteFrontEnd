import { HouseForRent, HouseFilterDTO } from "@/types/models";
import { houseAPI } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

// Hook для получения всех домов
export function useProperties() {
  return useQuery<HouseForRent[]>({
    queryKey: ["houses"],
    queryFn: async () => {
      return await houseAPI.getAll();
    },
  });
}

// Hook для получения дома по ID
export function useProperty(id: number) {
  return useQuery<HouseForRent>({
    queryKey: ["house", id],
    queryFn: async () => {
      return await houseAPI.getById(id);
    },
    enabled: !!id,
  });
}

// Hook для поиска домов с фильтрами
export function useFilteredProperties(filters: HouseFilterDTO) {
  return useQuery<HouseForRent[]>({
    queryKey: ["houses", "filtered", filters],
    queryFn: async () => {
      return await houseAPI.search(filters);
    },
    enabled: Object.keys(filters).length > 0,
  });
}