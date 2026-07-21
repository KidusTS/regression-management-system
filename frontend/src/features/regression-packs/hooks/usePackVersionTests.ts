import { useQuery } from "@tanstack/react-query";
import { packService } from "../services/pack.service";

export function usePackVersionTests(packId: string, versionId: string) {
  return useQuery({
    queryKey: ["packs", packId, "versions", versionId, "tests"],
    queryFn: () => packService.getVersionTests(packId, versionId),
    enabled: !!packId && !!versionId,
  });
}
