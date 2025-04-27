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

export const useReviews = (houseId: number) =>
    useQuery<Review[], Error>({
        queryKey: [`property-${houseId}-reviews`],
        queryFn: async () => {
            const response = await reviewAPI.getByHouseId(houseId);
            console.log("useReviews response for houseId", houseId, ":", response);
            return Array.isArray(response) ? response : [];
        },
        enabled: !!houseId,
    });