import { HouseForRent, HouseFilterDTO } from "@/types/models";
import { propertyAPI } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

// Hook для получения всех объектов недвижимости
export function useProperties() {
  return useQuery<HouseForRent[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      return await propertyAPI.getAll();
    },
  });
}

// Hook для получения объекта недвижимости по ID
export function useProperty(id: number) {
  return useQuery<HouseForRent>({
    queryKey: ["property", id],
    queryFn: async () => {
      return await propertyAPI.getById(id);
    },
    enabled: !!id,
  });
}

// Hook для поиска объектов недвижимости с фильтрами
export function useFilteredProperties(filters: HouseFilterDTO) {
  return useQuery<HouseForRent[]>({
    queryKey: ["properties", "filtered", filters],
    queryFn: async () => {
      return await propertyAPI.search(filters);
    },
    enabled: Object.keys(filters).length > 0,
  });
}