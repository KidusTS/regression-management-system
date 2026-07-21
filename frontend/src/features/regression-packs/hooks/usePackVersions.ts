import { useQuery } from "@tanstack/react-query";
import { packService } from "../services/pack.service";

export function usePackVersions(packId: string) {
  return useQuery({
    queryKey: ["packs", packId, "versions"],
    queryFn: () => packService.getVersions(packId),
    enabled: !!packId,
  });
}
