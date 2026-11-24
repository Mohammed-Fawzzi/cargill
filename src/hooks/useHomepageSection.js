import { useQuery } from "@tanstack/react-query";
import { getHomepageSection } from "@/services/cms/homepage";

export function useHomepageSection(id) {
  return useQuery({
    queryKey: ["cms", "homepage", id],
    queryFn: () => getHomepageSection(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
