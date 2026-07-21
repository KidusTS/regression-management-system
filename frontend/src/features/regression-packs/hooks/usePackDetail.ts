import { useQuery } from "@tanstack/react-query";
import { packService } from "../services/pack.service";

export function usePackDetail(id: string) {
  return useQuery({
    queryKey: ["packs", id],
    queryFn: () => packService.getById(id),
    enabled: !!id,
  });
}
