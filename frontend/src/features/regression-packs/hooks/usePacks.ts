import { useQuery } from "@tanstack/react-query";
import { packService } from "../services/pack.service";

export function usePacks() {
  return useQuery({
    queryKey: ["packs"],
    queryFn: packService.getAll,
  });
}
